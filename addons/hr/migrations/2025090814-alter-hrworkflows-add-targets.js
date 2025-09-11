'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('HrWorkflows', 'target_employee_id', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('HrWorkflows', 'target_department_id', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addIndex('HrWorkflows', ['target_employee_id']);
    await queryInterface.addIndex('HrWorkflows', ['target_department_id']);
  },

  async down(queryInterface) {
    try { await queryInterface.removeIndex('HrWorkflows', ['target_employee_id']); } catch {}
    try { await queryInterface.removeIndex('HrWorkflows', ['target_department_id']); } catch {}
    await queryInterface.removeColumn('HrWorkflows', 'target_employee_id');
    await queryInterface.removeColumn('HrWorkflows', 'target_department_id');
  }
};

