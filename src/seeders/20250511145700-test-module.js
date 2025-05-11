'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Module de test simplifié
    const testModule = {
      name: 'test',
      displayName: 'Module de Test',
      version: '1.0.0',
      summary: 'Module de test',
      description: 'Module de test pour vérifier le fonctionnement des seeders',
      active: true,
      installed: true,
      installable: true,
      application: true,
      autoInstall: false,
      dependencies: '[]',
      models: '[]',
      installedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insérer le module de test
    await queryInterface.bulkInsert('Modules', [testModule], {});
  },

  async down(queryInterface, Sequelize) {
    // Supprimer le module de test
    await queryInterface.bulkDelete('Modules', {
      name: 'test'
    }, {});
  }
};
