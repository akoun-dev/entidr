'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration du thème de l'application
 * Stocke les préférences d'apparence globales
 */
module.exports = (sequelize, DataTypes) => {
  class ThemeConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  ThemeConfig.init({
    // Mode du thème (light, dark, system)
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'light'
    },
    // Couleur primaire (code hexadécimal)
    primaryColor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#3b82f6'
    },
    // Couleur secondaire (code hexadécimal)
    secondaryColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#10b981'
    },
    // Densité d'affichage (compact, normal, comfortable)
    density: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'normal'
    },
    // Taille de police (small, medium, large)
    fontSize: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'medium'
    },
    // Mode contraste élevé
    highContrast: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Animations réduites
    reducedMotion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Disposition du tableau de bord (default, minimal, detailed)
    dashboardLayout: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default'
    },
    // Personnalisations CSS supplémentaires
    customCSS: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Paramètres de personnalisation avancés (JSON)
    advancedSettings: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ThemeConfig',
  });
  
  return ThemeConfig;
};
