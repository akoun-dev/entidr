import React, { Suspense, useEffect, useState, lazy } from 'react';
import AddonManager from '../core/AddonManager';
import { getAllModules, registerHook } from '../core/ModuleRegistry';
import moduleService from '../services/moduleService';
import { Module } from '../types/module';
import logger from '../utils/logger';
import LoadingAnimation from './LoadingAnimation';

interface AddonLoaderProps {
  children: React.ReactNode;
}

// Composant de fallback pour le lazy loading
const Fallback = () => <LoadingAnimation />;

/**
 * Composant qui charge tous les addons au démarrage de l'application
 */
const AddonLoader: React.FC<AddonLoaderProps> = ({ children }) => {
  const [modules, setModules] = useState<React.ReactElement[]>([]);
  const [hasModules, setHasModules] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAddons = async () => {
      try {
        const addonManager = AddonManager.getInstance();

        registerHook('preModuleLoad', (moduleName: string) =>
          logger.debug(`Chargement du module ${moduleName} démarré`));

        registerHook('postModuleLoad', (moduleName: string) =>
          logger.debug(`Module ${moduleName} chargé avec succès`));

        let dbModules: Module[] = [];
        try {
          dbModules = await moduleService.getAllModules();
        } catch (error) {
          logger.warn("Erreur DB modules:", error);
        }

        const registryModules = await getAllModules();
        const activeModules = registryModules.filter(addon => {
          const dbModule = dbModules.find(m => m.name === addon.manifest.name);
          return dbModule ? dbModule.active : true;
        });

        const lazyModules = activeModules.map(addon => {
          const LazyComponent = lazy(() =>
            import(`../../addons/${addon.manifest.name}/views/index.ts`)
              .then(module => ({ default: module.default }))
          );
          return <LazyComponent key={addon.manifest.name} />;
        });

        setModules(lazyModules);
        setHasModules(activeModules.length > 0);
      } catch (error) {
        setError('Erreur de chargement des modules');
        logger.error("Erreur modules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddons();

    // Nettoyage lors du démontage du composant
    return () => {
      const addonManager = AddonManager.getInstance();
      addonManager.cleanup();
    };
  }, []);

  if (isLoading) {
    return <Fallback />;
  }

  if (error) {
    return <div style={{ padding: 20 }}>{error}</div>;
  }

  if (!hasModules) {
    return <div style={{ padding: 20 }}>Aucun module disponible</div>;
  }

  return (
    <>
      {children}
      <Suspense fallback={<Fallback />}>
        {modules}
      </Suspense>
    </>
  );
};

export default AddonLoader;
