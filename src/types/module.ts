/**
 * Interface pour un module
 */
export interface Module {
  id: number;
  name: string;
  displayName: string;
  version: string;
  summary?: string;
  description?: string;
  active: boolean;
  installed: boolean;
  installable: boolean;
  application: boolean;
  autoInstall: boolean;
  dependencies: string[];
  models: string[];
  installedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour les paramètres de module
 */
export interface ModuleListSettings {
  installedModules: string[];
  autoUpdate: boolean;
  updateChannel: string;
  dependencies: Record<string, string>;
}
