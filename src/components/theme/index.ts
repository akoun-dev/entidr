/**
 * Exportations du système de thème - Personnalisation des polices
 */

// Types et interfaces
export type * from './types';

// Utilitaires de polices
export {
  FONT_PRESETS,
  FONT_SIZE_SCALE,
  LINE_HEIGHT_SCALE,
  FONT_WEIGHTS,
  LETTER_SPACING_SCALE,
  generateFontVariations,
  createSemanticFontConfig,
  adaptFontsForDarkMode,
  validateFontFamily,
  normalizeFontInfo,
  fontInfoToCSS,
  calculateFontReadability,
  listFontPresets,
  getFontPreset,
  applyFontPreset
} from './fontUtils';

export type {
  FontInfo,
  FontVariations,
  FontPreset
} from './fontUtils';

// Composants de sélection de polices
export { FontSelector } from './FontSelector';
export type { FontSelectorProps } from './FontSelector';

// Service de chargement de polices
export {
  FontLoaderService,
  AsyncFontLoader,
  useFontLoader
} from './fontLoader';

export type {
  FontLoaderOptions,
  FontLoadState,
  FontLoadResult
} from './fontLoader';

// Panneau de personnalisation des polices
export { FontCustomizationPanel } from './FontCustomizationPanel';
export type { FontCustomizationPanelProps } from './FontCustomizationPanel';

// Utilitaires d'espacement
export {
  SPACING_SCALE,
  BREAKPOINTS,
  SPACING_PRESETS,
  generateSpacingScale,
  calculateFluidSpacing,
  generateSpacingVariables,
  generateSpacingUtilities,
  parseSpacingValue,
  validateSpacingValue,
  getSpacingRecommendations,
  createSpacingConfig
} from './spacingUtils';

export type {
  SpacingOptions,
  SpacingPreset,
  SpacingInfo
} from './spacingUtils';

// Composants de sélection d'espacement
export { SpacingSelector } from './SpacingSelector';
export type { SpacingSelectorProps } from './SpacingSelector';

// Panneau de personnalisation de l'espacement
export { SpacingCustomizationPanel } from './SpacingCustomizationPanel';
export type { SpacingCustomizationPanelProps } from './SpacingCustomizationPanel';

// Utilitaires de bordures
export {
  BORDER_WIDTH_SCALE,
  BORDER_STYLES,
  BORDER_RADIUS_SCALE,
  BORDER_PRESETS,
  generateBorderWidths,
  generateBorderVariables,
  generateBorderUtilities,
  parseBorderValue,
  validateBorderValue,
  getBorderRecommendations,
  createBorderConfig
} from './borderUtils';

export type {
  BorderOptions,
  BorderPreset,
  BorderInfo
} from './borderUtils';

// Composants de sélection de bordures
export { BorderSelector } from './BorderSelector';
export type { BorderSelectorProps } from './BorderSelector';

// Panneau de personnalisation des bordures
export { BorderCustomizationPanel } from './BorderCustomizationPanel';
export type { BorderCustomizationPanelProps } from './BorderCustomizationPanel';

// Utilitaires d'ombres
export {
  SHADOW_SCALE,
  COLORED_SHADOWS,
  SHADOW_PRESETS,
  generateShadowScale,
  generateShadowVariables,
  generateShadowUtilities,
  parseShadowValue,
  validateShadowValue,
  getShadowRecommendations,
  createShadowConfig
} from './shadowUtils';

export type {
  ShadowOptions,
  ShadowPreset,
  ShadowInfo
} from './shadowUtils';

// Composants de sélection d'ombres
export { ShadowSelector } from './ShadowSelector';
export type { ShadowSelectorProps } from './ShadowSelector';

// Panneau de personnalisation des ombres
export { ShadowCustomizationPanel } from './ShadowCustomizationPanel';
export type { ShadowCustomizationPanelProps } from './ShadowCustomizationPanel';

// Tests d'intégration et exemples d'utilisation
export { ThemeIntegrationTests } from './ThemeIntegrationTests';
export { ThemeUsageExamples } from './ThemeUsageExamples';

// Note: Les exportations suivantes seront disponibles lorsque les modules correspondants seront implémentés
// - Panneau de personnalisation complet (CustomizationPanel)
// - Utilitaires CSS (cssUtils)
// - Configurations par défaut (defaults)
// - Validation de thème (validation)
