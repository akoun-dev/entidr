'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les paramètres de journalisation
 * Stocke les paramètres de configuration des logs de l'application
 */
module.exports = (sequelize, DataTypes) => {
  class LoggingSetting extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  LoggingSetting.init({
    // Clé du paramètre (ex: "level", "retentionDays", etc.)
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Valeur du paramètre (stockée sous forme de chaîne, sera convertie selon valueType)
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Description du paramètre
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Type de la valeur (string, boolean, number, json)
    valueType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'string'
    },
    // Catégorie du paramètre (pour le regroupement)
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'logging'
    }
  }, {
    sequelize,
    modelName: 'LoggingSetting',
  });
  
  return LoggingSetting;
};
