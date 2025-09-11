'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrEmployeeRoles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      employee_id: { type: Sequelize.INTEGER, allowNull: false },
      role_id: { type: Sequelize.INTEGER, allowNull: false },
      assigned_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      assigned_by: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('HrEmployeeRoles', ['employee_id']);
    await queryInterface.addIndex('HrEmployeeRoles', ['role_id']);
    await queryInterface.addConstraint('HrEmployeeRoles', {
      fields: ['employee_id', 'role_id'],
      type: 'unique',
      name: 'uniq_hremployeeroles_employee_role'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrEmployeeRoles');
  }
};

