'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Vérifier si les traductions existent déjà
    const existingTranslations = await queryInterface.sequelize.query(
      "SELECT key, locale, namespace FROM Translations WHERE (key = 'welcome' AND locale = 'fr' AND namespace = 'common') OR (key = 'login' AND locale = 'fr' AND namespace = 'auth') OR (key = 'logout' AND locale = 'fr' AND namespace = 'auth')",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Si aucune traduction n'existe, les insérer
    if (existingTranslations.length === 0) {
      await queryInterface.bulkInsert('Translations', [{
        key: 'welcome',
        locale: 'fr',
        namespace: 'common',
        value: 'Bienvenue',
        is_default: true,
        active: true,
        description: 'Message de bienvenue principal',
        createdAt: now,
        updatedAt: now
      }, {
        key: 'login',
        locale: 'fr',
        namespace: 'auth',
        value: 'Connexion',
        is_default: true,
        active: true,
        description: 'Texte du bouton de connexion',
        createdAt: now,
        updatedAt: now
      }, {
        key: 'logout',
        locale: 'fr',
        namespace: 'auth',
        value: 'Déconnexion',
        is_default: true,
        active: true,
        description: 'Texte du bouton de déconnexion',
        createdAt: now,
        updatedAt: now
      }], {});
    } else {
      console.log('Les traductions existent déjà, aucune insertion nécessaire.');
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Translations', null, {});
  }
};
