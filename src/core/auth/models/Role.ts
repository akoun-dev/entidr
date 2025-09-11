import {
  EntidrBaseModel,
  EntidrModelDecorator,
  Field,
  Method,
  Hook,
  AdvancedFieldType
} from '../../orm/EntidrModel';
import { EntidrRole, EntidrRolePermission } from '../../../types/entidr-security';

/**
 * Modèle Rôle pour le système de sécurité
 */
@EntidrModelDecorator({
  tableName: 'roles',
  timestamps: true,
  paranoid: true,
  underscored: true
})
export class RoleModel extends EntidrBaseModel implements EntidrRole {
  @Field({
    type: AdvancedFieldType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  })
  id!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    validate: [
      { validator: (value: string) => value.length >= 3, message: 'Role name must be at least 3 characters' },
      { validator: (value: string) => /^[a-zA-Z0-9_]+$/.test(value), message: 'Role name can only contain letters, numbers and underscores' }
    ]
  })
  name!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    maxLength: 255
  })
  displayName!: string;

  @Field({
    type: AdvancedFieldType.TEXT,
    allowNull: true
  })
  description!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    maxLength: 50
  })
  category!: string;

  @Field({
    type: AdvancedFieldType.JSON,
    allowNull: false,
    defaultValue: () => []
  })
  permissions!: EntidrRolePermission[];

  @Field({
    type: AdvancedFieldType.JSON,
    allowNull: false,
    defaultValue: () => []
  })
  users!: string[];

  @Field({
    type: AdvancedFieldType.JSON,
    allowNull: false,
    defaultValue: () => []
  })
  groups!: string[];

  @Field({
    type: AdvancedFieldType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  active!: boolean;

  @Field({
    type: AdvancedFieldType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  system!: boolean;

  // Méthodes métier
  @Method({
    name: 'hasPermission',
    description: 'Vérifie si le rôle a une permission spécifique',
    parameters: [
      { name: 'model', type: 'string', required: true, description: 'Modèle concerné' },
      { name: 'action', type: 'string', required: true, description: 'Action (read, write, create, unlink)' }
    ],
    returns: { type: 'boolean', description: 'True si permission accordée' }
  })
  hasPermission(model: string, action: string): boolean {
    return this.permissions.some(perm =>
      perm.model === model && perm.permissions[action as keyof typeof perm.permissions]
    );
  }

  @Method({
    name: 'addPermission',
    description: 'Ajoute une permission au rôle',
    parameters: [
      { name: 'model', type: 'string', required: true, description: 'Modèle concerné' },
      { name: 'permissions', type: 'object', required: true, description: 'Permissions à ajouter' },
      { name: 'domain', type: 'string', required: false, description: 'Domaine optionnel' }
    ],
    returns: { type: 'boolean', description: 'True si permission ajoutée' }
  })
  addPermission(model: string, permissions: any, domain?: string): boolean {
    // Vérifier si la permission existe déjà
    const existingIndex = this.permissions.findIndex(perm => perm.model === model);

    if (existingIndex >= 0) {
      // Mettre à jour la permission existante
      this.permissions[existingIndex] = {
        model,
        permissions: { ...this.permissions[existingIndex].permissions, ...permissions },
        domain
      };
    } else {
      // Ajouter une nouvelle permission
      this.permissions.push({
        model,
        permissions,
        domain
      });
    }

    return true;
  }

  @Method({
    name: 'removePermission',
    description: 'Supprime une permission du rôle',
    parameters: [
      { name: 'model', type: 'string', required: true, description: 'Modèle concerné' }
    ],
    returns: { type: 'boolean', description: 'True si permission supprimée' }
  })
  removePermission(model: string): boolean {
    const initialLength = this.permissions.length;
    this.permissions = this.permissions.filter(perm => perm.model !== model);
    return initialLength > this.permissions.length;
  }

  @Method({
    name: 'updatePermission',
    description: 'Met à jour une permission du rôle',
    parameters: [
      { name: 'model', type: 'string', required: true, description: 'Modèle concerné' },
      { name: 'permissions', type: 'object', required: true, description: 'Nouvelles permissions' },
      { name: 'domain', type: 'string', required: false, description: 'Nouveau domaine' }
    ],
    returns: { type: 'boolean', description: 'True si permission mise à jour' }
  })
  updatePermission(model: string, permissions: any, domain?: string): boolean {
    const permissionIndex = this.permissions.findIndex(perm => perm.model === model);

    if (permissionIndex >= 0) {
      this.permissions[permissionIndex] = {
        model,
        permissions,
        domain: domain !== undefined ? domain : this.permissions[permissionIndex].domain
      };
      return true;
    }

    return false;
  }

  @Method({
    name: 'getPermission',
    description: 'Récupère une permission spécifique du rôle',
    parameters: [
      { name: 'model', type: 'string', required: true, description: 'Modèle concerné' }
    ],
    returns: { type: 'object', description: 'Permission ou null' }
  })
  getPermission(model: string): EntidrRolePermission | null {
    return this.permissions.find(perm => perm.model === model) || null;
  }

  @Method({
    name: 'getAllPermissions',
    description: 'Récupère toutes les permissions du rôle',
    returns: { type: 'array', description: 'Liste des permissions' }
  })
  getAllPermissions(): EntidrRolePermission[] {
    return [...this.permissions];
  }

  @Method({
    name: 'addUser',
    description: 'Ajoute un utilisateur au rôle',
    parameters: [
      { name: 'userId', type: 'string', required: true, description: 'ID de l\'utilisateur' }
    ],
    returns: { type: 'boolean', description: 'True si utilisateur ajouté' }
  })
  addUser(userId: string): boolean {
    if (!this.users.includes(userId)) {
      this.users.push(userId);
      return true;
    }
    return false;
  }

  @Method({
    name: 'removeUser',
    description: 'Supprime un utilisateur du rôle',
    parameters: [
      { name: 'userId', type: 'string', required: true, description: 'ID de l\'utilisateur' }
    ],
    returns: { type: 'boolean', description: 'True si utilisateur supprimé' }
  })
  removeUser(userId: string): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(id => id !== userId);
    return initialLength > this.users.length;
  }

  @Method({
    name: 'hasUser',
    description: 'Vérifie si un utilisateur a ce rôle',
    parameters: [
      { name: 'userId', type: 'string', required: true, description: 'ID de l\'utilisateur' }
    ],
    returns: { type: 'boolean', description: 'True si utilisateur a le rôle' }
  })
  hasUser(userId: string): boolean {
    return this.users.includes(userId);
  }

  @Method({
    name: 'getUserCount',
    description: 'Retourne le nombre d\'utilisateurs ayant ce rôle',
    returns: { type: 'number', description: 'Nombre d\'utilisateurs' }
  })
  getUserCount(): number {
    return this.users.length;
  }

  @Method({
    name: 'addGroup',
    description: 'Ajoute un groupe au rôle',
    parameters: [
      { name: 'groupId', type: 'string', required: true, description: 'ID du groupe' }
    ],
    returns: { type: 'boolean', description: 'True si groupe ajouté' }
  })
  addGroup(groupId: string): boolean {
    if (!this.groups.includes(groupId)) {
      this.groups.push(groupId);
      return true;
    }
    return false;
  }

  @Method({
    name: 'removeGroup',
    description: 'Supprime un groupe du rôle',
    parameters: [
      { name: 'groupId', type: 'string', required: true, description: 'ID du groupe' }
    ],
    returns: { type: 'boolean', description: 'True si groupe supprimé' }
  })
  removeGroup(groupId: string): boolean {
    const initialLength = this.groups.length;
    this.groups = this.groups.filter(id => id !== groupId);
    return initialLength > this.groups.length;
  }

  @Method({
    name: 'hasGroup',
    description: 'Vérifie si un groupe est associé à ce rôle',
    parameters: [
      { name: 'groupId', type: 'string', required: true, description: 'ID du groupe' }
    ],
    returns: { type: 'boolean', description: 'True si groupe associé' }
  })
  hasGroup(groupId: string): boolean {
    return this.groups.includes(groupId);
  }

  @Method({
    name: 'getGroupCount',
    description: 'Retourne le nombre de groupes associés à ce rôle',
    returns: { type: 'number', description: 'Nombre de groupes' }
  })
  getGroupCount(): number {
    return this.groups.length;
  }

  @Method({
    name: 'isSystemRole',
    description: 'Vérifie si c\'est un rôle système',
    returns: { type: 'boolean', description: 'True si rôle système' }
  })
  isSystemRole(): boolean {
    return this.system;
  }

  @Method({
    name: 'canBeModified',
    description: 'Vérifie si le rôle peut être modifié',
    returns: { type: 'boolean', description: 'True si modifiable' }
  })
  canBeModified(): boolean {
    return !this.system;
  }

  @Method({
    name: 'canBeDeleted',
    description: 'Vérifie si le rôle peut être supprimé',
    returns: { type: 'boolean', description: 'True si supprimable' }
  })
  canBeDeleted(): boolean {
    return !this.system && this.users.length === 0;
  }

  @Method({
    name: 'getPermissionSummary',
    description: 'Retourne un résumé des permissions du rôle',
    returns: { type: 'object', description: 'Résumé des permissions' }
  })
  getPermissionSummary(): Record<string, number> {
    const summary: Record<string, number> = {};

    this.permissions.forEach(perm => {
      Object.keys(perm.permissions).forEach(action => {
        if (perm.permissions[action as keyof typeof perm.permissions]) {
          summary[action] = (summary[action] || 0) + 1;
        }
      });
    });

    return summary;
  }

  @Method({
    name: 'validatePermissions',
    description: 'Valide les permissions du rôle',
    returns: { type: 'array', description: 'Erreurs de validation' }
  })
  validatePermissions(): string[] {
    const errors: string[] = [];

    this.permissions.forEach((perm, index) => {
      if (!perm.model) {
        errors.push(`Permission ${index}: model is required`);
      }

      if (!perm.permissions || Object.keys(perm.permissions).length === 0) {
        errors.push(`Permission ${index}: at least one permission action is required`);
      }
    });

    return errors;
  }

  @Method({
    name: 'clone',
    description: 'Clone le rôle avec un nouveau nom',
    parameters: [
      { name: 'newName', type: 'string', required: true, description: 'Nouveau nom du rôle' },
      { name: 'newDisplayName', type: 'string', required: true, description: 'Nouveau display name' }
    ],
    returns: { type: 'object', description: 'Nouveau rôle cloné' }
  })
  clone(newName: string, newDisplayName: string): Partial<RoleModel> {
    return {
      name: newName,
      displayName: newDisplayName,
      description: this.description,
      category: this.category,
      permissions: [...this.permissions],
      users: [],
      groups: [...this.groups],
      active: this.active,
      system: false // Les rôles clonés ne sont pas des rôles système
    };
  }

  @Method({
    name: 'mergePermissions',
    description: 'Fusionne les permissions avec un autre rôle',
    parameters: [
      { name: 'otherRole', type: 'object', required: true, description: 'Autre rôle à fusionner' }
    ],
    returns: { type: 'boolean', description: 'True si fusion réussie' }
  })
  mergePermissions(otherRole: RoleModel): boolean {
    try {
      otherRole.permissions.forEach(perm => {
        this.addPermission(perm.model, perm.permissions, perm.domain);
      });
      return true;
    } catch (error) {
      console.error('Error merging permissions:', error);
      return false;
    }
  }

  // Hooks de cycle de vie
  @Hook('beforeCreate')
  static async beforeCreate(role: RoleModel): Promise<void> {
    // Validation des données
    if (!role.name || !role.displayName) {
      throw new Error('Role name and display name are required');
    }

    // Validation des permissions
    const permissionErrors = role.validatePermissions();
    if (permissionErrors.length > 0) {
      throw new Error(`Invalid permissions: ${permissionErrors.join(', ')}`);
    }

    // Normalisation du nom
    role.name = role.name.toLowerCase().replace(/\s+/g, '_');
  }

  @Hook('beforeUpdate')
  static async beforeUpdate(role: RoleModel): Promise<void> {
    // Empêcher la modification des rôles système
    if (role.changed('system') && role.system) {
      throw new Error('Cannot modify system role status');
    }

    // Validation des permissions si modifiées
    if (role.changed('permissions')) {
      const permissionErrors = role.validatePermissions();
      if (permissionErrors.length > 0) {
        throw new Error(`Invalid permissions: ${permissionErrors.join(', ')}`);
      }
    }

    // Normalisation du nom si modifié
    if (role.changed('name')) {
      role.name = role.name.toLowerCase().replace(/\s+/g, '_');
    }
  }

  @Hook('beforeDestroy')
  static async beforeDestroy(role: RoleModel): Promise<void> {
    // Empêcher la suppression des rôles système
    if (role.system) {
      throw new Error('Cannot delete system role');
    }

    // Vérifier si des utilisateurs ont ce rôle
    if (role.users.length > 0) {
      throw new Error('Cannot delete role with assigned users');
    }
  }

  @Hook('afterUpdate')
  static async afterUpdate(role: RoleModel): Promise<void> {
    // Journaliser les changements importants
    if (role.changed('active') || role.changed('permissions')) {
      console.log(`Role ${role.name} updated - Active: ${role.active}, Permissions: ${role.permissions.length}`);
    }
  }
}

export default RoleModel;
