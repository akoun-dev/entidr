/**
 * Registre des modules de l'application
 *
 * ATTENTION: Ce fichier est généré automatiquement par le script generateModuleRegistry.js
 * Ne pas modifier manuellement ce fichier, il sera écrasé à la prochaine génération.
 */

import { Addon } from '../types/addon';

// Liste des noms de modules disponibles
// Cette liste est générée automatiquement en fonction des modules présents dans le dossier addons
export const AVAILABLE_MODULE_NAMES = [
  'project',
  'inventory',
  'hr',
  'finance',
  'crm',
];

// Fonction pour charger dynamiquement un module
async function loadModule(moduleName: string): Promise<any> {
  try {
    // Utilisation de l'import dynamique pour charger le module
    return await import(`../../addons/${moduleName}/index.ts`);
  } catch (error) {
    console.error(`Erreur lors du chargement du module ${moduleName}:`, error);
    return null;
  }
}

/**
 * Récupère la liste des noms de modules disponibles
 * @returns Liste des noms de modules
 */
export const getAvailableModuleNames = (): string[] => {
  return AVAILABLE_MODULE_NAMES;
};

/**
 * Récupère un module par son nom
 * @param moduleName Nom du module
 * @returns Promise résolvant vers le module ou null s'il n'existe pas
 */
export const getModule = async (moduleName: string): Promise<any> => {
  if (!AVAILABLE_MODULE_NAMES.includes(moduleName)) {
    return null;
  }
  return await loadModule(moduleName);
};

/**
 * Récupère tous les modules disponibles sous forme d'objets Addon
 * @returns Promise résolvant vers un tableau de modules sous forme d'objets Addon
 */
export const getAllModules = async (): Promise<Addon[]> => {
  const modulePromises = AVAILABLE_MODULE_NAMES.map(async (name) => {
    const module = await loadModule(name);
    if (!module) return null;

    // Vérifier que le module a un manifeste et des routes
    if (!module.manifest || !module.routes) {
      console.warn(`Le module ${name} n'a pas de manifeste ou de routes définis.`);
      return null;
    }

    // Construire l'objet Addon
    const addon: Addon = {
      manifest: module.manifest,
      routes: module.routes,
    };

    // Ajouter les fonctions d'initialisation et de nettoyage si elles existent
    if (typeof module.initialize === 'function') {
      addon.initialize = module.initialize;
    }

    if (typeof module.cleanup === 'function') {
      addon.cleanup = module.cleanup;
    }

    // Ajouter les composants si ils existent
    if (module.Components) {
      addon.Components = module.Components;
    }

    return addon;
  });

  // Attendre que tous les modules soient chargés et filtrer les nulls
  const modules = await Promise.all(modulePromises);
  return modules.filter((addon): addon is Addon => addon !== null);
};