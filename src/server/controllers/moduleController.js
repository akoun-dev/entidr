'use strict';

const { Module } = require('../../models');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Chemin vers le dossier des modules
const ADDONS_DIR = path.resolve(__dirname, '../../../addons');

// Regex de validation pour le nom du module
const MODULE_NAME_REGEX = /^[\w-]+$/;

/**
 * Valide le nom du module et retourne son chemin sécurisé
 * @param {string} name Nom du module
 * @returns {string} Chemin sécurisé vers le module
 */
function validateModuleName(name) {
  if (!MODULE_NAME_REGEX.test(name)) {
    throw new Error('Nom de module invalide');
  }

  const modulePath = path.resolve(ADDONS_DIR, name);
  if (!modulePath.startsWith(ADDONS_DIR)) {
    throw new Error('Chemin de module invalide');
  }

  return modulePath;
}

/**
 * Exécute une commande et gère les erreurs de façon centralisée
 * @param {string} command Commande à exécuter
 * @param {string[]} args Liste des arguments
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: false });
    let stderr = '';

    if (child.stderr) {
      child.stderr.on('data', data => {
        stderr += data.toString();
      });
    }

    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) {
        const error = new Error(`Commande échouée avec le code ${code}`);
        error.code = code;
        error.stderr = stderr;
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Contrôleur pour la gestion des modules
 */
const moduleController = {
  /**
   * Synchronise les modules entre la base et le système de fichiers addons/
   * - Marque installable=false si le dossier n'existe pas
   * - Optionnel: `?purgeMissing=true` pour désactiver/désinstaller ou supprimer
   */
  async syncModules(req, res) {
    try {
      const purgeMissing = String(req.query.purgeMissing || '').toLowerCase() === 'true';

      const entries = fs.existsSync(ADDONS_DIR) ? fs.readdirSync(ADDONS_DIR, { withFileTypes: true }) : [];
      const fsModules = new Set(entries.filter(e => e.isDirectory()).map(e => e.name));

      const dbModules = await Module.findAll();
      let updated = 0;
      let removed = 0;

      for (const m of dbModules) {
        const exists = fsModules.has(m.name);
        if (!exists) {
          if (purgeMissing) {
            // Stratégie douce par défaut: désactiver + désinstaller
            m.active = false;
            m.installed = false;
            m.installable = false;
            await m.save();
            updated++;
          } else {
            if (m.installable !== false) {
              m.installable = false;
              await m.save();
              updated++;
            }
          }
        } else {
          if (m.installable === false) {
            m.installable = true;
            await m.save();
            updated++;
          }
        }
      }

      // Optionnel: purger totalement les entrées DB orphelines si explicitement demandé
      if (purgeMissing && process.env.MODULES_PURGE_DELETE === 'true') {
        for (const m of dbModules) {
          if (!fsModules.has(m.name)) {
            await m.destroy();
            removed++;
          }
        }
      }

      return res.status(200).json({ data: { updated, removed }, error: null });
    } catch (error) {
      console.error('Erreur lors de la synchronisation des modules:', error);
      return res.status(500).json({ data: null, error: { message: 'Une erreur est survenue lors de la synchronisation des modules' } });
    }
  },
  /**
   * Récupère tous les modules
   */
  async getAllModules(req, res) {
    try {
      console.log('Tentative de récupération des modules depuis la base de données');

      // Vérifier la connexion à la base de données
      try {
        await Module.sequelize.authenticate();
        console.log('Connexion à la base de données établie avec succès');
      } catch (authError) {
        console.error('Erreur de connexion à la base de données:', authError);
        throw authError;
      }

      // Vérifier la synchronisation du modèle
      try {
        const description = await Module.describe();
        console.log('Description de la table Modules:', description);
      } catch (descError) {
        console.error('Erreur lors de la description de la table:', {
          message: descError.message,
          stack: descError.stack,
          name: descError.name
        });
        throw descError;
      }

      try {
        const modules = await Module.findAll({
          order: [['displayName', 'ASC']]
        });
        console.log('Modules récupérés avec succès:', modules.length);

        // Compat: certains schémas n'incluent pas encore tous les champs (installable, summary, ...)
        const normalized = modules.map(m => {
          const plain = m.toJSON ? m.toJSON() : m;
          const modulePath = path.join(ADDONS_DIR, plain.name);
          const existsInFs = fs.existsSync(modulePath);

          // Parse potential JSON strings from older seeders
          let deps = [];
          if (Array.isArray(plain.dependencies)) deps = plain.dependencies;
          else if (typeof plain.dependencies === 'string') {
            try { deps = JSON.parse(plain.dependencies || '[]'); } catch { deps = []; }
          }

          let models = [];
          if (Array.isArray(plain.models)) models = plain.models;
          else if (typeof plain.models === 'string') {
            try { models = JSON.parse(plain.models || '[]'); } catch { models = []; }
          }
          return {
            // Champs de base
            id: plain.id,
            name: plain.name,
            displayName: plain.displayName || plain.name,
            version: plain.version || '0.0.0',
            description: plain.description || null,
            summary: plain.summary || plain.description || null,
            active: typeof plain.active === 'boolean' ? plain.active : false,
            installed: typeof plain.installed === 'boolean' ? plain.installed : false,
            // Champs optionnels avec valeurs par défaut raisonnables
            installable: existsInFs && (typeof plain.installable === 'boolean' ? plain.installable : true),
            application: typeof plain.application === 'boolean' ? plain.application : true,
            autoInstall: typeof plain.autoInstall === 'boolean' ? plain.autoInstall : false,
            dependencies: deps,
            models: models,
            installedAt: plain.installedAt || null,
            createdAt: plain.createdAt,
            updatedAt: plain.updatedAt
          };
        });

        return res.status(200).json({ data: normalized, error: null });
      } catch (findError) {
        console.error('Erreur lors de la récupération des modules:', {
          message: findError.message,
          stack: findError.stack,
          name: findError.name,
          sql: findError.sql,
          parameters: findError.parameters
        });
        throw findError;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      return res.status(500).json({ data: null, error: { message: 'Une erreur est survenue lors de la récupération des modules' } });
    }
  },

  /**
   * Récupère un module par son nom
   */
  async getModuleByName(req, res) {
    try {
      const { name } = req.params;
      try {
        validateModuleName(name);
      } catch (err) {
        return res.status(400).json({ data: null, error: { message: err.message } });
      }

      const module = await Module.findOne({
        where: { name }
      });

      if (!module) {
        return res.status(404).json({ data: null, error: { message: `Le module ${name} n'existe pas` } });
      }

      const plain = module.toJSON ? module.toJSON() : module;
      const modulePath = path.join(ADDONS_DIR, plain.name);
      const existsInFs = fs.existsSync(modulePath);
      let deps = [];
      if (Array.isArray(plain.dependencies)) deps = plain.dependencies;
      else if (typeof plain.dependencies === 'string') {
        try { deps = JSON.parse(plain.dependencies || '[]'); } catch { deps = []; }
      }
      let models = [];
      if (Array.isArray(plain.models)) models = plain.models;
      else if (typeof plain.models === 'string') {
        try { models = JSON.parse(plain.models || '[]'); } catch { models = []; }
      }
      const normalized = {
        id: plain.id,
        name: plain.name,
        displayName: plain.displayName || plain.name,
        version: plain.version || '0.0.0',
        description: plain.description || null,
        summary: plain.summary || plain.description || null,
        active: typeof plain.active === 'boolean' ? plain.active : false,
        installed: typeof plain.installed === 'boolean' ? plain.installed : false,
        installable: existsInFs && (typeof plain.installable === 'boolean' ? plain.installable : true),
        application: typeof plain.application === 'boolean' ? plain.application : true,
        autoInstall: typeof plain.autoInstall === 'boolean' ? plain.autoInstall : false,
        dependencies: deps,
        models: models,
        installedAt: plain.installedAt || null,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt
      };

      return res.status(200).json({ data: normalized, error: null });
    } catch (error) {
      console.error(`Erreur lors de la récupération du module ${req.params.name}:`, error);
      return res.status(500).json({ data: null, error: { message: `Une erreur est survenue lors de la récupération du module ${req.params.name}` } });
    }
  },

  /**
   * Active ou désactive un module
   */
  async toggleModuleStatus(req, res) {
    try {
      const { name } = req.params;
      const { active } = req.body;

      try {
        validateModuleName(name);
      } catch (err) {
        return res.status(400).json({ data: null, error: { message: err.message } });
      }

      const module = await Module.findOne({
        where: { name }
      });

      if (!module) {
        return res.status(404).json({ data: null, error: { message: `Le module ${name} n'existe pas` } });
      }

      // Vérifier les dépendances si on désactive le module
      if (active === false) {
        const dependentModules = await Module.findAll({
          where: {
            active: true
          }
        });

        // Vérifier si d'autres modules dépendent de celui-ci
        const dependents = dependentModules.filter(m => {
          const deps = m.dependencies || [];
          return deps.includes(name);
        });

        if (dependents.length > 0) {
          return res.status(400).json({ data: null, error: { message: `Impossible de désactiver le module ${name} car d'autres modules en dépendent`, dependents: dependents.map(m => m.name) } });
        }
      }

      // Mettre à jour le statut du module
      module.active = active;
      await module.save();

      return res.status(200).json({ data: module, error: null });
    } catch (error) {
      console.error(`Erreur lors de la modification du statut du module ${req.params.name}:`, error);
      return res.status(500).json({ data: null, error: { message: `Une erreur est survenue lors de la modification du statut du module ${req.params.name}` } });
    }
  },

  /**
   * Installe un module
   */
  async installModule(req, res) {
    try {
      const { name } = req.params;
      let modulePath;
      try {
        modulePath = validateModuleName(name);
      } catch (err) {
        return res.status(400).json({ data: null, error: { message: err.message } });
      }

      const module = await Module.findOne({
        where: { name }
      });

      if (!module) {
        return res.status(404).json({ data: null, error: { message: `Le module ${name} n'existe pas` } });
      }

      if (module.installed) {
        return res.status(400).json({ data: null, error: { message: `Le module ${name} est déjà installé` } });
      }

      // Vérifier que le dossier du module existe
      if (!fs.existsSync(modulePath)) {
        return res.status(400).json({ data: null, error: { message: `Le dossier du module ${name} n'existe pas` } });
      }

      // Vérifier les dépendances
      const dependencies = module.dependencies || [];
      const missingDependencies = [];

      for (const dep of dependencies) {
        const dependency = await Module.findOne({
          where: { name: dep, installed: true }
        });

        if (!dependency) {
          missingDependencies.push(dep);
        }
      }

      if (missingDependencies.length > 0) {
        return res.status(400).json({ data: null, error: { message: `Impossible d'installer le module ${name} car certaines dépendances ne sont pas installées`, missingDependencies } });
      }

      // Exécuter les migrations du module si elles existent
      const migrationsPath = path.join(modulePath, 'migrations');
      if (fs.existsSync(migrationsPath)) {
        try {
          // Exécuter les migrations
          await runCommand('npx', ['sequelize-cli', 'db:migrate', '--migrations-path', migrationsPath]);
        } catch (error) {
          console.error(`Erreur lors de l'exécution des migrations du module ${name}:`, error);
          return res.status(500).json({ data: null, error: { message: `Une erreur est survenue lors de l'exécution des migrations du module ${name}` } });
        }
      }

      // Exécuter les seeders du module si ils existent
      const seedersPath = path.join(modulePath, 'seeders');
      if (fs.existsSync(seedersPath)) {
        try {
          // Exécuter les seeders
          await runCommand('npx', ['sequelize-cli', 'db:seed', '--seed-path', seedersPath]);
        } catch (error) {
          console.error(`Erreur lors de l'exécution des seeders du module ${name}:`, error);
          return res.status(500).json({ data: null, error: { message: `Une erreur est survenue lors de l'exécution des seeders du module ${name}` } });
        }
      }

      // Mettre à jour le statut du module
      module.installed = true;
      module.installedAt = new Date();
      await module.save();

      return res.status(200).json({ data: module, error: null });
    } catch (error) {
      console.error(`Erreur lors de l'installation du module ${req.params.name}:`, error);
      return res.status(500).json({ data: null, error: { message: `Une erreur est survenue lors de l'installation du module ${req.params.name}` } });
    }
  },

  /**
   * Désinstalle un module
   */
  async uninstallModule(req, res) {
    try {
      const { name } = req.params;
      try {
        validateModuleName(name);
      } catch (err) {
        return res.status(400).json({ data: null, error: { message: err.message } });
      }

      const module = await Module.findOne({
        where: { name }
      });

      if (!module) {
        return res.status(404).json({ data: null, error: { message: `Le module ${name} n'existe pas` } });
      }

      if (!module.installed) {
        return res.status(400).json({ data: null, error: { message: `Le module ${name} n'est pas installé` } });
      }

      // Vérifier les dépendances
      const dependentModules = await Module.findAll({
        where: {
          installed: true
        }
      });

      // Vérifier si d'autres modules dépendent de celui-ci
      const dependents = dependentModules.filter(m => {
        const deps = m.dependencies || [];
        return deps.includes(name);
      });

      if (dependents.length > 0) {
        return res.status(400).json({ data: null, error: { message: `Impossible de désinstaller le module ${name} car d'autres modules en dépendent`, dependents: dependents.map(m => m.name) } });
      }

      // Mettre à jour le statut du module
      module.installed = false;
      module.active = false;
      await module.save();

      return res.status(200).json({ data: module, error: null });
    } catch (error) {
      console.error(`Erreur lors de la désinstallation du module ${req.params.name}:`, error);
      return res.status(500).json({ data: null, error: { message: `Une erreur est survenue lors de la désinstallation du module ${req.params.name}` } });
    }
  }
};

module.exports = moduleController;
