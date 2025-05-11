'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Liste des modules par défaut
    const defaultModules = [
      {
        name: 'hr',
        displayName: 'Ressources Humaines',
        version: '1.0.0',
        summary: 'Gestion des ressources humaines',
        description: 'Module de gestion des ressources humaines pour la gestion des employés, départements, congés et feuilles de temps',
        active: true,
        installed: true,
        installable: true,
        application: true,
        autoInstall: false,
        dependencies: '[]',
        models: '["hr.employee", "hr.department", "hr.leave"]',
        installedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crm',
        displayName: 'CRM',
        version: '1.0.0',
        summary: 'Gestion de la relation client',
        description: 'Module de gestion de la relation client pour la gestion des prospects, clients, opportunités et activités commerciales',
        active: true,
        installed: true,
        installable: true,
        application: true,
        autoInstall: false,
        dependencies: '[]',
        models: '["crm.lead", "crm.opportunity", "crm.activity"]',
        installedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'finance',
        displayName: 'Finance',
        version: '1.0.0',
        summary: 'Gestion financière',
        description: 'Module de gestion financière pour la comptabilité, facturation et paiements',
        active: true,
        installed: true,
        installable: true,
        application: true,
        autoInstall: false,
        dependencies: '[]',
        models: '["finance.invoice", "finance.payment", "finance.account"]',
        installedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'inventory',
        displayName: 'Inventaire',
        version: '1.0.0',
        summary: 'Gestion des stocks',
        description: 'Module de gestion des stocks, produits, entrepôts et mouvements de stock',
        active: true,
        installed: true,
        installable: true,
        application: true,
        autoInstall: false,
        dependencies: '[]',
        models: '["inventory.product", "inventory.warehouse", "inventory.movement"]',
        installedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'project',
        displayName: 'Projets',
        version: '1.0.0',
        summary: 'Gestion de projets',
        description: 'Module de gestion de projets, tâches, planification et suivi de temps',
        active: true,
        installed: true,
        installable: true,
        application: true,
        autoInstall: false,
        dependencies: '[]',
        models: '["project.project", "project.task", "project.timesheet"]',
        installedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insérer les modules par défaut
    await queryInterface.bulkInsert('Modules', defaultModules, {});
  },

  async down(queryInterface, Sequelize) {
    // Supprimer tous les modules par défaut
    await queryInterface.bulkDelete('Modules', {
      name: {
        [Sequelize.Op.in]: ['hr', 'crm', 'finance', 'inventory', 'project']
      }
    }, {});
  }
};
