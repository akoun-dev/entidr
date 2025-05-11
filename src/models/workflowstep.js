'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les étapes de workflow
 * Stocke les étapes individuelles des flux de travail
 */
module.exports = (sequelize, DataTypes) => {
  class WorkflowStep extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec le workflow parent (many-to-one)
      WorkflowStep.belongsTo(models.Workflow, {
        foreignKey: 'workflowId',
        as: 'workflow'
      });
      
      // Association avec les conditions (one-to-many)
      WorkflowStep.hasMany(models.WorkflowCondition, {
        foreignKey: 'stepId',
        as: 'conditions',
        onDelete: 'CASCADE'
      });
    }
  }
  
  WorkflowStep.init({
    // ID du workflow parent
    workflowId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Workflows',
        key: 'id'
      }
    },
    // Nom de l'étape
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type d'étape (approval, notification, task, etc.)
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Assigné à (utilisateur, groupe, rôle, etc.)
    assignee: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Type d'assigné (user, group, role, etc.)
    assigneeType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'user'
    },
    // Ordre d'exécution
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    // Délai avant exécution (en heures)
    delay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Délai d'expiration (en heures)
    timeout: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Action à effectuer
    action: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Configuration de l'étape (JSON)
    config: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Statut d'activation
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'WorkflowStep',
  });
  
  return WorkflowStep;
};
