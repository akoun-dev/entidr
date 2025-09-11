import type { FontConfig, ThemeConfig } from './types';

/**
 * Interface pour les informations de police
 */
export interface FontInfo {
  family: string;
  weight?: number | string;
  style?: 'normal' | 'italic' | 'oblique';
  size?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
}

/**
 * Interface pour les variations de police
 */
export interface FontVariations {
  [key: string]: string;
}

/**
 * Interface pour les presets de polices
 */
export interface FontPreset {
  name: string;
  description: string;
  sans: FontInfo;
  serif: FontInfo;
  mono: FontInfo;
  display?: FontInfo;
  body?: FontInfo;
  heading?: FontInfo;
}

/**
 * Presets de polices prédéfinis
 */
export const FONT_PRESETS: Record<string, FontPreset> = {
  modern: {
    name: 'Moderne',
    description: 'Polices modernes et épurées',
    sans: {
      family: 'Inter, system-ui, -apple-system, sans-serif',
      weight: 400,
      size: '16px',
      lineHeight: 1.5
    },
    serif: {
      family: 'Playfair Display, Georgia, serif',
      weight: 400,
      size: '18px',
      lineHeight: 1.4
    },
    mono: {
      family: 'JetBrains Mono, Consolas, Monaco, monospace',
      weight: 400,
      size: '14px',
      lineHeight: 1.5
    },
    display: {
      family: 'Inter, system-ui, -apple-system, sans-serif',
      weight: 700,
      size: '48px',
      lineHeight: 1.2
    },
    body: {
      family: 'Inter, system-ui, -apple-system, sans-serif',
      weight: 400,
      size: '16px',
      lineHeight: 1.5
    },
    heading: {
      family: 'Inter, system-ui, -apple-system, sans-serif',
      weight: 600,
      size: '24px',
      lineHeight: 1.3
    }
  },
  classic: {
    name: 'Classique',
    description: 'Polices classiques et élégantes',
    sans: {
      family: 'Helvetica, Arial, sans-serif',
      weight: 400,
      size: '16px',
      lineHeight: 1.5
    },
    serif: {
      family: 'Georgia, Times New Roman, serif',
      weight: 400,
      size: '18px',
      lineHeight: 1.4
    },
    mono: {
      family: 'Courier New, monospace',
      weight: 400,
      size: '14px',
      lineHeight: 1.5
    },
    display: {
      family: 'Georgia, Times New Roman, serif',
      weight: 700,
      size: '48px',
      lineHeight: 1.2
    },
    body: {
      family: 'Georgia, Times New Roman, serif',
      weight: 400,
      size: '16px',
      lineHeight: 1.5
    },
    heading: {
      family: 'Georgia, Times New Roman, serif',
      weight: 600,
      size: '24px',
      lineHeight: 1.3
    }
  },
  technical: {
    name: 'Technique',
    description: 'Polices techniques et monospaces',
    sans: {
      family: 'Roboto, system-ui, sans-serif',
      weight: 400,
      size: '16px',
      lineHeight: 1.5
    },
    serif: {
      family: 'Merriweather, Georgia, serif',
      weight: 400,
      size: '18px',
      lineHeight: 1.4
    },
    mono: {
      family: 'Fira Code, Consolas, Monaco, monospace',
      weight: 400,
      size: '14px',
      lineHeight: 1.5
    },
    display: {
      family: 'Roboto, system-ui, sans-serif',
      weight: 700,
      size: '48px',
      lineHeight: 1.2
    },
    body: {
      family: 'Roboto, system-ui, sans-serif',
      weight: 400,
      size: '16px',
      lineHeight: 1.5
    },
    heading: {
      family: 'Roboto, system-ui, sans-serif',
      weight: 600,
      size: '24px',
      lineHeight: 1.3
    }
  },
  elegant: {
    name: 'Élégant',
    description: 'Polices élégantes et sophistiquées',
    sans: {
      family: 'Lato, system-ui, sans-serif',
      weight: 300,
      size: '16px',
      lineHeight: 1.6
    },
    serif: {
      family: 'Crimson Text, Georgia, serif',
      weight: 400,
      size: '18px',
      lineHeight: 1.5
    },
    mono: {
      family: 'Source Code Pro, Consolas, Monaco, monospace',
      weight: 400,
      size: '14px',
      lineHeight: 1.5
    },
    display: {
      family: 'Playfair Display, Georgia, serif',
      weight: 700,
      size: '52px',
      lineHeight: 1.2
    },
    body: {
      family: 'Lato, system-ui, sans-serif',
      weight: 300,
      size: '16px',
      lineHeight: 1.6
    },
    heading: {
      family: 'Playfair Display, Georgia, serif',
      weight: 600,
      size: '28px',
      lineHeight: 1.3
    }
  }
};

/**
 * Système de tailles de police standard
 */
export const FONT_SIZE_SCALE = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
  '7xl': '72px',
  '8xl': '96px'
};

/**
 * Système de hauteurs de ligne standard
 */
export const LINE_HEIGHT_SCALE = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2
};

/**
 * Système de poids de police standard
 */
export const FONT_WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
};

/**
 * Système d'espacement des lettres
 */
export const LETTER_SPACING_SCALE = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
};

/**
 * Générer les variations de taille pour une police
 */
export function generateFontVariations(
  baseSize: string,
  scale: typeof FONT_SIZE_SCALE = FONT_SIZE_SCALE
): FontVariations {
  const basePx = parseInt(baseSize);
  const variations: FontVariations = {};

  Object.entries(scale).forEach(([key, size]) => {
    const sizePx = parseInt(size as string);
    const ratio = sizePx / basePx;
    variations[key] = `${ratio}rem`;
  });

  return variations;
}

/**
 * Créer une configuration de polices sémantique
 */
export function createSemanticFontConfig(
  baseFont: FontInfo,
  options: {
    includeDisplay?: boolean;
    includeHeading?: boolean;
    includeBody?: boolean;
    includeMono?: boolean;
  } = {}
): FontConfig {
  const {
    includeDisplay = true,
    includeHeading = true,
    includeBody = true,
    includeMono = true
  } = options;

  const config: FontConfig = {
    sans: [baseFont.family],
    serif: ['Georgia, Times New Roman, serif'],
    mono: ['JetBrains Mono, Consolas, Monaco, monospace'],
    xs: FONT_SIZE_SCALE.xs,
    sm: FONT_SIZE_SCALE.sm,
    base: FONT_SIZE_SCALE.base,
    lg: FONT_SIZE_SCALE.lg,
    xl: FONT_SIZE_SCALE.xl,
    '2xl': FONT_SIZE_SCALE['2xl'],
    '3xl': FONT_SIZE_SCALE['3xl'],
    '4xl': FONT_SIZE_SCALE['4xl'],
    '5xl': FONT_SIZE_SCALE['5xl'],
    '6xl': FONT_SIZE_SCALE['6xl'],
    light: FONT_WEIGHTS.light,
    normal: FONT_WEIGHTS.normal,
    medium: FONT_WEIGHTS.medium,
    semibold: FONT_WEIGHTS.semibold,
    bold: FONT_WEIGHTS.bold,
    extrabold: FONT_WEIGHTS.extrabold,
    lineHeightTight: LINE_HEIGHT_SCALE.tight,
    lineHeightNormal: LINE_HEIGHT_SCALE.normal,
    lineHeightRelaxed: LINE_HEIGHT_SCALE.relaxed,
    lineHeightLoose: LINE_HEIGHT_SCALE.loose,
    letterSpacingTight: LETTER_SPACING_SCALE.tight,
    letterSpacingNormal: LETTER_SPACING_SCALE.normal,
    letterSpacingWide: LETTER_SPACING_SCALE.wide
  };

  return config;
}

/**
 * Adapter les polices pour le mode sombre
 */
export function adaptFontsForDarkMode(fontConfig: FontConfig): FontConfig {
  // Pour le mode sombre, on augmente légèrement les poids des polices
  // mais la structure FontConfig ne permet pas de stocker les poids par famille
  // donc on retourne la même configuration
  return { ...fontConfig };
}

/**
 * Valider une famille de polices
 */
export function validateFontFamily(fontFamily: string): boolean {
  // Vérifier si la famille contient des caractères invalides
  const invalidChars = /[{}|\\^~[\]`"<>]/;
  return !invalidChars.test(fontFamily);
}

/**
 * Normaliser une information de police
 */
export function normalizeFontInfo(fontInfo: Partial<FontInfo>): FontInfo {
  return {
    family: fontInfo.family || 'Inter, system-ui, sans-serif',
    weight: fontInfo.weight || 400,
    style: fontInfo.style || 'normal',
    size: fontInfo.size || '16px',
    lineHeight: fontInfo.lineHeight || 1.5,
    letterSpacing: fontInfo.letterSpacing || 'normal'
  };
}

/**
 * Convertir une information de police en CSS
 */
export function fontInfoToCSS(fontInfo: FontInfo): string {
  const css: string[] = [];

  // Style
  if (fontInfo.style && fontInfo.style !== 'normal') {
    css.push(fontInfo.style);
  }

  // Weight
  if (fontInfo.weight) {
    css.push(fontInfo.weight.toString());
  }

  // Size
  if (fontInfo.size) {
    css.push(fontInfo.size);
  }

  // Line height
  if (fontInfo.lineHeight) {
    css.push(`/${fontInfo.lineHeight}`);
  }

  // Family
  css.push(fontInfo.family);

  return css.join(' ');
}

/**
 * Calculer le contraste de lisibilité d'une police
 */
export function calculateFontReadability(
  fontSize: number | string,
  fontWeight: number | string,
  lineHeight: number | string
): {
  score: number;
  recommendations: string[];
} {
  const sizePx = typeof fontSize === 'string'
    ? parseInt(fontSize)
    : fontSize;

  const weightNum = typeof fontWeight === 'string'
    ? parseInt(fontWeight) || 400
    : fontWeight;

  const lineHeightNum = typeof lineHeight === 'string'
    ? parseFloat(lineHeight) || 1.5
    : lineHeight;

  let score = 0;
  const recommendations: string[] = [];

  // Taille minimum recommandée
  if (sizePx < 14) {
    recommendations.push('Augmenter la taille de police à au moins 14px');
  } else if (sizePx >= 16) {
    score += 30;
  }

  // Poids minimum pour la lisibilité
  if (weightNum < 400) {
    recommendations.push('Utiliser un poids de police d\'au moins 400');
  } else if (weightNum >= 500) {
    score += 20;
  }

  // Hauteur de ligne optimale
  if (lineHeightNum < 1.3) {
    recommendations.push('Augmenter la hauteur de ligne à au moins 1.3');
  } else if (lineHeightNum >= 1.4 && lineHeightNum <= 1.6) {
    score += 25;
  }

  // Bonus pour les grandes tailles
  if (sizePx >= 18) {
    score += 15;
  }

  // Bonus pour les poids plus élevés
  if (weightNum >= 600) {
    score += 10;
  }

  return {
    score: Math.min(100, score),
    recommendations
  };
}

/**
 * Lister les presets de polices disponibles
 */
export function listFontPresets(): Array<{ key: string; preset: FontPreset }> {
  return Object.entries(FONT_PRESETS).map(([key, preset]) => ({
    key,
    preset
  }));
}

/**
 * Obtenir un preset de police par son nom
 */
export function getFontPreset(name: string): FontPreset | undefined {
  return FONT_PRESETS[name];
}

/**
 * Appliquer un preset de police à une configuration
 */
export function applyFontPreset(
  config: ThemeConfig,
  presetName: string
): ThemeConfig {
  const preset = FONT_PRESETS[presetName];
  if (!preset) {
    throw new Error(`Font preset "${presetName}" not found`);
  }

  const newConfig = { ...config };

  // Créer la configuration de polices pour le thème light
  // Convertir les FontInfo en tableaux de chaînes pour correspondre à FontConfig
  newConfig.fonts = {
    sans: [preset.sans.family],
    serif: [preset.serif.family],
    mono: [preset.mono.family],
    xs: FONT_SIZE_SCALE.xs,
    sm: FONT_SIZE_SCALE.sm,
    base: FONT_SIZE_SCALE.base,
    lg: FONT_SIZE_SCALE.lg,
    xl: FONT_SIZE_SCALE.xl,
    '2xl': FONT_SIZE_SCALE['2xl'],
    '3xl': FONT_SIZE_SCALE['3xl'],
    '4xl': FONT_SIZE_SCALE['4xl'],
    '5xl': FONT_SIZE_SCALE['5xl'],
    '6xl': FONT_SIZE_SCALE['6xl'],
    light: FONT_WEIGHTS.light,
    normal: FONT_WEIGHTS.normal,
    medium: FONT_WEIGHTS.medium,
    semibold: FONT_WEIGHTS.semibold,
    bold: FONT_WEIGHTS.bold,
    extrabold: FONT_WEIGHTS.extrabold,
    lineHeightTight: LINE_HEIGHT_SCALE.tight,
    lineHeightNormal: LINE_HEIGHT_SCALE.normal,
    lineHeightRelaxed: LINE_HEIGHT_SCALE.relaxed,
    lineHeightLoose: LINE_HEIGHT_SCALE.loose,
    letterSpacingTight: LETTER_SPACING_SCALE.tight,
    letterSpacingNormal: LETTER_SPACING_SCALE.normal,
    letterSpacingWide: LETTER_SPACING_SCALE.wide
  };

  return newConfig;
}

/**
 * Exporter les utilitaires par défaut
 */
export default {
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
};
