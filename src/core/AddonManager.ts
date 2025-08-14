import { ReactNode } from 'react';
import { Addon, AddonManifest, MenuDefinition } from '../types/addon';
import logger from '../utils/logger';

/**
 * Gestionnaire des addons de l'application
 * Responsable du chargement, de l'initialisation et de la gestion des addons
 */
class AddonManager {
  private static instance: AddonManager;
  private addons: Map<string, Addon> = new Map();
  private menus: MenuDefinition[] = [];

  /**
   * Obtient l'instance unique du gestionnaire d'addons (Singleton)
   */
  public static getInstance(): AddonManager {
    if (!AddonManager.instance) {
      AddonManager.instance = new AddonManager();
    }
    return AddonManager.instance;
  }

  /**
   * Enregistre un addon dans le gestionnaire
   * @param addon L'addon à enregistrer
   */
  public registerAddon(addon: Addon): void {
    if (this.addons.has(addon.manifest.name)) {
      logger.warn(`L'addon ${addon.manifest.name} est déjà enregistré. Il sera remplacé.`);
    }

    this.addons.set(addon.manifest.name, addon);

    // Initialiser l'addon si une fonction d'initialisation est fournie
    if (addon.initialize) {
      addon.initialize();
    }

    // Ajouter les menus de l'addon
    if (addon.manifest.menus) {
      this.menus = [...this.menus, ...addon.manifest.menus];
    }

    logger.info(`Addon ${addon.manifest.name} enregistré avec succès.`);

  }

  /**
   * Obtient un addon par son nom
   * @param name Nom de l'addon
   * @returns L'addon ou undefined s'il n'existe pas
   */
  public getAddon(name: string): Addon | undefined {
    return this.addons.get(name);
  }

  /**
   * Obtient tous les addons enregistrés
   * @returns Un tableau de tous les addons
   */
  public getAllAddons(): Addon[] {
    return Array.from(this.addons.values());
  }

  /**
   * Obtient tous les manifestes des addons enregistrés
   * @returns Un tableau de tous les manifestes
   */
  public getAllManifests(): AddonManifest[] {
    return this.getAllAddons().map(addon => addon.manifest);
  }

  /**
   * Obtient toutes les routes de tous les addons
   * @returns Un tableau de routes React
   */
  public getAllRoutes(): ReactNode[] {
    return this.getAllAddons().map(addon => addon.routes);
  }

  /**
   * Obtient tous les menus de tous les addons
   * @returns Un tableau de tous les menus
   */
  public getAllMenus(): MenuDefinition[] {
    return this.menus;
  }

  /**
   * Nettoie tous les addons et réinitialise le gestionnaire
   */
  public cleanup(): void {
    this.addons.forEach(addon => {
      if (addon.cleanup) {
        addon.cleanup();
      }
    });

    this.addons.clear();
    this.menus = [];
  }
}

export default AddonManager;
