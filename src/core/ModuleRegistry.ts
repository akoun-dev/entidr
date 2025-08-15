/**
 * Registre des modules de l'application
 * Version améliorée avec cache, chargement parallèle et hooks
 */
import { Addon, AddonManifest, RouteDefinition } from '../types/addon';
import logger from '../utils/logger';
import { getCachedManifests, cacheManifests, discoverModules } from '../services/moduleCacheService';
import DependencyResolver from './DependencyResolver';
import { HealthChecker } from './HealthChecker';
import { DeploymentManager } from './DeploymentManager';

// Cache des modules chargés
const moduleCache = new Map<string, any>();

// Hooks système
const hooksRegistry = new Map<string, Function[]>();

// Routes actives (pour tree-shaking)
const activeRoutes = new Set<string>();

// Enregistre les routes actives d'un module
function registerActiveRoutes(manifest: AddonManifest): void {
  if (!manifest.routes) return;
  
  const walkRoutes = (routes: RouteDefinition[]) => {
    routes.forEach(route => {
      activeRoutes.add(route.path);
      if (route.children) walkRoutes(route.children);
    });
  };

  walkRoutes(manifest.routes);
}

// Liste des noms de modules disponibles
export const getAvailableModuleNames = async (): Promise<string[]> => {
  try {
    // Vérifier d'abord le cache
    const cached = await getCachedManifests();
    if (cached) return cached.map(m => m.name);

    // Découvrir les modules si pas dans le cache
    const manifests = await discoverModules();
    await cacheManifests(manifests);
    
    // Vérifier les dépendances
    for (const manifest of manifests) {
      const { valid, conflicts } = await DependencyResolver.resolveDependencies(manifest, manifests);
      if (!valid) {
        logger.warn(`Dependency issues for ${manifest.name}:`, conflicts);
      }
    }
    
    return manifests.map(m => m.name);
  } catch (error) {
    logger.error('Error getting module names:', error);
    return [];
  }
};

/**
 * Enregistre un hook système
 * @param hookName Nom du hook (ex: 'preModuleLoad')
 * @param callback Fonction à exécuter
 */
// Alias pour compatibilité ascendante
export function registerHook<T = any>(hookName: string, callback: (data: T) => void): void {
  registerHook(hookName, callback);
}

/**
 * Déclenche un hook système
 * @param hookName Nom du hook
 * @param args Arguments à passer aux callbacks
 */
// Alias pour compatibilité ascendante
async function triggerHook<T = any>(hookName: string, data: T): Promise<void> {
  await triggerHook(hookName, data);
}

// Fonction optimisée pour charger dynamiquement un module avec lazy loading
async function loadModule(moduleName: string): Promise<any> {
  // Vérifier le cache
  if (moduleCache.has(moduleName)) {
    return moduleCache.get(moduleName);
  }

  try {
    await triggerHook('preModuleLoad', moduleName);

    // Implémentation du lazy loading avec préchargement
    const module = await import(
      /* webpackPrefetch: true */
      `../../addons/${moduleName}/index.ts`
    );
    
    moduleCache.set(moduleName, module);
    await triggerHook('postModuleLoad', { moduleName, module });
    return module;
  } catch (error) {
    logger.error(`Erreur lors du chargement du module ${moduleName}:`, error);
    await triggerHook('moduleLoadError', { moduleName, error });
    return null;
  }
}

/**
 * Récupère un module par son nom
 * @param moduleName Nom du module
 * @returns Promise résolvant vers le module ou null s'il n'existe pas
 */
export const getModule = async (moduleName: string): Promise<any> => {
  const availableModules = await getAvailableModuleNames();
  if (!availableModules.includes(moduleName)) {
    return null;
  }
  return await loadModule(moduleName);
};

/**
 * Récupère tous les modules disponibles sous forme d'objets Addon
 * @returns Promise résolvant vers un tableau de modules sous forme d'objets Addon
 */
export const getAllModules = async (): Promise<Addon[]> => {
  try {
    await triggerHook('preAllModulesLoad', {});

    // Pré-compilation AOT des templates
    await triggerHook('preCompileTemplates', {});

    // Chargement parallèle optimisé
    const modules = await Promise.allSettled(
      (await getAvailableModuleNames()).map(async (name) => {
        const module = await loadModule(name);
        if (!module) return null;

        if (!module.manifest || !module.routes) {
          logger.warn(`Module ${name} - manifeste ou routes manquants`);
          return null;
        }

        const addon: Addon = {
          manifest: module.manifest,
          // Filtrage des routes inactives (tree-shaking)
          routes: module.routes?.filter(route => activeRoutes.has(route.path)),
          ...(module.initialize && { initialize: module.initialize }),
          ...(module.cleanup && { cleanup: module.cleanup }),
          ...(module.Components && { Components: module.Components }),
        };
        
        // Initialisation du système de déploiement
        const healthChecker = new HealthChecker();
        const deploymentManager = new DeploymentManager(healthChecker);
        
        const deployModuleVersion = async (moduleName: string, version: string): Promise<boolean> => {
          const manifests = await getCachedManifests();
          const manifest = manifests.find(m => m.name === moduleName);
          if (!manifest) {
            throw new Error(`Module ${moduleName} not found`);
          }
        
          return deploymentManager.deployBlueGreen(version);
        };
        
        /**
         * Récupère le graphe de dépendances des modules
         */
        const getDependencyGraph = async (): Promise<Record<string, string[]>> => {
          const manifests = await getCachedManifests() || await discoverModules();
          return DependencyResolver.generateDependencyGraph(manifests);
        };

        return addon;
      })
    );

    // Traitement des résultats
    const result = modules
      .map(m => m.status === 'fulfilled' ? m.value : null)
      .filter((addon): addon is Addon => addon !== null);

    await triggerHook('postAllModulesLoad', result);
    return result;
  } catch (error) {
    await triggerHook('allModulesLoadError', error);
    throw error;
  }
};

/**
 * Récupère les routes actives filtrées
 */
export const getActiveRoutes = (): string[] => {
  return Array.from(activeRoutes);
};