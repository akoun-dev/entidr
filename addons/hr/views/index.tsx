// Fichier index.tsx pour les vues du module HR
// Ce fichier exporte les composants de vues définis dans le manifeste

import React from 'react';

// Composant par défaut pour le module HR
export default function HRModuleViews() {
  return (
    <div>
      <h1>Module Ressources Humaines</h1>
      <p>Ce module est en cours de développement.</p>
    </div>
  );
}

// Exporter les composants de vues individuels
// Ces composants seront utilisés pour rendre les pages spécifiques du module HR
export { default as HrDashboardView } from './pages/HrDashboardView';
export { default as EmployeesView } from './pages/EmployeesView';

export const EmployeesKanbanView = () => (
  <div>
    <h1>Kanban des employés</h1>
    <p>Page de kanban des employés</p>
  </div>
);

export const EmployeeFormView = () => (
  <div>
    <h1>Formulaire employé</h1>
    <p>Page de formulaire d'employé</p>
  </div>
);

export const EmployeeDetailView = () => (
  <div>
    <h1>Détail de l'employé</h1>
    <p>Page de détail d'un employé</p>
  </div>
);

export const DepartmentsView = () => (
  <div>
    <h1>Liste des départements</h1>
    <p>Page de liste des départements</p>
  </div>
);

export const DepartmentsKanbanView = () => (
  <div>
    <h1>Kanban des départements</h1>
    <p>Page de kanban des départements</p>
  </div>
);

export const DepartmentFormView = () => (
  <div>
    <h1>Formulaire département</h1>
    <p>Page de formulaire de département</p>
  </div>
);

export const DepartmentDetailView = () => (
  <div>
    <h1>Détail du département</h1>
    <p>Page de détail d'un département</p>
  </div>
);

export const ContractsView = () => (
  <div>
    <h1>Liste des contrats</h1>
    <p>Page de liste des contrats</p>
  </div>
);

export const ContractsKanbanView = () => (
  <div>
    <h1>Kanban des contrats</h1>
    <p>Page de kanban des contrats</p>
  </div>
);

export const ContractFormView = () => (
  <div>
    <h1>Formulaire contrat</h1>
    <p>Page de formulaire de contrat</p>
  </div>
);

export const ContractDetailView = () => (
  <div>
    <h1>Détail du contrat</h1>
    <p>Page de détail d'un contrat</p>
  </div>
);

export const DocumentsView = () => (
  <div>
    <h1>Liste des documents</h1>
    <p>Page de liste des documents</p>
  </div>
);

export const DocumentsKanbanView = () => (
  <div>
    <h1>Kanban des documents</h1>
    <p>Page de kanban des documents</p>
  </div>
);

export const DocumentFormView = () => (
  <div>
    <h1>Formulaire document</h1>
    <p>Page de formulaire de document</p>
  </div>
);

export const DocumentDetailView = () => (
  <div>
    <h1>Détail du document</h1>
    <p>Page de détail d'un document</p>
  </div>
);
