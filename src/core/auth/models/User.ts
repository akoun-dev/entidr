import {
  EntidrBaseModel,
  EntidrModelDecorator,
  Field,
  Method,
  Hook,
  AdvancedFieldType
} from '../../orm/EntidrModel';
import { EntidrUser, EntidrUserSettings, EntidrUserSecurity, EntidrUserSession } from '../../../types/entidr-security';

/**
 * Modèle Utilisateur pour le système de sécurité
 */
@EntidrModelDecorator({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true
})
export class UserModel extends EntidrBaseModel implements EntidrUser {
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
      { validator: (value: string) => value.length >= 3, message: 'Username must be at least 3 characters' },
      { validator: (value: string) => /^[a-zA-Z0-9_]+$/.test(value), message: 'Username can only contain letters, numbers and underscores' }
    ]
  })
  username!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    widget: 'email',
    validate: [
      { validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: 'Invalid email format' }
    ]
  })
  email!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    maxLength: 255
  })
  displayName!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    maxLength: 100
  })
  firstName!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    maxLength: 100
  })
  lastName!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    maxLength: 500
  })
  avatar!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    maxLength: 20,
    widget: 'phone'
  })
  phone!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    defaultValue: 'fr',
    maxLength: 5
  })
  language!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    defaultValue: 'UTC',
    maxLength: 50
  })
  timezone!: string;

  @Field({
    type: AdvancedFieldType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  active!: boolean;

  @Field({
    type: AdvancedFieldType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  verified!: boolean;

  @Field({
    type: AdvancedFieldType.DATE,
    allowNull: true
  })
  lastLogin!: Date;

  @Field({
    type: AdvancedFieldType.JSON,
    allowNull: false,
    defaultValue: () => ({
      theme: 'auto',
      language: 'fr',
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      numberFormat: 'fr',
      notifications: {
        email: true,
        push: true,
        sms: false,
        frequency: 'immediate',
        types: ['system', 'security', 'workflow']
      },
      dashboard: {
        layout: 'default',
        widgets: ['recent_activities', 'quick_stats', 'calendar'],
        filters: {}
      },
      privacy: {
        profileVisibility: 'private',
        activityTracking: true,
        dataSharing: false,
        marketingEmails: false
      }
    })
  })
  settings!: EntidrUserSettings;

  @Field({
    type: AdvancedFieldType.JSON,
    allowNull: false,
    defaultValue: () => ({
      passwordHash: '',
      passwordSalt: '',
      twoFactorEnabled: false,
      twoFactorSecret: '',
      backupCodes: [],
      loginAttempts: 0,
      lastFailedLogin: null,
      lockedUntil: null,
      passwordExpiresAt: null,
      passwordHistory: [],
      sessions: []
    })
  })
  security!: EntidrUserSecurity;

  // Relations - seront définies dans les associations
  groups!: string[];
  roles!: string[];
  permissions!: any[];

  // Méthodes métier
  @Method({
    name: 'getFullName',
    description: 'Retourne le nom complet de l\'utilisateur',
    returns: { type: 'string', description: 'Nom complet' }
  })
  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.displayName;
  }

  @Method({
    name: 'isAdmin',
    description: 'Vérifie si l\'utilisateur est administrateur',
    returns: { type: 'boolean', description: 'True si administrateur' }
  })
  isAdmin(): boolean {
    return this.roles.includes('admin');
  }

  @Method({
    name: 'hasPermission',
    description: 'Vérifie si l\'utilisateur a une permission spécifique',
    parameters: [
      { name: 'model', type: 'string', required: true, description: 'Modèle concerné' },
      { name: 'action', type: 'string', required: true, description: 'Action (read, write, create, unlink)' }
    ],
    returns: { type: 'boolean', description: 'True si permission accordée' }
  })
  hasPermission(model: string, action: string): boolean {
    return this.permissions.some((perm: any) =>
      perm.model === model && perm.permissions[action as keyof typeof perm.permissions]
    );
  }

  @Method({
    name: 'isInGroup',
    description: 'Vérifie si l\'utilisateur appartient à un groupe',
    parameters: [
      { name: 'groupName', type: 'string', required: true, description: 'Nom du groupe' }
    ],
    returns: { type: 'boolean', description: 'True si membre du groupe' }
  })
  isInGroup(groupName: string): boolean {
    return this.groups.includes(groupName);
  }

  @Method({
    name: 'hasRole',
    description: 'Vérifie si l\'utilisateur a un rôle spécifique',
    parameters: [
      { name: 'roleName', type: 'string', required: true, description: 'Nom du rôle' }
    ],
    returns: { type: 'boolean', description: 'True si rôle accordé' }
  })
  hasRole(roleName: string): boolean {
    return this.roles.includes(roleName);
  }

  @Method({
    name: 'isLocked',
    description: 'Vérifie si le compte est verrouillé',
    returns: { type: 'boolean', description: 'True si verrouillé' }
  })
  isLocked(): boolean {
    if (!this.security.lockedUntil) {
      return false;
    }
    return new Date() < new Date(this.security.lockedUntil);
  }

  @Method({
    name: 'isPasswordExpired',
    description: 'Vérifie si le mot de passe a expiré',
    returns: { type: 'boolean', description: 'True si expiré' }
  })
  isPasswordExpired(): boolean {
    if (!this.security.passwordExpiresAt) {
      return false;
    }
    return new Date() > new Date(this.security.passwordExpiresAt);
  }

  @Method({
    name: 'incrementLoginAttempts',
    description: 'Incrémente le nombre de tentatives de connexion échouées',
    returns: { type: 'number', description: 'Nombre de tentatives' }
  })
  incrementLoginAttempts(): number {
    this.security.loginAttempts += 1;
    this.security.lastFailedLogin = new Date();
    return this.security.loginAttempts;
  }

  @Method({
    name: 'resetLoginAttempts',
    description: 'Réinitialise le nombre de tentatives de connexion',
    returns: { type: 'void', description: 'Void' }
  })
  resetLoginAttempts(): void {
    this.security.loginAttempts = 0;
    this.security.lastFailedLogin = null;
  }

  @Method({
    name: 'lockAccount',
    description: 'Verrouille le compte pour une durée spécifiée',
    parameters: [
      { name: 'duration', type: 'number', required: false, description: 'Durée en minutes (défaut: 30)' }
    ],
    returns: { type: 'Date', description: 'Date de déverrouillage' }
  })
  lockAccount(duration: number = 30): Date {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + duration);
    this.security.lockedUntil = lockedUntil;
    return lockedUntil;
  }

  @Method({
    name: 'unlockAccount',
    description: 'Déverrouille le compte',
    returns: { type: 'void', description: 'Void' }
  })
  unlockAccount(): void {
    this.security.lockedUntil = null;
    this.resetLoginAttempts();
  }

  @Method({
    name: 'addSession',
    description: 'Ajoute une session utilisateur',
    parameters: [
      { name: 'session', type: 'object', required: true, description: 'Session à ajouter' }
    ],
    returns: { type: 'void', description: 'Void' }
  })
  addSession(session: Partial<EntidrUserSession>): void {
    const newSession: EntidrUserSession = {
      id: this.generateSessionId(),
      token: session.token || '',
      device: session.device || 'Unknown',
      browser: session.browser || 'Unknown',
      os: session.os || 'Unknown',
      ipAddress: session.ipAddress || '',
      location: session.location,
      createdAt: new Date(),
      expiresAt: session.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastActive: new Date(),
      active: true
    };

    this.security.sessions.push(newSession);
  }

  @Method({
    name: 'removeSession',
    description: 'Supprime une session utilisateur',
    parameters: [
      { name: 'sessionId', type: 'string', required: true, description: 'ID de la session' }
    ],
    returns: { type: 'boolean', description: 'True si session supprimée' }
  })
  removeSession(sessionId: string): boolean {
    const index = this.security.sessions.findIndex(s => s.id === sessionId);
    if (index >= 0) {
      this.security.sessions.splice(index, 1);
      return true;
    }
    return false;
  }

  @Method({
    name: 'cleanupExpiredSessions',
    description: 'Supprime les sessions expirées',
    returns: { type: 'number', description: 'Nombre de sessions supprimées' }
  })
  cleanupExpiredSessions(): number {
    const now = new Date();
    const initialLength = this.security.sessions.length;

    this.security.sessions = this.security.sessions.filter(session =>
      session.active && new Date(session.expiresAt) > now
    );

    return initialLength - this.security.sessions.length;
  }

  @Method({
    name: 'getActiveSessions',
    description: 'Retourne les sessions actives',
    returns: { type: 'array', description: 'Sessions actives' }
  })
  getActiveSessions(): EntidrUserSession[] {
    const now = new Date();
    return this.security.sessions.filter(session =>
      session.active && new Date(session.expiresAt) > now
    );
  }

  @Method({
    name: 'updateLastLogin',
    description: 'Met à jour la date de dernière connexion',
    returns: { type: 'void', description: 'Void' }
  })
  updateLastLogin(): void {
    this.lastLogin = new Date();
    this.resetLoginAttempts();
  }

  // Méthodes utilitaires privées
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Hooks de cycle de vie
  @Hook('beforeCreate')
  static async beforeCreate(user: UserModel): Promise<void> {
    // Validation des données
    if (!user.email || !user.username) {
      throw new Error('Email and username are required');
    }

    // Initialisation des données de sécurité
    if (!user.security) {
      user.security = {
        passwordHash: '',
        passwordSalt: '',
        twoFactorEnabled: false,
        backupCodes: [],
        loginAttempts: 0,
        passwordHistory: []
      };
    }

    // Initialisation des paramètres
    if (!user.settings) {
      user.settings = {
        theme: 'auto',
        language: 'fr',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        numberFormat: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false,
          frequency: 'immediate',
          types: ['system', 'security', 'workflow']
        },
        dashboard: {
          layout: 'default',
          widgets: ['recent_activities', 'quick_stats', 'calendar'],
          filters: {}
        },
        privacy: {
          profileVisibility: 'private',
          activityTracking: true,
          dataSharing: false,
          marketingEmails: false
        }
      };
    }
  }

  @Hook('beforeUpdate')
  static async beforeUpdate(user: UserModel): Promise<void> {
    // Nettoyer les sessions expirées
    if (user.changed('security')) {
      user.cleanupExpiredSessions();
    }
  }

  @Hook('afterUpdate')
  static async afterUpdate(user: UserModel): Promise<void> {
    // Journaliser les changements de sécurité
    if (user.changed('security') || user.changed('active')) {
      console.log(`Security settings updated for user ${user.username}`);
    }
  }
}

export default UserModel;
