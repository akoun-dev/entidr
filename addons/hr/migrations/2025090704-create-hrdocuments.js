'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrDocuments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      employee_id: { type: Sequelize.INTEGER, allowNull: true },
      type: { type: Sequelize.STRING, allowNull: true },
      file_url: { type: Sequelize.STRING, allowNull: false },
      mime_type: { type: Sequelize.STRING, allowNull: true },
      size_bytes: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
    });
    await queryInterface.addIndex('HrDocuments', ['employee_id']);
    await queryInterface.addIndex('HrDocuments', ['type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrDocuments');
  }
};

