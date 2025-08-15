'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration des performances
 * Stocke les paramètres d'optimisation des performances
 */
module.exports = (sequelize, DataTypes) => {
  class PerformanceConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  PerformanceConfig.init({
    // Activation du cache
    cacheEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Taille du cache (en Mo)
    cacheSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 500
    },
    // Durée de vie du cache (en secondes)
    cacheTTL: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3600
    },
    // Taille de page par défaut
    defaultPageSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 25
    },
    // Optimisation des requêtes
    queryOptimization: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Compression des réponses
    responseCompression: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Niveau de journalisation
    loggingLevel: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'info'
    },
    // Délai d'expiration des requêtes (en secondes)
    requestTimeout: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    // Nombre maximum de connexions à la base de données
    maxDbConnections: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    // Paramètres avancés
    advancedSettings: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PerformanceConfig',
  });
  
  return PerformanceConfig;
};
