// Export du composant principal
export { DashboardView as default } from './DashboardView';
export { DashboardView } from './DashboardView';

// Export des sous-composants
export { DashboardViewHeader } from './DashboardViewHeader';
export { DashboardViewToolbar } from './DashboardViewToolbar';
export { DashboardViewGrid } from './DashboardViewGrid';
export { DashboardViewWidget } from './DashboardViewWidget';
export { DashboardViewConfig } from './DashboardViewConfig';

// Export des types
export type { DashboardWidget, DashboardConfig } from './DashboardView';

// Export des utilitaires et constantes si nécessaire
export const DASHBOARD_WIDGET_TYPES = [
  'stats',
  'chart',
  'table',
  'text',
  'metric',
] as const;

export const DASHBOARD_LAYOUTS = [
  'grid',
  'free',
] as const;

export const DASHBOARD_DEFAULT_THEMES = {
  light: {
    background: '#f8fafc',
    widgetBackground: '#ffffff',
    textColor: '#1e293b',
    borderColor: '#e2e8f0',
  },
  dark: {
    background: '#0f172a',
    widgetBackground: '#1e293b',
    textColor: '#f1f5f9',
    borderColor: '#334155',
  },
  blue: {
    background: '#eff6ff',
    widgetBackground: '#dbeafe',
    textColor: '#1e3a8a',
    borderColor: '#93c5fd',
  },
  green: {
    background: '#f0fdf4',
    widgetBackground: '#dcfce7',
    textColor: '#14532d',
    borderColor: '#86efac',
  },
} as const;
