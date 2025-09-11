import { EntidrBaseModel } from '../EntidrModel';
import { EntidrUser, EntidrPermission, EntidrRole } from '../../../../types/entidr-security';
import { Model, ModelStatic } from 'sequelize';

/**
 * Types d'actions de sécurité
 */
export enum SecurityAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  SHARE = 'share'
}

/**
 * Types de règles d'accès
 */
export enum AccessRuleType {
  ALLOW = 'allow',
  DENY = 'deny',
  REQUIRE = 'require',
  RESTRICT = 'restrict'
}

/**
 * Configuration de sécurité pour un champ
 */
export interface FieldSecurityConfig {
  field: string;
  read?: boolean;
  write?: boolean;
  mask?: string | ((value: any, user: EntidrUser) => string);
  encrypt?: boolean;
  sensitive?: boolean;
  audit?: boolean;
  permissions?: string[];
  roles?: string[];
}

/**
 * Configuration de sécurité pour un modèle
 */
export interface ModelSecurityConfig {
  model: string;
  permissions?: {
    [key in SecurityAction]?: string[];
  };
  fieldSecurity?: FieldSecurityConfig[];
  recordRules?: RecordRule[];
  audit?: boolean;
  encryption?: boolean;
  dataRetention?: {
    enabled: boolean;
    period: number; // en jours
    action: 'archive' | 'delete';
  };
}

/**
 * Règle d'accès aux enregistrements
 */
export interface RecordRule {
  name: string;
  type: AccessRuleType;
  condition: (record: any, user: EntidrUser) => boolean | Promise<boolean>;
  permissions?: SecurityAction[];
  description?: string;
  error?: string;
}

/**
 * Contexte de sécurité
 */
export interface SecurityContext {
  user: EntidrUser;
  roles: EntidrRole[];
  permissions: EntidrPermission[];
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Options pour les vérifications de sécurité
 */
export interface SecurityOptions {
  strict?: boolean;
  throwOnError?: boolean;
  logAccess?: boolean;
  bypassForAdmin?: boolean;
}

/**
 * Événement d'audit de sécurité
 */
export interface SecurityAuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  username: string;
  action: SecurityAction;
  resource: string;
  resourceId?: string | number;
  success: boolean;
  error?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Classe pour gérer la sécurité au niveau des modèles
 */
export class EntidrModelSecurity {
  private static securityConfigs: Map<string, ModelSecurityConfig> = new Map();
  private static auditEvents: SecurityAuditEvent[] = [];
  private static securityContexts: Map<string, SecurityContext> = new Map();
  private static currentUser: EntidrUser | null = null;

  /**
   * Définit la configuration de sécurité pour un modèle
   */
  public static defineSecurity(config: ModelSecurityConfig): void {
    this.securityConfigs.set(config.model, config);

    // Appliquer la sécurité au modèle
    this.applyModelSecurity(config);
  }

  /**
   * Applique la configuration de sécurité à un modèle
   */
  private static applyModelSecurity(config: ModelSecurityConfig): void {
    const model = (global as any)[config.model] as typeof EntidrBaseModel;
    if (!model) {
      console.warn(`Model ${config.model} not found for security configuration`);
      return;
    }

    // Ajouter les hooks de sécurité
    this.addSecurityHooks(model, config);

    // Appliquer la sécurité des champs
    this.applyFieldSecurity(model, config);
  }

  /**
   * Ajoute les hooks de sécurité à un modèle
   */
  private static addSecurityHooks(model: typeof EntidrBaseModel, config: ModelSecurityConfig): void {
    // Hook avant création
    model.addHook('beforeCreate', async (instance: any) => {
      const context = this.getCurrentContext();
      if (!context) return;

      const hasPermission = await this.checkPermission(
        context,
        SecurityAction.CREATE,
        config.model
      );

      if (!hasPermission) {
        await this.logSecurityEvent({
          userId: context.user.id,
          username: context.user.username,
          action: SecurityAction.CREATE,
          resource: config.model,
          success: false,
          error: 'Permission denied',
          details: { model: config.model }
        });
        throw new Error('Permission denied: create access not allowed');
      }
    });

    // Hook avant lecture
    model.addHook('afterFind', async (instance: any) => {
      if (!instance) return;

      const context = this.getCurrentContext();
      if (!context) return;

      const hasPermission = await this.checkPermission(
        context,
        SecurityAction.READ,
        config.model
      );

      if (!hasPermission) {
        await this.logSecurityEvent({
          userId: context.user.id,
          username: context.user.username,
          action: SecurityAction.READ,
          resource: config.model,
          resourceId: instance.id,
          success: false,
          error: 'Permission denied',
          details: { model: config.model, id: instance.id }
        });
        return null;
      }

      // Appliquer les règles d'accès aux enregistrements
      const recordAccess = await this.checkRecordAccess(instance, context, config);
      if (!recordAccess) {
        return null;
      }

      // Appliquer la sécurité des champs
      return this.applyFieldSecurityToInstance(instance, context, config);
    });

    // Hook avant mise à jour
    model.addHook('beforeUpdate', async (instance: any) => {
      const context = this.getCurrentContext();
      if (!context) return;

      const hasPermission = await this.checkPermission(
        context,
        SecurityAction.UPDATE,
        config.model
      );

      if (!hasPermission) {
        await this.logSecurityEvent({
          userId: context.user.id,
          username: context.user.username,
          action: SecurityAction.UPDATE,
          resource: config.model,
          resourceId: instance.id,
          success: false,
          error: 'Permission denied',
          details: { model: config.model, id: instance.id }
        });
        throw new Error('Permission denied: update access not allowed');
      }

      // Vérifier les règles d'accès aux enregistrements
      const recordAccess = await this.checkRecordAccess(instance, context, config);
      if (!recordAccess) {
        throw new Error('Record access denied');
      }
    });

    // Hook avant suppression
    model.addHook('beforeDestroy', async (instance: any) => {
      const context = this.getCurrentContext();
      if (!context) return;

      const hasPermission = await this.checkPermission(
        context,
        SecurityAction.DELETE,
        config.model
      );

      if (!hasPermission) {
        await this.logSecurityEvent({
          userId: context.user.id,
          username: context.user.username,
          action: SecurityAction.DELETE,
          resource: config.model,
          resourceId: instance.id,
          success: false,
          error: 'Permission denied',
          details: { model: config.model, id: instance.id }
        });
        throw new Error('Permission denied: delete access not allowed');
      }

      // Vérifier les règles d'accès aux enregistrements
      const recordAccess = await this.checkRecordAccess(instance, context, config);
      if (!recordAccess) {
        throw new Error('Record access denied');
      }
    });
  }

  /**
   * Applique la sécurité des champs à un modèle
   */
  private static applyFieldSecurity(model: typeof EntidrBaseModel, config: ModelSecurityConfig): void {
    if (!config.fieldSecurity) return;

    config.fieldSecurity.forEach(fieldConfig => {
      // Ajouter des getters/setters sécurisés si nécessaire
      if (fieldConfig.mask || fieldConfig.encrypt) {
        this.addSecureFieldAccessors(model, fieldConfig);
      }
    });
  }

  /**
   * Ajoute des accesseurs sécurisés pour un champ
   */
  private static addSecureFieldAccessors(model: typeof EntidrBaseModel, fieldConfig: FieldSecurityConfig): void {
    const fieldName = fieldConfig.field;

    // Getter sécurisé
    Object.defineProperty(model.prototype, `secure_${fieldName}`, {
      get: function() {
        const context = EntidrModelSecurity.getCurrentContext();
        if (!context) return this.get(fieldName);

        // Vérifier la permission de lecture
        if (!fieldConfig.read) {
          return fieldConfig.mask ? '***' : undefined;
        }

        // Appliquer le masquage si nécessaire
        const value = this.get(fieldName);
        if (fieldConfig.mask) {
          if (typeof fieldConfig.mask === 'function') {
            return fieldConfig.mask(value, context.user);
          }
          return fieldConfig.mask;
        }

        return value;
      },
      set: function(value: any) {
        const context = EntidrModelSecurity.getCurrentContext();
        if (!context) {
          this.set(fieldName, value);
          return;
        }

        // Vérifier la permission d'écriture
        if (!fieldConfig.write) {
          throw new Error(`Write access denied for field ${fieldName}`);
        }

        this.set(fieldName, value);
      }
    });
  }

  /**
   * Applique la sécurité des champs à une instance
   */
  private static applyFieldSecurityToInstance(
    instance: any,
    context: SecurityContext,
    config: ModelSecurityConfig
  ): any {
    if (!config.fieldSecurity) return instance;

    // Créer une copie sécurisée de l'instance
    const secureInstance = { ...instance };

    config.fieldSecurity.forEach(fieldConfig => {
      const fieldName = fieldConfig.field;
      const value = instance[fieldName];

      // Vérifier la permission de lecture
      if (!fieldConfig.read) {
        secureInstance[fieldName] = fieldConfig.mask ? '***' : undefined;
        return;
      }

      // Appliquer le masquage si nécessaire
      if (fieldConfig.mask) {
        if (typeof fieldConfig.mask === 'function') {
          secureInstance[fieldName] = fieldConfig.mask(value, context.user);
        } else {
          secureInstance[fieldName] = fieldConfig.mask;
        }
      }
    });

    return secureInstance;
  }

  /**
   * Vérifie si un utilisateur a une permission
   */
  public static async checkPermission(
    context: SecurityContext,
    action: SecurityAction,
    resource: string,
    options: SecurityOptions = {}
  ): Promise<boolean> {
    try {
      // Bypass pour les administrateurs si configuré
      if (options.bypassForAdmin && context.user.isAdmin) {
        return true;
      }

      // Vérifier les permissions directes
      const hasDirectPermission = context.permissions.some(perm =>
        perm.name === `${action}:${resource}` || perm.name === `${action}:*`
      );

      if (hasDirectPermission) {
        await this.logSecurityEvent({
          userId: context.user.id,
          username: context.user.username,
          action,
          resource,
          success: true,
          details: { type: 'direct_permission' }
        });
        return true;
      }

      // Vérifier les permissions de rôle
      const hasRolePermission = context.roles.some(role =>
        role.permissions.some(perm =>
          perm.name === `${action}:${resource}` || perm.name === `${action}:*`
        )
      );

      if (hasRolePermission) {
        await this.logSecurityEvent({
          userId: context.user.id,
          username: context.user.username,
          action,
          resource,
          success: true,
          details: { type: 'role_permission' }
        });
        return true;
      }

      // Échec de la vérification
      if (options.logAccess !== false) {
        await this.logSecurityEvent({
          userId: context.user.id,
          username: context.user.username,
          action,
          resource,
          success: false,
          error: 'Permission denied',
          details: { type: 'no_permission' }
        });
      }

      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Vérifie l'accès à un enregistrement selon les règles
   */
  public static async checkRecordAccess(
    record: any,
    context: SecurityContext,
    config: ModelSecurityConfig
  ): Promise<boolean> {
    if (!config.recordRules) return true;

    for (const rule of config.recordRules) {
      try {
        const result = await rule.condition(record, context);

        if (rule.type === AccessRuleType.DENY && result) {
          await this.logSecurityEvent({
            userId: context.user.id,
            username: context.user.username,
            action: SecurityAction.READ,
            resource: config.model,
            resourceId: record.id,
            success: false,
            error: `Record access denied by rule: ${rule.name}`,
            details: { rule: rule.name }
          });
          return false;
        }

        if (rule.type === AccessRuleType.REQUIRE && !result) {
          await this.logSecurityEvent({
            userId: context.user.id,
            username: context.user.username,
            action: SecurityAction.READ,
            resource: config.model,
            resourceId: record.id,
            success: false,
            error: `Record access denied by rule: ${rule.name}`,
            details: { rule: rule.name }
          });
          return false;
        }
      } catch (error) {
        console.error(`Error evaluating record rule ${rule.name}:`, error);
      }
    }

    return true;
  }

  /**
   * Définit le contexte de sécurité actuel
   */
  public static setSecurityContext(context: SecurityContext): void {
    this.securityContexts.set(context.user.id, context);
    this.currentUser = context.user;
  }

  /**
   * Récupère le contexte de sécurité actuel
   */
  public static getCurrentContext(): SecurityContext | null {
    if (!this.currentUser) return null;
    return this.securityContexts.get(this.currentUser.id) || null;
  }

  /**
   * Récupère l'utilisateur actuel
   */
  public static getCurrentUser(): EntidrUser | null {
    return this.currentUser;
  }

  /**
   * Journalise un événement de sécurité
   */
  public static async logSecurityEvent(event: Partial<SecurityAuditEvent>): Promise<void> {
    const auditEvent: SecurityAuditEvent = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId: event.userId || '',
      username: event.username || '',
      action: event.action || SecurityAction.READ,
      resource: event.resource || '',
      resourceId: event.resourceId,
      success: event.success || false,
      error: event.error,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details
    };

    this.auditEvents.push(auditEvent);

    // En production, on sauvegarderait dans la base de données
    console.log('Security Audit Event:', auditEvent);
  }

  /**
   * Génère un ID d'audit
   */
  private static generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Récupère les événements d'audit
   */
  public static getAuditEvents(
    filters?: {
      userId?: string;
      action?: SecurityAction;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): SecurityAuditEvent[] {
    let events = [...this.auditEvents];

    if (filters) {
      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId);
      }
      if (filters.action) {
        events = events.filter(e => e.action === filters.action);
      }
      if (filters.resource) {
        events = events.filter(e => e.resource === filters.resource);
      }
      if (filters.startDate) {
        events = events.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(e => e.timestamp <= filters.endDate!);
      }
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Crée une configuration de sécurité pour un modèle
   */
  public static createModelSecurity(
    modelName: string,
    config: Partial<ModelSecurityConfig> = {}
  ): ModelSecurityConfig {
    return {
      model: modelName,
      permissions: {},
      fieldSecurity: [],
      recordRules: [],
      audit: false,
      encryption: false,
      ...config
    };
  }

  /**
   * Ajoute une permission à un modèle
   */
  public static addPermission(
    modelName: string,
    action: SecurityAction,
    permissions: string[]
  ): void {
    const config = this.securityConfigs.get(modelName);
    if (!config) {
      config = this.createModelSecurity(modelName);
      this.securityConfigs.set(modelName, config);
    }

    if (!config.permissions) {
      config.permissions = {};
    }

    config.permissions[action] = permissions;
    this.defineSecurity(config);
  }

  /**
   * Ajoute une règle de sécurité de champ
   */
  public static addFieldSecurity(
    modelName: string,
    fieldName: string,
    config: Partial<FieldSecurityConfig> = {}
  ): void {
    const modelConfig = this.securityConfigs.get(modelName);
    if (!modelConfig) {
      const newConfig = this.createModelSecurity(modelName);
      this.securityConfigs.set(modelName, newConfig);
      this.defineSecurity(newConfig);
    }

    const securityConfig = this.securityConfigs.get(modelName)!;
    if (!securityConfig.fieldSecurity) {
      securityConfig.fieldSecurity = [];
    }

    const existingIndex = securityConfig.fieldSecurity.findIndex(f => f.field === fieldName);
    if (existingIndex >= 0) {
      securityConfig.fieldSecurity[existingIndex] = {
        field: fieldName,
        ...securityConfig.fieldSecurity[existingIndex],
        ...config
      };
    } else {
      securityConfig.fieldSecurity.push({
        field: fieldName,
        ...config
      });
    }

    this.defineSecurity(securityConfig);
  }

  /**
   * Ajoute une règle d'accès aux enregistrements
   */
  public static addRecordRule(
    modelName: string,
    rule: RecordRule
  ): void {
    const config = this.securityConfigs.get(modelName);
    if (!config) {
      const newConfig = this.createModelSecurity(modelName);
      this.securityConfigs.set(modelName, newConfig);
      this.defineSecurity(newConfig);
    }

    const securityConfig = this.securityConfigs.get(modelName)!;
    if (!securityConfig.recordRules) {
      securityConfig.recordRules = [];
    }

    securityConfig.recordRules.push(rule);
    this.defineSecurity(securityConfig);
  }

  /**
   * Exporte toutes les configurations de sécurité
   */
  public static exportSecurityConfigs(): Record<string, ModelSecurityConfig> {
    const exported: Record<string, ModelSecurityConfig> = {};

    for (const [modelName, config] of this.securityConfigs) {
      exported[modelName] = config;
    }

    return exported;
  }

  /**
   * Importe des configurations de sécurité
   */
  public static importSecurityConfigs(
    configs: Record<string, ModelSecurityConfig>
  ): void {
    for (const [modelName, config] of Object.entries(configs)) {
      try {
        this.defineSecurity(config);
      } catch (error) {
        console.error(`Failed to import security config for model ${modelName}:`, error);
      }
    }
  }

  /**
   * Valide une configuration de sécurité
   */
  public static validateSecurityConfig(config: ModelSecurityConfig): string[] {
    const errors: string[] = [];

    if (!config.model) {
      errors.push('Model name is required');
    }

    if (config.fieldSecurity) {
      config.fieldSecurity.forEach((fieldConfig, index) => {
        if (!fieldConfig.field) {
          errors.push(`Field ${index} name is required`);
        }
      });
    }

    if (config.recordRules) {
      config.recordRules.forEach((rule, index) => {
        if (!rule.name) {
          errors.push(`Record rule ${index} name is required`);
        }
        if (!rule.condition) {
          errors.push(`Record rule ${index} condition is required`);
        }
      });
    }

    return errors;
  }

  /**
   * Nettoie les anciens événements d'audit
   */
  public static cleanupAuditEvents(olderThanDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    this.auditEvents = this.auditEvents.filter(
      event => event.timestamp > cutoffDate
    );
  }
}

export default EntidrModelSecurity;
