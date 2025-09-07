'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HrSignatureRequests', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      document_id: { type: Sequelize.INTEGER, allowNull: false },
      employee_id: { type: Sequelize.INTEGER, allowNull: true },
      provider: { type: Sequelize.STRING, allowNull: false, defaultValue: 'internal' },
      status: { type: Sequelize.ENUM('pending','signed','declined'), allowNull: false, defaultValue: 'pending' },
      token: { type: Sequelize.STRING, allowNull: true },
      signed_at: { type: Sequelize.DATE, allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
    });
    await queryInterface.addIndex('HrSignatureRequests', ['document_id']);
    await queryInterface.addIndex('HrSignatureRequests', ['employee_id']);
    await queryInterface.addIndex('HrSignatureRequests', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('HrSignatureRequests');
  }
};

