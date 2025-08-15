import { ReactNode } from 'react';
import { Addon, AddonManifest, MenuDefinition } from '../types/addon';
import { debug, info, warn, error } from '../utils/logger';
import { ModuleConfig, validateModuleConfig } from './ModuleConfig';
import { createSandbox } from './ModuleSandbox';

/**
 * Gestionnaire des addons de l'application
 * Responsable du chargement, de l'initialisation et de la gestion des addons
 */
class AddonManager {
  private static instance: AddonManager;
  private addons: Map<string, Addon> = new Map();
  private menus: MenuDefinition[] = [];
  private hooks: Map<string, Function[]> = new Map();

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
  public async registerAddon(addon: Addon): Promise<void> {
    const config = validateModuleConfig(addon.manifest);
    const { name } = config;

    // Initialize sandbox if required
    if (config.sandbox) {
      addon.sandbox = createSandbox(config);
    }

    // Apply CSS scoping
    if (config.scopedStyles) {
      this.applyStyleScoping(config.name);
    }
    
    if (this.addons.has(name)) {
      warn(`Addon ${name} déjà enregistré - remplacement en cours`);
      await this.unregisterAddon(name);
    }

    try {
      // Appeler les hooks pré-enregistrement
      await this.triggerHook('preAddonRegister', addon);

      this.addons.set(name, addon);

      // Initialisation conditionnelle
      if (addon.initialize) {
        await addon.initialize();
      }

      // Gestion des menus
      if (addon.manifest.menus) {
        this.menus = [...this.menus, ...addon.manifest.menus];
      }

      info(`Addon ${name} enregistré avec succès`);
      await this.triggerHook('postAddonRegister', addon);
    } catch (error) {
      error(`Erreur lors de l'enregistrement de l'addon ${name}:`, error);
      await this.triggerHook('addonRegisterError', addon, error);
      throw error;
    }
  }

  /**
   * Désenregistre un addon
   * @param name Nom de l'addon
   */
  public async unregisterAddon(name: string): Promise<void> {
    const addon = this.addons.get(name);
    if (!addon) return;

    try {
      await this.triggerHook('preAddonUnregister', addon);

      if (addon.cleanup) {
        await addon.cleanup();
      }

      // Supprimer les menus associés
      this.menus = this.menus.filter(menu => !('module' in menu) || menu.module !== name);
      this.addons.delete(name);

      await this.triggerHook('postAddonUnregister', name);
    } catch (error) {
      error(`Erreur lors du désenregistrement de l'addon ${name}:`, error);
      await this.triggerHook('addonUnregisterError', name, error);
      throw error;
    }
  }

  /**
   * Déclenche un hook interne
   * @param hookName Nom du hook
   * @param args Arguments
   */
  private async triggerHook(hookName: string, ...args: any[]): Promise<void> {
    const hooks = this.hooks.get(hookName) || [];
    await Promise.all(hooks.map(hook => hook(...args)));
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

  private applyStyleScoping(moduleName: string): void {
    const styleSheets = document.querySelectorAll(`link[data-module="${moduleName}"]`);
    styleSheets.forEach(sheet => {
      sheet.setAttribute('scoped', '');
    });
  }

  /**
   * Enregistre un hook pour un événement spécifique
   * @param hookName Nom du hook
   * @param callback Fonction de callback
   */
  public registerHook(hookName: string, callback: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName)?.push(callback);
  }

  /**
   * Nettoie tous les addons et réinitialise le gestionnaire
   */
  public cleanup(): void {
    this.addons.forEach(addon => {
      if (addon.cleanup) {
        addon.cleanup();
      }
      if (addon.sandbox) {
        addon.sandbox.destroy();
      }
    });

    this.addons.clear();
    this.menus = [];
    this.hooks.clear();
  }
}

export default AddonManager;
