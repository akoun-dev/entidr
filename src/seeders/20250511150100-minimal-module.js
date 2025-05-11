'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Module minimal avec seulement les champs obligatoires
    const minimalModule = {
      name: 'minimal',
      displayName: 'Module Minimal',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insérer le module minimal
    await queryInterface.bulkInsert('Modules', [minimalModule], {});
  },

  async down(queryInterface, Sequelize) {
    // Supprimer le module minimal
    await queryInterface.bulkDelete('Modules', {
      name: 'minimal'
    }, {});
  }
};
