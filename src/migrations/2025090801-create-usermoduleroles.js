'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Détecter l'état courant de la table
    let columns = null;
    try {
      columns = await queryInterface.describeTable('UserModuleRoles');
    } catch (_) {
      columns = null;
    }

    if (!columns) {
      // Création fraîche avec la bonne colonne module_name
      await queryInterface.createTable('UserModuleRoles', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        user_id: { type: Sequelize.INTEGER, allowNull: false },
        module_name: { type: Sequelize.STRING, allowNull: false },
        role: { type: Sequelize.STRING, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
        updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('datetime', 'now') },
      });
    } else {
      // Si une ancienne version existe avec colonne `module`, la renommer
      if (columns.module && !columns.module_name) {
        await queryInterface.renameColumn('UserModuleRoles', 'module', 'module_name');
      }
    }

    // Re-synchroniser l'état et créer les index de manière compatible SQLite
    const cols2 = await queryInterface.describeTable('UserModuleRoles');
    const moduleCol = cols2.module_name ? 'module_name' : (cols2.module ? 'module' : null);
    if (!moduleCol) throw new Error('UserModuleRoles: colonne module/module_name manquante');

    // Index simple sur le nom du module
    await queryInterface.addIndex('UserModuleRoles', [moduleCol], { name: 'idx_usermoduleroles_module_name' });
    // Index unique composite (user_id, module)
    await queryInterface.addIndex('UserModuleRoles', ['user_id', moduleCol], {
      unique: true,
      name: 'uniq_usermoduleroles_user_module'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('UserModuleRoles');
  }
};
