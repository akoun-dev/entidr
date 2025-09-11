// Export des hooks principaux
export { useTheme } from './useTheme';
export { useAdaptiveTheme } from './AdaptiveComponents';

// Export des composants adaptatifs
export {
  AdaptiveCard,
  AdaptiveBadge,
  AdaptiveButton,
  AdaptiveAlert,
  AdaptiveText,
  AdaptiveContainer
} from './AdaptiveComponents';

// Export du composant de test d'accessibilité
export { AccessibilityTester } from './AccessibilityTester';

// Export des types
export type {
  ThemeType,
  ThemeState,
  ThemeConfig,
  ColorPalette,
  FontConfig,
  SpacingConfig,
  BorderConfig,
  ShadowConfig,
  AnimationConfig,
  BreakpointConfig
} from './types';

// Export du hook par défaut
export { useTheme as default } from './useTheme';

// Export des utilitaires
export { ThemeProvider } from './ThemeProvider';

// Export du CSS de transitions
import './theme-transitions.css';
