'use strict';
const crypto = require('crypto');

// Fonction pour générer une clé API
const generateKey = () => 'sk_' + crypto.randomBytes(24).toString('hex');
const hashKey = (key) => crypto.createHash('sha256').update(key).digest('hex');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const keys = [
      {
        name: 'Application mobile',
        permissions: JSON.stringify(['read', 'write']),
        active: true,
        description: 'Clé API pour l\'application mobile'
      },
      {
        name: 'Intégration CRM',
        permissions: JSON.stringify(['read']),
        active: false,
        description: 'Clé API pour l\'intégration avec le CRM'
      },
      {
        name: 'Webhook externe',
        permissions: JSON.stringify(['read', 'write', 'webhook']),
        active: true,
        description: 'Clé API pour les webhooks externes'
      }
    ].map(data => {
      const key = generateKey();
      return {
        ...data,
        key_hash: hashKey(key),
        key_last4: key.slice(-4),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    await queryInterface.bulkInsert('ApiKeys', keys, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ApiKeys', null, {});
  }
};
