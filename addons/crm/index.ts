// Exporter les vues
export * from './views';

// Exporter les routes
export { default as routes } from './routes';

// Exporter le manifeste
export { default as manifest } from './manifest';

// Exporter les composants pour l'enregistrement des routes
import { CrmDashboardView } from './views/pages';

export const Components = {
  CrmDashboardView
};

// Fonctions d'initialisation et de nettoyage
export function initialize() {
  // Code d'initialisation...
}

export function cleanup() {
  // Code de nettoyage...
}
