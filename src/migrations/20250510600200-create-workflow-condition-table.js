'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WorkflowConditions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      stepId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'WorkflowSteps',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      field: {
        type: Sequelize.STRING,
        allowNull: false
      },
      operator: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.STRING,
        allowNull: true
      },
      valueType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'string'
      },
      logicGroup: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'AND'
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Ajouter des index pour améliorer les performances
    await queryInterface.addIndex('WorkflowConditions', ['stepId']);
    await queryInterface.addIndex('WorkflowConditions', ['field']);
    await queryInterface.addIndex('WorkflowConditions', ['operator']);
    await queryInterface.addIndex('WorkflowConditions', ['logicGroup']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WorkflowConditions');
  }
};
