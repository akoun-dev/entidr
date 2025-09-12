import { AddonManifest } from '../../src/types/addon';

export const hrManifest: AddonManifest = {
  id: 'hr',
  name: 'Ressources Humaines',
  version: '2.0.0',
  description: 'Module de gestion des ressources humaines avec composants ENTIDR',
  author: 'ENTIDR Team',
  dependencies: {},
  permissions: [
    'hr.employees.read',
    'hr.employees.write',
    'hr.employees.create',
    'hr.employees.delete',
    'hr.departments.read',
    'hr.departments.write',
    'hr.departments.create',
    'hr.departments.delete',
    'hr.contracts.read',
    'hr.contracts.write',
    'hr.contracts.create',
    'hr.contracts.delete',
    'hr.documents.read',
    'hr.documents.write',
    'hr.documents.create',
    'hr.documents.delete'
  ],
  models: [
    {
      name: 'Employee',
      fields: [
        { name: 'id', type: 'number', primary: true },
        { name: 'name', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true, unique: true },
        { name: 'phone', type: 'string' },
        { name: 'job_title', type: 'string' },
        { name: 'department_id', type: 'number' },
        { name: 'hire_date', type: 'date' },
        { name: 'salary', type: 'number' },
        { name: 'active', type: 'boolean', default: true },
        { name: 'created_at', type: 'datetime', auto: true },
        { name: 'updated_at', type: 'datetime', auto: true }
      ]
    },
    {
      name: 'Department',
      fields: [
        { name: 'id', type: 'number', primary: true },
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'manager_id', type: 'number' },
        { name: 'active', type: 'boolean', default: true },
        { name: 'created_at', type: 'datetime', auto: true },
        { name: 'updated_at', type: 'datetime', auto: true }
      ]
    },
    {
      name: 'Contract',
      fields: [
        { name: 'id', type: 'number', primary: true },
        { name: 'employee_id', type: 'number', required: true },
        { name: 'type', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'salary', type: 'number' },
        { name: 'status', type: 'string', default: 'active' },
        { name: 'created_at', type: 'datetime', auto: true },
        { name: 'updated_at', type: 'datetime', auto: true }
      ]
    },
    {
      name: 'Document',
      fields: [
        { name: 'id', type: 'number', primary: true },
        { name: 'employee_id', type: 'number' },
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'string' },
        { name: 'file_url', type: 'string', required: true },
        { name: 'mime_type', type: 'string' },
        { name: 'size_bytes', type: 'number' },
        { name: 'created_at', type: 'datetime', auto: true },
        { name: 'updated_at', type: 'datetime', auto: true }
      ]
    }
  ],
  views: [
    {
      id: 'hr-employees-list',
      name: 'Liste des employés',
      type: 'LIST',
      model: 'Employee',
      fields: ['id', 'name', 'email', 'job_title', 'department_id', 'active', 'created_at']
    },
    {
      id: 'hr-employees-form',
      name: 'Formulaire employé',
      type: 'FORM',
      model: 'Employee',
      fields: ['name', 'first_name', 'last_name', 'email', 'phone', 'job_title', 'department_id', 'hire_date', 'salary', 'active']
    },
    {
      id: 'hr-employees-kanban',
      name: 'Kanban employés',
      type: 'KANBAN',
      model: 'Employee',
      fields: ['id', 'name', 'email', 'job_title', 'department_id', 'active'],
      groupBy: 'department_id'
    },
    {
      id: 'hr-departments-list',
      name: 'Liste des départements',
      type: 'LIST',
      model: 'Department',
      fields: ['id', 'name', 'description', 'manager_id', 'active', 'created_at']
    },
    {
      id: 'hr-departments-form',
      name: 'Formulaire département',
      type: 'FORM',
      model: 'Department',
      fields: ['name', 'description', 'manager_id', 'active']
    },
    {
      id: 'hr-departments-kanban',
      name: 'Kanban départements',
      type: 'KANBAN',
      model: 'Department',
      fields: ['id', 'name', 'description', 'manager_id', 'active'],
      groupBy: 'active'
    },
    {
      id: 'hr-contracts-list',
      name: 'Liste des contrats',
      type: 'LIST',
      model: 'Contract',
      fields: ['id', 'employee_id', 'type', 'start_date', 'end_date', 'salary', 'status', 'created_at']
    },
    {
      id: 'hr-contracts-form',
      name: 'Formulaire contrat',
      type: 'FORM',
      model: 'Contract',
      fields: ['employee_id', 'type', 'start_date', 'end_date', 'salary', 'status']
    },
    {
      id: 'hr-contracts-kanban',
      name: 'Kanban contrats',
      type: 'KANBAN',
      model: 'Contract',
      fields: ['id', 'employee_id', 'type', 'start_date', 'end_date', 'salary', 'status'],
      groupBy: 'status'
    },
    {
      id: 'hr-documents-list',
      name: 'Liste des documents',
      type: 'LIST',
      model: 'Document',
      fields: ['id', 'employee_id', 'name', 'type', 'mime_type', 'size_bytes', 'created_at']
    },
    {
      id: 'hr-documents-form',
      name: 'Formulaire document',
      type: 'FORM',
      model: 'Document',
      fields: ['employee_id', 'name', 'type', 'file_url']
    },
    {
      id: 'hr-documents-kanban',
      name: 'Kanban documents',
      type: 'KANBAN',
      model: 'Document',
      fields: ['id', 'employee_id', 'name', 'type', 'mime_type'],
      groupBy: 'type'
    }
  ],
  menus: [
    {
      id: 'hr-main',
      label: 'Ressources Humaines',
      icon: 'users',
      order: 10,
      children: [
        {
          id: 'hr-dashboard',
          label: 'Tableau de bord',
          path: '/hr',
          icon: 'dashboard'
        },
        {
          id: 'hr-employees',
          label: 'Employés',
          path: '/hr/employees',
          icon: 'user',
          children: [
            {
              id: 'hr-employees-list',
              label: 'Liste',
              path: '/hr/employees',
              icon: 'list'
            },
            {
              id: 'hr-employees-kanban',
              label: 'Kanban',
              path: '/hr/employees/kanban',
              icon: 'grid'
            }
          ]
        },
        {
          id: 'hr-departments',
          label: 'Départements',
          path: '/hr/departments',
          icon: 'building',
          children: [
            {
              id: 'hr-departments-list',
              label: 'Liste',
              path: '/hr/departments',
              icon: 'list'
            },
            {
              id: 'hr-departments-kanban',
              label: 'Kanban',
              path: '/hr/departments/kanban',
              icon: 'grid'
            }
          ]
        },
        {
          id: 'hr-contracts',
          label: 'Contrats',
          path: '/hr/contracts',
          icon: 'file-text',
          children: [
            {
              id: 'hr-contracts-list',
              label: 'Liste',
              path: '/hr/contracts',
              icon: 'list'
            },
            {
              id: 'hr-contracts-kanban',
              label: 'Kanban',
              path: '/hr/contracts/kanban',
              icon: 'grid'
            }
          ]
        },
        {
          id: 'hr-documents',
          label: 'Documents',
          path: '/hr/documents',
          icon: 'file',
          children: [
            {
              id: 'hr-documents-list',
              label: 'Liste',
              path: '/hr/documents',
              icon: 'list'
            },
            {
              id: 'hr-documents-kanban',
              label: 'Kanban',
              path: '/hr/documents/kanban',
              icon: 'grid'
            }
          ]
        }
      ]
    }
  ],
  routes: [
    {
      path: '/hr',
      component: 'HrDashboardView'
    },
    {
      path: '/hr/employees',
      component: 'EmployeesView'
    },
    {
      path: '/hr/employees/kanban',
      component: 'EmployeesKanbanView'
    },
    {
      path: '/hr/employees/new',
      component: 'EmployeeFormView'
    },
    {
      path: '/hr/employees/:id',
      component: 'EmployeeDetailView'
    },
    {
      path: '/hr/employees/edit/:id',
      component: 'EmployeeFormView'
    },
    {
      path: '/hr/departments',
      component: 'DepartmentsView'
    },
    {
      path: '/hr/departments/kanban',
      component: 'DepartmentsKanbanView'
    },
    {
      path: '/hr/departments/new',
      component: 'DepartmentFormView'
    },
    {
      path: '/hr/departments/:id',
      component: 'DepartmentDetailView'
    },
    {
      path: '/hr/departments/edit/:id',
      component: 'DepartmentFormView'
    },
    {
      path: '/hr/contracts',
      component: 'ContractsView'
    },
    {
      path: '/hr/contracts/kanban',
      component: 'ContractsKanbanView'
    },
    {
      path: '/hr/contracts/new',
      component: 'ContractFormView'
    },
    {
      path: '/hr/contracts/:id',
      component: 'ContractDetailView'
    },
    {
      path: '/hr/contracts/edit/:id',
      component: 'ContractFormView'
    },
    {
      path: '/hr/documents',
      component: 'DocumentsView'
    },
    {
      path: '/hr/documents/kanban',
      component: 'DocumentsKanbanView'
    },
    {
      path: '/hr/documents/new',
      component: 'DocumentFormView'
    },
    {
      path: '/hr/documents/:id',
      component: 'DocumentDetailView'
    },
    {
      path: '/hr/documents/edit/:id',
      component: 'DocumentFormView'
    }
  ],
  api: [
    {
      method: 'GET',
      path: '/api/hr/employees',
      handler: 'EmployeeController.getAll'
    },
    {
      method: 'GET',
      path: '/api/hr/employees/:id',
      handler: 'EmployeeController.getById'
    },
    {
      method: 'POST',
      path: '/api/hr/employees',
      handler: 'EmployeeController.create'
    },
    {
      method: 'PUT',
      path: '/api/hr/employees/:id',
      handler: 'EmployeeController.update'
    },
    {
      method: 'DELETE',
      path: '/api/hr/employees/:id',
      handler: 'EmployeeController.delete'
    },
    {
      method: 'GET',
      path: '/api/hr/departments',
      handler: 'DepartmentController.getAll'
    },
    {
      method: 'GET',
      path: '/api/hr/departments/:id',
      handler: 'DepartmentController.getById'
    },
    {
      method: 'POST',
      path: '/api/hr/departments',
      handler: 'DepartmentController.create'
    },
    {
      method: 'PUT',
      path: '/api/hr/departments/:id',
      handler: 'DepartmentController.update'
    },
    {
      method: 'DELETE',
      path: '/api/hr/departments/:id',
      handler: 'DepartmentController.delete'
    },
    {
      method: 'GET',
      path: '/api/hr/contracts',
      handler: 'ContractController.getAll'
    },
    {
      method: 'GET',
      path: '/api/hr/contracts/:id',
      handler: 'ContractController.getById'
    },
    {
      method: 'POST',
      path: '/api/hr/contracts',
      handler: 'ContractController.create'
    },
    {
      method: 'PUT',
      path: '/api/hr/contracts/:id',
      handler: 'ContractController.update'
    },
    {
      method: 'DELETE',
      path: '/api/hr/contracts/:id',
      handler: 'ContractController.delete'
    },
    {
      method: 'GET',
      path: '/api/hr/documents',
      handler: 'DocumentController.getAll'
    },
    {
      method: 'GET',
      path: '/api/hr/documents/:id',
      handler: 'DocumentController.getById'
    },
    {
      method: 'POST',
      path: '/api/hr/documents',
      handler: 'DocumentController.create'
    },
    {
      method: 'PUT',
      path: '/api/hr/documents/:id',
      handler: 'DocumentController.update'
    },
    {
      method: 'DELETE',
      path: '/api/hr/documents/:id',
      handler: 'DocumentController.delete'
    }
  ]
};

export default hrManifest;
