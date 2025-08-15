'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les séquences de numérotation
 * Stocke les séquences pour la numérotation des documents
 */
module.exports = (sequelize, DataTypes) => {
  class Sequence extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  Sequence.init({
    // Nom de la séquence
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Préfixe de la séquence
    prefix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Suffixe de la séquence
    suffix: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Prochain numéro de la séquence
    nextNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    // Nombre de chiffres (padding)
    padding: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    // Fréquence de réinitialisation (never, yearly, monthly)
    resetFrequency: {
      type: DataTypes.ENUM('never', 'yearly', 'monthly'),
      allowNull: false,
      defaultValue: 'never'
    },
    // Type de document associé
    documentType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Dernière réinitialisation
    lastReset: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Indique si la séquence est active
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Sequence',
  });
  
  return Sequence;
};
