'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les modèles de notification
 * Stocke les différents modèles de contenu pour les notifications
 */
module.exports = (sequelize, DataTypes) => {
  class NotificationTemplate extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec les canaux de notification (many-to-many)
      this.belongsToMany(models.NotificationChannel, {
        through: 'NotificationTemplateChannels',
        foreignKey: 'templateId',
        otherKey: 'channelId'
      });
    }
  }
  
  NotificationTemplate.init({
    // Nom du modèle
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Code de l'événement associé
    event: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Sujet (pour les emails)
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Contenu du modèle
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // Contenu HTML (pour les emails)
    htmlContent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Variables disponibles dans le modèle (JSON)
    variables: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Statut d'activation
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Catégorie du modèle
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Langue du modèle
    language: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: 'fr-FR'
    }
  }, {
    sequelize,
    modelName: 'NotificationTemplate',
  });
  
  return NotificationTemplate;
};
