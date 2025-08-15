'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les intégrations de calendrier
 * Stocke les connexions avec des calendriers externes
 */
module.exports = (sequelize, DataTypes) => {
  class CalendarIntegration extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  
  CalendarIntegration.init({
    // Type de calendrier (google, outlook, etc.)
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Nom du calendrier
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // ID utilisateur associé
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Token d'accès
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Token de rafraîchissement
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Date d'expiration du token
    tokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Paramètres de synchronisation
    syncSettings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Dernière synchronisation
    lastSync: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Statut de la dernière synchronisation
    lastSyncStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Indique si l'intégration est active
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'CalendarIntegration',
  });
  
  return CalendarIntegration;
};
