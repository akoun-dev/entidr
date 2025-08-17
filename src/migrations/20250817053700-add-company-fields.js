'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Companies', 'trading_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Companies', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Companies', 'industry', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Companies', 'foundation_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
    await queryInterface.addColumn('Companies', 'postal_code', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Companies', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Companies', 'country', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Companies', 'trading_name');
    await queryInterface.removeColumn('Companies', 'description');
    await queryInterface.removeColumn('Companies', 'industry');
    await queryInterface.removeColumn('Companies', 'foundation_date');
    await queryInterface.removeColumn('Companies', 'postal_code');
    await queryInterface.removeColumn('Companies', 'city');
    await queryInterface.removeColumn('Companies', 'country');
  }
};
