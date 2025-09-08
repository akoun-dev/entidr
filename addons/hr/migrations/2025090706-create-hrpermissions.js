'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrPermissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      resource: { type: Sequelize.STRING, allowNull: false },
      action: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
    });
    await queryInterface.addIndex('HrPermissions', ['resource']);
    await queryInterface.addIndex('HrPermissions', ['action']);
    await queryInterface.addConstraint('HrPermissions', {
      fields: ['resource', 'action'],
      type: 'unique',
      name: 'uniq_hrpermissions_resource_action'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrPermissions');
  }
};

