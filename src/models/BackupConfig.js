'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration des sauvegardes
 * Stocke les paramètres de configuration du système de sauvegarde
 */
module.exports = (sequelize, DataTypes) => {
  class BackupConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  BackupConfig.init({
    // Fréquence des sauvegardes (daily, weekly, monthly)
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
      allowNull: false,
      defaultValue: 'daily'
    },
    // Heure de la sauvegarde (format HH:MM)
    backupTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '02:00'
    },
    // Jour de la semaine pour les sauvegardes hebdomadaires (0-6, où 0 = dimanche)
    weeklyDay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 6
      }
    },
    // Jour du mois pour les sauvegardes mensuelles (1-31)
    monthlyDay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 31
      }
    },
    // Durée de conservation des sauvegardes en jours
    retention: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    // Type de stockage (local, cloud, both)
    storageType: {
      type: DataTypes.ENUM('local', 'cloud', 'both'),
      allowNull: false,
      defaultValue: 'both'
    },
    // Chemin de stockage local
    localPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Configuration du stockage cloud (stockée sous forme de JSON)
    cloudConfig: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Activer le chiffrement des sauvegardes
    encryption: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Clé de chiffrement (stockée de manière sécurisée)
    encryptionKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Date et heure de la dernière sauvegarde
    lastBackup: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Date et heure de la prochaine sauvegarde planifiée
    nextBackup: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Statut de la dernière sauvegarde (success, failure, in_progress)
    lastBackupStatus: {
      type: DataTypes.ENUM('success', 'failure', 'in_progress'),
      allowNull: true
    },
    // Détails du dernier échec de sauvegarde
    lastFailureDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Activer les notifications par email
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Adresses email pour les notifications (stockées sous forme de JSON)
    notificationEmails: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'BackupConfig',
    // Utiliser les timestamps standards (createdAt, updatedAt)
    timestamps: true
  });
  
  return BackupConfig;
};
