'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Companies', 'legal_form', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Companies', 'registration_number', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Companies', 'vat_number', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Companies', 'share_capital', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Companies', 'legal_representative', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Companies', 'legal_info', { type: Sequelize.TEXT, allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Companies', 'legal_form');
    await queryInterface.removeColumn('Companies', 'registration_number');
    await queryInterface.removeColumn('Companies', 'vat_number');
    await queryInterface.removeColumn('Companies', 'share_capital');
    await queryInterface.removeColumn('Companies', 'legal_representative');
    await queryInterface.removeColumn('Companies', 'legal_info');
  }
};

