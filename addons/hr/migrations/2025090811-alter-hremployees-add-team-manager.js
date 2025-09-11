'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('HrEmployees', 'team_id', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('HrEmployees', 'is_department_manager', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addIndex('HrEmployees', ['team_id']);
    await queryInterface.addIndex('HrEmployees', ['is_department_manager']);
  },

  async down(queryInterface) {
    try { await queryInterface.removeIndex('HrEmployees', ['team_id']); } catch {}
    try { await queryInterface.removeIndex('HrEmployees', ['is_department_manager']); } catch {}
    await queryInterface.removeColumn('HrEmployees', 'team_id');
    await queryInterface.removeColumn('HrEmployees', 'is_department_manager');
  }
};

