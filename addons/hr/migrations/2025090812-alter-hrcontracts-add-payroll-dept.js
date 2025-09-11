'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('HrContracts', 'department_id', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('HrContracts', 'payroll_id', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('HrContracts', 'payroll_system', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('HrContracts', 'salary_currency', { type: Sequelize.STRING, allowNull: false, defaultValue: 'EUR' });
    await queryInterface.addColumn('HrContracts', 'payment_frequency', { type: Sequelize.ENUM('weekly','bi-weekly','monthly','quarterly'), allowNull: false, defaultValue: 'monthly' });
    await queryInterface.addIndex('HrContracts', ['department_id']);
    await queryInterface.addIndex('HrContracts', ['payment_frequency']);
  },

  async down(queryInterface) {
    try { await queryInterface.removeIndex('HrContracts', ['department_id']); } catch {}
    try { await queryInterface.removeIndex('HrContracts', ['payment_frequency']); } catch {}
    await queryInterface.removeColumn('HrContracts', 'department_id');
    await queryInterface.removeColumn('HrContracts', 'payroll_id');
    await queryInterface.removeColumn('HrContracts', 'payroll_system');
    await queryInterface.removeColumn('HrContracts', 'salary_currency');
    await queryInterface.removeColumn('HrContracts', 'payment_frequency');
  }
};

