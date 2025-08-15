'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les services externes
 * Stocke les configurations des intégrations avec des services tiers
 */
module.exports = (sequelize, DataTypes) => {
  class ExternalService extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  ExternalService.init({
    // Nom du service externe
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type de service (Cartographie, Email, Paiement, etc.)
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Clé API du service (cryptée)
    apiKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Secret API du service (crypté)
    apiSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // URL de base de l'API
    baseUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Configuration supplémentaire (stockée sous forme de JSON)
    config: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Indique si ce service est actif
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Mode de fonctionnement (test, production)
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'test'
    },
    // URL de callback pour les webhooks
    webhookUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Informations d'authentification (stockées sous forme de JSON)
    authInfo: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Date d'expiration du token (si applicable)
    tokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Statut de la dernière synchronisation
    lastSyncStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Date de la dernière synchronisation
    lastSyncDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ExternalService',
  });
  
  return ExternalService;
};
