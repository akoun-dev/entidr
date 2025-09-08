'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrContracts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      employee_id: { type: Sequelize.INTEGER, allowNull: false },
      contract_type: { type: Sequelize.STRING, allowNull: false },
      date_start: { type: Sequelize.DATEONLY, allowNull: false },
      date_end: { type: Sequelize.DATEONLY, allowNull: true },
      wage: { type: Sequelize.FLOAT, allowNull: true },
      state: { type: Sequelize.ENUM('draft','running','expired','cancelled'), allowNull: false, defaultValue: 'running' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('HrContracts', ['employee_id']);
    await queryInterface.addIndex('HrContracts', ['state']);
    await queryInterface.addIndex('HrContracts', ['contract_type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrContracts');
  }
};

