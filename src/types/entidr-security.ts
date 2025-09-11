/**
 * Types et interfaces pour le système de sécurité Entidr
 * Ces types définissent la structure de sécurité pour l'ERP Entidr
 */

import { EntidrModuleCategory } from './entidr-addon';

export interface EntidrSecurityRule {
  id: string;
  name: string;
  model: string;
  description?: string;
  domainFilter: string; // Expression de domaine pour le filtrage
  groups: string[]; // Groupes concernés
  permissions: EntidrPermissions;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrAccessControl {
  id: string;
  model: string;
  group: string;
  permissions: EntidrPermissions;
  domain?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrPermissions {
  read: boolean;
  write: boolean;
  create: boolean;
  unlink: boolean;
  // Permissions étendues
  export?: boolean;
  import?: boolean;
  share?: boolean;
  approve?: boolean;
  reject?: boolean;
}

export interface EntidrGroup {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category?: EntidrModuleCategory;
  parent?: string; // Groupe parent
  users: string[]; // IDs des utilisateurs
  permissions: EntidrGroupPermission[];
  impliedIds: string[]; // IDs des groupes impliqués (héritage)
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrGroupPermission {
  model: string;
  permissions: EntidrPermissions;
  domain?: string;
}

export interface EntidrUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  language?: string;
  timezone?: string;
  active: boolean;
  verified: boolean;
  lastLogin?: Date;
  groups: string[]; // IDs des groupes
  roles: string[]; // IDs des rôles
  permissions: EntidrUserPermission[];
  settings: EntidrUserSettings;
  security: EntidrUserSecurity;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrUserPermission {
  model: string;
  permissions: EntidrPermissions;
  domain?: string;
}

export interface EntidrUserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  notifications: EntidrNotificationSettings;
  dashboard: EntidrDashboardSettings;
  privacy: EntidrPrivacySettings;
}

export interface EntidrNotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  types: string[];
}

export interface EntidrDashboardSettings {
  layout: string;
  widgets: string[];
  filters: Record<string, any>;
}

export interface EntidrPrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts';
  activityTracking: boolean;
  dataSharing: boolean;
  marketingEmails: boolean;
}

export interface EntidrUserSecurity {
  passwordHash: string;
  passwordSalt: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  loginAttempts: number;
  lastFailedLogin?: Date;
  lockedUntil?: Date;
  passwordExpiresAt?: Date;
  passwordHistory: string[];
  sessions: EntidrUserSession[];
}

export interface EntidrUserSession {
  id: string;
  token: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActive: Date;
  active: boolean;
}

export interface EntidrRole {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category?: EntidrModuleCategory;
  permissions: EntidrRolePermission[];
  users: string[]; // IDs des utilisateurs
  groups: string[]; // IDs des groupes
  active: boolean;
  system: boolean; // Rôle système (non modifiable)
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrRolePermission {
  model: string;
  permissions: EntidrPermissions;
  domain?: string;
}

export interface EntidrApiKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  description?: string;
  user: string; // ID de l'utilisateur
  permissions: EntidrApiKeyPermission[];
  allowedIPs?: string[];
  rateLimit: number;
  expiresAt?: Date;
  lastUsed?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrApiKeyPermission {
  model: string;
  permissions: ('read' | 'write' | 'create' | 'unlink')[];
  domain?: string;
}

export interface EntidrSecurityPolicy {
  id: string;
  name: string;
  type: 'password' | 'session' | 'api' | 'data' | 'access';
  description?: string;
  config: Record<string, any>;
  active: boolean;
  priority: number;
  groups: string[]; // Groupes concernés
  users: string[]; // Utilisateurs concernés
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrAuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  model: string;
  recordId: string | number;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: Date;
}

export interface EntidrSecurityEvent {
  id: string;
  type: EntidrSecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type EntidrSecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'login_locked'
  | 'password_changed'
  | 'password_reset'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'permission_changed'
  | 'group_changed'
  | 'role_changed'
  | 'data_access'
  | 'data_export'
  | 'data_import'
  | 'suspicious_activity'
  | 'brute_force_attempt'
  | 'session_hijack';

export interface EntidrSecurityConfig {
  // Configuration des mots de passe
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number;
    expireDays: number;
  };

  // Configuration des sessions
  sessionPolicy: {
    timeout: number; // en minutes
    maxConcurrent: number;
    rememberMeTimeout: number; // en jours
    requireReauth: boolean;
  };

  // Configuration de la sécurité
  securityPolicy: {
    twoFactorRequired: boolean;
    twoFactorForAdmin: boolean;
    loginAttempts: number;
    lockoutDuration: number; // en minutes
    requireEmailVerification: boolean;
    requireAdminApproval: boolean;
  };

  // Configuration des API
  apiPolicy: {
    rateLimit: number; // requêtes par minute
    burstLimit: number;
    keyExpiration: number; // en jours
    allowedOrigins: string[];
    allowedMethods: string[];
  };

  // Configuration des audits
  auditPolicy: {
    enabled: boolean;
    logRead: boolean;
    logWrite: boolean;
    logDelete: boolean;
    retentionDays: number;
    sensitiveFields: string[];
  };
}

export interface EntidrPermissionMatrix {
  [model: string]: {
    [group: string]: EntidrPermissions;
  };
}

export interface EntidrSecurityContext {
  user: EntidrUser;
  groups: EntidrGroup[];
  roles: EntidrRole[];
  permissions: EntidrUserPermission[];
  session: EntidrUserSession;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface EntidrAccessResult {
  granted: boolean;
  reason?: string;
  domain?: string;
  permissions?: EntidrPermissions;
}

export interface EntidrFieldSecurity {
  model: string;
  field: string;
  groups: string[];
  permissions: 'read' | 'write' | 'hidden';
  condition?: string;
}

export interface EntidrRecordSecurity {
  model: string;
  recordId: string | number;
  userId: string;
  access: 'read' | 'write' | 'none';
  grantedAt: Date;
  grantedBy?: string;
  expiresAt?: Date;
}

export interface EntidrSecurityFilter {
  model: string;
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'ilike' | 'in' | 'not in';
  value: any;
  logic?: 'and' | 'or';
}

export interface EntidrSecurityDomain {
  filters: EntidrSecurityFilter[];
  logic?: 'and' | 'or';
}

// Types pour le middleware de sécurité
export interface EntidrSecurityMiddlewareOptions {
  excludePaths?: string[];
  requireAuth?: boolean;
  requirePermissions?: boolean;
  checkSession?: boolean;
  checkIP?: boolean;
  checkRateLimit?: boolean;
  auditLog?: boolean;
}

export interface EntidrRateLimitConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any) => void;
}

export interface EntidrCSRFConfig {
  enabled: boolean;
  cookieName: string;
  headerName: string;
  tokenLength: number;
  expiresIn: number;
}

export interface EntidrCORSConfig {
  origin: string | string[];
  credentials: boolean;
  optionsSuccessStatus: number;
  allowedHeaders: string[];
  allowedMethods: string[];
  exposedHeaders: string[];
  maxAge: number;
}

export interface EntidrHelmetConfig {
  contentSecurityPolicy?: any;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: boolean;
  dnsPrefetchControl?: boolean;
  expectCt?: boolean;
  frameguard?: boolean;
  hidePoweredBy?: boolean;
  hsts?: boolean;
  ieNoOpen?: boolean;
  noSniff?: boolean;
  permittedCrossDomainPolicies?: boolean;
  referrerPolicy?: boolean;
  xssFilter?: boolean;
}
