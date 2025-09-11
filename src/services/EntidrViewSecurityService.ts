import { EventEmitter } from 'events';

/**
 * Types de permissions pour les vues
 */
export enum ViewPermission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  CREATE = 'create',
  CONFIGURE = 'configure',
  SHARE = 'share',
  EXPORT = 'export',
  ADMIN = 'admin'
}

/**
 * Types de ressources pour les permissions
 */
export enum ViewResourceType {
  VIEW = 'view',
  FIELD = 'field',
  RECORD = 'record',
  ACTION = 'action',
  FILTER = 'filter',
  GROUP = 'group',
  SORT = 'sort',
  LAYOUT = 'layout',
  THEME = 'theme'
}

/**
 * Niveaux d'accès
 */
export enum AccessLevel {
  DENIED = 'denied',
  READ_ONLY = 'read_only',
  LIMITED = 'limited',
  FULL = 'full',
  CUSTOM = 'custom'
}

/**
 * Interface pour les options de sécurité
 */
export interface ViewSecurityOptions {
  enableRoleBasedAccess?: boolean;
  enableAttributeBasedAccess?: boolean;
  enableDataEncryption?: boolean;
  enableAuditLogging?: boolean;
  enableFieldLevelSecurity?: boolean;
  enableRowLevelSecurity?: boolean;
  defaultAccessLevel?: AccessLevel;
  enforceStrictMode?: boolean;
  cachePermissions?: boolean;
  cacheTTL?: number;
  debug?: boolean;
}

/**
 * Interface pour une permission
 */
export interface ViewPermissionData {
  id: string;
  resourceType: ViewResourceType;
  resourceId: string;
  permission: ViewPermission;
  conditions?: PermissionCondition[];
  granted: boolean;
  grantedAt: number;
  grantedBy?: string;
  expiresAt?: number;
  isSystemRole?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Interface pour les conditions de permission
 */
export interface PermissionCondition {
  type: 'attribute' | 'role' | 'relationship' | 'custom';
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  metadata?: Record<string, any>;
}

/**
 * Interface pour les rôles
 */
export interface ViewRole {
  id: string;
  name: string;
  description?: string;
  permissions: ViewPermissionData[];
  isSystemRole?: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface pour le contexte de sécurité
 */
export interface SecurityContext {
  userId: string;
  roles: string[];
  attributes: Record<string, any>;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}

/**
 * Interface pour les règles d'accès
 */
export interface AccessRule {
  id: string;
  name: string;
  description?: string;
  resourceType: ViewResourceType;
  resourceId: string;
  conditions: PermissionCondition[];
  effect: 'allow' | 'deny';
  priority: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Interface pour les entrées d'audit
 */
export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string;
  sessionId: string;
  action: string;
  resourceType: ViewResourceType;
  resourceId: string;
  result: 'success' | 'failure' | 'denied' | 'partial';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Interface pour les métriques de sécurité
 */
export interface SecurityMetrics {
  totalPermissionChecks: number;
  permissionGrants: number;
  permissionDenials: number;
  averageCheckTime: number;
  cacheHitRate: number;
  activeRoles: number;
  activeRules: number;
  auditEntries: number;
  securityViolations: number;
}

/**
 * Service de sécurité pour les vues Entidr
 * Gère les permissions, les rôles, les règles d'accès et l'audit
 */
export class EntidrViewSecurityService extends EventEmitter {
  private permissions: Map<string, ViewPermissionData> = new Map();
  private roles: Map<string, ViewRole> = new Map();
  private accessRules: Map<string, AccessRule> = new Map();
  private auditLog: AuditEntry[] = [];
  private permissionCache: Map<string, { granted: boolean; timestamp: number }> = new Map();
  private metrics: SecurityMetrics = this.initializeMetrics();
  private options: Required<ViewSecurityOptions>;
  private securityContext: SecurityContext | null = null;

  constructor(options: ViewSecurityOptions = {}) {
    super();

    this.options = {
      enableRoleBasedAccess: options.enableRoleBasedAccess ?? true,
      enableAttributeBasedAccess: options.enableAttributeBasedAccess ?? true,
      enableDataEncryption: options.enableDataEncryption ?? false,
      enableAuditLogging: options.enableAuditLogging ?? true,
      enableFieldLevelSecurity: options.enableFieldLevelSecurity ?? true,
      enableRowLevelSecurity: options.enableRowLevelSecurity ?? true,
      defaultAccessLevel: options.defaultAccessLevel ?? AccessLevel.DENIED,
      enforceStrictMode: options.enforceStrictMode ?? true,
      cachePermissions: options.cachePermissions ?? true,
      cacheTTL: options.cacheTTL || 300000, // 5 minutes
      debug: options.debug || false
    };

    // Initialiser les rôles et permissions par défaut
    this.initializeDefaultRoles();

    // Configurer les écouteurs d'événements
    this.setupEventListeners();
  }

  /**
   * Définit le contexte de sécurité
   */
  setSecurityContext(context: SecurityContext): void {
    this.securityContext = context;

    // Vider le cache de permissions lorsque le contexte change
    this.permissionCache.clear();

    if (this.options.debug) {
      console.log('[ViewSecurityService] Security context set for user:', context.userId);
    }

    this.emit('securityContextChanged', context);
  }

  /**
   * Vérifie si une permission est accordée
   */
  async checkPermission(
    resourceType: ViewResourceType,
    resourceId: string,
    permission: ViewPermission,
    context?: Record<string, any>
  ): Promise<boolean> {
    const startTime = performance.now();

    try {
      if (!this.securityContext) {
        throw new Error('Security context not set');
      }

      // Vérifier le cache si activé
      const cacheKey = this.generateCacheKey(
        this.securityContext.userId,
        resourceType,
        resourceId,
        permission
      );

      if (this.options.cachePermissions) {
        const cached = this.permissionCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.options.cacheTTL) {
          this.metrics.cacheHitRate =
            (this.metrics.cacheHitRate * (this.metrics.totalPermissionChecks - 1) + 1) /
            this.metrics.totalPermissionChecks;

          if (this.options.debug) {
            console.log(`[ViewSecurityService] Cache hit for permission: ${permission}`);
          }

          return cached.granted;
        }
      }

      // Effectuer la vérification de permission
      let granted = false;

      // 1. Vérifier les permissions explicites
      granted = await this.checkExplicitPermissions(resourceType, resourceId, permission, context);

      // 2. Si aucune permission explicite, vérifier les rôles
      if (!granted && this.options.enableRoleBasedAccess) {
        granted = await this.checkRoleBasedPermissions(resourceType, resourceId, permission, context);
      }

      // 3. Si toujours aucune permission, vérifier les règles d'accès
      if (!granted && this.options.enableAttributeBasedAccess) {
        granted = await this.checkRuleBasedAccess(resourceType, resourceId, permission, context);
      }

      // 4. Appliquer le niveau d'accès par défaut
      if (!granted && this.options.defaultAccessLevel !== AccessLevel.DENIED) {
        granted = this.checkDefaultAccessLevel(permission);
      }

      // Mettre en cache le résultat
      if (this.options.cachePermissions) {
        this.permissionCache.set(cacheKey, {
          granted,
          timestamp: Date.now()
        });
      }

      // Mettre à jour les métriques
      this.metrics.totalPermissionChecks++;
      if (granted) {
        this.metrics.permissionGrants++;
      } else {
        this.metrics.permissionDenials++;
      }

      const checkTime = performance.now() - startTime;
      this.updateAverageCheckTime(checkTime);

      // Journaliser l'audit si activé
      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: `check_${permission}`,
          resourceType,
          resourceId,
          result: granted ? 'success' : 'denied',
          details: { context, checkTime }
        });
      }

      if (this.options.debug) {
        console.log(`[ViewSecurityService] Permission check: ${permission} for ${resourceType}:${resourceId} = ${granted}`);
      }

      return granted;
    } catch (error) {
      // Journaliser l'erreur de sécurité
      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: `check_${permission}`,
          resourceType,
          resourceId,
          result: 'failure',
          details: { error: error instanceof Error ? error.message : error, context }
        });
      }

      this.emit('securityError', error);

      // En mode strict, refuser l'accès en cas d'erreur
      if (this.options.enforceStrictMode) {
        return false;
      }

      throw error;
    }
  }

  /**
   * Accorde une permission
   */
  async grantPermission(
    userId: string,
    resourceType: ViewResourceType,
    resourceId: string,
    permission: ViewPermission,
    conditions?: PermissionCondition[],
    expiresAt?: number
  ): Promise<string> {
    const permissionId = this.generatePermissionId();

    const viewPermission: ViewPermissionData = {
      id: permissionId,
      resourceType,
      resourceId,
      permission,
      conditions: conditions || [],
      granted: true,
      grantedAt: Date.now(),
      grantedBy: this.securityContext?.userId,
      expiresAt
    };

    this.permissions.set(permissionId, viewPermission);

    // Vider le cache pour l'utilisateur affecté
    this.clearUserPermissionCache(userId);

    if (this.options.enableAuditLogging) {
      this.logAudit({
        action: 'grant_permission',
        resourceType,
        resourceId,
        result: 'success',
        details: { permission, conditions, expiresAt, targetUserId: userId }
      });
    }

    if (this.options.debug) {
      console.log(`[ViewSecurityService] Permission granted: ${permission} to user ${userId}`);
    }

    this.emit('permissionGranted', viewPermission);
    return permissionId;
  }

  /**
   * Révoque une permission
   */
  async revokePermission(permissionId: string): Promise<boolean> {
    const permission = this.permissions.get(permissionId);
    if (!permission) {
      return false;
    }

    const deleted = this.permissions.delete(permissionId);

    if (deleted) {
      // Vider le cache (nous ne savons pas quel utilisateur est affecté, donc on vide tout)
      this.permissionCache.clear();

      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'revoke_permission',
          resourceType: permission.resourceType,
          resourceId: permission.resourceId,
          result: 'success',
          details: { permission }
        });
      }

      if (this.options.debug) {
        console.log(`[ViewSecurityService] Permission revoked: ${permissionId}`);
      }

      this.emit('permissionRevoked', permission);
    }

    return deleted;
  }

  /**
   * Crée un rôle
   */
  async createRole(
    name: string,
    description?: string,
    permissions?: ViewPermissionData[]
  ): Promise<string> {
    const roleId = this.generateRoleId();

    const role: ViewRole = {
      id: roleId,
      name,
      description,
      permissions: permissions || [],
      isSystemRole: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: this.securityContext?.userId
    };

    this.roles.set(roleId, role);
    this.metrics.activeRoles++;

    if (this.options.enableAuditLogging) {
      this.logAudit({
        action: 'create_role',
        resourceType: ViewResourceType.VIEW,
        resourceId: roleId,
        result: 'success',
        details: { name, description, permissions }
      });
    }

    if (this.options.debug) {
      console.log(`[ViewSecurityService] Role created: ${name} (${roleId})`);
    }

    this.emit('roleCreated', role);
    return roleId;
  }

  /**
   * Ajoute un utilisateur à un rôle
   */
  async addUserToRole(userId: string, roleId: string): Promise<boolean> {
    const role = this.roles.get(roleId);
    if (!role) {
      return false;
    }

    // Dans une implémentation réelle, vous géreriez la relation utilisateur-rôle
    // Pour l'instant, nous simulons en vidant le cache
    this.clearUserPermissionCache(userId);

    if (this.options.enableAuditLogging) {
      this.logAudit({
        action: 'add_user_to_role',
        resourceType: ViewResourceType.VIEW,
        resourceId: roleId,
        result: 'success',
        details: { userId, roleId }
      });
    }

    if (this.options.debug) {
      console.log(`[ViewSecurityService] User ${userId} added to role ${role.name}`);
    }

    this.emit('userAddedToRole', { userId, roleId });
    return true;
  }

  /**
   * Retire un utilisateur d'un rôle
   */
  async removeUserFromRole(userId: string, roleId: string): Promise<boolean> {
    const role = this.roles.get(roleId);
    if (!role) {
      return false;
    }

    this.clearUserPermissionCache(userId);

    if (this.options.enableAuditLogging) {
      this.logAudit({
        action: 'remove_user_from_role',
        resourceType: ViewResourceType.VIEW,
        resourceId: roleId,
        result: 'success',
        details: { userId, roleId }
      });
    }

    if (this.options.debug) {
      console.log(`[ViewSecurityService] User ${userId} removed from role ${role.name}`);
    }

    this.emit('userRemovedFromRole', { userId, roleId });
    return true;
  }

  /**
   * Crée une règle d'accès
   */
  async createAccessRule(
    name: string,
    description: string,
    resourceType: ViewResourceType,
    conditions: PermissionCondition[],
    effect: 'allow' | 'deny',
    priority: number = 0,
    resourceId: string = '*'
  ): Promise<string> {
    const ruleId = this.generateRuleId();

    const rule: AccessRule = {
      id: ruleId,
      name,
      description,
      resourceType,
      resourceId,
      conditions,
      effect,
      priority,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.accessRules.set(ruleId, rule);
    this.metrics.activeRules++;

    if (this.options.enableAuditLogging) {
      this.logAudit({
        action: 'create_access_rule',
        resourceType: ViewResourceType.VIEW,
        resourceId: ruleId,
        result: 'success',
        details: { name, conditions, effect, priority }
      });
    }

    if (this.options.debug) {
      console.log(`[ViewSecurityService] Access rule created: ${name} (${ruleId})`);
    }

    this.emit('accessRuleCreated', rule);
    return ruleId;
  }

  /**
   * Récupère les permissions d'un utilisateur
   */
  getUserPermissions(userId: string): ViewPermissionData[] {
    // Dans une implémentation réelle, vous récupéreriez les permissions
    // depuis la base de données en fonction de l'utilisateur
    return Array.from(this.permissions.values()).filter(p => {
      // Logique pour déterminer si la permission s'applique à l'utilisateur
      return true; // Simplifié pour l'exemple
    });
  }

  /**
   * Récupère les rôles d'un utilisateur
   */
  getUserRoles(userId: string): ViewRole[] {
    // Dans une implémentation réelle, vous récupéreriez les rôles
    // depuis la base de données en fonction de l'utilisateur
    return Array.from(this.roles.values()).filter(r => {
      // Logique pour déterminer si le rôle s'applique à l'utilisateur
      return true; // Simplifié pour l'exemple
    });
  }

  /**
   * Récupère les métriques de sécurité
   */
  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  /**
   * Récupère le journal d'audit
   */
  getAuditLog(filter?: {
    userId?: string;
    resourceType?: ViewResourceType;
    resourceId?: string;
    action?: string;
    since?: number;
    limit?: number;
  }): AuditEntry[] {
    let log = [...this.auditLog];

    if (filter) {
      log = log.filter(entry => {
        if (filter.userId && entry.userId !== filter.userId) return false;
        if (filter.resourceType && entry.resourceType !== filter.resourceType) return false;
        if (filter.resourceId && entry.resourceId !== filter.resourceId) return false;
        if (filter.action && !entry.action.includes(filter.action)) return false;
        if (filter.since && entry.timestamp < filter.since) return false;
        return true;
      });
    }

    // Trier par timestamp (plus récent en premier)
    log.sort((a, b) => b.timestamp - a.timestamp);

    if (filter?.limit) {
      log = log.slice(0, filter.limit);
    }

    return log;
  }

  /**
   * Vide le cache des permissions
   */
  clearPermissionCache(): void {
    this.permissionCache.clear();

    if (this.options.debug) {
      console.log('[ViewSecurityService] Permission cache cleared');
    }
  }

  /**
   * Initialise les rôles par défaut
   */
  private initializeDefaultRoles(): void {
    // Rôle administrateur
    this.createRole(
      'Administrator',
      'Accès complet à toutes les fonctionnalités',
      [
        {
          id: 'admin_full_access',
          resourceType: ViewResourceType.VIEW,
          resourceId: '*',
          permission: ViewPermission.ADMIN,
          granted: true,
          grantedAt: Date.now(),
          isSystemRole: true
        }
      ]
    );

    // Rôle lecteur
    this.createRole(
      'Reader',
      'Accès en lecture seule',
      [
        {
          id: 'reader_read_access',
          resourceType: ViewResourceType.VIEW,
          resourceId: '*',
          permission: ViewPermission.READ,
          granted: true,
          grantedAt: Date.now(),
          isSystemRole: true
        }
      ]
    );

    // Rôle éditeur
    this.createRole(
      'Editor',
      'Accès en lecture et écriture',
      [
        {
          id: 'editor_read_access',
          resourceType: ViewResourceType.VIEW,
          resourceId: '*',
          permission: ViewPermission.READ,
          granted: true,
          grantedAt: Date.now(),
          isSystemRole: true
        },
        {
          id: 'editor_write_access',
          resourceType: ViewResourceType.VIEW,
          resourceId: '*',
          permission: ViewPermission.WRITE,
          granted: true,
          grantedAt: Date.now(),
          isSystemRole: true
        }
      ]
    );
  }

  /**
   * Vérifie les permissions explicites
   */
  private async checkExplicitPermissions(
    resourceType: ViewResourceType,
    resourceId: string,
    permission: ViewPermission,
    context?: Record<string, any>
  ): Promise<boolean> {
    const userPermissions = this.getUserPermissions(this.securityContext!.userId);

    for (const perm of userPermissions) {
      if (perm.resourceType === resourceType &&
          (perm.resourceId === resourceId || perm.resourceId === '*') &&
          perm.permission === permission &&
          perm.granted) {

        // Vérifier si la permission est expirée
        if (perm.expiresAt && perm.expiresAt < Date.now()) {
          continue;
        }

        // Vérifier les conditions
        if (perm.conditions && perm.conditions.length > 0) {
          const conditionsMet = await this.evaluateConditions(
            perm.conditions,
            this.securityContext!,
            context
          );

          if (!conditionsMet) {
            continue;
          }
        }

        return true;
      }
    }

    return false;
  }

  /**
   * Vérifie les permissions basées sur les rôles
   */
  private async checkRoleBasedPermissions(
    resourceType: ViewResourceType,
    resourceId: string,
    permission: ViewPermission,
    context?: Record<string, any>
  ): Promise<boolean> {
    const userRoles = this.getUserRoles(this.securityContext!.userId);

    for (const role of userRoles) {
      for (const perm of role.permissions) {
        if (perm.resourceType === resourceType &&
            (perm.resourceId === resourceId || perm.resourceId === '*') &&
            perm.permission === permission &&
            perm.granted) {

          // Vérifier si la permission est expirée
          if (perm.expiresAt && perm.expiresAt < Date.now()) {
            continue;
          }

          // Vérifier les conditions
          if (perm.conditions && perm.conditions.length > 0) {
            const conditionsMet = await this.evaluateConditions(
              perm.conditions,
              this.securityContext!,
              context
            );

            if (!conditionsMet) {
              continue;
            }
          }

          return true;
        }
      }
    }

    return false;
  }

  /**
   * Vérifie l'accès basé sur les règles
   */
  private async checkRuleBasedAccess(
    resourceType: ViewResourceType,
    resourceId: string,
    permission: ViewPermission,
    context?: Record<string, any>
  ): Promise<boolean> {
    const applicableRules = Array.from(this.accessRules.values())
      .filter(rule => rule.isActive && rule.resourceType === resourceType)
      .sort((a, b) => b.priority - a.priority); // Plus haute priorité en premier

    for (const rule of applicableRules) {
      const conditionsMet = await this.evaluateConditions(
        rule.conditions,
        this.securityContext!,
        context
      );

      if (conditionsMet) {
        return rule.effect === 'allow';
      }
    }

    return false;
  }

  /**
   * Vérifie le niveau d'accès par défaut
   */
  private checkDefaultAccessLevel(permission: ViewPermission): boolean {
    switch (this.options.defaultAccessLevel) {
      case AccessLevel.FULL:
        return true;
      case AccessLevel.LIMITED:
        return permission === ViewPermission.READ;
      case AccessLevel.READ_ONLY:
        return permission === ViewPermission.READ;
      case AccessLevel.DENIED:
      default:
        return false;
    }
  }

  /**
   * Évalue les conditions de permission
   */
  private async evaluateConditions(
    conditions: PermissionCondition[],
    context: SecurityContext,
    additionalContext?: Record<string, any>
  ): Promise<boolean> {
    const evaluationContext: Record<string, any> = {
      ...context.attributes,
      ...additionalContext,
      userId: context.userId,
      roles: context.roles,
      timestamp: context.timestamp
    };

    for (const condition of conditions) {
      const fieldValue = evaluationContext[condition.field];
      let conditionMet = false;

      switch (condition.operator) {
        case 'equals':
          conditionMet = fieldValue === condition.value;
          break;
        case 'not_equals':
          conditionMet = fieldValue !== condition.value;
          break;
        case 'contains':
          conditionMet = typeof fieldValue === 'string' &&
                         fieldValue.includes(condition.value);
          break;
        case 'not_contains':
          conditionMet = typeof fieldValue === 'string' &&
                         !fieldValue.includes(condition.value);
          break;
        case 'in':
          conditionMet = Array.isArray(condition.value) &&
                         condition.value.includes(fieldValue);
          break;
        case 'not_in':
          conditionMet = Array.isArray(condition.value) &&
                         !condition.value.includes(fieldValue);
          break;
        case 'greater_than':
          conditionMet = typeof fieldValue === 'number' &&
                         fieldValue > condition.value;
          break;
        case 'less_than':
          conditionMet = typeof fieldValue === 'number' &&
                         fieldValue < condition.value;
          break;
      }

      if (!conditionMet) {
        return false;
      }
    }

    return true;
  }

  /**
   * Journalise une entrée d'audit
   */
  private logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'userId' | 'sessionId'>): void {
    if (!this.securityContext) {
      return;
    }

    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: Date.now(),
      userId: this.securityContext.userId,
      sessionId: this.securityContext.sessionId,
      ipAddress: this.securityContext.ipAddress,
      userAgent: this.securityContext.userAgent,
      ...entry
    };

    this.auditLog.push(auditEntry);
    this.metrics.auditEntries++;

    // Limiter la taille du journal d'audit
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000); // Garder les 5000 plus récentes
    }
  }

  /**
   * Vide le cache de permissions pour un utilisateur
   */
  private clearUserPermissionCache(userId: string): void {
    const keysToDelete: string[] = [];

    for (const [key] of this.permissionCache.entries()) {
      if (key.startsWith(`${userId}_`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.permissionCache.delete(key));
  }

  /**
   * Génère une clé de cache
   */
  private generateCacheKey(
    userId: string,
    resourceType: ViewResourceType,
    resourceId: string,
    permission: ViewPermission
  ): string {
    return `${userId}_${resourceType}_${resourceId}_${permission}`;
  }

  /**
   * Met à jour le temps de vérification moyen
   */
  private updateAverageCheckTime(checkTime: number): void {
    const alpha = 0.1; // Facteur de lissage
    this.metrics.averageCheckTime =
      (1 - alpha) * this.metrics.averageCheckTime + alpha * checkTime;
  }

  /**
   * Initialise les métriques
   */
  private initializeMetrics(): SecurityMetrics {
    return {
      totalPermissionChecks: 0,
      permissionGrants: 0,
      permissionDenials: 0,
      averageCheckTime: 0,
      cacheHitRate: 0,
      activeRoles: 0,
      activeRules: 0,
      auditEntries: 0,
      securityViolations: 0
    };
  }

  /**
   * Configure les écouteurs d'événements
   */
  private setupEventListeners(): void {
    // Nettoyer périodiquement le cache expiré
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Toutes les minutes

    // Nettoyer périodiquement les permissions expirées
    setInterval(() => {
      this.cleanupExpiredPermissions();
    }, 3600000); // Toutes les heures
  }

  /**
   * Nettoie le cache expiré
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, value] of this.permissionCache.entries()) {
      if (now - value.timestamp > this.options.cacheTTL) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.permissionCache.delete(key));

    if (this.options.debug && keysToDelete.length > 0) {
      console.log(`[ViewSecurityService] Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Nettoie les permissions expirées
   */
  private cleanupExpiredPermissions(): void {
    const now = Date.now();
    const permissionsToDelete: string[] = [];

    for (const [id, permission] of this.permissions.entries()) {
      if (permission.expiresAt && permission.expiresAt < now) {
        permissionsToDelete.push(id);
      }
    }

    permissionsToDelete.forEach(id => {
      this.permissions.delete(id);
    });

    if (this.options.debug && permissionsToDelete.length > 0) {
      console.log(`[ViewSecurityService] Cleaned up ${permissionsToDelete.length} expired permissions`);
    }
  }

  /**
   * Génère un ID de permission
   */
  private generatePermissionId(): string {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Génère un ID de rôle
   */
  private generateRoleId(): string {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Génère un ID de règle
   */
  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Génère un ID d'audit
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Connecte le service avec un système EntidrSecurityContext externe
   */
  async connectToSecurityContext(securityContextProvider: any): Promise<boolean> {
    try {
      // Vérifier si le provider a les méthodes requises
      if (!securityContextProvider ||
          typeof securityContextProvider.getCurrentUser !== 'function' ||
          typeof securityContextProvider.getUserRoles !== 'function' ||
          typeof securityContextProvider.getUserAttributes !== 'function') {
        throw new Error('Invalid security context provider');
      }

      // Stocker la référence au provider externe
      (this as any).securityContextProvider = securityContextProvider;

      if (this.options.debug) {
        console.log('[ViewSecurityService] Connected to external security context provider');
      }

      // Synchroniser les données initiales
      await this.syncWithSecurityContext();

      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'connect_security_context',
          resourceType: ViewResourceType.VIEW,
          resourceId: 'system',
          result: 'success',
          details: { provider: securityContextProvider.constructor.name }
        });
      }

      this.emit('securityContextConnected', securityContextProvider);
      return true;
    } catch (error) {
      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'connect_security_context',
          resourceType: ViewResourceType.VIEW,
          resourceId: 'system',
          result: 'failure',
          details: { error: error instanceof Error ? error.message : error }
        });
      }

      this.emit('securityContextError', error);
      return false;
    }
  }

  /**
   * Synchronise les utilisateurs et rôles entre les systèmes
   */
  async syncWithSecurityContext(): Promise<boolean> {
    try {
      const provider = (this as any).securityContextProvider;
      if (!provider) {
        throw new Error('No security context provider connected');
      }

      if (this.options.debug) {
        console.log('[ViewSecurityService] Starting synchronization with security context');
      }

      // Synchroniser les utilisateurs et leurs rôles
      const syncStartTime = Date.now();
      let syncedUsers = 0;
      let syncedRoles = 0;

      // Récupérer les utilisateurs depuis le système externe
      const externalUsers = await provider.getAllUsers?.() || [];

      for (const user of externalUsers) {
        // Synchroniser les permissions de l'utilisateur
        const userPermissions = await provider.getUserPermissions?.(user.id) || [];

        for (const perm of userPermissions) {
          // Convertir les permissions externes en format interne
          const viewPermission: ViewPermissionData = {
            id: `ext_${perm.id}`,
            resourceType: this.mapExternalResourceType(perm.resourceType),
            resourceId: perm.resourceId || '*',
            permission: this.mapExternalPermission(perm.permission),
            conditions: perm.conditions || [],
            granted: perm.granted,
            grantedAt: perm.grantedAt || Date.now(),
            grantedBy: perm.grantedBy,
            expiresAt: perm.expiresAt,
            metadata: { ...perm.metadata, externalSource: true }
          };

          this.permissions.set(viewPermission.id, viewPermission);
        }

        syncedUsers++;
      }

      // Synchroniser les rôles depuis le système externe
      const externalRoles = await provider.getAllRoles?.() || [];

      for (const role of externalRoles) {
        // Convertir les rôles externes en format interne
        const rolePermissions = role.permissions?.map((perm: any) => ({
          id: `ext_role_${perm.id}`,
          resourceType: this.mapExternalResourceType(perm.resourceType),
          resourceId: perm.resourceId || '*',
          permission: this.mapExternalPermission(perm.permission),
          conditions: perm.conditions || [],
          granted: perm.granted,
          grantedAt: perm.grantedAt || Date.now(),
          grantedBy: perm.grantedBy,
          expiresAt: perm.expiresAt,
          metadata: { ...perm.metadata, externalSource: true }
        })) || [];

        const viewRole: ViewRole = {
          id: `ext_role_${role.id}`,
          name: role.name,
          description: role.description,
          permissions: rolePermissions,
          isSystemRole: role.isSystemRole || false,
          createdAt: role.createdAt || Date.now(),
          updatedAt: role.updatedAt || Date.now(),
          createdBy: role.createdBy,
          metadata: { ...role.metadata, externalSource: true }
        };

        this.roles.set(viewRole.id, viewRole);
        syncedRoles++;
      }

      // Vider le cache après la synchronisation
      this.permissionCache.clear();

      const syncTime = Date.now() - syncStartTime;

      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'sync_security_context',
          resourceType: ViewResourceType.VIEW,
          resourceId: 'system',
          result: 'success',
          details: {
            syncedUsers,
            syncedRoles,
            syncTime,
            totalPermissions: this.permissions.size,
            totalRoles: this.roles.size
          }
        });
      }

      if (this.options.debug) {
        console.log(`[ViewSecurityService] Synchronization completed: ${syncedUsers} users, ${syncedRoles} roles in ${syncTime}ms`);
      }

      this.emit('securityContextSynced', { syncedUsers, syncedRoles, syncTime });
      return true;
    } catch (error) {
      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'sync_security_context',
          resourceType: ViewResourceType.VIEW,
          resourceId: 'system',
          result: 'failure',
          details: { error: error instanceof Error ? error.message : error }
        });
      }

      this.emit('securityContextError', error);
      return false;
    }
  }

  /**
   * Implémente le partage du contexte de sécurité
   */
  async shareSecurityContext(targetService: any): Promise<boolean> {
    try {
      if (!this.securityContext) {
        throw new Error('No security context available to share');
      }

      // Vérifier si le service cible peut accepter un contexte de sécurité
      if (!targetService || typeof targetService.receiveSecurityContext !== 'function') {
        throw new Error('Target service cannot receive security context');
      }

      // Préparer le contexte de sécurité à partager
      const sharedContext = {
        userId: this.securityContext.userId,
        roles: this.securityContext.roles,
        attributes: this.securityContext.attributes,
        sessionId: this.securityContext.sessionId,
        ipAddress: this.securityContext.ipAddress,
        userAgent: this.securityContext.userAgent,
        timestamp: this.securityContext.timestamp,
        permissions: this.getUserPermissions(this.securityContext.userId),
        userRoles: this.getUserRoles(this.securityContext.userId),
        source: 'EntidrViewSecurityService'
      };

      // Envoyer le contexte au service cible
      await targetService.receiveSecurityContext(sharedContext);

      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'share_security_context',
          resourceType: ViewResourceType.VIEW,
          resourceId: 'system',
          result: 'success',
          details: {
            targetService: targetService.constructor.name,
            userId: this.securityContext.userId,
            rolesCount: this.securityContext.roles.length
          }
        });
      }

      if (this.options.debug) {
        console.log(`[ViewSecurityService] Security context shared with ${targetService.constructor.name}`);
      }

      this.emit('securityContextShared', { targetService, sharedContext });
      return true;
    } catch (error) {
      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'share_security_context',
          resourceType: ViewResourceType.VIEW,
          resourceId: 'system',
          result: 'failure',
          details: {
            error: error instanceof Error ? error.message : error,
            targetService: targetService?.constructor?.name || 'unknown'
          }
        });
      }

      this.emit('securityContextError', error);
      return false;
    }
  }

  /**
   * Reçoit un contexte de sécurité partagé
   */
  async receiveSecurityContext(sharedContext: any): Promise<boolean> {
    try {
      // Valider le contexte reçu
      if (!sharedContext || !sharedContext.userId || !sharedContext.roles) {
        throw new Error('Invalid shared security context');
      }

      // Créer un nouveau contexte de sécurité à partir des données partagées
      const newContext: SecurityContext = {
        userId: sharedContext.userId,
        roles: sharedContext.roles || [],
        attributes: sharedContext.attributes || {},
        sessionId: sharedContext.sessionId || `shared_${Date.now()}`,
        ipAddress: sharedContext.ipAddress,
        userAgent: sharedContext.userAgent,
        timestamp: sharedContext.timestamp || Date.now()
      };

      // Appliquer le nouveau contexte
      this.setSecurityContext(newContext);

      // Si des permissions sont incluses, les importer
      if (sharedContext.permissions && Array.isArray(sharedContext.permissions)) {
        for (const perm of sharedContext.permissions) {
          if (perm && perm.id && perm.resourceType && perm.permission) {
            this.permissions.set(perm.id, perm);
          }
        }
      }

      // Si des rôles sont inclus, les importer
      if (sharedContext.userRoles && Array.isArray(sharedContext.userRoles)) {
        for (const role of sharedContext.userRoles) {
          if (role && role.id && role.name) {
            this.roles.set(role.id, role);
          }
        }
      }

      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'receive_security_context',
          resourceType: ViewResourceType.VIEW,
          resourceId: 'system',
          result: 'success',
          details: {
            source: sharedContext.source || 'unknown',
            userId: newContext.userId,
            rolesCount: newContext.roles.length
          }
        });
      }

      if (this.options.debug) {
        console.log(`[ViewSecurityService] Security context received from ${sharedContext.source || 'unknown'}`);
      }

      this.emit('securityContextReceived', { sharedContext, newContext });
      return true;
    } catch (error) {
      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'receive_security_context',
          resourceType: ViewResourceType.VIEW,
          resourceId: 'system',
          result: 'failure',
          details: {
            error: error instanceof Error ? error.message : error,
            source: sharedContext?.source || 'unknown'
          }
        });
      }

      this.emit('securityContextError', error);
      return false;
    }
  }

  /**
   * Mappe un type de ressource externe vers un type interne
   */
  private mapExternalResourceType(externalType: string): ViewResourceType {
    const mapping: Record<string, ViewResourceType> = {
      'view': ViewResourceType.VIEW,
      'field': ViewResourceType.FIELD,
      'record': ViewResourceType.RECORD,
      'action': ViewResourceType.ACTION,
      'filter': ViewResourceType.FILTER,
      'group': ViewResourceType.GROUP,
      'sort': ViewResourceType.SORT,
      'layout': ViewResourceType.LAYOUT,
      'theme': ViewResourceType.THEME,
      // Ajouter d'autres mappings si nécessaire
    };

    return mapping[externalType] || ViewResourceType.VIEW;
  }

  /**
   * Mappe une permission externe vers une permission interne
   */
  private mapExternalPermission(externalPermission: string): ViewPermission {
    const mapping: Record<string, ViewPermission> = {
      'read': ViewPermission.READ,
      'write': ViewPermission.WRITE,
      'delete': ViewPermission.DELETE,
      'create': ViewPermission.CREATE,
      'configure': ViewPermission.CONFIGURE,
      'share': ViewPermission.SHARE,
      'export': ViewPermission.EXPORT,
      'admin': ViewPermission.ADMIN,
      // Ajouter d'autres mappings si nécessaire
    };

    return mapping[externalPermission] || ViewPermission.READ;
  }

  /**
   * Crée des hooks de sécurité pour les composants de vue
   */
  createViewSecurityHooks(viewId: string) {
    const self = this;

    return {
      /**
       * Hook pour vérifier si l'utilisateur peut voir la vue
       */
      useCanViewView: () => {
        return async () => {
          return await self.checkPermission(
            ViewResourceType.VIEW,
            viewId,
            ViewPermission.READ
          );
        };
      },

      /**
       * Hook pour vérifier si l'utilisateur peut modifier la vue
       */
      useCanEditView: () => {
        return async () => {
          return await self.checkPermission(
            ViewResourceType.VIEW,
            viewId,
            ViewPermission.WRITE
          );
        };
      },

      /**
       * Hook pour vérifier si l'utilisateur peut configurer la vue
       */
      useCanConfigureView: () => {
        return async () => {
          return await self.checkPermission(
            ViewResourceType.VIEW,
            viewId,
            ViewPermission.CONFIGURE
          );
        };
      },

      /**
       * Hook pour vérifier si l'utilisateur peut supprimer la vue
       */
      useCanDeleteView: () => {
        return async () => {
          return await self.checkPermission(
            ViewResourceType.VIEW,
            viewId,
            ViewPermission.DELETE
          );
        };
      },

      /**
       * Hook pour vérifier si l'utilisateur peut partager la vue
       */
      useCanShareView: () => {
        return async () => {
          return await self.checkPermission(
            ViewResourceType.VIEW,
            viewId,
            ViewPermission.SHARE
          );
        };
      },

      /**
       * Hook pour vérifier si l'utilisateur peut exporter la vue
       */
      useCanExportView: () => {
        return async () => {
          return await self.checkPermission(
            ViewResourceType.VIEW,
            viewId,
            ViewPermission.EXPORT
          );
        };
      }
    };
  }

  /**
   * Implémente le masquage conditionnel des champs
   */
  async shouldShowField(
    viewId: string,
    fieldId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Vérifier si l'utilisateur a la permission de voir le champ
      const canViewField = await this.checkPermission(
        ViewResourceType.FIELD,
        `${viewId}.${fieldId}`,
        ViewPermission.READ,
        context
      );

      if (!canViewField) {
        return false;
      }

      // Vérifier les règles de masquage conditionnel basées sur les attributs
      if (this.options.enableAttributeBasedAccess) {
        const hiddenRules = Array.from(this.accessRules.values())
          .filter(rule =>
            rule.isActive &&
            rule.resourceType === ViewResourceType.FIELD &&
            rule.effect === 'deny' &&
            rule.resourceId === `${viewId}.${fieldId}`
          );

        for (const rule of hiddenRules) {
          const conditionsMet = await this.evaluateConditions(
            rule.conditions,
            this.securityContext!,
            context
          );

          if (conditionsMet) {
            return false; // Le champ doit être masqué
          }
        }
      }

      return true; // Le champ peut être affiché
    } catch (error) {
      if (this.options.enforceStrictMode) {
        return false; // En cas d'erreur, masquer le champ par sécurité
      }
      throw error;
    }
  }

  /**
   * Ajoute des vérifications de permission dans les actions de vue
   */
  async canPerformViewAction(
    viewId: string,
    actionId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Vérifier si l'utilisateur a la permission d'exécuter l'action
      const canExecuteAction = await this.checkPermission(
        ViewResourceType.ACTION,
        `${viewId}.${actionId}`,
        ViewPermission.READ,
        context
      );

      if (!canExecuteAction) {
        return false;
      }

      // Vérifier les permissions spécifiques à l'action
      const actionPermissions = await this.getActionPermissions(viewId, actionId);

      for (const requiredPermission of actionPermissions) {
        const hasPermission = await this.checkPermission(
          requiredPermission.resourceType,
          requiredPermission.resourceId,
          requiredPermission.permission,
          context
        );

        if (!hasPermission) {
          return false;
        }
      }

      return true;
    } catch (error) {
      if (this.options.enforceStrictMode) {
        return false; // En cas d'erreur, refuser l'action par sécurité
      }
      throw error;
    }
  }

  /**
   * Implémente la sécurité au niveau des lignes (RLS)
   */
  async filterRecordsByRowSecurity(
    viewId: string,
    records: any[],
    context?: Record<string, any>
  ): Promise<any[]> {
    try {
      if (!this.options.enableRowLevelSecurity) {
        return records; // Pas de filtrage si RLS est désactivé
      }

      const filteredRecords: any[] = [];

      for (const record of records) {
        const canAccessRecord = await this.checkRecordAccess(
          viewId,
          record,
          context
        );

        if (canAccessRecord) {
          filteredRecords.push(record);
        }
      }

      if (this.options.debug) {
        console.log(`[ViewSecurityService] RLS filtered ${records.length} records to ${filteredRecords.length} for view ${viewId}`);
      }

      return filteredRecords;
    } catch (error) {
      if (this.options.enforceStrictMode) {
        return []; // En cas d'erreur, retourner un tableau vide par sécurité
      }
      throw error;
    }
  }

  /**
   * Vérifie l'accès à un enregistrement spécifique (utilisé par RLS)
   */
  private async checkRecordAccess(
    viewId: string,
    record: any,
    context?: Record<string, any>
  ): Promise<boolean> {
    const recordId = record.id || record._id;

    // Vérifier la permission de base sur l'enregistrement
    const canAccessRecord = await this.checkPermission(
      ViewResourceType.RECORD,
      `${viewId}.${recordId}`,
      ViewPermission.READ,
      { ...context, record }
    );

    if (!canAccessRecord) {
      return false;
    }

    // Vérifier les règles RLS spécifiques
    const rlsRules = Array.from(this.accessRules.values())
      .filter(rule =>
        rule.isActive &&
        rule.resourceType === ViewResourceType.RECORD &&
        rule.resourceId === `${viewId}.*` // Règles qui s'appliquent à tous les enregistrements de la vue
      );

    for (const rule of rlsRules) {
      const conditionsMet = await this.evaluateConditions(
        rule.conditions,
        this.securityContext!,
        { ...context, record }
      );

      if (conditionsMet) {
        return rule.effect === 'allow';
      }
    }

    // Si aucune règle ne s'applique, utiliser la permission par défaut
    return true;
  }

  /**
   * Récupère les permissions requises pour une action spécifique
   */
  private async getActionPermissions(
    viewId: string,
    actionId: string
  ): Promise<Array<{ resourceType: ViewResourceType; resourceId: string; permission: ViewPermission }>> {
    // Dans une implémentation réelle, vous récupéreriez ces informations
    // depuis une configuration ou une base de données
    const actionPermissionsMap: Record<string, Array<{ resourceType: ViewResourceType; resourceId: string; permission: ViewPermission }>> = {
      'create': [
        { resourceType: ViewResourceType.VIEW, resourceId: viewId, permission: ViewPermission.CREATE }
      ],
      'edit': [
        { resourceType: ViewResourceType.VIEW, resourceId: viewId, permission: ViewPermission.WRITE }
      ],
      'delete': [
        { resourceType: ViewResourceType.VIEW, resourceId: viewId, permission: ViewPermission.DELETE }
      ],
      'export': [
        { resourceType: ViewResourceType.VIEW, resourceId: viewId, permission: ViewPermission.EXPORT }
      ],
      'share': [
        { resourceType: ViewResourceType.VIEW, resourceId: viewId, permission: ViewPermission.SHARE }
      ]
    };

    return actionPermissionsMap[actionId] || [];
  }

  /**
   * Définit des règles d'accès dynamiques
   */
  async createDynamicAccessRule(
    name: string,
    description: string,
    resourceType: ViewResourceType,
    resourceId: string,
    conditions: PermissionCondition[],
    effect: 'allow' | 'deny',
    priority: number = 0,
    expiresAt?: number,
    metadata?: Record<string, any>
  ): Promise<string> {
    const ruleId = this.generateRuleId();

    const rule: AccessRule = {
      id: ruleId,
      name,
      description,
      resourceType,
      resourceId,
      conditions,
      effect,
      priority,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.accessRules.set(ruleId, rule);
    this.metrics.activeRules++;

    // Si la règle a une date d'expiration, planifier sa désactivation automatique
    if (expiresAt) {
      this.scheduleRuleExpiration(ruleId, expiresAt);
    }

    if (this.options.enableAuditLogging) {
      this.logAudit({
        action: 'create_dynamic_access_rule',
        resourceType,
        resourceId,
        result: 'success',
        details: { name, conditions, effect, priority, expiresAt, metadata }
      });
    }

    if (this.options.debug) {
      console.log(`[ViewSecurityService] Dynamic access rule created: ${name} (${ruleId})`);
    }

    this.emit('dynamicAccessRuleCreated', rule);
    return ruleId;
  }

  /**
   * Implémente l'évaluation des règles en temps réel
   */
  async evaluateAccessRulesInRealTime(
    resourceType: ViewResourceType,
    resourceId: string,
    context?: Record<string, any>
  ): Promise<{ allowed: boolean; matchedRules: AccessRule[]; evaluationTime: number }> {
    const startTime = performance.now();

    try {
      // Récupérer toutes les règles applicables
      const applicableRules = Array.from(this.accessRules.values())
        .filter(rule =>
          rule.isActive &&
          rule.resourceType === resourceType &&
          (rule.resourceId === resourceId || rule.resourceId === '*')
        )
        .sort((a, b) => b.priority - a.priority); // Plus haute priorité en premier

      const matchedRules: AccessRule[] = [];
      let finalDecision = false; // Par défaut, refuser l'accès

      // Évaluer chaque règle dans l'ordre de priorité
      for (const rule of applicableRules) {
        const conditionsMet = await this.evaluateConditions(
          rule.conditions,
          this.securityContext!,
          context
        );

        if (conditionsMet) {
          matchedRules.push(rule);
          finalDecision = rule.effect === 'allow';

          // Journaliser la violation de règle si nécessaire
          if (rule.effect === 'deny' && this.options.enableAuditLogging) {
            this.logRuleViolation(rule, resourceType, resourceId, context);
          }

          // Si une règle de haute priorité correspond, on s'arrête
          if (rule.priority > 0) {
            break;
          }
        }
      }

      const evaluationTime = performance.now() - startTime;

      if (this.options.debug) {
        console.log(`[ViewSecurityService] Real-time rule evaluation: ${resourceType}:${resourceId} = ${finalDecision} (${matchedRules.length} rules matched in ${evaluationTime}ms)`);
      }

      return {
        allowed: finalDecision,
        matchedRules,
        evaluationTime
      };
    } catch (error) {
      const evaluationTime = performance.now() - startTime;

      if (this.options.enableAuditLogging) {
        this.logAudit({
          action: 'evaluate_access_rules_error',
          resourceType,
          resourceId,
          result: 'failure',
          details: { error: error instanceof Error ? error.message : error, context, evaluationTime }
        });
      }

      // En cas d'erreur, retourner une décision sécurisée
      return {
        allowed: false,
        matchedRules: [],
        evaluationTime
      };
    }
  }

  /**
   * Crée une interface pour gérer les règles d'accès
   */
  createAccessRulesManager() {
    const self = this;

    return {
      /**
       * Récupère toutes les règles d'accès
       */
      getAllRules: (): AccessRule[] => {
        return Array.from(self.accessRules.values());
      },

      /**
       * Récupère les règles pour un type de ressource spécifique
       */
      getRulesByResourceType: (resourceType: ViewResourceType): AccessRule[] => {
        return Array.from(self.accessRules.values())
          .filter(rule => rule.resourceType === resourceType);
      },

      /**
       * Récupère les règles pour une ressource spécifique
       */
      getRulesByResource: (resourceType: ViewResourceType, resourceId: string): AccessRule[] => {
        return Array.from(self.accessRules.values())
          .filter(rule =>
            rule.resourceType === resourceType &&
            (rule.resourceId === resourceId || rule.resourceId === '*')
          );
      },

      /**
       * Active ou désactive une règle
       */
      toggleRule: (ruleId: string, isActive: boolean): boolean => {
        const rule = self.accessRules.get(ruleId);
        if (!rule) {
          return false;
        }

        rule.isActive = isActive;
        rule.updatedAt = Date.now();

        if (self.options.enableAuditLogging) {
          self.logAudit({
            action: isActive ? 'activate_rule' : 'deactivate_rule',
            resourceType: rule.resourceType,
            resourceId: rule.resourceId,
            result: 'success',
            details: { ruleId, isActive }
          });
        }

        self.emit('ruleToggled', { rule, isActive });
        return true;
      },

      /**
       * Met à jour une règle
       */
      updateRule: (ruleId: string, updates: Partial<AccessRule>): boolean => {
        const rule = self.accessRules.get(ruleId);
        if (!rule) {
          return false;
        }

        const updatedRule = { ...rule, ...updates, updatedAt: Date.now() };
        self.accessRules.set(ruleId, updatedRule);

        if (self.options.enableAuditLogging) {
          self.logAudit({
            action: 'update_rule',
            resourceType: rule.resourceType,
            resourceId: rule.resourceId,
            result: 'success',
            details: { ruleId, updates }
          });
        }

        self.emit('ruleUpdated', { rule: updatedRule, updates });
        return true;
      },

      /**
       * Supprime une règle
       */
      deleteRule: (ruleId: string): boolean => {
        const rule = self.accessRules.get(ruleId);
        if (!rule) {
          return false;
        }

        const deleted = self.accessRules.delete(ruleId);

        if (deleted) {
          if (self.options.enableAuditLogging) {
            self.logAudit({
              action: 'delete_rule',
              resourceType: rule.resourceType,
              resourceId: rule.resourceId,
              result: 'success',
              details: { ruleId }
            });
          }

          self.emit('ruleDeleted', rule);
        }

        return deleted;
      },

      /**
       * Réorganise les priorités des règles
       */
      reorderRules: (ruleIds: string[]): boolean => {
        try {
          ruleIds.forEach((ruleId, index) => {
            const rule = self.accessRules.get(ruleId);
            if (rule) {
              rule.priority = ruleIds.length - index; // Plus haute priorité = plus grand nombre
              rule.updatedAt = Date.now();
            }
          });

          if (self.options.enableAuditLogging) {
            self.logAudit({
              action: 'reorder_rules',
              resourceType: ViewResourceType.VIEW,
              resourceId: 'system',
              result: 'success',
              details: { ruleIds }
            });
          }

          self.emit('rulesReordered', ruleIds);
          return true;
        } catch (error) {
          if (self.options.enableAuditLogging) {
            self.logAudit({
              action: 'reorder_rules',
              resourceType: ViewResourceType.VIEW,
              resourceId: 'system',
              result: 'failure',
              details: { error: error instanceof Error ? error.message : error, ruleIds }
            });
          }

          return false;
        }
      },

      /**
       * Exporte les règles au format JSON
       */
      exportRules: (): string => {
        const rules = Array.from(self.accessRules.values());
        return JSON.stringify(rules, null, 2);
      },

      /**
       * Importe les règles depuis un format JSON
       */
      importRules: (rulesJson: string): { success: number; errors: string[] } => {
        try {
          const rules = JSON.parse(rulesJson);
          const result = { success: 0, errors: [] as string[] };

          for (const ruleData of rules) {
            try {
              const rule: AccessRule = {
                ...ruleData,
                id: self.generateRuleId(),
                createdAt: Date.now(),
                updatedAt: Date.now()
              };

              self.accessRules.set(rule.id, rule);
              result.success++;
            } catch (error) {
              result.errors.push(`Erreur avec la règle ${ruleData.name}: ${error instanceof Error ? error.message : error}`);
            }
          }

          if (self.options.enableAuditLogging) {
            self.logAudit({
              action: 'import_rules',
              resourceType: ViewResourceType.VIEW,
              resourceId: 'system',
              result: result.errors.length === 0 ? 'success' : 'partial',
              details: { imported: result.success, errors: result.errors.length }
            });
          }

          self.emit('rulesImported', result);
          return result;
        } catch (error) {
          const errorMessage = `Erreur de parsing JSON: ${error instanceof Error ? error.message : error}`;

          if (self.options.enableAuditLogging) {
            self.logAudit({
              action: 'import_rules',
              resourceType: ViewResourceType.VIEW,
              resourceId: 'system',
              result: 'failure',
              details: { error: errorMessage }
            });
          }

          return { success: 0, errors: [errorMessage] };
        }
      }
    };
  }

  /**
   * Ajoute des logs pour les violations de règles
   */
  private logRuleViolation(
    rule: AccessRule,
    resourceType: ViewResourceType,
    resourceId: string,
    context?: Record<string, any>
  ): void {
    this.metrics.securityViolations++;

    if (this.options.enableAuditLogging) {
      this.logAudit({
        action: 'rule_violation',
        resourceType,
        resourceId,
        result: 'denied',
        details: {
          ruleId: rule.id,
          ruleName: rule.name,
          ruleEffect: rule.effect,
          conditions: rule.conditions,
          context,
          userId: this.securityContext?.userId,
          timestamp: Date.now()
        }
      });
    }

    if (this.options.debug) {
      console.log(`[ViewSecurityService] Rule violation detected: ${rule.name} for ${resourceType}:${resourceId}`);
    }

    this.emit('ruleViolation', { rule, resourceType, resourceId, context });
  }

  /**
   * Planifie l'expiration d'une règle
   */
  private scheduleRuleExpiration(ruleId: string, expiresAt: number): void {
    const delay = expiresAt - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        const rule = this.accessRules.get(ruleId);
        if (rule && rule.isActive) {
          rule.isActive = false;
          rule.updatedAt = Date.now();

          if (this.options.enableAuditLogging) {
            this.logAudit({
              action: 'rule_expired',
              resourceType: rule.resourceType,
              resourceId: rule.resourceId,
              result: 'success',
              details: { ruleId, expiresAt }
            });
          }

          if (this.options.debug) {
            console.log(`[ViewSecurityService] Rule expired: ${rule.name} (${ruleId})`);
          }

          this.emit('ruleExpired', rule);
        }
      }, delay);
    }
  }
}

// Exporter une instance singleton pour une utilisation facile
export const viewSecurityService = new EntidrViewSecurityService({
  enableRoleBasedAccess: true,
  enableAttributeBasedAccess: true,
  enableDataEncryption: false,
  enableAuditLogging: true,
  enableFieldLevelSecurity: true,
  enableRowLevelSecurity: true,
  defaultAccessLevel: AccessLevel.DENIED,
  enforceStrictMode: true,
  cachePermissions: true,
  cacheTTL: 300000,
  debug: false
});

export default EntidrViewSecurityService;
