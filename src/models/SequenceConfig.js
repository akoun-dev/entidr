'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration des séquences
 * Stocke les paramètres généraux de numérotation
 */
module.exports = (sequelize, DataTypes) => {
  class SequenceConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  SequenceConfig.init({
    // Année fiscale - début (format MM-DD)
    fiscalYearStart: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '01-01'
    },
    // Année fiscale - fin (format MM-DD)
    fiscalYearEnd: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '12-31'
    },
    // Format par défaut
    defaultFormat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'prefix-number-year'
    },
    // Padding par défaut
    defaultPadding: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    // Réinitialisation automatique
    autoReset: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Paramètres avancés
    advancedSettings: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SequenceConfig',
  });
  
  return SequenceConfig;
};
