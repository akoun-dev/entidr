import {
  EntidrBaseModel,
  EntidrModelDecorator,
  Field,
  Method,
  Relation,
  Hook,
  Scope,
  AdvancedFieldType,
  ValidationRule
} from '../EntidrModel';
import { EntidrModelConfig, EntidrRelation } from '../../../types/entidr-model';

/**
 * Modèle utilisateur avancé utilisant le système Entidr ORM
 */
@EntidrModelDecorator({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
  freezeTableName: false,
  logging: false
} as EntidrModelConfig)
export class UserModel extends EntidrBaseModel {
  // Champ ID primaire
  @Field({
    type: AdvancedFieldType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Identifiant unique de l\'utilisateur'
  })
  id!: number;

  // Champ nom d'utilisateur
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    required: true,
    minLength: 3,
    maxLength: 50,
    searchable: true,
    sortable: true,
    filterable: true,
    comment: 'Nom d\'utilisateur unique'
  })
  username!: string;

  // Champ email
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    required: true,
    searchable: true,
    sortable: true,
    filterable: true,
    widget: 'email',
    hint: 'adresse@email.com',
    placeholder: 'Entrez votre email',
    comment: 'Adresse email de l\'utilisateur'
  })
  email!: string;

  // Champ mot de passe
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    required: true,
    sensitive: true,
    hidden: true,
    minLength: 8,
    widget: 'password',
    hint: 'Minimum 8 caractères',
    placeholder: 'Entrez votre mot de passe',
    comment: 'Mot de passe hashé de l\'utilisateur'
  })
  password!: string;

  // Champ prénom
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    searchable: true,
    sortable: true,
    filterable: true,
    maxLength: 100,
    widget: 'text',
    placeholder: 'Entrez votre prénom',
    comment: 'Prénom de l\'utilisateur'
  })
  firstName!: string;

  // Champ nom
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    searchable: true,
    sortable: true,
    filterable: true,
    maxLength: 100,
    widget: 'text',
    placeholder: 'Entrez votre nom',
    comment: 'Nom de l\'utilisateur'
  })
  lastName!: string;

  // Champ statut
  @Field({
    type: AdvancedFieldType.ENUM,
    allowNull: false,
    defaultValue: 'active',
    values: ['active', 'inactive', 'pending', 'suspended'],
    filterable: true,
    sortable: true,
    widget: 'select',
    comment: 'Statut du compte utilisateur'
  })
  status!: string;

  // Champ date de dernière connexion
  @Field({
    type: AdvancedFieldType.DATETIME,
    allowNull: true,
    readOnly: true,
    sortable: true,
    widget: 'datetime',
    comment: 'Date et heure de la dernière connexion'
  })
  lastLogin!: Date;

  // Champ avatar (URL)
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    widget: 'image',
    placeholder: 'URL de l\'avatar',
    comment: 'URL de l\'avatar de l\'utilisateur'
  })
  avatar!: string;

  // Champ préférences (JSON)
  @Field({
    type: AdvancedFieldType.JSON,
    allowNull: true,
    defaultValue: {},
    widget: 'json',
    comment: 'Préférences utilisateur au format JSON'
  })
  preferences!: Record<string, any>;

  // Champ vérifié
  @Field({
    type: AdvancedFieldType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    filterable: true,
    sortable: true,
    widget: 'checkbox',
    comment: 'Email vérifié'
  })
  verified!: boolean;

  // Méthode pour obtenir le nom complet
  @Method({
    name: 'getFullName',
    description: 'Retourne le nom complet de l\'utilisateur',
    api: true,
    returns: { type: 'string', description: 'Nom complet' }
  })
  getFullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
  }

  // Méthode pour vérifier le mot de passe
  @Method({
    name: 'verifyPassword',
    description: 'Vérifie si le mot de passe correspond',
    parameters: [
      { name: 'password', type: 'string', required: true, description: 'Mot de passe à vérifier' }
    ],
    returns: { type: 'boolean', description: 'True si le mot de passe correspond' }
  })
  async verifyPassword(password: string): Promise<boolean> {
    // Dans une implémentation réelle, on utiliserait bcrypt
    return this.password === password; // Simplifié pour l'exemple
  }

  // Méthode pour activer le compte
  @Method({
    name: 'activate',
    description: 'Active le compte utilisateur',
    api: true,
    permissions: ['user:activate']
  })
  async activate(): Promise<void> {
    this.status = 'active';
    this.verified = true;
    await this.save();
  }

  // Hook avant création
  @Hook('beforeCreate')
  static async beforeCreate(user: UserModel): Promise<void> {
    // Hasher le mot de passe avant création
    if (user.password) {
      user.password = await UserModel.hashPassword(user.password);
    }

    // Générer un username si non fourni
    if (!user.username && user.email) {
      user.username = await UserModel.generateUsername(user.email);
    }
  }

  // Hook avant mise à jour
  @Hook('beforeUpdate')
  static async beforeUpdate(user: UserModel): Promise<void> {
    // Hasher le mot de passe s'il a été modifié
    if (user.changed('password')) {
      user.password = await UserModel.hashPassword(user.password);
    }
  }

  // Hook après création
  @Hook('afterCreate')
  static async afterCreate(user: UserModel): Promise<void> {
    console.log(`Nouvel utilisateur créé: ${user.username}`);
    // Envoyer un email de bienvenue, etc.
  }

  // Scope pour les utilisateurs actifs
  @Scope({
    name: 'active',
    scope: () => ({ where: { status: 'active' } })
  })
  static activeScope() {
    return this.scope({ where: { status: 'active' } });
  }

  // Scope pour les utilisateurs vérifiés
  @Scope({
    name: 'verified',
    scope: () => ({ where: { verified: true } })
  })
  static verifiedScope() {
    return this.scope({ where: { verified: true } });
  }

  // Scope pour les utilisateurs par rôle
  @Scope({
    name: 'byRole',
    scope: (role: string) => ({
      where: {
        preferences: {
          role: role
        }
      }
    })
  })
  static byRoleScope(role: string) {
    return this.scope({
      where: {
        preferences: {
          role: role
        }
      }
    });
  }

  // Méthode statique pour hasher un mot de passe
  static async hashPassword(password: string): Promise<string> {
    // Dans une implémentation réelle, on utiliserait bcrypt
    return `hashed_${password}`; // Simplifié pour l'exemple
  }

  // Méthode statique pour générer un username
  static async generateUsername(email: string): Promise<string> {
    const baseUsername = email.split('@')[0];
    let username = baseUsername;
    let counter = 1;

    // Vérifier si le username existe déjà
    while (await this.findOne({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  // Méthode statique pour trouver par email
  static async findByEmail(email: string): Promise<UserModel | null> {
    return this.findOne({ where: { email } });
  }

  // Méthode statique pour créer un utilisateur
  static async create(userData: Partial<UserModel>): Promise<UserModel> {
    return this.create(userData);
  }

  // Validation personnalisée
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    return errors;
  }
}

export default UserModel;
