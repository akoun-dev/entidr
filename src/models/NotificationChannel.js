'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les canaux de notification
 * Stocke les différents canaux par lesquels les notifications peuvent être envoyées
 */
module.exports = (sequelize, DataTypes) => {
  class NotificationChannel extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec les modèles de notification (many-to-many)
      this.belongsToMany(models.NotificationTemplate, {
        through: 'NotificationTemplateChannels',
        foreignKey: 'channelId',
        otherKey: 'templateId'
      });
    }
  }
  
  NotificationChannel.init({
    // Nom du canal
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type de canal (email, sms, in_app, webhook)
    type: {
      type: DataTypes.ENUM('email', 'sms', 'in_app', 'webhook'),
      allowNull: false
    },
    // Description du canal
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Configuration du canal (JSON)
    config: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Statut d'activation
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Ordre d'affichage
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Icône du canal
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NotificationChannel',
  });
  
  return NotificationChannel;
};
