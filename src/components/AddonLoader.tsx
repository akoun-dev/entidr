import React, { Suspense, useEffect, useState, lazy } from 'react';
import AddonManager from '../core/AddonManager';
import { getAllModules } from '../core/ModuleRegistry';
import moduleService from '../services/moduleService';
import { Module } from '../types/module';
import { debug, info, warn, error } from '../utils/logger';
import LoadingAnimation from './LoadingAnimation';

interface AddonLoaderProps {
  children: React.ReactNode;
}

const Fallback = () => <LoadingAnimation />;

const AddonLoader: React.FC<AddonLoaderProps> = ({ children }) => {
  const [modules, setModules] = useState<React.ReactElement[]>([]);
  const [hasModules, setHasModules] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAddons = async () => {
      try {
        AddonManager.registerHook('preModuleLoad', (moduleName: string) =>
          debug(`Chargement du module ${moduleName} démarré`));

        AddonManager.registerHook('postModuleLoad', (moduleName: string) =>
          debug(`Module ${moduleName} chargé avec succès`));

        let dbModules: Module[] = [];
        try {
          dbModules = await moduleService.getAllModules();
        } catch (err) {
          warn("Erreur DB modules:", err);
        }

        const registryModules = await getAllModules();
        const activeModules = registryModules.filter(addon => {
          const dbModule = dbModules.find(m => m.name === addon.manifest.name);
          return dbModule ? dbModule.active : true;
        });

        // Enregistrer les manifests des addons actifs pour exposer leurs routes/menus
        activeModules.forEach(addon => {
          try {
            if (!AddonManager.getAddon(addon.manifest.name)) {
              AddonManager.registerAddon(addon.manifest);
            }
          } catch (e) {
            warn(`Enregistrement du module ${addon.manifest.name} ignoré:`, e);
          }
        });

        const lazyModules = activeModules.map(addon => {
          const LazyComponent = lazy(() =>
            import(`../../addons/${addon.manifest.name}/views/index.ts`)
              .then(module => ({
                default: module.default || (() => <div>Module {addon.manifest.name} non chargé</div>)
              }))
              .catch(() => ({
                default: () => <div>Erreur de chargement du module {addon.manifest.name}</div>
              }))
          );
          return <LazyComponent key={addon.manifest.name} />;
        });

        setModules(lazyModules);
        setHasModules(activeModules.length > 0);
      } catch (err) {
        setLoadError('Erreur de chargement des modules');
        error("Erreur modules:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAddons();

    return () => {
      AddonManager.cleanup();
    };
  }, []);

  // Ne jamais bloquer l'application de base: toujours rendre {children}
  return (
    <>
      {children}

      {/* Informations non bloquantes */}
      {isLoading && <Fallback />}
      {loadError && (
        <div style={{ padding: 20, color: '#b91c1c' }}>{loadError}</div>
      )}
      {!isLoading && !loadError && !hasModules && (
        <div style={{ padding: 12, color: '#6b7280' }}>Aucun module disponible</div>
      )}

      {/* Rendu des modules si présents */}
      {!isLoading && !loadError && hasModules && (
        <Suspense fallback={<Fallback />}>
          {modules}
        </Suspense>
      )}
    </>
  );
};

export default AddonLoader;
