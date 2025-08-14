import React, { useEffect, useState } from 'react';
import AddonManager from '../core/AddonManager';
import { getAllModules } from '../core/ModuleRegistry';
import moduleService from '../services/moduleService';
import { Module } from '../types/module';
import logger from '../utils/logger';
import LoadingAnimation from './LoadingAnimation';

interface AddonLoaderProps {
  children: React.ReactNode;
}

/**
 * Composant qui charge tous les addons au démarrage de l'application
 */
const AddonLoader: React.FC<AddonLoaderProps> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadAddons = async () => {
      const addonManager = AddonManager.getInstance();

      try {
        // Récupérer les modules depuis la base de données
        let dbModules: Module[] = [];
        try {
          dbModules = await moduleService.getAllModules();
          logger.debug("Modules récupérés depuis la base de données:", dbModules);
        } catch (error) {
          logger.warn("Impossible de récupérer les modules depuis la base de données:", error);
          logger.warn("Utilisation des modules du registre uniquement.");
        }

        // Découvrir et charger automatiquement tous les modules disponibles
        logger.info("Chargement des modules depuis le registre...");
        const registryModules = await getAllModules();
        logger.info(`${registryModules.length} modules découverts:`, registryModules.map(m => m.manifest.name));

        // Filtrer les modules actifs
        const activeModules = registryModules.filter(addon => {
          // Si le module existe dans la base de données, vérifier son état d'activation
          const dbModule = dbModules.find(m => m.name === addon.manifest.name);
          if (dbModule) {
            return dbModule.active;
          }
          // Si le module n'existe pas dans la base de données, l'activer par défaut
          return true;
        });

        logger.info(`${activeModules.length} modules actifs:`, activeModules.map(m => m.manifest.name));

        // Enregistrer chaque module actif
        for (const addon of activeModules) {
          logger.debug(`Enregistrement du module ${addon.manifest.name}...`);
          logger.debug(`Routes du module ${addon.manifest.name}:`, addon.routes);
          addonManager.registerAddon(addon);
        }

        // Vérifier que les routes sont bien enregistrées
        const allRoutes = addonManager.getAllRoutes();
        logger.debug("Routes après enregistrement:", allRoutes);

        // Vérifier spécifiquement les routes du module HR
        const hrAddon = addonManager.getAddon('hr');
        if (hrAddon) {
          logger.debug("Module HR trouvé:", hrAddon);
          logger.debug("Routes du module HR:", hrAddon.routes);
        } else {
          logger.warn("Module HR non trouvé dans le gestionnaire d'addons");
        }

        // Afficher tous les menus enregistrés
        logger.debug("Menus enregistrés:", addonManager.getAllMenus());
      } catch (error) {
        logger.error("Erreur lors du chargement des modules:", error);
      }

      setLoaded(true);
    };

    loadAddons();

    // Nettoyage lors du démontage du composant
    return () => {
      const addonManager = AddonManager.getInstance();
      addonManager.cleanup();
    };
  }, []);

  if (!loaded) {
    return <LoadingAnimation />;
  }

  return <>{children}</>;
};

export default AddonLoader;
