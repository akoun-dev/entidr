/**
 * Utilitaire pour la découverte dynamique des modules
 *
 * Ce module permet de découvrir automatiquement tous les modules
 * présents dans le dossier addons sans avoir à les importer explicitement.
 */

import { Addon } from '../types/addon';

// Liste des modules connus
// Dans une application réelle, cette liste pourrait être générée automatiquement
// par un script de build ou une API backend
const KNOWN_MODULES = [
  'hr',
  'finance',
  // Ajoutez d'autres modules ici au fur et à mesure qu'ils sont créés
];

/**
 * Charge dynamiquement un module par son nom
 * @param moduleName Nom du module à charger
 * @returns Promise résolvant vers le module chargé
 */
export const loadModule = async (moduleName: string): Promise<any> => {
  try {
    if (!KNOWN_MODULES.includes(moduleName)) {
      console.warn(`Module inconnu: ${moduleName}`);
      return null;
    }

    // Utilisation de l'import dynamique pour charger le module
    return await import(`../../addons/${moduleName}`);
  } catch (error) {
    console.error(`Erreur lors du chargement du module ${moduleName}:`, error);
    return null;
  }
};

/**
 * Découvre et charge tous les modules disponibles
 * @returns Promise résolvant vers un tableau de modules chargés
 */
export const discoverModules = async (): Promise<Addon[]> => {
  const modulePromises = KNOWN_MODULES.map(async (moduleName) => {
    const moduleExports = await loadModule(moduleName);
    if (!moduleExports) return null;

    // Vérifier que le module a un manifeste et des routes
    if (!moduleExports.manifest || !moduleExports.routes) {
      console.warn(`Le module ${moduleName} n'a pas de manifeste ou de routes définis.`);
      return null;
    }

    // Construire l'objet Addon
    const addon: Addon = {
      manifest: moduleExports.manifest,
      routes: moduleExports.routes,
    };

    // Ajouter les fonctions d'initialisation et de nettoyage si elles existent
    if (typeof moduleExports.initialize === 'function') {
      addon.initialize = moduleExports.initialize;
    }

    if (typeof moduleExports.cleanup === 'function') {
      addon.cleanup = moduleExports.cleanup;
    }

    // Ajouter les composants si ils existent
    if (moduleExports.Components) {
      addon.Components = moduleExports.Components;
    }

    return addon;
  });

  // Attendre que tous les modules soient chargés et filtrer les nulls
  const modules = await Promise.all(modulePromises);
  return modules.filter((module): module is Addon => module !== null);
};

/**
 * Dans une application réelle, cette fonction pourrait interroger le backend
 * pour obtenir la liste des modules disponibles, ou scanner le système de fichiers
 */
export const getAvailableModules = async (): Promise<string[]> => {
  // Simulation d'une requête API ou d'un scan de dossier
  return Promise.resolve(KNOWN_MODULES);
};
