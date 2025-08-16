import { AddonManifest, MenuDefinition, RouteDefinition } from '../types/addon';

class AddonManager {
  private static instance: AddonManager;
  private registeredAddons: Map<string, AddonManifest> = new Map();
  private hooks: Map<string, ((moduleName: string) => void)[]> = new Map();

  private constructor() {}

  public static getInstance(): AddonManager {
    if (!AddonManager.instance) {
      AddonManager.instance = new AddonManager();
    }
    return AddonManager.instance;
  }

  public registerAddon(manifest: AddonManifest): void {
    if (this.registeredAddons.has(manifest.name)) {
      throw new Error(`Addon ${manifest.name} already registered`);
    }
    this.registeredAddons.set(manifest.name, manifest);
  }

  public getAddon(name: string): AddonManifest | undefined {
    return this.registeredAddons.get(name);
  }

  public listAddons(): AddonManifest[] {
    return Array.from(this.registeredAddons.values());
  }

  public registerHook(hookName: string, callback: (moduleName: string) => void): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName)?.push(callback);
  }

  public triggerHook(hookName: string, moduleName: string): void {
    this.hooks.get(hookName)?.forEach(callback => callback(moduleName));
  }

  public cleanup(): void {
    this.registeredAddons.clear();
    this.hooks.clear();
  }

  public getAllMenus(): MenuDefinition[] {
    const menus: MenuDefinition[] = [];
    this.registeredAddons.forEach(addon => {
      if (addon.menus) {
        menus.push(...addon.menus);
      }
    });
    return menus;
  }

  public getAllRoutes(): RouteDefinition[] {
    const routes: RouteDefinition[] = [];
    this.registeredAddons.forEach(addon => {
      if (addon.routes) {
        routes.push(...addon.routes);
      }
    });
    return routes;
  }
}

export { AddonManager };
export default AddonManager.getInstance();
