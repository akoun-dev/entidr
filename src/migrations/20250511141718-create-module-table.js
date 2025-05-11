'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Modules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false
      },
      summary: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      installed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      installable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      application: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      autoInstall: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      dependencies: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      models: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      installedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajouter des index pour améliorer les performances
    await queryInterface.addIndex('Modules', ['name']);
    await queryInterface.addIndex('Modules', ['active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Modules');
  }
};
