import {
  EntidrUser,
  EntidrRole,
  EntidrGroup,
  EntidrPermissions,
  EntidrSecurityContext,
  EntidrAccessResult
} from '../../../types/entidr-security';
import { UserModel } from '../models/User';
import { RoleModel } from '../models/Role';
import { GroupModel } from '../models/Group';

/**
 * Service de gestion des permissions pour le système de sécurité
 */
export class PermissionService {
  private static instance: PermissionService;
  private permissionCache: Map<string, { permissions: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupère l'instance unique du service (Singleton)
   */
  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Crée un contexte de sécurité pour un utilisateur
   */
  async createSecurityContext(user: UserModel): Promise<EntidrSecurityContext> {
    // Récupérer les rôles de l'utilisateur
    const roles = await this.getUserRoles(user);

    // Récupérer les groupes de l'utilisateur
    const groups = await this.getUserGroups(user);

    // Récupérer toutes les permissions de l'utilisateur
    const permissions = await this.getUserPermissions(user, roles, groups);

    // Créer le contexte de sécurité
    const context: EntidrSecurityContext = {
      user: user.get({ plain: true }),
      groups: groups.map(group => group.get({ plain: true })),
      roles: roles.map(role => role.get({ plain: true })),
      permissions,
      session: user.security.sessions[0] || {
        id: '',
        token: '',
        device: 'Unknown',
        browser: 'Unknown',
        os: 'Unknown',
        ipAddress: '',
        createdAt: new Date(),
        expiresAt: new Date(),
        lastActive: new Date(),
        active: false
      },
      ipAddress: '',
      userAgent: '',
      timestamp: new Date()
    };

    return context;
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async hasPermission(
    context: EntidrSecurityContext,
    model: string,
    action: keyof EntidrPermissions
  ): Promise<boolean> {
    // Vérifier le cache d'abord
    const cacheKey = this.getCacheKey(context.user.id, model, 'permissions');
    const cached = this.permissionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.permissions[action] || false;
    }

    // Calculer les permissions
    const hasPermission = await this.calculatePermission(context, model, action);

    // Mettre en cache le résultat
    this.permissionCache.set(cacheKey, {
      permissions: { [action]: hasPermission },
      timestamp: Date.now(),
      ttl: this.DEFAULT_CACHE_TTL
    });

    return hasPermission;
  }

  /**
   * Vérifie l'accès à un modèle avec des conditions spécifiques
   */
  async checkModelAccess(
    context: EntidrSecurityContext,
    model: string,
    action: keyof EntidrPermissions,
    domain?: string
  ): Promise<EntidrAccessResult> {
    // Vérifier si l'utilisateur a la permission de base
    const hasBasicPermission = await this.hasPermission(context, model, action);

    if (!hasBasicPermission) {
      return {
        granted: false,
        reason: `Permission ${action} denied for model ${model}`
      };
    }

    // Vérifier les conditions de domaine si spécifiées
    if (domain) {
      const domainAccess = await this.checkDomainAccess(context, model, domain);
      if (!domainAccess.granted) {
        return domainAccess;
      }
    }

    // Vérifier les règles d'accès aux enregistrements
    const recordAccess = await this.checkRecordAccess(context, model);
    if (!recordAccess.granted) {
      return recordAccess;
    }

    return {
      granted: true,
      domain,
      permissions: await this.getModelPermissions(context, model)
    };
  }

  /**
   * Récupère toutes les permissions d'un utilisateur pour un modèle
   */
  async getModelPermissions(context: EntidrSecurityContext, model: string): Promise<EntidrPermissions> {
    const permissions: EntidrPermissions = {
      read: false,
      write: false,
      create: false,
      unlink: false,
      export: false,
      import: false,
      share: false,
      approve: false,
      reject: false
    };

    // Permissions directes de l'utilisateur
    const userPerms = context.permissions.find(p => p.model === model);
    if (userPerms) {
      Object.assign(permissions, userPerms.permissions);
    }

    // Permissions des rôles
    for (const role of context.roles) {
      const rolePerms = role.permissions.find(p => p.model === model);
      if (rolePerms) {
        // Fusionner les permissions (OU logique)
        Object.keys(permissions).forEach(key => {
          const permKey = key as keyof EntidrPermissions;
          permissions[permKey] = permissions[permKey] || rolePerms.permissions[permKey];
        });
      }
    }

    // Permissions des groupes
    for (const group of context.groups) {
      const groupPerms = group.permissions.find(p => p.model === model);
      if (groupPerms) {
        // Fusionner les permissions (OU logique)
        Object.keys(permissions).forEach(key => {
          const permKey = key as keyof EntidrPermissions;
          permissions[permKey] = permissions[permKey] || groupPerms.permissions[permKey];
        });
      }
    }

    return permissions;
  }

  /**
   * Invalide le cache des permissions pour un utilisateur
   */
  invalidateUserPermissionCache(userId: string): void {
    // Supprimer toutes les entrées de cache pour cet utilisateur
    for (const [key] of this.permissionCache) {
      if (key.startsWith(`${userId}:`)) {
        this.permissionCache.delete(key);
      }
    }
  }

  /**
   * Nettoie le cache des permissions expirées
   */
  cleanupPermissionCache(): void {
    const now = Date.now();
    for (const [key, value] of this.permissionCache) {
      if (now - value.timestamp > value.ttl) {
        this.permissionCache.delete(key);
      }
    }
  }

  /**
   * Récupère les rôles d'un utilisateur
   */
  private async getUserRoles(user: UserModel): Promise<RoleModel[]> {
    const roleIds = user.roles || [];
    if (roleIds.length === 0) {
      return [];
    }

    // Simuler la récupération des rôles depuis la base de données
    // Dans une implémentation réelle, cela utiliserait RoleModel.findAll()
    const roles: RoleModel[] = [];

    for (const roleId of roleIds) {
      // Créer un rôle factice pour la démo
      const role = new RoleModel();
      Object.assign(role, {
        id: roleId,
        name: `role_${roleId}`,
        displayName: `Role ${roleId}`,
        active: true,
        system: false,
        permissions: [],
        users: [user.id],
        groups: []
      });
      roles.push(role);
    }

    return roles;
  }

  /**
   * Récupère les groupes d'un utilisateur
   */
  private async getUserGroups(user: UserModel): Promise<GroupModel[]> {
    const groupIds = user.groups || [];
    if (groupIds.length === 0) {
      return [];
    }

    // Simuler la récupération des groupes depuis la base de données
    // Dans une implémentation réelle, cela utiliserait GroupModel.findAll()
    const groups: GroupModel[] = [];

    for (const groupId of groupIds) {
      // Créer un groupe factice pour la démo
      const group = new GroupModel();
      Object.assign(group, {
        id: groupId,
        name: `group_${groupId}`,
        displayName: `Group ${groupId}`,
        active: true,
        parent: '',
        users: [user.id],
        permissions: [],
        impliedIds: []
      });
      groups.push(group);
    }

    return groups;
  }

  /**
   * Récupère toutes les permissions d'un utilisateur
   */
  private async getUserPermissions(
    user: UserModel,
    roles: RoleModel[],
    groups: GroupModel[]
  ): Promise<any[]> {
    const permissions: any[] = [];

    // Permissions directes de l'utilisateur
    if (user.permissions && Array.isArray(user.permissions)) {
      permissions.push(...user.permissions);
    }

    // Permissions des rôles
    for (const role of roles) {
      if (role.permissions && Array.isArray(role.permissions)) {
        permissions.push(...role.permissions);
      }
    }

    // Permissions des groupes
    for (const group of groups) {
      if (group.permissions && Array.isArray(group.permissions)) {
        permissions.push(...group.permissions);
      }

      // Permissions des groupes impliqués (héritage)
      for (const impliedGroupId of group.impliedIds) {
        // Dans une implémentation réelle, récupérer les permissions du groupe impliqué
        // Pour la démo, on suppose qu'il n'y a pas de permissions supplémentaires
      }
    }

    return permissions;
  }

  /**
   * Calcule une permission spécifique
   */
  private async calculatePermission(
    context: EntidrSecurityContext,
    model: string,
    action: keyof EntidrPermissions
  ): Promise<boolean> {
    // Vérifier si l'utilisateur est administrateur
    if (this.isAdmin(context.user)) {
      return true;
    }

    // Récupérer les permissions pour le modèle
    const modelPermissions = await this.getModelPermissions(context, model);

    return modelPermissions[action] || false;
  }

  /**
   * Vérifie l'accès à un domaine spécifique
   */
  private async checkDomainAccess(
    context: EntidrSecurityContext,
    model: string,
    domain: string
  ): Promise<EntidrAccessResult> {
    // Dans une implémentation réelle, cela évaluerait le domaine
    // Pour la démo, on suppose que l'accès est accordé

    return {
      granted: true,
      reason: 'Domain access granted'
    };
  }

  /**
   * Vérifie l'accès aux enregistrements
   */
  private async checkRecordAccess(
    context: EntidrSecurityContext,
    model: string
  ): Promise<EntidrAccessResult> {
    // Dans une implémentation réelle, cela vérifierait les règles d'accès aux enregistrements
    // Pour la démo, on suppose que l'accès est accordé

    return {
      granted: true,
      reason: 'Record access granted'
    };
  }

  /**
   * Vérifie si un utilisateur est administrateur
   */
  private isAdmin(user: EntidrUser): boolean {
    return user.roles.includes('admin') || user.username === 'admin';
  }

  /**
   * Génère une clé de cache
   */
  private getCacheKey(userId: string, model: string, type: string): string {
    return `${userId}:${model}:${type}`;
  }

  /**
   * Initialise le service avec des données par défaut
   */
  async initialize(): Promise<void> {
    console.log('PermissionService initialized');

    // Démarrer le nettoyage périodique du cache
    setInterval(() => {
      this.cleanupPermissionCache();
    }, 10 * 60 * 1000); // Toutes les 10 minutes
  }

  /**
   * Détruit l'instance du service
   */
  destroy(): void {
    this.permissionCache.clear();
    PermissionService.instance = null as any;
  }
}

export default PermissionService;
