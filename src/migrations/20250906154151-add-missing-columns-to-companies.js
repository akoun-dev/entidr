'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Companies');

    // Ajouter la colonne logo seulement si elle n'existe pas
    if (!tableInfo.logo) {
      await queryInterface.addColumn('Companies', 'logo', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    // Ajouter la colonne createdBy seulement si elle n'existe pas
    if (!tableInfo.createdBy) {
      await queryInterface.addColumn('Companies', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      });
    }

    // Ajouter la colonne updatedBy seulement si elle n'existe pas
    if (!tableInfo.updatedBy) {
      await queryInterface.addColumn('Companies', 'updatedBy', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Supprimer les colonnes seulement si elles existent
    const tableInfo = await queryInterface.describeTable('Companies');

    if (tableInfo.logo) {
      await queryInterface.removeColumn('Companies', 'logo');
    }

    if (tableInfo.createdBy) {
      await queryInterface.removeColumn('Companies', 'createdBy');
    }

    if (tableInfo.updatedBy) {
      await queryInterface.removeColumn('Companies', 'updatedBy');
    }
  }
};
