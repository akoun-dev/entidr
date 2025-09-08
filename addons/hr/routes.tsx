
import React from 'react';
import { Route } from 'react-router-dom';
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
  WorkflowsView,
  WorkflowFormView,
  SignaturesView,
  SecurityView,
  RoleFormView,
  PermissionFormView
} from './views/pages';

/**
 * Routes pour le module HR
 * Note: Les chemins de route ne doivent pas commencer par un slash (/) car ils sont relatifs à la route parent
 */
const routes = (
  <>
    {/* Routes principales */}
    <Route path="hr" element={<HrDashboardView />} />

    {/* Routes pour les employés */}
    <Route path="hr/employees" element={<EmployeesView />} />
    <Route path="hr/employees/new" element={<EmployeeFormView />} />
    <Route path="hr/employees/:id" element={<EmployeeDetailView />} />
    <Route path="hr/employees/edit/:id" element={<EmployeeFormView />} />

    {/* Routes pour les départements */}
    <Route path="hr/departments" element={<DepartmentsView />} />
    <Route path="hr/departments/new" element={<DepartmentFormView />} />
    <Route path="hr/departments/:id" element={<DepartmentDetailView />} />
    <Route path="hr/departments/edit/:id" element={<DepartmentFormView />} />

    {/* Route pour les contrats */}
    <Route path="hr/contracts" element={<ContractsView />} />
    <Route path="hr/contracts/new" element={<ContractFormView />} />
    <Route path="hr/contracts/:id" element={<ContractDetailView />} />
    <Route path="hr/contracts/edit/:id" element={<ContractFormView />} />

    {/* Documents */}
    <Route path="hr/documents" element={<DocumentsView />} />
    <Route path="hr/documents/new" element={<DocumentFormView />} />
    <Route path="hr/documents/:id" element={<DocumentDetailView />} />
    <Route path="hr/documents/edit/:id" element={<DocumentFormView />} />

    {/* Onboarding / Offboarding */}
    <Route path="hr/onboarding" element={<OnboardingView />} />
    <Route path="hr/offboarding" element={<OffboardingView />} />

    {/* Workflows */}
    <Route path="hr/workflows" element={<WorkflowsView />} />
    <Route path="hr/workflows/new" element={<WorkflowFormView />} />
    <Route path="hr/workflows/edit/:id" element={<WorkflowFormView />} />
    
    {/* Signatures */}
    <Route path="hr/signatures" element={<SignaturesView />} />

    {/* Sécurité */}
    <Route path="hr/security" element={<SecurityView />} />
    <Route path="hr/security/roles/new" element={<RoleFormView />} />
    <Route path="hr/security/roles/edit/:id" element={<RoleFormView />} />
    <Route path="hr/security/permissions/new" element={<PermissionFormView />} />
    <Route path="hr/security/permissions/edit/:id" element={<PermissionFormView />} />
  </>
);

export default routes;
