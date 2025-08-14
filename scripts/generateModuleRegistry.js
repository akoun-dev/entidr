/**
 * Script pour générer automatiquement le registre des modules
 *
 * Ce script scanne le dossier addons, identifie tous les modules valides
 * et génère automatiquement le fichier ModuleRegistry.ts
 *
 * Usage: node scripts/generateModuleRegistry.js
 */

const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

// Chemins
const ADDONS_DIR = path.resolve(__dirname, '../addons');
const OUTPUT_FILE = path.resolve(__dirname, '../src/core/ModuleRegistry.ts');

/**
 * Vérifie si un dossier est un module valide
 * Un module valide doit avoir un fichier index.ts et un fichier manifest.ts
 */
function isValidModule(modulePath) {
  return (
    fs.existsSync(path.join(modulePath, 'index.ts')) &&
    fs.existsSync(path.join(modulePath, 'manifest.ts'))
  );
}

/**
 * Lit le manifeste d'un module
 * @param {string} modulePath Chemin vers le dossier du module
 * @returns {Object|null} Manifeste du module ou null en cas d'erreur
 */
function readModuleManifest(modulePath) {
  try {
    const manifestPath = path.join(modulePath, 'manifest.ts');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');

    // Extraire les informations du manifeste à l'aide d'expressions régulières
    // Note: Cette approche est simplifiée et pourrait ne pas fonctionner pour tous les cas
    // Une approche plus robuste serait d'utiliser un transpileur TypeScript

    // Extraire le nom
    const nameMatch = manifestContent.match(/name:\s*['"]([^'"]+)['"]/);
    const name = nameMatch ? nameMatch[1] : null;

    // Extraire les dépendances
    const depsMatch = manifestContent.match(/dependencies:\s*\[(.*?)\]/s);
    const depsString = depsMatch ? depsMatch[1] : '';
    const dependencies = depsString
      .split(',')
      .map(dep => dep.trim().replace(/['"]/g, ''))
      .filter(dep => dep);

    // Extraire les modèles
    const modelsMatch = manifestContent.match(/models:\s*\[(.*?)\]/s);
    const modelsString = modelsMatch ? modelsMatch[1] : '';
    const models = modelsString
      .split(',')
      .map(model => {
        const trimmed = model.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          // C'est un objet de définition de modèle, extraire le nom
          const nameMatch = trimmed.match(/name:\s*['"]([^'"]+)['"]/);
          return nameMatch ? nameMatch[1] : null;
        }
        return trimmed.replace(/['"]/g, '');
      })
      .filter(model => model);

    return {
      name,
      dependencies,
      models
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture du manifeste du module ${path.basename(modulePath)}:`, error);
    return null;
  }
}

/**
 * Trie les modules en fonction de leurs dépendances
 * @param {string[]} moduleNames Noms des modules
 * @param {Object} manifestsMap Map des manifestes par nom de module
 * @returns {string[]} Modules triés
 */
function sortModulesByDependencies(moduleNames, manifestsMap) {
  // Construire un graphe de dépendances
  const graph = {};

  // Initialiser le graphe
  moduleNames.forEach(name => {
    graph[name] = [];
  });

  // Ajouter les dépendances au graphe
  moduleNames.forEach(name => {
    const manifest = manifestsMap[name];
    if (manifest && manifest.dependencies) {
      manifest.dependencies.forEach(dep => {
        if (moduleNames.includes(dep)) {
          graph[name].push(dep);
        }
      });
    }
  });

  // Tri topologique
  const visited = {};
  const temp = {};
  const result = [];

  function visit(name) {
    if (temp[name]) {
      // Cycle détecté
      console.error(`Cycle de dépendances détecté impliquant le module ${name}`);
      return;
    }

    if (!visited[name]) {
      temp[name] = true;

      // Visiter les dépendances
      graph[name].forEach(dep => {
        visit(dep);
      });

      temp[name] = false;
      visited[name] = true;
      result.unshift(name);
    }
  }

  // Visiter tous les modules
  moduleNames.forEach(name => {
    if (!visited[name]) {
      visit(name);
    }
  });

  return result;
}

/**
 * Génère le contenu du fichier ModuleRegistry.ts
 */
function generateRegistryContent(moduleNames) {
  const lines = [
    '/**',
    " * Registre des modules de l'application",
    ' *',
    " * ATTENTION: Ce fichier est généré automatiquement par le script generateModuleRegistry.js",
    " * Ne pas modifier manuellement ce fichier, il sera écrasé à la prochaine génération.",
    ' */',
    '',
    "import { Addon } from '../types/addon';",
    '',
    '// Liste des noms de modules disponibles',
    "// Cette liste est générée automatiquement en fonction des modules présents dans le dossier addons",
    'export const AVAILABLE_MODULE_NAMES = [',
    ...moduleNames.map(name => `  '${name}',`),
    '];',
    '',
    '// Fonction pour charger dynamiquement un module',
    'async function loadModule(moduleName: string): Promise<any> {',
    '  try {',
    "    // Utilisation de l'import dynamique pour charger le module",
    '    return await import(`../../addons/${moduleName}/index.ts`);',
    '  } catch (error) {',
    '    console.error(`Erreur lors du chargement du module ${moduleName}:`, error);',
    '    return null;',
    '  }',
    '}',
    '',
    '/**',
    ' * Récupère la liste des noms de modules disponibles',
    ' * @returns Liste des noms de modules',
    ' */',
    'export const getAvailableModuleNames = (): string[] => {',
    '  return AVAILABLE_MODULE_NAMES;',
    '};',
    '',
    '/**',
    " * Récupère un module par son nom",
    ' * @param moduleName Nom du module',
    " * @returns Promise résolvant vers le module ou null s'il n'existe pas",
    ' */',
    'export const getModule = async (moduleName: string): Promise<any> => {',
    '  if (!AVAILABLE_MODULE_NAMES.includes(moduleName)) {',
    '    return null;',
    '  }',
    '  return await loadModule(moduleName);',
    '};',
    '',
    '/**',
    " * Récupère tous les modules disponibles sous forme d'objets Addon",
    " * @returns Promise résolvant vers un tableau de modules sous forme d'objets Addon",
    ' */',
    'export const getAllModules = async (): Promise<Addon[]> => {',
    '  const modulePromises = AVAILABLE_MODULE_NAMES.map(async (name) => {',
    '    const module = await loadModule(name);',
    '    if (!module) return null;',
    '',
    "    // Vérifier que le module a un manifeste et des routes",
    "    if (!module.manifest || !module.routes) {",
    "      console.warn(`Le module ${name} n'a pas de manifeste ou de routes définis.`);",
    '      return null;',
    '    }',
    '',
    "    // Construire l'objet Addon",
    '    const addon: Addon = {',
    '      manifest: module.manifest,',
    '      routes: module.routes,',
    '    };',
    '',
    "    // Ajouter les fonctions d'initialisation et de nettoyage si elles existent",
    "    if (typeof module.initialize === 'function') {",
    '      addon.initialize = module.initialize;',
    '    }',
    '',
    "    if (typeof module.cleanup === 'function') {",
    '      addon.cleanup = module.cleanup;',
    '    }',
    '',
    '    // Ajouter les composants si ils existent',
    '    if (module.Components) {',
    '      addon.Components = module.Components;',
    '    }',
    '',
    '    return addon;',
    '  });',
    '',
    '  // Attendre que tous les modules soient chargés et filtrer les nulls',
    '  const modules = await Promise.all(modulePromises);',
    '  return modules.filter((addon): addon is Addon => addon !== null);',
    '};',
  ];
  return lines.join('\n');
}

/**
 * Fonction principale
 */
function main() {
  try {
    // Vérifier que le dossier addons existe
    if (!fs.existsSync(ADDONS_DIR)) {
      console.error(`Le dossier addons n'existe pas: ${ADDONS_DIR}`);
      process.exit(1);
    }

    // Lire le contenu du dossier addons
    const addonDirs = fs.readdirSync(ADDONS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Filtrer les modules valides
    const validModules = addonDirs.filter(dir =>
      isValidModule(path.join(ADDONS_DIR, dir))
    );

    if (validModules.length === 0) {
      logger.warn('Aucun module valide trouvé dans le dossier addons');
    } else {
      logger.info(`Modules valides trouvés: ${validModules.join(', ')}`);
    }

    // Lire les manifestes des modules
    const manifests = {};
    validModules.forEach(moduleName => {
      const modulePath = path.join(ADDONS_DIR, moduleName);
      const manifest = readModuleManifest(modulePath);
      if (manifest) {
        manifests[moduleName] = manifest;
      }
    });

    // Trier les modules en fonction de leurs dépendances
    const sortedModules = sortModulesByDependencies(validModules, manifests);
    logger.info(`Ordre de chargement des modules: ${sortedModules.join(', ')}`);

    // Générer le contenu du fichier ModuleRegistry.ts
    const content = generateRegistryContent(sortedModules);

    // Créer le dossier src/core s'il n'existe pas
    const coreDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(coreDir)) {
      fs.mkdirSync(coreDir, { recursive: true });
    }

    // Écrire le fichier ModuleRegistry.ts
    fs.writeFileSync(OUTPUT_FILE, content);
    logger.info(`Fichier ModuleRegistry.ts généré avec succès: ${OUTPUT_FILE}`);

    // Mettre à jour la base de données (si nécessaire)
    // Note: Cette partie serait idéalement gérée par un script séparé
    logger.info('Pour mettre à jour la base de données avec les informations des modules:');
    logger.info('1. Exécutez les migrations: npx sequelize-cli db:migrate');
    logger.info('2. Exécutez les seeders: npx sequelize-cli db:seed:all');
  } catch (error) {
    logger.error('Erreur lors de la génération du registre des modules:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();
