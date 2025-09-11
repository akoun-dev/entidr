'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrCompliance', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      employee_id: { type: Sequelize.INTEGER, allowNull: false },
      requirement_type: { type: Sequelize.STRING, allowNull: false },
      requirement_name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      document_id: { type: Sequelize.INTEGER, allowNull: true },
      due_date: { type: Sequelize.DATEONLY, allowNull: true },
      completed_date: { type: Sequelize.DATEONLY, allowNull: true },
      status: { type: Sequelize.ENUM('pending','completed','overdue','exempt'), allowNull: false, defaultValue: 'pending' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('HrCompliance', ['employee_id']);
    await queryInterface.addIndex('HrCompliance', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrCompliance');
  }
};

