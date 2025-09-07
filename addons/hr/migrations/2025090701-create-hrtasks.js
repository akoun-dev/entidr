'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrTasks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      employee_id: { type: Sequelize.INTEGER, allowNull: true },
      kind: { type: Sequelize.ENUM('onboarding','offboarding'), allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      assignee_role: { type: Sequelize.ENUM('employee','manager','hr','admin','it','security'), allowNull: true },
      due_date: { type: Sequelize.DATEONLY, allowNull: true },
      status: { type: Sequelize.ENUM('pending','in_progress','done'), allowNull: false, defaultValue: 'pending' },
      completed_by: { type: Sequelize.INTEGER, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
    });
    await queryInterface.addIndex('HrTasks', ['employee_id']);
    await queryInterface.addIndex('HrTasks', ['kind']);
    await queryInterface.addIndex('HrTasks', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrTasks');
  }
};

