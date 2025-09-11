import {
  EntidrBaseModel,
  EntidrModelDecorator,
  Field,
  Method,
  Hook,
  AdvancedFieldType
} from '../../orm/EntidrModel';
import { EntidrGroup, EntidrGroupPermission } from '../../../types/entidr-security';

/**
 * Modèle Groupe pour le système de sécurité
 */
@EntidrModelDecorator({
  tableName: 'groups',
  timestamps: true,
  paranoid: true,
  underscored: true
})
export class GroupModel extends EntidrBaseModel implements EntidrGroup {
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
      { validator: (value: string) => value.length >= 3, message: 'Group name must be at least 3 characters' },
      { validator: (value: string) => /^[a-zA-Z0-9_]+$/.test(value), message: 'Group name can only contain letters, numbers and underscores' }
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
    type: AdvancedFieldType.STRING,
    allowNull: true,
    maxLength: 255
  })
  parent!: string;

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
  permissions!: EntidrGroupPermission[];

  @Field({
    type: AdvancedFieldType.JSON,
    allowNull: false,
    defaultValue: () => []
  })
  impliedIds!: string[];

  @Field({
    type: AdvancedFieldType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  active!: boolean;

  // Méthodes métier
  @Method({
    name: 'hasPermission',
    description: 'Vérifie si le groupe a une permission spécifique',
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
    description: 'Ajoute une permission au groupe',
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
    description: 'Supprime une permission du groupe',
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
    description: 'Met à jour une permission du groupe',
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
    description: 'Récupère une permission spécifique du groupe',
    parameters: [
      { name: 'model', type: 'string', required: true, description: 'Modèle concerné' }
    ],
    returns: { type: 'object', description: 'Permission ou null' }
  })
  getPermission(model: string): EntidrGroupPermission | null {
    return this.permissions.find(perm => perm.model === model) || null;
  }

  @Method({
    name: 'getAllPermissions',
    description: 'Récupère toutes les permissions du groupe',
    returns: { type: 'array', description: 'Liste des permissions' }
  })
  getAllPermissions(): EntidrGroupPermission[] {
    return [...this.permissions];
  }

  @Method({
    name: 'addUser',
    description: 'Ajoute un utilisateur au groupe',
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
    description: 'Supprime un utilisateur du groupe',
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
    description: 'Vérifie si un utilisateur appartient au groupe',
    parameters: [
      { name: 'userId', type: 'string', required: true, description: 'ID de l\'utilisateur' }
    ],
    returns: { type: 'boolean', description: 'True si utilisateur appartient' }
  })
  hasUser(userId: string): boolean {
    return this.users.includes(userId);
  }

  @Method({
    name: 'getUserCount',
    description: 'Retourne le nombre d\'utilisateurs dans le groupe',
    returns: { type: 'number', description: 'Nombre d\'utilisateurs' }
  })
  getUserCount(): number {
    return this.users.length;
  }

  @Method({
    name: 'setParent',
    description: 'Définit le groupe parent',
    parameters: [
      { name: 'parentId', type: 'string', required: true, description: 'ID du groupe parent' }
    ],
    returns: { type: 'boolean', description: 'True si parent défini' }
  })
  setParent(parentId: string): boolean {
    // Vérifier que ce n'est pas une référence circulaire
    if (parentId === this.id) {
      return false;
    }

    this.parent = parentId;
    return true;
  }

  @Method({
    name: 'removeParent',
    description: 'Supprime le groupe parent',
    returns: { type: 'void', description: 'Void' }
  })
  removeParent(): void {
    this.parent = '';
  }

  @Method({
    name: 'hasParent',
    description: 'Vérifie si le groupe a un parent',
    returns: { type: 'boolean', description: 'True si a un parent' }
  })
  hasParent(): boolean {
    return !!this.parent && this.parent.length > 0;
  }

  @Method({
    name: 'getParentId',
    description: 'Retourne l\'ID du groupe parent',
    returns: { type: 'string', description: 'ID du parent ou chaîne vide' }
  })
  getParentId(): string {
    return this.parent || '';
  }

  @Method({
    name: 'isRoot',
    description: 'Vérifie si le groupe est un groupe racine (pas de parent)',
    returns: { type: 'boolean', description: 'True si racine' }
  })
  isRoot(): boolean {
    return !this.hasParent();
  }

  @Method({
    name: 'addImpliedGroup',
    description: 'Ajoute un groupe impliqué (héritage)',
    parameters: [
      { name: 'groupId', type: 'string', required: true, description: 'ID du groupe impliqué' }
    ],
    returns: { type: 'boolean', description: 'True si groupe ajouté' }
  })
  addImpliedGroup(groupId: string): boolean {
    if (!this.impliedIds.includes(groupId)) {
      this.impliedIds.push(groupId);
      return true;
    }
    return false;
  }

  @Method({
    name: 'removeImpliedGroup',
    description: 'Supprime un groupe impliqué',
    parameters: [
      { name: 'groupId', type: 'string', required: true, description: 'ID du groupe impliqué' }
    ],
    returns: { type: 'boolean', description: 'True si groupe supprimé' }
  })
  removeImpliedGroup(groupId: string): boolean {
    const initialLength = this.impliedIds.length;
    this.impliedIds = this.impliedIds.filter(id => id !== groupId);
    return initialLength > this.impliedIds.length;
  }

  @Method({
    name: 'hasImpliedGroup',
    description: 'Vérifie si un groupe est impliqué',
    parameters: [
      { name: 'groupId', type: 'string', required: true, description: 'ID du groupe impliqué' }
    ],
    returns: { type: 'boolean', description: 'True si groupe impliqué' }
  })
  hasImpliedGroup(groupId: string): boolean {
    return this.impliedIds.includes(groupId);
  }

  @Method({
    name: 'getImpliedGroups',
    description: 'Retourne tous les groupes impliqués',
    returns: { type: 'array', description: 'IDs des groupes impliqués' }
  })
  getImpliedGroups(): string[] {
    return [...this.impliedIds];
  }

  @Method({
    name: 'getImpliedGroupCount',
    description: 'Retourne le nombre de groupes impliqués',
    returns: { type: 'number', description: 'Nombre de groupes' }
  })
  getImpliedGroupCount(): number {
    return this.impliedIds.length;
  }

  @Method({
    name: 'getPermissionSummary',
    description: 'Retourne un résumé des permissions du groupe',
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
    description: 'Valide les permissions du groupe',
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
    name: 'getHierarchy',
    description: 'Retourne la hiérarchie complète du groupe',
    parameters: [
      { name: 'allGroups', type: 'array', required: true, description: 'Tous les groupes disponibles' }
    ],
    returns: { type: 'array', description: 'Hiérarchie des groupes' }
  })
  getHierarchy(allGroups: GroupModel[]): GroupModel[] {
    const hierarchy: GroupModel[] = [];
    let current: GroupModel | null = this;

    while (current) {
      hierarchy.unshift(current);
      const parentId = current.getParentId();
      current = parentId ? allGroups.find(g => g.id === parentId) || null : null;
    }

    return hierarchy;
  }

  @Method({
    name: 'getAllChildren',
    description: 'Retourne tous les groupes enfants directs',
    parameters: [
      { name: 'allGroups', type: 'array', required: true, description: 'Tous les groupes disponibles' }
    ],
    returns: { type: 'array', description: 'Groupes enfants' }
  })
  getAllChildren(allGroups: GroupModel[]): GroupModel[] {
    return allGroups.filter(group => group.getParentId() === this.id);
  }

  @Method({
    name: 'getAllDescendants',
    description: 'Retourne tous les descendants (hiérarchie complète)',
    parameters: [
      { name: 'allGroups', type: 'array', required: true, description: 'Tous les groupes disponibles' }
    ],
    returns: { type: 'array', description: 'Tous les descendants' }
  })
  getAllDescendants(allGroups: GroupModel[]): GroupModel[] {
    const descendants: GroupModel[] = [];
    const children = this.getAllChildren(allGroups);

    children.forEach(child => {
      descendants.push(child);
      descendants.push(...child.getAllDescendants(allGroups));
    });

    return descendants;
  }

  @Method({
    name: 'isAncestorOf',
    description: 'Vérifie si ce groupe est un ancêtre d\'un autre groupe',
    parameters: [
      { name: 'otherGroup', type: 'object', required: true, description: 'Autre groupe à vérifier' },
      { name: 'allGroups', type: 'array', required: true, description: 'Tous les groupes disponibles' }
    ],
    returns: { type: 'boolean', description: 'True si ancêtre' }
  })
  isAncestorOf(otherGroup: GroupModel, allGroups: GroupModel[]): boolean {
    const hierarchy = otherGroup.getHierarchy(allGroups);
    return hierarchy.some(group => group.id === this.id);
  }

  @Method({
    name: 'isDescendantOf',
    description: 'Vérifie si ce groupe est un descendant d\'un autre groupe',
    parameters: [
      { name: 'otherGroup', type: 'object', required: true, description: 'Autre groupe à vérifier' },
      { name: 'allGroups', type: 'array', required: true, description: 'Tous les groupes disponibles' }
    ],
    returns: { type: 'boolean', description: 'True si descendant' }
  })
  isDescendantOf(otherGroup: GroupModel, allGroups: GroupModel[]): boolean {
    return otherGroup.isAncestorOf(this, allGroups);
  }

  @Method({
    name: 'canBeDeleted',
    description: 'Vérifie si le groupe peut être supprimé',
    returns: { type: 'boolean', description: 'True si supprimable' }
  })
  canBeDeleted(): boolean {
    return this.users.length === 0;
  }

  @Method({
    name: 'clone',
    description: 'Clone le groupe avec un nouveau nom',
    parameters: [
      { name: 'newName', type: 'string', required: true, description: 'Nouveau nom du groupe' },
      { name: 'newDisplayName', type: 'string', required: true, description: 'Nouveau display name' }
    ],
    returns: { type: 'object', description: 'Nouveau groupe cloné' }
  })
  clone(newName: string, newDisplayName: string): Partial<GroupModel> {
    return {
      name: newName,
      displayName: newDisplayName,
      description: this.description,
      category: this.category,
      parent: '', // Les groupes clonés n'ont pas de parent par défaut
      users: [],
      permissions: [...this.permissions],
      impliedIds: [],
      active: this.active
    };
  }

  // Hooks de cycle de vie
  @Hook('beforeCreate')
  static async beforeCreate(group: GroupModel): Promise<void> {
    // Validation des données
    if (!group.name || !group.displayName) {
      throw new Error('Group name and display name are required');
    }

    // Validation des permissions
    const permissionErrors = group.validatePermissions();
    if (permissionErrors.length > 0) {
      throw new Error(`Invalid permissions: ${permissionErrors.join(', ')}`);
    }

    // Normalisation du nom
    group.name = group.name.toLowerCase().replace(/\s+/g, '_');

    // Vérifier les références circulaires
    if (group.parent === group.id) {
      throw new Error('Group cannot be its own parent');
    }
  }

  @Hook('beforeUpdate')
  static async beforeUpdate(group: GroupModel): Promise<void> {
    // Validation des permissions si modifiées
    if (group.changed('permissions')) {
      const permissionErrors = group.validatePermissions();
      if (permissionErrors.length > 0) {
        throw new Error(`Invalid permissions: ${permissionErrors.join(', ')}`);
      }
    }

    // Normalisation du nom si modifié
    if (group.changed('name')) {
      group.name = group.name.toLowerCase().replace(/\s+/g, '_');
    }

    // Vérifier les références circulaires
    if (group.changed('parent') && group.parent === group.id) {
      throw new Error('Group cannot be its own parent');
    }
  }

  @Hook('beforeDestroy')
  static async beforeDestroy(group: GroupModel): Promise<void> {
    // Vérifier si des utilisateurs sont dans ce groupe
    if (group.users.length > 0) {
      throw new Error('Cannot delete group with assigned users');
    }
  }

  @Hook('afterUpdate')
  static async afterUpdate(group: GroupModel): Promise<void> {
    // Journaliser les changements importants
    if (group.changed('active') || group.changed('permissions') || group.changed('parent')) {
      console.log(`Group ${group.name} updated - Active: ${group.active}, Permissions: ${group.permissions.length}, Parent: ${group.parent}`);
    }
  }
}

export default GroupModel;
