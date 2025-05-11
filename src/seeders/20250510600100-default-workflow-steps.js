'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Récupérer les IDs des workflows
    const workflows = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Workflows"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (workflows.length === 0) {
      console.log('Aucun workflow trouvé, les étapes ne seront pas créées.');
      return;
    }
    
    const workflowMap = {};
    workflows.forEach(workflow => {
      workflowMap[workflow.name] = workflow.id;
    });
    
    const now = new Date();
    const steps = [];
    
    // Étapes pour "Approbation de commande"
    if (workflowMap['Approbation de commande']) {
      steps.push(
        {
          workflowId: workflowMap['Approbation de commande'],
          name: 'Vérification initiale',
          type: 'automatic',
          assignee: null,
          assigneeType: null,
          sequence: 10,
          delay: 0,
          timeout: null,
          action: 'check_amount',
          config: JSON.stringify({
            checkField: 'total_amount',
            threshold: 1000
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          workflowId: workflowMap['Approbation de commande'],
          name: 'Approbation du responsable',
          type: 'approval',
          assignee: 'manager',
          assigneeType: 'role',
          sequence: 20,
          delay: 0,
          timeout: 48,
          action: 'approve_reject',
          config: JSON.stringify({
            requireComment: true,
            notifyCustomer: false
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          workflowId: workflowMap['Approbation de commande'],
          name: 'Notification de décision',
          type: 'notification',
          assignee: null,
          assigneeType: null,
          sequence: 30,
          delay: 0,
          timeout: null,
          action: 'send_notification',
          config: JSON.stringify({
            channels: ['email', 'in_app'],
            template: 'order_approval_result'
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        }
      );
    }
    
    // Étapes pour "Validation de facture"
    if (workflowMap['Validation de facture']) {
      steps.push(
        {
          workflowId: workflowMap['Validation de facture'],
          name: 'Vérification des pièces jointes',
          type: 'automatic',
          assignee: null,
          assigneeType: null,
          sequence: 10,
          delay: 0,
          timeout: null,
          action: 'check_attachments',
          config: JSON.stringify({
            requiredTypes: ['pdf', 'jpg', 'png'],
            minCount: 1
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          workflowId: workflowMap['Validation de facture'],
          name: 'Vérification des montants',
          type: 'automatic',
          assignee: null,
          assigneeType: null,
          sequence: 20,
          delay: 0,
          timeout: null,
          action: 'validate_totals',
          config: JSON.stringify({
            checkFields: ['subtotal', 'tax', 'total'],
            tolerance: 0.01
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          workflowId: workflowMap['Validation de facture'],
          name: 'Validation comptable',
          type: 'approval',
          assignee: 'accounting',
          assigneeType: 'department',
          sequence: 30,
          delay: 0,
          timeout: 24,
          action: 'approve_reject',
          config: JSON.stringify({
            requireComment: true,
            escalateAfter: 12
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        }
      );
    }
    
    // Étapes pour "Notification de retard de paiement"
    if (workflowMap['Notification de retard de paiement']) {
      steps.push(
        {
          workflowId: workflowMap['Notification de retard de paiement'],
          name: 'Premier rappel',
          type: 'notification',
          assignee: null,
          assigneeType: null,
          sequence: 10,
          delay: 7,
          timeout: null,
          action: 'send_notification',
          config: JSON.stringify({
            channels: ['email'],
            template: 'payment_reminder_1',
            cc: ['accounting@example.com']
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          workflowId: workflowMap['Notification de retard de paiement'],
          name: 'Deuxième rappel',
          type: 'notification',
          assignee: null,
          assigneeType: null,
          sequence: 20,
          delay: 14,
          timeout: null,
          action: 'send_notification',
          config: JSON.stringify({
            channels: ['email', 'sms'],
            template: 'payment_reminder_2',
            cc: ['accounting@example.com']
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          workflowId: workflowMap['Notification de retard de paiement'],
          name: 'Escalade au responsable',
          type: 'task',
          assignee: 'account_manager',
          assigneeType: 'role',
          sequence: 30,
          delay: 30,
          timeout: 48,
          action: 'create_task',
          config: JSON.stringify({
            taskType: 'call_customer',
            priority: 'high',
            description: 'Contacter le client concernant le paiement en retard'
          }),
          active: true,
          createdAt: now,
          updatedAt: now
        }
      );
    }
    
    // Insérer toutes les étapes
    if (steps.length > 0) {
      await queryInterface.bulkInsert('WorkflowSteps', steps, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('WorkflowSteps', null, {});
  }
};
