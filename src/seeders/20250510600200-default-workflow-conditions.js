'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Récupérer les IDs des étapes
    const steps = await queryInterface.sequelize.query(
      'SELECT ws.id, ws.name, w.name as workflow_name FROM "WorkflowSteps" ws JOIN "Workflows" w ON ws.workflowId = w.id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (steps.length === 0) {
      console.log('Aucune étape de workflow trouvée, les conditions ne seront pas créées.');
      return;
    }
    
    const stepMap = {};
    steps.forEach(step => {
      const key = `${step.workflow_name} - ${step.name}`;
      stepMap[key] = step.id;
    });
    
    const now = new Date();
    const conditions = [];
    
    // Conditions pour "Approbation de commande - Vérification initiale"
    const approvalCheckStepKey = 'Approbation de commande - Vérification initiale';
    if (stepMap[approvalCheckStepKey]) {
      conditions.push(
        {
          stepId: stepMap[approvalCheckStepKey],
          field: 'total_amount',
          operator: 'greater_than',
          value: '1000',
          valueType: 'number',
          logicGroup: 'AND',
          sequence: 10,
          config: null,
          createdAt: now,
          updatedAt: now
        },
        {
          stepId: stepMap[approvalCheckStepKey],
          field: 'status',
          operator: 'equals',
          value: 'pending',
          valueType: 'string',
          logicGroup: 'AND',
          sequence: 20,
          config: null,
          createdAt: now,
          updatedAt: now
        }
      );
    }
    
    // Conditions pour "Validation de facture - Vérification des pièces jointes"
    const invoiceAttachmentStepKey = 'Validation de facture - Vérification des pièces jointes';
    if (stepMap[invoiceAttachmentStepKey]) {
      conditions.push(
        {
          stepId: stepMap[invoiceAttachmentStepKey],
          field: 'has_attachments',
          operator: 'equals',
          value: 'true',
          valueType: 'boolean',
          logicGroup: 'AND',
          sequence: 10,
          config: null,
          createdAt: now,
          updatedAt: now
        }
      );
    }
    
    // Conditions pour "Validation de facture - Vérification des montants"
    const invoiceTotalsStepKey = 'Validation de facture - Vérification des montants';
    if (stepMap[invoiceTotalsStepKey]) {
      conditions.push(
        {
          stepId: stepMap[invoiceTotalsStepKey],
          field: 'subtotal',
          operator: 'greater_than',
          value: '0',
          valueType: 'number',
          logicGroup: 'AND',
          sequence: 10,
          config: null,
          createdAt: now,
          updatedAt: now
        },
        {
          stepId: stepMap[invoiceTotalsStepKey],
          field: 'total',
          operator: 'greater_than',
          value: 'subtotal',
          valueType: 'field',
          logicGroup: 'AND',
          sequence: 20,
          config: null,
          createdAt: now,
          updatedAt: now
        }
      );
    }
    
    // Conditions pour "Notification de retard de paiement - Premier rappel"
    const paymentReminder1StepKey = 'Notification de retard de paiement - Premier rappel';
    if (stepMap[paymentReminder1StepKey]) {
      conditions.push(
        {
          stepId: stepMap[paymentReminder1StepKey],
          field: 'days_overdue',
          operator: 'greater_than_or_equal',
          value: '7',
          valueType: 'number',
          logicGroup: 'AND',
          sequence: 10,
          config: null,
          createdAt: now,
          updatedAt: now
        },
        {
          stepId: stepMap[paymentReminder1StepKey],
          field: 'days_overdue',
          operator: 'less_than',
          value: '14',
          valueType: 'number',
          logicGroup: 'AND',
          sequence: 20,
          config: null,
          createdAt: now,
          updatedAt: now
        },
        {
          stepId: stepMap[paymentReminder1StepKey],
          field: 'reminder_sent',
          operator: 'equals',
          value: 'false',
          valueType: 'boolean',
          logicGroup: 'AND',
          sequence: 30,
          config: null,
          createdAt: now,
          updatedAt: now
        }
      );
    }
    
    // Conditions pour "Notification de retard de paiement - Deuxième rappel"
    const paymentReminder2StepKey = 'Notification de retard de paiement - Deuxième rappel';
    if (stepMap[paymentReminder2StepKey]) {
      conditions.push(
        {
          stepId: stepMap[paymentReminder2StepKey],
          field: 'days_overdue',
          operator: 'greater_than_or_equal',
          value: '14',
          valueType: 'number',
          logicGroup: 'AND',
          sequence: 10,
          config: null,
          createdAt: now,
          updatedAt: now
        },
        {
          stepId: stepMap[paymentReminder2StepKey],
          field: 'days_overdue',
          operator: 'less_than',
          value: '30',
          valueType: 'number',
          logicGroup: 'AND',
          sequence: 20,
          config: null,
          createdAt: now,
          updatedAt: now
        },
        {
          stepId: stepMap[paymentReminder2StepKey],
          field: 'reminder_level',
          operator: 'less_than',
          value: '2',
          valueType: 'number',
          logicGroup: 'AND',
          sequence: 30,
          config: null,
          createdAt: now,
          updatedAt: now
        }
      );
    }
    
    // Insérer toutes les conditions
    if (conditions.length > 0) {
      await queryInterface.bulkInsert('WorkflowConditions', conditions, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('WorkflowConditions', null, {});
  }
};
