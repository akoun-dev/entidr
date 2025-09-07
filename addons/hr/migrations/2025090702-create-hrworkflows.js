'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrWorkflows', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      kind: { type: Sequelize.STRING, allowNull: false },
      config: { type: Sequelize.JSON, allowNull: true },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
    });
    await queryInterface.addIndex('HrWorkflows', ['kind']);
    await queryInterface.addIndex('HrWorkflows', ['active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrWorkflows');
  }
};

