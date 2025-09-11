'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('HrTasks', 'workflow_id', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addIndex('HrTasks', ['workflow_id']);
  },

  async down(queryInterface) {
    try { await queryInterface.removeIndex('HrTasks', ['workflow_id']); } catch {}
    await queryInterface.removeColumn('HrTasks', 'workflow_id');
  }
};

