import type { ThemeConfig } from './types';

/**
 * Interface pour les options de bordure
 */
export interface BorderOptions {
  // Unité de base (px, rem, em)
  unit?: 'px' | 'rem' | 'em';

  // Facteur d'échelle
  scale?: number;

  // Valeur de base
  base?: number;

  // Activer les animations
  animations?: boolean;

  // Activer les rayons personnalisés
  customRadii?: boolean;
}

/**
 * Interface pour les presets de bordure
 */
export interface BorderPreset {
  name: string;
  description: string;
  widths: Record<string, string>;
  styles: Record<string, string>;
  radii: Record<string, string>;
  options: BorderOptions;
}

/**
 * Interface pour les informations de bordure
 */
export interface BorderInfo {
  // Valeur de bordure
  value: string;

  // Valeur numérique
  numericValue: number;

  // Unité
  unit: string;

  // Type de bordure
  type: 'width' | 'style' | 'radius';

  // Nom sémantique
  semantic: string;

  // Style CSS
  style?: string;
}

/**
 * Système de largeurs de bordure standard
 */
export const BORDER_WIDTH_SCALE = {
  none: '0',
  px: '1px',
  '0.5': '0.5px',
  '1': '1px',
  '1.5': '1.5px',
  '2': '2px',
  '3': '3px',
  '4': '4px',
  '6': '6px',
  '8': '8px',
  '12': '12px',
  '16': '16px',
  '24': '24px',
} as const;

/**
 * Styles de bordure standard
 */
export const BORDER_STYLES = {
  none: 'none',
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  double: 'double',
  groove: 'groove',
  ridge: 'ridge',
  inset: 'inset',
  outset: 'outset',
} as const;

/**
 * Rayons de bordure standard
 */
export const BORDER_RADIUS_SCALE = {
  none: '0',
  px: '1px',
  sm: '0.125rem',  // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',  // Pour les coins arrondis complets
} as const;

/**
 * Presets de bordure prédéfinis
 */
export const BORDER_PRESETS: Record<string, BorderPreset> = {
  minimal: {
    name: 'Minimal',
    description: 'Bordures fines et subtiles',
    widths: {
      none: '0',
      px: '1px',
      thin: '0.5px',
      light: '1px',
      regular: '1.5px',
      medium: '2px',
    },
    styles: {
      none: 'none',
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
    },
    radii: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
    },
    options: {
      unit: 'px',
      scale: 1,
      base: 16,
      animations: false,
      customRadii: false
    }
  },

  standard: {
    name: 'Standard',
    description: 'Bordures équilibrées pour usage général',
    widths: BORDER_WIDTH_SCALE,
    styles: BORDER_STYLES,
    radii: BORDER_RADIUS_SCALE,
    options: {
      unit: 'px',
      scale: 1,
      base: 16,
      animations: true,
      customRadii: true
    }
  },

  bold: {
    name: 'Audacieux',
    description: 'Bordures épaisses et prononcées',
    widths: {
      none: '0',
      px: '1px',
      thin: '1px',
      light: '2px',
      regular: '3px',
      medium: '4px',
      thick: '6px',
      heavy: '8px',
      extra: '12px',
      ultra: '16px',
      massive: '24px',
    },
    styles: {
      none: 'none',
      solid: 'solid',
      double: 'double',
      groove: 'groove',
      ridge: 'ridge',
    },
    radii: {
      none: '0',
      sm: '0.25rem',
      DEFAULT: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
      full: '9999px',
    },
    options: {
      unit: 'px',
      scale: 2,
      base: 16,
      animations: true,
      customRadii: true
    }
  },

  modern: {
    name: 'Moderne',
    description: 'Bordures avec animations et effets',
    widths: BORDER_WIDTH_SCALE,
    styles: BORDER_STYLES,
    radii: BORDER_RADIUS_SCALE,
    options: {
      unit: 'rem',
      scale: 1,
      base: 16,
      animations: true,
      customRadii: true
    }
  }
};

/**
 * Générer une échelle de largeurs de bordure personnalisée
 */
export function generateBorderWidths(options: BorderOptions = {}): Record<string, string> {
  const {
    unit = 'px',
    scale = 1,
    base = 16
  } = options;

  const borderScale: Record<string, string> = {
    none: '0',
    px: '1px'
  };

  // Générer les valeurs de largeur
  const widths = [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24];

  widths.forEach((width, index) => {
    const value = (width * scale) / (unit === 'rem' ? base : 1);
    const key = index === 0 ? '0.5' : width.toString();
    borderScale[key] = `${value}${unit}`;
  });

  return borderScale;
}

/**
 * Générer des variables CSS pour les bordures
 */
export function generateBorderVariables(
  widths: Record<string, string>,
  styles: Record<string, string>,
  radii: Record<string, string>,
  widthPrefix: string = '--border-width-',
  stylePrefix: string = '--border-style-',
  radiusPrefix: string = '--border-radius-'
): string {
  let css = '';

  // Variables de largeur
  Object.entries(widths).forEach(([key, value]) => {
    css += `${widthPrefix}${key}: ${value};\n`;
  });

  // Variables de style
  Object.entries(styles).forEach(([key, value]) => {
    css += `${stylePrefix}${key}: ${value};\n`;
  });

  // Variables de rayon
  Object.entries(radii).forEach(([key, value]) => {
    css += `${radiusPrefix}${key}: ${value};\n`;
  });

  return css;
}

/**
 * Créer des utilitaires de bordure CSS
 */
export function generateBorderUtilities(
  widths: Record<string, string>,
  styles: Record<string, string>,
  radii: Record<string, string>,
  includeAnimations: boolean = true
): string {
  let css = '';

  // Utilitaires de largeur
  Object.entries(widths).forEach(([key, value]) => {
    css += `.border-${key} { border-width: ${value}; }\n`;
    css += `.border-t-${key} { border-top-width: ${value}; }\n`;
    css += `.border-r-${key} { border-right-width: ${value}; }\n`;
    css += `.border-b-${key} { border-bottom-width: ${value}; }\n`;
    css += `.border-l-${key} { border-left-width: ${value}; }\n`;
    css += `.border-x-${key} { border-left-width: ${value}; border-right-width: ${value}; }\n`;
    css += `.border-y-${key} { border-top-width: ${value}; border-bottom-width: ${value}; }\n`;
  });

  // Utilitaires de style
  Object.entries(styles).forEach(([key, value]) => {
    css += `.border-${key} { border-style: ${value}; }\n`;
  });

  // Utilitaires de rayon
  Object.entries(radii).forEach(([key, value]) => {
    css += `.rounded-${key.toLowerCase()} { border-radius: ${value}; }\n`;
    css += `.rounded-t-${key.toLowerCase()} { border-top-left-radius: ${value}; border-top-right-radius: ${value}; }\n`;
    css += `.rounded-r-${key.toLowerCase()} { border-top-right-radius: ${value}; border-bottom-right-radius: ${value}; }\n`;
    css += `.rounded-b-${key.toLowerCase()} { border-bottom-left-radius: ${value}; border-bottom-right-radius: ${value}; }\n`;
    css += `.rounded-l-${key.toLowerCase()} { border-top-left-radius: ${value}; border-bottom-left-radius: ${value}; }\n`;
    css += `.rounded-tl-${key.toLowerCase()} { border-top-left-radius: ${value}; }\n`;
    css += `.rounded-tr-${key.toLowerCase()} { border-top-right-radius: ${value}; }\n`;
    css += `.rounded-bl-${key.toLowerCase()} { border-bottom-left-radius: ${value}; }\n`;
    css += `.rounded-br-${key.toLowerCase()} { border-bottom-right-radius: ${value}; }\n`;
  });

  // Animations de bordure
  if (includeAnimations) {
    css += `
/* Animations de bordure */
@keyframes border-pulse {
  0%, 100% { border-color: hsl(var(--border)); }
  50% { border-color: hsl(var(--primary)); }
}

@keyframes border-glow {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.5); }
  50% { box-shadow: 0 0 0 8px hsl(var(--primary) / 0); }
}

@keyframes border-slide {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.border-animate-pulse {
  animation: border-pulse 2s ease-in-out infinite;
}

.border-animate-glow {
  animation: border-glow 2s ease-in-out infinite;
}

.border-animate-slide {
  background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent);
  background-size: 200% 100%;
  animation: border-slide 3s linear infinite;
}
`;
  }

  return css;
}

/**
 * Convertir une valeur de bordure en information structurée
 */
export function parseBorderValue(value: string, type: 'width' | 'style' | 'radius' = 'width'): BorderInfo {
  let numericValue = 0;
  let unit = '';
  let semantic = 'custom';

  if (type === 'width' || type === 'radius') {
    // Extraire la valeur numérique et l'unité
    const match = value.match(/^(\d+\.?\d*)(px|rem|em)?$/);
    if (match) {
      numericValue = parseFloat(match[1]);
      unit = match[2] || 'px';
    }

    // Déterminer le nom sémantique
    if (type === 'width') {
      if (numericValue === 0) semantic = 'none';
      else if (numericValue <= 0.5) semantic = 'hairline';
      else if (numericValue <= 1) semantic = 'thin';
      else if (numericValue <= 2) semantic = 'light';
      else if (numericValue <= 4) semantic = 'regular';
      else if (numericValue <= 8) semantic = 'medium';
      else if (numericValue <= 16) semantic = 'thick';
      else semantic = 'heavy';
    } else if (type === 'radius') {
      if (numericValue === 0) semantic = 'none';
      else if (numericValue <= 2) semantic = 'small';
      else if (numericValue <= 4) semantic = 'default';
      else if (numericValue <= 8) semantic = 'medium';
      else if (numericValue <= 16) semantic = 'large';
      else if (value === '9999px') semantic = 'full';
      else semantic = 'extra-large';
    }
  } else if (type === 'style') {
    semantic = value;
    unit = 'style';
  }

  return {
    value,
    numericValue,
    unit,
    type,
    semantic,
    style: type === 'style' ? value : undefined
  };
}

/**
 * Valider une valeur de bordure
 */
export function validateBorderValue(value: string, type: 'width' | 'style' | 'radius' = 'width'): boolean {
  if (type === 'style') {
    return Object.values(BORDER_STYLES).includes(value as any);
  }

  const validUnits = ['px', 'rem', 'em', ''];
  const pattern = /^(\d+\.?\d*)(px|rem|em)?$/;

  if (!pattern.test(value)) {
    return false;
  }

  const match = value.match(/^(\d+\.?\d*)(px|rem|em)?$/);
  const unit = match?.[2] || '';

  return validUnits.includes(unit);
}

/**
 * Obtenir des recommandations de bordure
 */
export function getBorderRecommendations(
  currentWidths: Record<string, string>,
  currentStyles: Record<string, string>,
  currentRadii: Record<string, string>,
  context: 'mobile' | 'desktop' | 'tablet' = 'desktop'
): string[] {
  const recommendations: string[] = [];

  // Vérifier la cohérence des largeurs
  const widthValues = Object.values(currentWidths).map(v => parseBorderValue(v, 'width'));
  const numericWidths = widthValues.map(v => v.numericValue).filter(v => v > 0);

  if (numericWidths.length > 0) {
    const maxWidth = Math.max(...numericWidths);
    if (maxWidth > 4 && context === 'mobile') {
      recommendations.push('Pour mobile, utilisez des bordures plus fines (≤4px) pour optimiser l\'espace.');
    }
  }

  // Vérifier les rayons
  const radiusValues = Object.values(currentRadii).map(v => parseBorderValue(v, 'radius'));
  const hasLargeRadii = radiusValues.some(v => v.numericValue > 16);

  if (hasLargeRadii && context === 'mobile') {
    recommendations.push('Pour mobile, utilisez des rayons plus petits (≤16px) pour un meilleur rendu.');
  }

  // Recommandations contextuelles
  if (context === 'mobile') {
    recommendations.push('Utilisez des bordures simples (solid) pour une meilleure performance sur mobile.');
    recommendations.push('Évitez les bordures doubles ou complexes sur les petits écrans.');
  } else if (context === 'desktop') {
    recommendations.push('Vous pouvez utiliser des bordures plus créatives sur desktop.');
    recommendations.push('Les animations de bordure sont recommandées pour les interactions.');
  }

  // Vérifier l'utilisation des unités
  const hasRem = [...widthValues, ...radiusValues].some(v => v.unit === 'rem');
  const hasPx = [...widthValues, ...radiusValues].some(v => v.unit === 'px');

  if (hasPx && !hasRem) {
    recommendations.push('Envisagez d\'utiliser des unités rem pour une meilleure accessibilité.');
  }

  return recommendations;
}

/**
 * Créer une configuration de bordure pour le thème
 */
export function createBorderConfig(
  preset: string = 'standard',
  customOptions?: Partial<BorderOptions>
): Partial<ThemeConfig> {
  const borderPreset = BORDER_PRESETS[preset] || BORDER_PRESETS.standard;
  const options = { ...borderPreset.options, ...customOptions };

  return {
    borders: {
      widthNone: borderPreset.widths.none || '0',
      widthSm: borderPreset.widths['0.5'] || '0.5px',
      widthMd: borderPreset.widths['1'] || '1px',
      widthLg: borderPreset.widths['2'] || '2px',
      widthXl: borderPreset.widths['3'] || '3px',
      width2xl: borderPreset.widths['4'] || '4px',
      width3xl: borderPreset.widths['6'] || '6px',
      solid: borderPreset.styles.solid || 'solid',
      dashed: borderPreset.styles.dashed || 'dashed',
      dotted: borderPreset.styles.dotted || 'dotted',
      double: borderPreset.styles.double || 'double',
      groove: borderPreset.styles.groove || 'groove',
      ridge: borderPreset.styles.ridge || 'ridge',
      inset: borderPreset.styles.inset || 'inset',
      outset: borderPreset.styles.outset || 'outset',
      radiusNone: borderPreset.radii.none || '0',
      radiusSm: borderPreset.radii.sm || '0.125rem',
      radiusMd: borderPreset.radii.DEFAULT || '0.25rem',
      radiusLg: borderPreset.radii.lg || '0.5rem',
      radiusXl: borderPreset.radii.xl || '0.75rem',
      radius2xl: borderPreset.radii['2xl'] || '1rem',
      radius3xl: borderPreset.radii['3xl'] || '1.5rem',
      radiusFull: borderPreset.radii.full || '9999px',
    }
  };
}

/**
 * Exporter les utilitaires par défaut
 */
export default {
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
};
