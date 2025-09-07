'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrEmployees', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      job_title: { type: Sequelize.STRING, allowNull: true },
      department_id: { type: Sequelize.INTEGER, allowNull: true },
      work_email: { type: Sequelize.STRING, allowNull: true },
      work_phone: { type: Sequelize.STRING, allowNull: true },
      mobile_phone: { type: Sequelize.STRING, allowNull: true },
      parent_id: { type: Sequelize.INTEGER, allowNull: true },
      birth_date: { type: Sequelize.DATEONLY, allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      employment_type: { type: Sequelize.STRING, allowNull: true },
      hire_date: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
    });
    await queryInterface.addIndex('HrEmployees', ['department_id']);
    await queryInterface.addIndex('HrEmployees', ['parent_id']);
    await queryInterface.addIndex('HrEmployees', ['active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrEmployees');
  }
};

