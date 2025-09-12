import { AddonManifest } from '../../src/types/addon';
import hrRoutes from './routes';

export const hrManifest: AddonManifest = {
  name: 'hr',
  version: '2.0.0',
  displayName: 'Ressources Humaines',
  summary: 'Gestion des ressources humaines',
  description: 'Module de gestion des ressources humaines avec composants ENTIDR',
  isCore: false,
  application: true,
  autoInstall: true,
  installable: true,
  publication: {
    status: 'published'
  },
  dependencies: {},
  models: [
    {
      name: 'Employee',
      displayName: 'Employé',
      fields: [
        { name: 'id', type: 'number', label: 'ID' },
        { name: 'name', type: 'string', label: 'Nom', required: true },
        { name: 'first_name', type: 'string', label: 'Prénom', required: true },
        { name: 'last_name', type: 'string', label: 'Nom de famille', required: true },
        { name: 'email', type: 'string', label: 'Email', required: true },
        { name: 'phone', type: 'string', label: 'Téléphone' },
        { name: 'job_title', type: 'string', label: 'Poste' },
        { name: 'department_id', type: 'number', label: 'Département' },
        { name: 'hire_date', type: 'date', label: 'Date d\'embauche' },
        { name: 'salary', type: 'number', label: 'Salaire' },
        { name: 'active', type: 'boolean', label: 'Actif', default: true },
        { name: 'created_at', type: 'datetime', label: 'Créé le' },
        { name: 'updated_at', type: 'datetime', label: 'Modifié le' }
      ]
    },
    {
      name: 'Department',
      displayName: 'Département',
      fields: [
        { name: 'id', type: 'number', label: 'ID' },
        { name: 'name', type: 'string', label: 'Nom', required: true },
        { name: 'description', type: 'string', label: 'Description' },
        { name: 'manager_id', type: 'number', label: 'Manager' },
        { name: 'active', type: 'boolean', label: 'Actif', default: true },
        { name: 'created_at', type: 'datetime', label: 'Créé le' },
        { name: 'updated_at', type: 'datetime', label: 'Modifié le' }
      ]
    },
    {
      name: 'Contract',
      displayName: 'Contrat',
      fields: [
        { name: 'id', type: 'number', label: 'ID' },
        { name: 'employee_id', type: 'number', label: 'Employé', required: true },
        { name: 'type', type: 'string', label: 'Type', required: true },
        { name: 'start_date', type: 'date', label: 'Date de début', required: true },
        { name: 'end_date', type: 'date', label: 'Date de fin' },
        { name: 'salary', type: 'number', label: 'Salaire' },
        { name: 'status', type: 'string', label: 'Statut', default: 'active' },
        { name: 'created_at', type: 'datetime', label: 'Créé le' },
        { name: 'updated_at', type: 'datetime', label: 'Modifié le' }
      ]
    },
    {
      name: 'Document',
      displayName: 'Document',
      fields: [
        { name: 'id', type: 'number', label: 'ID' },
        { name: 'employee_id', type: 'number', label: 'Employé' },
        { name: 'name', type: 'string', label: 'Nom', required: true },
        { name: 'type', type: 'string', label: 'Type' },
        { name: 'file_url', type: 'string', label: 'URL du fichier', required: true },
        { name: 'mime_type', type: 'string', label: 'Type MIME' },
        { name: 'size_bytes', type: 'number', label: 'Taille (octets)' },
        { name: 'created_at', type: 'datetime', label: 'Créé le' },
        { name: 'updated_at', type: 'datetime', label: 'Modifié le' }
      ]
    }
  ],
  menus: [
    {
      id: 'hr-main',
      name: 'Ressources Humaines',
      sequence: 10,
      icon: 'users'
    },
    {
      id: 'hr-dashboard',
      name: 'Tableau de bord',
      sequence: 1,
      route: '/hr',
      icon: 'dashboard',
      parent: 'hr-main'
    },
    {
      id: 'hr-employees',
      name: 'Employés',
      sequence: 2,
      icon: 'user',
      parent: 'hr-main'
    },
    {
      id: 'hr-employees-list',
      name: 'Liste',
      sequence: 1,
      route: '/hr/employees',
      icon: 'list',
      parent: 'hr-employees'
    },
    {
      id: 'hr-employees-kanban',
      name: 'Kanban',
      sequence: 2,
      route: '/hr/employees/kanban',
      icon: 'grid',
      parent: 'hr-employees'
    },
    {
      id: 'hr-departments',
      name: 'Départements',
      sequence: 3,
      icon: 'building',
      parent: 'hr-main'
    },
    {
      id: 'hr-departments-list',
      name: 'Liste',
      sequence: 1,
      route: '/hr/departments',
      icon: 'list',
      parent: 'hr-departments'
    },
    {
      id: 'hr-departments-kanban',
      name: 'Kanban',
      sequence: 2,
      route: '/hr/departments/kanban',
      icon: 'grid',
      parent: 'hr-departments'
    },
    {
      id: 'hr-contracts',
      name: 'Contrats',
      sequence: 4,
      icon: 'file-text',
      parent: 'hr-main'
    },
    {
      id: 'hr-contracts-list',
      name: 'Liste',
      sequence: 1,
      route: '/hr/contracts',
      icon: 'list',
      parent: 'hr-contracts'
    },
    {
      id: 'hr-contracts-kanban',
      name: 'Kanban',
      sequence: 2,
      route: '/hr/contracts/kanban',
      icon: 'grid',
      parent: 'hr-contracts'
    },
    {
      id: 'hr-documents',
      name: 'Documents',
      sequence: 5,
      icon: 'file',
      parent: 'hr-main'
    },
    {
      id: 'hr-documents-list',
      name: 'Liste',
      sequence: 1,
      route: '/hr/documents',
      icon: 'list',
      parent: 'hr-documents'
    },
    {
      id: 'hr-documents-kanban',
      name: 'Kanban',
      sequence: 2,
      route: '/hr/documents/kanban',
      icon: 'grid',
      parent: 'hr-documents'
    }
  ],
  routes: [
    {
      path: '/hr',
      component: hrRoutes.HrDashboardView,
      title: 'Tableau de bord HR',
      icon: 'dashboard'
    },
    {
      path: '/hr/employees',
      component: hrRoutes.EmployeesView,
      title: 'Employés',
      icon: 'users'
    },
    {
      path: '/hr/employees/kanban',
      component: hrRoutes.EmployeesKanbanView,
      title: 'Kanban Employés',
      icon: 'grid'
    },
    {
      path: '/hr/departments',
      component: hrRoutes.DepartmentsView,
      title: 'Départements',
      icon: 'building'
    },
    {
      path: '/hr/departments/kanban',
      component: hrRoutes.DepartmentsKanbanView,
      title: 'Kanban Départements',
      icon: 'grid'
    },
    {
      path: '/hr/contracts',
      component: hrRoutes.ContractsView,
      title: 'Contrats',
      icon: 'file-text'
    },
    {
      path: '/hr/contracts/kanban',
      component: hrRoutes.ContractsKanbanView,
      title: 'Kanban Contrats',
      icon: 'grid'
    },
    {
      path: '/hr/documents',
      component: hrRoutes.DocumentsView,
      title: 'Documents',
      icon: 'file'
    },
    {
      path: '/hr/documents/kanban',
      component: hrRoutes.DocumentsKanbanView,
      title: 'Kanban Documents',
      icon: 'grid'
    }
  ],
};

export default hrManifest;
