'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration du calendrier
 * Stocke les paramètres généraux du calendrier
 */
module.exports = (sequelize, DataTypes) => {
  class CalendarConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  CalendarConfig.init({
    // Fuseau horaire par défaut
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Europe/Paris'
    },
    // Heure de début de la journée de travail (format HH:MM)
    workHoursStart: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '08:00'
    },
    // Heure de fin de la journée de travail (format HH:MM)
    workHoursEnd: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '18:00'
    },
    // Premier jour de la semaine (monday, sunday, etc.)
    weekStart: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'monday'
    },
    // Format d'affichage de la date
    dateFormat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'YYYY-MM-DD'
    },
    // Format d'affichage de l'heure
    timeFormat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'HH:mm'
    },
    // Jours ouvrés (tableau des jours de la semaine)
    workDays: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    // Paramètres avancés
    advancedSettings: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'CalendarConfig',
  });
  
  return CalendarConfig;
};
