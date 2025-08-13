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
   * Récupère tous les modules
   */
  async getAllModules(req, res) {
    try {
      const modules = await Module.findAll({
        order: [['displayName', 'ASC']]
      });
      
      return res.status(200).json(modules);
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      return res.status(500).json({
        message: 'Une erreur est survenue lors de la récupération des modules',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          message: err.message
        });
      }

      const module = await Module.findOne({
        where: { name }
      });
      
      if (!module) {
        return res.status(404).json({
          message: `Le module ${name} n'existe pas`
        });
      }
      
      return res.status(200).json(module);
    } catch (error) {
      console.error(`Erreur lors de la récupération du module ${req.params.name}:`, error);
      return res.status(500).json({
        message: `Une erreur est survenue lors de la récupération du module ${req.params.name}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          message: err.message
        });
      }

      const module = await Module.findOne({
        where: { name }
      });
      
      if (!module) {
        return res.status(404).json({
          message: `Le module ${name} n'existe pas`
        });
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
          return res.status(400).json({
            message: `Impossible de désactiver le module ${name} car d'autres modules en dépendent`,
            dependents: dependents.map(m => m.name)
          });
        }
      }
      
      // Mettre à jour le statut du module
      module.active = active;
      await module.save();
      
      return res.status(200).json({
        message: `Le module ${name} a été ${active ? 'activé' : 'désactivé'} avec succès`,
        module
      });
    } catch (error) {
      console.error(`Erreur lors de la modification du statut du module ${req.params.name}:`, error);
      return res.status(500).json({
        message: `Une erreur est survenue lors de la modification du statut du module ${req.params.name}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          message: err.message
        });
      }

      const module = await Module.findOne({
        where: { name }
      });
      
      if (!module) {
        return res.status(404).json({
          message: `Le module ${name} n'existe pas`
        });
      }
      
      if (module.installed) {
        return res.status(400).json({
          message: `Le module ${name} est déjà installé`
        });
      }
      
      // Vérifier que le dossier du module existe
      if (!fs.existsSync(modulePath)) {
        return res.status(400).json({
          message: `Le dossier du module ${name} n'existe pas`
        });
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
        return res.status(400).json({
          message: `Impossible d'installer le module ${name} car certaines dépendances ne sont pas installées`,
          missingDependencies
        });
      }
      
      // Exécuter les migrations du module si elles existent
      const migrationsPath = path.join(modulePath, 'migrations');
      if (fs.existsSync(migrationsPath)) {
        try {
          // Exécuter les migrations
          await runCommand('npx', ['sequelize-cli', 'db:migrate', '--migrations-path', migrationsPath]);
        } catch (error) {
          console.error(`Erreur lors de l'exécution des migrations du module ${name}:`, error);
          return res.status(500).json({
            message: `Une erreur est survenue lors de l'exécution des migrations du module ${name}`,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
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
          return res.status(500).json({
            message: `Une erreur est survenue lors de l'exécution des seeders du module ${name}`,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      }
      
      // Mettre à jour le statut du module
      module.installed = true;
      module.installedAt = new Date();
      await module.save();
      
      return res.status(200).json({
        message: `Le module ${name} a été installé avec succès`,
        module
      });
    } catch (error) {
      console.error(`Erreur lors de l'installation du module ${req.params.name}:`, error);
      return res.status(500).json({
        message: `Une erreur est survenue lors de l'installation du module ${req.params.name}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          message: err.message
        });
      }

      const module = await Module.findOne({
        where: { name }
      });
      
      if (!module) {
        return res.status(404).json({
          message: `Le module ${name} n'existe pas`
        });
      }
      
      if (!module.installed) {
        return res.status(400).json({
          message: `Le module ${name} n'est pas installé`
        });
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
        return res.status(400).json({
          message: `Impossible de désinstaller le module ${name} car d'autres modules en dépendent`,
          dependents: dependents.map(m => m.name)
        });
      }
      
      // Mettre à jour le statut du module
      module.installed = false;
      module.active = false;
      await module.save();
      
      return res.status(200).json({
        message: `Le module ${name} a été désinstallé avec succès`,
        module
      });
    } catch (error) {
      console.error(`Erreur lors de la désinstallation du module ${req.params.name}:`, error);
      return res.status(500).json({
        message: `Une erreur est survenue lors de la désinstallation du module ${req.params.name}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = moduleController;
