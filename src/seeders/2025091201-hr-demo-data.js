'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insérer des départements de démonstration
    const departments = await queryInterface.bulkInsert('hr_departments', [
      {
        name: 'Direction Générale',
        code: 'DG',
        description: 'Direction générale de l\'entreprise',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ressources Humaines',
        code: 'RH',
        description: 'Département des ressources humaines',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ingénierie',
        code: 'TECH',
        description: 'Département technique et ingénierie',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Marketing',
        code: 'MKT',
        description: 'Département marketing et communication',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Ventes',
        code: 'SALES',
        description: 'Département commercial et ventes',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // Insérer des employés de démonstration
    const employees = await queryInterface.bulkInsert('hr_employees', [
      {
        name: 'Jean Dupont',
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@company.com',
        phone: '+33 1 23 45 67 89',
        job_title: 'Directeur Général',
        department_id: departments[0].id,
        hire_date: new Date('2020-01-15'),
        salary: 85000.00,
        address: '123 Avenue des Champs-Élysées',
        city: 'Paris',
        postal_code: '75008',
        country: 'France',
        birth_date: new Date('1980-05-15'),
        gender: 'male',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Marie Lambert',
        first_name: 'Marie',
        last_name: 'Lambert',
        email: 'marie.lambert@company.com',
        phone: '+33 1 23 45 67 90',
        job_title: 'Directrice des Ressources Humaines',
        department_id: departments[1].id,
        manager_id: departments[0].id,
        hire_date: new Date('2020-03-20'),
        salary: 65000.00,
        address: '456 Rue de Rivoli',
        city: 'Paris',
        postal_code: '75004',
        country: 'France',
        birth_date: new Date('1985-08-22'),
        gender: 'female',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Pierre Martin',
        first_name: 'Pierre',
        last_name: 'Martin',
        email: 'pierre.martin@company.com',
        phone: '+33 1 23 45 67 91',
        job_title: 'Développeur Senior',
        department_id: departments[2].id,
        hire_date: new Date('2021-06-10'),
        salary: 55000.00,
        address: '789 Boulevard Haussmann',
        city: 'Paris',
        postal_code: '75009',
        country: 'France',
        birth_date: new Date('1990-12-03'),
        gender: 'male',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sophie Bernard',
        first_name: 'Sophie',
        last_name: 'Bernard',
        email: 'sophie.bernard@company.com',
        phone: '+33 1 23 45 67 92',
        job_title: 'Chef de Projet Marketing',
        department_id: departments[3].id,
        hire_date: new Date('2021-09-15'),
        salary: 48000.00,
        address: '321 Avenue Foch',
        city: 'Paris',
        postal_code: '75116',
        country: 'France',
        birth_date: new Date('1988-04-18'),
        gender: 'female',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Lucas Petit',
        first_name: 'Lucas',
        last_name: 'Petit',
        email: 'lucas.petit@company.com',
        phone: '+33 1 23 45 67 93',
        job_title: 'Commercial Senior',
        department_id: departments[4].id,
        hire_date: new Date('2022-01-20'),
        salary: 45000.00,
        address: '654 Rue de la Pompe',
        city: 'Paris',
        postal_code: '75116',
        country: 'France',
        birth_date: new Date('1992-07-25'),
        gender: 'male',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // Insérer des contrats de démonstration
    await queryInterface.bulkInsert('hr_contracts', [
      {
        employee_id: employees[0].id,
        type: 'cdi',
        reference: 'CONTR-2020-0001',
        start_date: new Date('2020-01-15'),
        salary: 85000.00,
        currency: 'EUR',
        working_hours: 39,
        status: 'active',
        terms: 'Contrat de direction à durée indéterminée',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: employees[1].id,
        type: 'cdi',
        reference: 'CONTR-2020-0002',
        start_date: new Date('2020-03-20'),
        salary: 65000.00,
        currency: 'EUR',
        working_hours: 39,
        status: 'active',
        terms: 'Contrat de cadre à durée indéterminée',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: employees[2].id,
        type: 'cdi',
        reference: 'CONTR-2021-0001',
        start_date: new Date('2021-06-10'),
        salary: 55000.00,
        currency: 'EUR',
        working_hours: 39,
        status: 'active',
        terms: 'Contrat de développeur à durée indéterminée',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: employees[3].id,
        type: 'cdi',
        reference: 'CONTR-2021-0002',
        start_date: new Date('2021-09-15'),
        salary: 48000.00,
        currency: 'EUR',
        working_hours: 39,
        status: 'active',
        terms: 'Contrat de chef de projet à durée indéterminée',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: employees[4].id,
        type: 'cdi',
        reference: 'CONTR-2022-0001',
        start_date: new Date('2022-01-20'),
        salary: 45000.00,
        currency: 'EUR',
        working_hours: 39,
        status: 'active',
        terms: 'Contrat commercial à durée indéterminée',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insérer des documents de démonstration
    await queryInterface.bulkInsert('hr_documents', [
      {
        employee_id: employees[0].id,
        name: 'Carte d\'identité',
        type: 'id_card',
        description: 'Carte d\'identité nationale',
        file_url: '/uploads/documents/id_card_jean_dupont.pdf',
        file_name: 'id_card_jean_dupont.pdf',
        mime_type: 'application/pdf',
        size_bytes: 256000,
        expiry_date: new Date('2030-05-15'),
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: employees[1].id,
        name: 'CV Marie Lambert',
        type: 'cv',
        description: 'Curriculum Vitae de Marie Lambert',
        file_url: '/uploads/documents/cv_marie_lambert.pdf',
        file_name: 'cv_marie_lambert.pdf',
        mime_type: 'application/pdf',
        size_bytes: 128000,
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: employees[2].id,
        name: 'Diplôme Ingénieur',
        type: 'diploma',
        description: 'Diplôme d\'ingénieur en informatique',
        file_url: '/uploads/documents/diplome_pierre_martin.pdf',
        file_name: 'diplome_pierre_martin.pdf',
        mime_type: 'application/pdf',
        size_bytes: 512000,
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: employees[3].id,
        name: 'Certification Marketing',
        type: 'certificate',
        description: 'Certification en marketing digital',
        file_url: '/uploads/documents/certification_sophie_bernard.pdf',
        file_name: 'certification_sophie_bernard.pdf',
        mime_type: 'application/pdf',
        size_bytes: 384000,
        expiry_date: new Date('2025-09-15'),
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        employee_id: employees[4].id,
        name: 'Contrat de travail',
        type: 'contract',
        description: 'Contrat de travail signé',
        file_url: '/uploads/documents/contrat_lucas_petit.pdf',
        file_name: 'contrat_lucas_petit.pdf',
        mime_type: 'application/pdf',
        size_bytes: 768000,
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Mettre à jour les managers des départements
    await queryInterface.bulkUpdate('hr_departments',
      { manager_id: employees[0].id },
      { id: departments[0].id }
    );

    await queryInterface.bulkUpdate('hr_departments',
      { manager_id: employees[1].id },
      { id: departments[1].id }
    );
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les données de démonstration dans l'ordre inverse
    await queryInterface.bulkDelete('hr_documents', null, {});
    await queryInterface.bulkDelete('hr_contracts', null, {});
    await queryInterface.bulkDelete('hr_employees', null, {});
    await queryInterface.bulkDelete('hr_departments', null, {});
  }
};
