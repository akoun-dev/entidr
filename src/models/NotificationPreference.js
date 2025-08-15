'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les préférences de notification des utilisateurs
 * Stocke les préférences de notification pour chaque utilisateur
 */
module.exports = (sequelize, DataTypes) => {
  class NotificationPreference extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec l'utilisateur
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  
  NotificationPreference.init({
    // ID de l'utilisateur
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Type d'événement
    eventType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Canaux activés (JSON array de channel IDs)
    enabledChannels: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    // Fréquence de notification (immediate, daily, weekly)
    frequency: {
      type: DataTypes.ENUM('immediate', 'daily', 'weekly'),
      allowNull: false,
      defaultValue: 'immediate'
    },
    // Heure préférée pour les notifications (pour les fréquences daily/weekly)
    preferredTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    // Jour préféré pour les notifications (pour la fréquence weekly)
    preferredDay: {
      type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      allowNull: true
    },
    // Statut global d'activation
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'NotificationPreference',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'eventType']
      }
    ]
  });
  
  return NotificationPreference;
};
