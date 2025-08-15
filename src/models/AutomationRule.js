'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les règles d'automatisation
 * Stocke les règles qui automatisent les processus de l'application
 */
module.exports = (sequelize, DataTypes) => {
  class AutomationRule extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
      // Potentiellement une association avec User pour savoir qui a créé la règle
    }
  }
  
  AutomationRule.init({
    // Nom de la règle d'automatisation
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Description de la règle
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Type de déclencheur (cron, événement, etc.)
    trigger_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cron'
    },
    // Valeur du déclencheur (expression cron, nom de l'événement, etc.)
    trigger_value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type d'action à exécuter
    action_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Paramètres de l'action (stockés sous forme de JSON)
    action_params: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Statut de la règle (activée ou désactivée)
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Priorité d'exécution (plus le nombre est bas, plus la priorité est élevée)
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    // Dernière exécution de la règle
    last_run: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Statut de la dernière exécution (succès, échec, etc.)
    last_status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Nombre d'exécutions réussies
    success_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Nombre d'exécutions échouées
    failure_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'AutomationRule',
  });
  
  return AutomationRule;
};
