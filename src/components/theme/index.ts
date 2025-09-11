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

// Note: Les exportations suivantes seront disponibles lorsque les modules correspondants seront implémentés
// - Hook de thème (useTheme)
// - Provider de thème (ThemeProvider)
// - Sélecteur de thème (ThemeSelector)
// - Panneau de personnalisation complet (CustomizationPanel)
// - Utilitaires CSS (cssUtils)
// - Configurations par défaut (defaults)
// - Validation de thème (validation)
