// Exporter les vues
export * from './views';

// Exporter les routes

export { default as routes } from './routes';

// Exporter le manifeste
export { default as manifest } from './manifest';

// Exporter les connecteurs et le coffre-fort
export * from './connectors';
export { SecretStore } from './secrets/SecretStore';


// Exporter les composants pour l'enregistrement des routes
import { BpmnDashboardView, ProcessListView, InstanceListView, ConnectorListView } from './views/pages';

export const Components = {
  BpmnDashboardView,
  ProcessListView,
  InstanceListView,
  ConnectorListView
};


export function initialize() {
  // Code d'initialisation du module BPMN
}

export function cleanup() {
  // Code de nettoyage du module BPMN
}
