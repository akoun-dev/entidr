'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration globale des notifications
 * Stocke les paramètres généraux du système de notification
 */
module.exports = (sequelize, DataTypes) => {
  class NotificationConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Pas d'associations nécessaires
    }
  }
  
  NotificationConfig.init({
    // Activer les notifications par email
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Activer les notifications par SMS
    smsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Activer les notifications in-app
    inAppEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Activer les notifications webhook
    webhookEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Nombre maximum de tentatives d'envoi
    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    // Délai entre les tentatives (en minutes)
    retryDelay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15
    },
    // Durée de conservation des notifications (en jours)
    retentionPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90
    },
    // Nombre maximum de notifications par utilisateur par jour
    maxNotificationsPerDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50
    },
    // Activer le regroupement des notifications
    batchingEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Intervalle de regroupement (en minutes)
    batchingInterval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15
    },
    // Paramètres avancés (JSON)
    advancedSettings: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NotificationConfig',
  });
  
  return NotificationConfig;
};
