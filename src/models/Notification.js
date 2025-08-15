'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les notifications
 * Stocke les notifications envoyées aux utilisateurs
 */
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec l'utilisateur destinataire
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      
      // Association avec le modèle de notification
      this.belongsTo(models.NotificationTemplate, { foreignKey: 'templateId', as: 'template' });
    }
  }
  
  Notification.init({
    // ID de l'utilisateur destinataire
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // ID du modèle de notification
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'NotificationTemplates',
        key: 'id'
      }
    },
    // Type de notification
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Titre de la notification
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Contenu de la notification
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    // Données supplémentaires (JSON)
    data: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Canal par lequel la notification a été envoyée
    channel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Statut de la notification (sent, delivered, read, failed)
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    // Date de lecture
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Date d'envoi planifiée
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Priorité (high, normal, low)
    priority: {
      type: DataTypes.ENUM('high', 'normal', 'low'),
      allowNull: false,
      defaultValue: 'normal'
    },
    // URL d'action
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Texte du bouton d'action
    actionText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Détails d'erreur en cas d'échec
    errorDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Notification',
  });
  
  return Notification;
};
