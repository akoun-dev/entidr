'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les workflows
 * Stocke les définitions des flux de travail automatisés
 */
module.exports = (sequelize, DataTypes) => {
  class Workflow extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec les étapes du workflow (one-to-many)
      Workflow.hasMany(models.WorkflowStep, {
        foreignKey: 'workflowId',
        as: 'steps',
        onDelete: 'CASCADE'
      });
    }
  }
  
  Workflow.init({
    // Nom du workflow
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Description du workflow
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Type d'entité concernée (ex: order, invoice, etc.)
    entityType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Événement déclencheur (ex: creation, update, etc.)
    triggerEvent: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Statut d'activation
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Priorité d'exécution
    priority: {
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
    modelName: 'Workflow',
  });
  
  return Workflow;
};
