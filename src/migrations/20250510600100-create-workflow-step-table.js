'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WorkflowSteps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      workflowId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Workflows',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      assignee: {
        type: Sequelize.STRING,
        allowNull: true
      },
      assigneeType: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'user'
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      delay: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      timeout: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      action: {
        type: Sequelize.STRING,
        allowNull: true
      },
      config: {
        type: Sequelize.JSON,
        allowNull: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('WorkflowSteps', ['workflowId']);
    await queryInterface.addIndex('WorkflowSteps', ['type']);
    await queryInterface.addIndex('WorkflowSteps', ['sequence']);
    await queryInterface.addIndex('WorkflowSteps', ['active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WorkflowSteps');
  }
};
