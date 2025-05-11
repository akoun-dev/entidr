'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    await queryInterface.bulkInsert('Workflows', [
      {
        name: 'Approbation de commande',
        description: 'Workflow d\'approbation pour les commandes dépassant un certain montant',
        entityType: 'order',
        triggerEvent: 'creation',
        active: true,
        priority: 10,
        config: JSON.stringify({
          threshold: 1000,
          notifyAdmin: true,
          escalationDelay: 24
        }),
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Validation de facture',
        description: 'Workflow de validation des factures avant envoi',
        entityType: 'invoice',
        triggerEvent: 'pre_send',
        active: true,
        priority: 20,
        config: JSON.stringify({
          requireAttachments: true,
          validateTotals: true
        }),
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Notification de retard de paiement',
        description: 'Envoie des notifications pour les paiements en retard',
        entityType: 'payment',
        triggerEvent: 'overdue',
        active: true,
        priority: 30,
        config: JSON.stringify({
          reminderIntervals: [7, 14, 30],
          escalateToManager: true
        }),
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Processus d\'onboarding client',
        description: 'Workflow pour l\'intégration des nouveaux clients',
        entityType: 'customer',
        triggerEvent: 'creation',
        active: true,
        priority: 10,
        config: JSON.stringify({
          sendWelcomeEmail: true,
          assignAccountManager: true,
          scheduleFollowUp: 7
        }),
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Gestion des réclamations',
        description: 'Workflow pour traiter les réclamations clients',
        entityType: 'complaint',
        triggerEvent: 'creation',
        active: true,
        priority: 5,
        config: JSON.stringify({
          priorityMapping: {
            high: 1,
            medium: 2,
            low: 3
          },
          slaHours: {
            high: 4,
            medium: 24,
            low: 48
          }
        }),
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Workflows', null, {});
  }
};
