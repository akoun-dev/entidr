'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les paramètres de sécurité
 * Stocke les configurations de sécurité de l'application
 */
module.exports = (sequelize, DataTypes) => {
  class SecuritySetting extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  SecuritySetting.init({
    // Clé unique pour identifier le paramètre
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Valeur du paramètre (stockée sous forme de chaîne, peut être convertie en d'autres types)
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Description du paramètre
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Type de valeur (string, boolean, number, json)
    valueType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'string'
    },
    // Catégorie du paramètre de sécurité (password, authentication, session, etc.)
    category: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'SecuritySetting',
  });
  
  return SecuritySetting;
};
