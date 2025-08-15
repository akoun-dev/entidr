'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les jours fériés
 * Stocke les jours fériés et congés
 */
module.exports = (sequelize, DataTypes) => {
  class Holiday extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  Holiday.init({
    // Nom du jour férié
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Date du jour férié (format YYYY-MM-DD)
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    // Pays concerné
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'France'
    },
    // Indique si le jour férié est récurrent chaque année
    recurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Type de jour férié (national, régional, entreprise)
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'national'
    },
    // Description ou note
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Indique si le jour férié est actif
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Holiday',
  });
  
  return Holiday;
};
