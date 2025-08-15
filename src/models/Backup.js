'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les sauvegardes
 * Stocke les informations sur les sauvegardes effectuées
 */
module.exports = (sequelize, DataTypes) => {
  class Backup extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
      // Une sauvegarde peut être liée à un utilisateur qui l'a déclenchée
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  
  Backup.init({
    // Nom de la sauvegarde (généralement généré automatiquement)
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Date et heure de la sauvegarde
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Type de sauvegarde (auto, manual)
    type: {
      type: DataTypes.ENUM('auto', 'manual'),
      allowNull: false,
      defaultValue: 'auto'
    },
    // Taille de la sauvegarde en octets
    size: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    // Emplacement de stockage (local, cloud, both)
    storageLocation: {
      type: DataTypes.ENUM('local', 'cloud', 'both'),
      allowNull: false
    },
    // Chemin local de la sauvegarde
    localPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // URL ou chemin cloud de la sauvegarde
    cloudPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Statut de la sauvegarde (success, failure, in_progress)
    status: {
      type: DataTypes.ENUM('success', 'failure', 'in_progress'),
      allowNull: false,
      defaultValue: 'in_progress'
    },
    // Détails en cas d'échec
    errorDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // ID de l'utilisateur qui a déclenché la sauvegarde (null pour les sauvegardes automatiques)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // La sauvegarde est-elle chiffrée
    encrypted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Identifiant de la clé de chiffrement utilisée
    encryptionKeyId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Contenu de la sauvegarde (tables incluses, etc.)
    content: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Checksum pour vérifier l'intégrité
    checksum: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Date d'expiration (basée sur la politique de rétention)
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // La sauvegarde a-t-elle été restaurée
    restored: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Date et heure de la restauration
    restoredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // ID de l'utilisateur qui a effectué la restauration
    restoredByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Backup',
    // Désactiver les timestamps automatiques car nous utilisons notre propre champ timestamp
    timestamps: false,
    // Ajouter des index pour améliorer les performances des requêtes
    indexes: [
      {
        name: 'backup_timestamp_idx',
        fields: ['timestamp']
      },
      {
        name: 'backup_status_idx',
        fields: ['status']
      },
      {
        name: 'backup_type_idx',
        fields: ['type']
      },
      {
        name: 'backup_expires_at_idx',
        fields: ['expiresAt']
      }
    ]
  });
  
  return Backup;
};
