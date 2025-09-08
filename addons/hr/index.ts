
// Exporter les modèles
export * from './models';

// Exporter les vues
export * from './views';

// Exporter les services
export * from './services';

// Exporter les hooks
export { useDepartmentForm } from './hooks';
export { useEmployee, useEmployeeForm } from './hooks';

// Exporter les routes
export { default as routes } from './routes';

// Exporter le manifeste
export { default as manifest } from './manifest';

// Exporter les composants pour l'enregistrement des routes
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
  WorkflowsView,
  WorkflowFormView,
  SignaturesView,
  SecurityView,
  RoleFormView,
  PermissionFormView
} from './views/pages';

export const Components = {
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
  WorkflowsView,
  WorkflowFormView,
  SignaturesView,
  SecurityView,
  RoleFormView,
  PermissionFormView,
};

// Fonctions d'initialisation et de nettoyage
export function initialize() {
  // Code d'initialisation...
}

export function cleanup() {
  // Code de nettoyage...
}
