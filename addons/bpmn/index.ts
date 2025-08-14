// Exporter les vues
export * from './views';
export * from './analytics';

// Exporter les routes

export { default as routes } from './routes';

// Exporter le manifeste
export { default as manifest } from './manifest';


// Exporter les composants pour l'enregistrement des routes
import { BpmnDashboardView, ProcessListView, InstanceListView, ConnectorListView } from './views/pages';

export const Components = {
  BpmnDashboardView,
  ProcessListView,
  InstanceListView,
  ConnectorListView
};
// Aucun composant spécifique pour l'instant
export const Components = {};


export function initialize() {
  // Code d'initialisation du module BPMN
}

export function cleanup() {
  // Code de nettoyage du module BPMN
}
