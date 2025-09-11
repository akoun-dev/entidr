/**
 * Index des types et interfaces pour l'ERP Entidr
 * Ce fichier exporte tous les types et interfaces pour faciliter leur utilisation
 */

// Export des types de modules avec réexportations explicites
export {
  EntidrAddonManifest,
  EntidrModuleCategory,
  EntidrRouteDefinition,
  EntidrModelDefinition,
  EntidrFieldDefinition,
  EntidrFieldType,
  EntidrConstraintDefinition,
  EntidrMenuDefinition,
  EntidrSecurityDefinition,
  EntidrPermissions as EntidrAddonPermissions,
  EntidrModuleConfig,
  EntidrHookDefinition,
  EntidrModuleInfo,
  EntidrModuleRegistry,
  EntidrModuleEvent,
  EntidrDependencyGraph,
  EntidrDependencyResult,
  EntidrModuleSettings,
  EntidrGlobalSettings,
  EntidrMarketplaceModule,
  EntidrMarketplaceResponse,
} from './entidr-addon';

// Export des types de modèles avec réexportations explicites
export {
  EntidrModel,
  EntidrModelField,
  EntidrModelMethod,
  EntidrMethodParameter,
  EntidrMethodReturn,
  EntidrModelHooks,
  EntidrModelConfig,
  EntidrRelation,
  EntidrQueryOptions,
  EntidrIncludeOptions,
  EntidrIncludeThroughOptions,
  EntidrFindOptions,
  EntidrCreateOptions,
  EntidrUpdateOptions,
  EntidrDestroyOptions,
  EntidrModelInstance,
  EntidrModelResult,
  EntidrValidationRule,
  EntidrValidationError as EntidrModelValidationError,
  EntidrAggregateOptions,
  EntidrAggregateResult,
  EntidrTransactionOptions,
  EntidrTransaction,
  EntidrSchemaOptions,
  EntidrMigration,
  EntidrSeeder,
  EntidrModelRegistry,
  EntidrModelIndex,
  EntidrModelEvent,
  EntidrModelScope,
  EntidrStaticMethods,
} from './entidr-model';

// Export des types de sécurité avec réexportations explicites
export {
  EntidrSecurityRule,
  EntidrAccessControl,
  EntidrPermissions,
  EntidrGroup,
  EntidrGroupPermission,
  EntidrUser,
  EntidrUserPermission,
  EntidrUserSettings,
  EntidrNotificationSettings,
  EntidrDashboardSettings as EntidrSecurityDashboardSettings,
  EntidrPrivacySettings,
  EntidrUserSecurity,
  EntidrUserSession,
  EntidrRole,
  EntidrRolePermission,
  EntidrApiKey,
  EntidrApiKeyPermission,
  EntidrSecurityPolicy,
  EntidrAuditLog,
  EntidrSecurityEvent,
  EntidrSecurityEventType,
  EntidrSecurityConfig,
  EntidrPermissionMatrix,
  EntidrSecurityContext,
  EntidrAccessResult,
  EntidrFieldSecurity,
  EntidrRecordSecurity,
  EntidrSecurityFilter,
  EntidrSecurityDomain,
  EntidrSecurityMiddlewareOptions,
  EntidrRateLimitConfig,
  EntidrCSRFConfig,
  EntidrCORSConfig,
  EntidrHelmetConfig,
} from './entidr-security';

// Export des types de vues avec réexportations explicites
export {
  EntidrViewDefinition,
  EntidrViewType,
  EntidrViewField,
  EntidrListViewConfig,
  EntidrFormViewConfig,
  EntidrFormGroup,
  EntidrFormTab,
  EntidrFormButton,
  EntidrKanbanViewConfig,
  EntidrCalendarViewConfig,
  EntidrGraphViewConfig,
  EntidrPivotViewConfig,
  EntidrSearchViewConfig,
  EntidrSearchFilter,
  EntidrSearchFavorite,
  EntidrViewRenderer,
  EntidrViewRendererProps,
  EntidrViewSwitcher,
  EntidrViewFilter,
  EntidrViewGroup,
  EntidrViewSort,
  EntidrViewAction,
  EntidrViewToolbar,
  EntidrViewContext,
  EntidrViewEvent,
  EntidrViewConfig,
  EntidrViewRegistry,
} from './entidr-view';

// Export des types de dashboard avec réexportations explicites
export {
  EntidrDashboardConfig,
  EntidrDashboardWidget,
  EntidrWidgetType,
  EntidrWidgetPosition,
  EntidrWidgetSize,
  EntidrWidgetConfig,
  EntidrKPIConfig,
  EntidrChartConfig,
  EntidrListConfig,
  EntidrListAction,
  EntidrListFilter,
  EntidrListSort,
  EntidrTableConfig,
  EntidrTableColumn,
  EntidrCalendarConfig,
  EntidrMapConfig,
  EntidrGaugeConfig,
  EntidrProgressConfig,
  EntidrMetricConfig,
  EntidrActivityConfig,
  EntidrActivityAction,
  EntidrNewsConfig,
  EntidrCustomConfig,
  EntidrDashboardBuilder,
  EntidrAvailableWidget,
  EntidrDashboardTemplate,
  EntidrDashboardLayout,
  EntidrDashboardWidgetRenderer,
  EntidrWidgetRendererProps,
  EntidrDashboardEvent,
  EntidrDashboardRegistry,
  EntidrDashboardSettings,
} from './entidr-dashboard';

// Types communs et utilitaires
export interface EntidrBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  active?: boolean;
}

export interface EntidrApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface EntidrPaginatedResponse<T = any> extends EntidrApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EntidrFilter {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'ilike' | 'in' | 'not in' | 'between' | 'not between';
  value: any;
  logic?: 'and' | 'or';
}

export interface EntidrSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface EntidrSearchOptions {
  query?: string;
  filters?: EntidrFilter[];
  sorts?: EntidrSort[];
  page?: number;
  pageSize?: number;
  include?: string[];
  exclude?: string[];
}

export interface EntidrEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
  userId?: string;
  sessionId?: string;
}

export interface EntidrHook {
  name: string;
  event: string;
  handler: Function;
  priority?: number;
  once?: boolean;
}

export interface EntidrPlugin {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  dependencies?: string[];
  hooks?: EntidrHook[];
  initialize?: (context: any) => Promise<void>;
  destroy?: (context: any) => Promise<void>;
}

export interface EntidrConfig {
  // Configuration de l'application
  app: {
    name: string;
    version: string;
    description: string;
    debug: boolean;
    env: 'development' | 'staging' | 'production';
  };

  // Configuration de la base de données
  database: {
    type: 'sqlite' | 'postgres' | 'mysql' | 'mssql';
    host?: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    storage?: string;
    logging?: boolean;
    pool?: {
      max: number;
      min: number;
      acquire: number;
      idle: number;
    };
  };

  // Configuration du serveur
  server: {
    port: number;
    host: string;
    cors: {
      enabled: boolean;
      origin: string | string[];
      credentials: boolean;
    };
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
    };
  };

  // Configuration de l'authentification
  auth: {
    jwt: {
      secret: string;
      expiresIn: string;
      refreshExpiresIn: string;
    };
    session: {
      timeout: number;
      maxConcurrent: number;
    };
  };

  // Configuration des modules
  modules: {
    autoLoad: boolean;
    paths: string[];
    ignore: string[];
  };

  // Configuration de l'interface utilisateur
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    numberFormat: string;
  };

  // Configuration des performances
  performance: {
    caching: {
      enabled: boolean;
      ttl: number;
    };
    compression: {
      enabled: boolean;
    };
    minification: {
      enabled: boolean;
    };
  };

  // Configuration de la sécurité
  security: {
    helmet: {
      enabled: boolean;
    };
    csrf: {
      enabled: boolean;
    };
    xss: {
      enabled: boolean;
    };
  };

  // Configuration des logs
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'text';
    outputs: ('console' | 'file' | 'database')[];
    file?: {
      path: string;
      maxSize: string;
      maxFiles: number;
    };
  };

  // Configuration des notifications
  notifications: {
    enabled: boolean;
    providers: ('email' | 'sms' | 'push' | 'webhook')[];
    email?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    sms?: {
      provider: string;
      apiKey: string;
      from: string;
    };
  };

  // Configuration des fichiers
  files: {
    storage: 'local' | 's3' | 'azure' | 'gcs';
    local?: {
      path: string;
      maxFileSize: number;
      allowedTypes: string[];
    };
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };

  // Configuration des API externes
  external: {
    services: Record<string, {
      baseUrl: string;
      apiKey?: string;
      timeout: number;
      retries: number;
    }>;
  };

  // Configuration des tâches planifiées
  cron: {
    enabled: boolean;
    timezone: string;
    jobs: Array<{
      name: string;
      schedule: string;
      handler: string;
      active: boolean;
    }>;
  };
}

// Types pour les erreurs
export interface EntidrError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: Date;
}

export interface EntidrValidationError extends EntidrError {
  field: string;
  value: any;
  constraints: Record<string, string>;
}

export interface EntidrAuthorizationError extends EntidrError {
  requiredPermissions: string[];
  userPermissions: string[];
}

export interface EntidrNotFoundError extends EntidrError {
  resource: string;
  resourceId: string;
}

export interface EntidrConflictError extends EntidrError {
  conflict: {
    field: string;
    value: any;
    existingId: string;
  };
}

// Types pour les utilitaires
export interface EntidrUtils {
  format: {
    date: (date: Date, format?: string) => string;
    number: (number: number, format?: string) => string;
    currency: (amount: number, currency?: string) => string;
    percentage: (value: number, decimals?: number) => string;
  };
  validation: {
    email: (email: string) => boolean;
    phone: (phone: string) => boolean;
    url: (url: string) => boolean;
    uuid: (uuid: string) => boolean;
  };
  crypto: {
    hash: (data: string, algorithm?: string) => string;
    encrypt: (data: string, key: string) => string;
    decrypt: (encrypted: string, key: string) => string;
    generateUUID: () => string;
  };
  string: {
    slugify: (text: string) => string;
    truncate: (text: string, length: number) => string;
    capitalize: (text: string) => string;
    camelCase: (text: string) => string;
    snakeCase: (text: string) => string;
    kebabCase: (text: string) => string;
  };
  array: {
    unique: <T>(array: T[]) => T[];
    groupBy: <T>(array: T[], key: string) => Record<string, T[]>;
    sortBy: <T>(array: T[], key: string, direction?: 'asc' | 'desc') => T[];
    chunk: <T>(array: T[], size: number) => T[][];
  };
  object: {
    deepClone: <T>(obj: T) => T;
    merge: <T>(target: T, source: Partial<T>) => T;
    pick: <T, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
    omit: <T, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>;
  };
}

// Types pour les constantes
export const ENTIDR_CONSTANTS = {
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: 30000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  SUPPORTED_DOCUMENT_FORMATS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'webm', 'ogg'],
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'ogg'],
  DATE_FORMATS: {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    TIMESTAMP: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  },
  NUMBER_FORMATS: {
    DECIMAL: '1,000.00',
    INTEGER: '1,000',
    CURRENCY: '$1,000.00',
    PERCENTAGE: '100.00%',
  },
  TIMEZONES: [
    'UTC',
    'Europe/Paris',
    'America/New_York',
    'Asia/Tokyo',
    'Australia/Sydney',
  ],
  LANGUAGES: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ],
} as const;

// Types pour les énumérations
export enum EntidrLogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum EntidrEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum EntidrDatabaseType {
  SQLITE = 'sqlite',
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  MSSQL = 'mssql',
}

export enum EntidrStorageType {
  LOCAL = 'local',
  S3 = 's3',
  AZURE = 'azure',
  GCS = 'gcs',
}

export enum EntidrNotificationProvider {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

// Types pour les décorateurs
export interface EntidrDecoratorOptions {
  name?: string;
  description?: string;
  deprecated?: boolean;
  since?: string;
  example?: string;
}

export interface EntidrRouteDecoratorOptions extends EntidrDecoratorOptions {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  protected?: boolean;
  permissions?: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}

export interface EntidrModelDecoratorOptions extends EntidrDecoratorOptions {
  tableName?: string;
  timestamps?: boolean;
  paranoid?: boolean;
  underscored?: boolean;
  freezeTableName?: boolean;
}

export interface EntidrFieldDecoratorOptions extends EntidrDecoratorOptions {
  type: string;
  required?: boolean;
  unique?: boolean;
  default?: any;
  validate?: (value: any) => boolean | string;
  transform?: (value: any) => any;
}

export interface EntidrHookDecoratorOptions extends EntidrDecoratorOptions {
  event: string;
  priority?: number;
  once?: boolean;
}

// Types pour les middlewares
export interface EntidrMiddlewareOptions {
  name?: string;
  description?: string;
  priority?: number;
  enabled?: boolean;
  paths?: string[];
  excludePaths?: string[];
}

export interface EntidrAuthMiddlewareOptions extends EntidrMiddlewareOptions {
  secret?: string;
  algorithms?: string[];
  ignoreExpiration?: boolean;
}

export interface EntidrRateLimitMiddlewareOptions extends EntidrMiddlewareOptions {
  windowMs: number;
  max: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any) => void;
}

export interface EntidrCORSiddlewareOptions extends EntidrMiddlewareOptions {
  origin: string | string[];
  credentials: boolean;
  optionsSuccessStatus: number;
  allowedHeaders: string[];
  allowedMethods: string[];
  exposedHeaders: string[];
  maxAge: number;
}

// Types pour les services
export interface EntidrServiceOptions {
  name: string;
  description?: string;
  version?: string;
  dependencies?: string[];
  config?: Record<string, any>;
}

export interface EntidrService {
  name: string;
  description?: string;
  version?: string;
  dependencies?: string[];
  config?: Record<string, any>;
  initialize?: () => Promise<void>;
  destroy?: () => Promise<void>;
  health?: () => Promise<boolean>;
}

// Types pour les contrôleurs
export interface EntidrControllerOptions {
  name: string;
  description?: string;
  version?: string;
  basePath?: string;
  middlewares?: string[];
}

export interface EntidrController {
  name: string;
  description?: string;
  version?: string;
  basePath?: string;
  middlewares?: string[];
  routes: EntidrRoute[];
  initialize?: () => Promise<void>;
  destroy?: () => Promise<void>;
}

export interface EntidrRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: Function;
  middlewares?: string[];
  protected?: boolean;
  permissions?: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  description?: string;
  summary?: string;
  tags?: string[];
  parameters?: EntidrRouteParameter[];
  responses?: EntidrRouteResponse[];
}

export interface EntidrRouteParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body' | 'formData';
  required?: boolean;
  type: string;
  description?: string;
  example?: any;
}

export interface EntidrRouteResponse {
  code: number;
  description?: string;
  schema?: any;
  example?: any;
}

// Types pour les tests
export interface EntidrTestOptions {
  name: string;
  description?: string;
  timeout?: number;
  retries?: number;
  parallel?: boolean;
}

export interface EntidrTestSuite {
  name: string;
  description?: string;
  tests: EntidrTestCase[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface EntidrTestCase {
  name: string;
  description?: string;
  test: () => Promise<void>;
  timeout?: number;
  retries?: number;
  skip?: boolean;
  only?: boolean;
}

// Types pour la documentation
export interface EntidrDocumentationOptions {
  title: string;
  description?: string;
  version?: string;
  baseUrl?: string;
  contact?: {
    name: string;
    email: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  tags?: Array<{
    name: string;
    description?: string;
  }>;
}

export interface EntidrAPIDocumentation {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
    contact?: {
      name: string;
      email: string;
      url?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  tags?: Array<{
    name: string;
    description?: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas?: Record<string, any>;
    responses?: Record<string, any>;
    parameters?: Record<string, any>;
    examples?: Record<string, any>;
    requestBodies?: Record<string, any>;
    headers?: Record<string, any>;
    securitySchemes?: Record<string, any>;
    links?: Record<string, any>;
    callbacks?: Record<string, any>;
  };
  security?: Array<{
    [key: string]: string[];
  }>;
  externalDocs?: {
    description?: string;
    url: string;
  };
}
