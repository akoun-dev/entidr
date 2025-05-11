'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Workflows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      entityType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      triggerEvent: {
        type: Sequelize.STRING,
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      priority: {
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
    await queryInterface.addIndex('Workflows', ['entityType']);
    await queryInterface.addIndex('Workflows', ['triggerEvent']);
    await queryInterface.addIndex('Workflows', ['active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Workflows');
  }
};
