'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les conditions des étapes de workflow
 * Stocke les conditions qui déterminent si une étape doit être exécutée
 */
module.exports = (sequelize, DataTypes) => {
  class WorkflowCondition extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec l'étape parent (many-to-one)
      WorkflowCondition.belongsTo(models.WorkflowStep, {
        foreignKey: 'stepId',
        as: 'step'
      });
    }
  }
  
  WorkflowCondition.init({
    // ID de l'étape parent
    stepId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'WorkflowSteps',
        key: 'id'
      }
    },
    // Champ sur lequel porte la condition
    field: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Opérateur de comparaison (equals, not_equals, greater_than, etc.)
    operator: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Valeur de comparaison
    value: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Type de valeur (string, number, boolean, date, etc.)
    valueType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'string'
    },
    // Groupe logique (AND, OR)
    logicGroup: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'AND'
    },
    // Ordre d'évaluation
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    // Configuration avancée (JSON)
    config: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'WorkflowCondition',
  });
  
  return WorkflowCondition;
};
