/**
 * Types et interfaces pour le système de modules Entidr
 * Ces types définissent la structure des modules/addons pour l'ERP Entidr
 */

export interface EntidrAddonManifest {
  // Métadonnées de base
  name: string;
  version: string;
  displayName: string;
  summary: string;
  description: string;

  // Configuration du module
  category: EntidrModuleCategory;
  application: boolean;
  autoInstall: boolean;
  installable: boolean;

  // Dépendances
  depends: string[];
  external_dependencies: {
    python?: string[];
    node?: string[];
  };

  // Données
  data: string[];
  demo: string[];

  // Informations légales et auteurs
  license: string;
  author: string;
  website?: string;
  price?: number;

  // Routes définies par le module
  routes: EntidrRouteDefinition[];

  // Modèles de données
  models: EntidrModelDefinition[];

  // Menus définis par le module
  menus: EntidrMenuDefinition[];

  // Sécurité
  security: EntidrSecurityDefinition[];

  // Configuration
  config?: EntidrModuleConfig;

  // Hooks et événements
  hooks?: EntidrHookDefinition[];
}

export type EntidrModuleCategory =
  | 'crm'
  | 'sale'
  | 'account'
  | 'hr'
  | 'stock'
  | 'manufacturing'
  | 'project'
  | 'website'
  | 'marketing'
  | 'purchase'
  | 'warehouse'
  | 'technical'
  | 'other';

export interface EntidrRouteDefinition {
  path: string;
  component: React.ComponentType<any>;
  protected: boolean;
  title: string;
  icon?: string;
  exact?: boolean;
  layout?: 'main' | 'settings' | 'auth';
  permissions?: string[];
}

export interface EntidrModelDefinition {
  name: string;
  displayName: string;
  description?: string;
  fields: Record<string, EntidrFieldDefinition>;
  methods?: Record<string, Function>;
  constraints?: EntidrConstraintDefinition[];
  defaults?: Record<string, any>;
  order?: string;
  recName?: string;
  inherit?: string[];
}

export interface EntidrFieldDefinition {
  type: EntidrFieldType;
  required?: boolean;
  readonly?: boolean;
  default?: any;
  label?: string;
  help?: string;
  selection?: [string, string][];
  relation?: string;
  domain?: string;
  compute?: Function;
  store?: boolean;
  depends?: string[];
  tracking?: boolean;
  index?: boolean;
  unique?: boolean;
  size?: number;
  translate?: boolean;
}

export type EntidrFieldType =
  | 'char'
  | 'text'
  | 'html'
  | 'integer'
  | 'float'
  | 'monetary'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'selection'
  | 'many2one'
  | 'one2many'
  | 'many2many'
  | 'reference'
  | 'binary'
  | 'image';

export interface EntidrConstraintDefinition {
  name: string;
  definition: string;
  message: string;
}

export interface EntidrMenuDefinition {
  id: string;
  name: string;
  sequence: number;
  route?: string;
  icon?: string;
  parent?: string;
  groups?: string[];
  webIcon?: string;
  action?: string;
}

export interface EntidrSecurityDefinition {
  model: string;
  group: string;
  permissions: EntidrPermissions;
  domain?: string;
}

export interface EntidrPermissions {
  read: boolean;
  write: boolean;
  create: boolean;
  unlink: boolean;
}

export interface EntidrModuleConfig {
  settings?: Record<string, any>;
  features?: string[];
  integrations?: string[];
  api?: {
    version: string;
    endpoints: string[];
  };
  ui?: {
    theme?: string;
    layout?: string;
    widgets?: string[];
  };
}

export interface EntidrHookDefinition {
  name: string;
  event: string;
  handler: Function;
  priority?: number;
}

// Types pour le gestionnaire de modules
export interface EntidrModuleInfo {
  manifest: EntidrAddonManifest;
  installed: boolean;
  active: boolean;
  installDate?: Date;
  lastUpdate?: Date;
  dependencies: string[];
  dependents: string[];
  path: string;
}

export interface EntidrModuleRegistry {
  [key: string]: EntidrModuleInfo;
}

export interface EntidrModuleEvent {
  type: 'install' | 'uninstall' | 'activate' | 'deactivate' | 'update';
  moduleName: string;
  timestamp: Date;
  data?: any;
}

// Types pour la résolution de dépendances
export interface EntidrDependencyGraph {
  nodes: Map<string, EntidrModuleInfo>;
  edges: Map<string, string[]>;
}

export interface EntidrDependencyResult {
  canInstall: boolean;
  missingDependencies: string[];
  circularDependencies: string[];
  installationOrder: string[];
}

// Types pour la configuration des modules
export interface EntidrModuleSettings {
  [moduleName: string]: {
    [key: string]: any;
  };
}

export interface EntidrGlobalSettings {
  modules: EntidrModuleSettings;
  system: {
    debug: boolean;
    maintenance: boolean;
    version: string;
  };
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
}

// Types pour le marketplace de modules
export interface EntidrMarketplaceModule {
  id: string;
  name: string;
  version: string;
  displayName: string;
  summary: string;
  description: string;
  author: string;
  category: EntidrModuleCategory;
  price?: number;
  rating: number;
  downloads: number;
  tags: string[];
  screenshots: string[];
  compatibility: {
    minVersion: string;
    maxVersion: string;
  };
  dependencies: string[];
  lastUpdate: Date;
}

export interface EntidrMarketplaceResponse {
  modules: EntidrMarketplaceModule[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    category?: EntidrModuleCategory;
    search?: string;
    price?: 'free' | 'paid' | 'all';
    rating?: number;
  };
}
