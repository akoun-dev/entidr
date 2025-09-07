import { AddonManifest } from '../../src/types/addon';
import {
  HrDashboardView,
  EmployeesView,
  EmployeeFormView,
  EmployeeDetailView,
  DepartmentsView,
  DepartmentFormView,
  DepartmentDetailView,
  DocumentsView,
  ContractsView,
  ContractFormView,
  ContractDetailView,
  DocumentFormView,
  DocumentDetailView,
  OnboardingView,
  OffboardingView,
} from './views/pages';
const manifest: AddonManifest = {
  // Métadonnées de base
  name: 'hr',
  version: '1.0.0',
  displayName: 'Ressources Humaines',
  summary: 'Gestion du personnel (noyau central)',
  description: 'Administration de base des employés: fiches, coordonnées, informations professionnelles, documents, contrats, historique RH et suivi des départs.',

  // Configuration
  application: true,
  autoInstall: false,
  installable: true,

  // Routes définies par l'addon
  routes: [
    {
      path: '/hr',
      component: HrDashboardView,
      protected: true,
      title: 'Tableau de bord RH',
      icon: 'LayoutDashboardIcon'
    },
    {
      path: '/hr/employees',
      component: EmployeesView,
      protected: true,
      title: 'Employés',
      icon: 'UsersIcon'
    },
    {
      path: '/hr/employees/new',
      component: EmployeeFormView,
      protected: true,
      title: 'Nouvel employé',
      icon: 'PlusIcon'
    },
    {
      path: '/hr/employees/:id',
      component: EmployeeDetailView,
      protected: true,
      title: 'Détail employé',
      icon: 'UserIcon'
    },
    {
      path: '/hr/employees/edit/:id',
      component: EmployeeFormView,
      protected: true,
      title: 'Modifier employé',
      icon: 'PencilIcon'
    },
    {
      path: '/hr/departments',
      component: DepartmentsView,
      protected: true,
      title: 'Départements',
      icon: 'FolderIcon'
    },
    {
      path: '/hr/departments/new',
      component: DepartmentFormView,
      protected: true,
      title: 'Nouveau département',
      icon: 'PlusIcon'
    },
    {
      path: '/hr/departments/:id',
      component: DepartmentDetailView,
      protected: true,
      title: 'Détail département',
      icon: 'FolderIcon'
    },
    {
      path: '/hr/departments/edit/:id',
      component: DepartmentFormView,
      protected: true,
      title: 'Modifier département',
      icon: 'PencilIcon'
    },
    {
      path: '/hr/contracts',
      component: ContractsView,
      protected: true,
      title: 'Contrats',
      icon: 'FileTextIcon'
    },
    {
      path: '/hr/contracts/new',
      component: ContractFormView,
      protected: true,
      title: 'Nouveau contrat',
      icon: 'PlusIcon'
    },
    {
      path: '/hr/contracts/:id',
      component: ContractDetailView,
      protected: true,
      title: 'Détail contrat',
      icon: 'FileTextIcon'
    },
    {
      path: '/hr/contracts/edit/:id',
      component: ContractFormView,
      protected: true,
      title: 'Modifier contrat',
      icon: 'PencilIcon'
    },
    {
      path: '/hr/documents',
      component: DocumentsView,
      protected: true,
      title: 'Documents',
      icon: 'FileTextIcon'
    },
    {
      path: '/hr/documents/new',
      component: DocumentFormView,
      protected: true,
      title: 'Nouveau document',
      icon: 'PlusIcon'
    },
    {
      path: '/hr/documents/:id',
      component: DocumentDetailView,
      protected: true,
      title: 'Détail document',
      icon: 'FileTextIcon'
    },
    {
      path: '/hr/documents/edit/:id',
      component: DocumentFormView,
      protected: true,
      title: 'Modifier document',
      icon: 'PencilIcon'
    },
    {
      path: '/hr/onboarding',
      component: OnboardingView,
      protected: true,
      title: 'Onboarding',
      icon: 'UsersIcon'
    },
    {
      path: '/hr/offboarding',
      component: OffboardingView,
      protected: true,
      title: 'Offboarding',
      icon: 'UsersIcon'
    }
  ],

  // Modèles de données
  models: [
    {
      name: 'hr.employee',
      displayName: 'Employé',
      fields: [
        { name: 'name', type: 'string', required: true, label: 'Nom' },
        { name: 'job_title', type: 'string', required: false, label: 'Poste' },
        { name: 'department_id', type: 'many2one', required: false, label: 'Département', relation: 'hr.department' },
        { name: 'work_email', type: 'string', required: false, label: 'Email professionnel' },
        { name: 'work_phone', type: 'string', required: false, label: 'Téléphone professionnel' },
        { name: 'parent_id', type: 'many2one', required: false, label: 'Responsable', relation: 'hr.employee' }
      ]
    },
    {
      name: 'hr.department',
      displayName: 'Département',
      fields: [
        { name: 'name', type: 'string', required: true, label: 'Nom' },
        { name: 'manager_id', type: 'many2one', required: false, label: 'Responsable', relation: 'hr.employee' }
      ]
    }
  ],

  // Menus définis par l'addon
  menus: [
    {
      id: 'menu_hr_root',
      name: 'Ressources Humaines',
      sequence: 10,
      route: '/hr',
      icon: 'UserIcon'
    }
  ],

  // Dépendances
  dependencies: []
};

export default manifest;
