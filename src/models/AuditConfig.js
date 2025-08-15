'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration d'audit
 * Stocke les paramètres de configuration du système d'audit
 */
module.exports = (sequelize, DataTypes) => {
  class AuditConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  AuditConfig.init({
    // Durée de conservation des journaux d'audit en jours
    retentionDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90
    },
    // Niveau de journalisation (minimal, normal, verbose)
    logLevel: {
      type: DataTypes.ENUM('minimal', 'normal', 'verbose'),
      allowNull: false,
      defaultValue: 'normal'
    },
    // Liste des événements surveillés (stockés sous forme de JSON)
    monitoredEvents: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['login', 'data_change', 'permission_change']
    },
    // Activer les alertes de sécurité
    alertEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Seuil d'alerte (nombre d'événements par heure)
    alertThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    // Adresses email pour les notifications d'alerte (stockées sous forme de JSON)
    alertEmails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Journalisation des accès aux données sensibles
    logSensitiveDataAccess: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Journalisation des modifications de données
    logDataChanges: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Journalisation des connexions et déconnexions
    logAuthentication: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Journalisation des modifications de permissions
    logPermissionChanges: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Journalisation des actions administratives
    logAdminActions: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'AuditConfig',
    // Utiliser les timestamps standards (createdAt, updatedAt)
    timestamps: true
  });
  
  return AuditConfig;
};
