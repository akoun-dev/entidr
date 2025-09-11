import type { ThemeConfig } from './types';

/**
 * Interface pour les options d'espacement
 */
export interface SpacingOptions {
  // Unité de base (px, rem, em)
  unit?: 'px' | 'rem' | 'em';

  // Facteur d'échelle
  scale?: number;

  // Valeur de base
  base?: number;

  // Activer l'espacement fluide
  fluid?: boolean;

  // Breakpoints pour l'espacement responsive
  breakpoints?: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
}

/**
 * Interface pour les presets d'espacement
 */
export interface SpacingPreset {
  name: string;
  description: string;
  scale: Record<string, string>;
  options: SpacingOptions;
}

/**
 * Interface pour les informations d'espacement
 */
export interface SpacingInfo {
  // Valeur d'espacement
  value: string;

  // Valeur numérique
  numericValue: number;

  // Unité
  unit: string;

  // Nom sémantique
  semantic: string;

  // Breakpoint responsive
  breakpoint?: string;
}

/**
 * Système d'espacement standard
 */
export const SPACING_SCALE = {
  // Espacement minimal
  px: '1px',

  // Espacements de base (échelle de 4px)
  '0': '0',
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '3': '0.75rem',  // 12px
  '4': '1rem',     // 16px
  '5': '1.25rem',  // 20px
  '6': '1.5rem',   // 24px
  '7': '1.75rem',  // 28px
  '8': '2rem',     // 32px
  '9': '2.25rem',  // 36px
  '10': '2.5rem',  // 40px
  '11': '2.75rem', // 44px
  '12': '3rem',    // 48px
  '14': '3.5rem',  // 56px
  '16': '4rem',    // 64px
  '20': '5rem',    // 80px
  '24': '6rem',    // 96px
  '28': '7rem',    // 112px
  '32': '8rem',    // 128px
  '36': '9rem',    // 144px
  '40': '10rem',   // 160px
  '44': '11rem',   // 176px
  '48': '12rem',   // 192px
  '52': '13rem',   // 208px
  '56': '14rem',   // 224px
  '60': '15rem',   // 240px
  '64': '16rem',   // 256px
  '72': '18rem',   // 288px
  '80': '20rem',   // 320px
  '96': '24rem',   // 384px
} as const;

/**
 * Breakpoints responsive standard
 */
export const BREAKPOINTS = {
  sm: 640,   // 40rem
  md: 768,   // 48rem
  lg: 1024,  // 64rem
  xl: 1280,  // 80rem
  '2xl': 1536, // 96rem
} as const;

/**
 * Presets d'espacement prédéfinis
 */
export const SPACING_PRESETS: Record<string, SpacingPreset> = {
  compact: {
    name: 'Compact',
    description: 'Espacement réduit pour les interfaces denses',
    scale: {
      '0': '0',
      '1': '0.125rem', // 2px
      '2': '0.25rem',  // 4px
      '3': '0.375rem', // 6px
      '4': '0.5rem',   // 8px
      '5': '0.625rem', // 10px
      '6': '0.75rem',  // 12px
      '8': '1rem',     // 16px
      '10': '1.25rem', // 20px
      '12': '1.5rem',  // 24px
      '16': '2rem',    // 32px
      '20': '2.5rem',  // 40px
      '24': '3rem',    // 48px
      '32': '4rem',    // 64px
    },
    options: {
      unit: 'rem',
      scale: 2,
      base: 16,
      fluid: false
    }
  },

  comfortable: {
    name: 'Confortable',
    description: 'Espacement standard pour une bonne lisibilité',
    scale: SPACING_SCALE,
    options: {
      unit: 'rem',
      scale: 4,
      base: 16,
      fluid: false
    }
  },

  spacious: {
    name: 'Spacieux',
    description: 'Espacement généreux pour une aération maximale',
    scale: {
      '0': '0',
      '1': '0.5rem',   // 8px
      '2': '1rem',     // 16px
      '3': '1.5rem',   // 24px
      '4': '2rem',     // 32px
      '5': '2.5rem',   // 40px
      '6': '3rem',     // 48px
      '8': '4rem',     // 64px
      '10': '5rem',    // 80px
      '12': '6rem',    // 96px
      '16': '8rem',    // 128px
      '20': '10rem',   // 160px
      '24': '12rem',   // 192px
      '32': '16rem',   // 256px
    },
    options: {
      unit: 'rem',
      scale: 8,
      base: 16,
      fluid: false
    }
  },

  fluid: {
    name: 'Fluide',
    description: 'Espacement adaptatif qui s\'ajuste à la taille de l\'écran',
    scale: SPACING_SCALE,
    options: {
      unit: 'rem',
      scale: 4,
      base: 16,
      fluid: true,
      breakpoints: BREAKPOINTS
    }
  }
};

/**
 * Générer une échelle d'espacement personnalisée
 */
export function generateSpacingScale(options: SpacingOptions = {}): Record<string, string> {
  const {
    unit = 'rem',
    scale = 4,
    base = 16,
    fluid = false
  } = options;

  const spacingScale: Record<string, string> = {
    '0': '0'
  };

  // Générer les valeurs d'espacement
  const steps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96];

  steps.forEach((step, index) => {
    const value = (step * scale) / base;
    spacingScale[(index + 1).toString()] = `${value}${unit}`;
  });

  return spacingScale;
}

/**
 * Calculer l'espacement fluide entre deux breakpoints
 */
export function calculateFluidSpacing(
  minSize: number,
  maxSize: number,
  minBreakpoint: number,
  maxBreakpoint: number,
  viewportWidth: number
): string {
  if (viewportWidth <= minBreakpoint) {
    return `${minSize}px`;
  }

  if (viewportWidth >= maxBreakpoint) {
    return `${maxSize}px`;
  }

  // Calculer la pente
  const slope = (maxSize - minSize) / (maxBreakpoint - minBreakpoint);

  // Calculer l'intersection
  const intercept = minSize - slope * minBreakpoint;

  // Calculer la taille actuelle
  const currentSize = slope * viewportWidth + intercept;

  return `${Math.round(currentSize)}px`;
}

/**
 * Générer des variables CSS pour l'espacement
 */
export function generateSpacingVariables(
  spacingScale: Record<string, string>,
  prefix: string = '--spacing-'
): string {
  let css = '';

  Object.entries(spacingScale).forEach(([key, value]) => {
    css += `${prefix}${key}: ${value};\n`;
  });

  return css;
}

/**
 * Créer des utilitaires d'espacement CSS
 */
export function generateSpacingUtilities(
  spacingScale: Record<string, string>,
  properties: string[] = ['margin', 'padding', 'gap']
): string {
  let css = '';

  properties.forEach(property => {
    Object.entries(spacingScale).forEach(([key, value]) => {
      // Classes positives
      css += `.${property}-${key} { ${property}: ${value}; }\n`;
      css += `.${property}-t-${key} { ${property}-top: ${value}; }\n`;
      css += `.${property}-r-${key} { ${property}-right: ${value}; }\n`;
      css += `.${property}-b-${key} { ${property}-bottom: ${value}; }\n`;
      css += `.${property}-l-${key} { ${property}-left: ${value}; }\n`;
      css += `.${property}-x-${key} { ${property}-left: ${value}; ${property}-right: ${value}; }\n`;
      css += `.${property}-y-${key} { ${property}-top: ${value}; ${property}-bottom: ${value}; }\n`;

      // Classes négatives (pour margin)
      if (property === 'margin') {
        css += `.-${property}-${key} { ${property}: -${value}; }\n`;
        css += `.-${property}-t-${key} { ${property}-top: -${value}; }\n`;
        css += `.-${property}-r-${key} { ${property}-right: -${value}; }\n`;
        css += `.-${property}-b-${key} { ${property}-bottom: -${value}; }\n`;
        css += `.-${property}-l-${key} { ${property}-left: -${value}; }\n`;
        css += `.-${property}-x-${key} { ${property}-left: -${value}; ${property}-right: -${value}; }\n`;
        css += `.-${property}-y-${key} { ${property}-top: -${value}; ${property}-bottom: -${value}; }\n`;
      }

      // Classes auto
      css += `.${property}-auto { ${property}: auto; }\n`;
    });
  });

  return css;
}

/**
 * Convertir une valeur d'espacement en information structurée
 */
export function parseSpacingValue(value: string): SpacingInfo {
  // Extraire la valeur numérique et l'unité
  const match = value.match(/^(-?\d+\.?\d*)(px|rem|em|%)?$/);

  if (!match) {
    return {
      value,
      numericValue: 0,
      unit: '',
      semantic: 'custom'
    };
  }

  const numericValue = parseFloat(match[1]);
  const unit = match[2] || '';

  // Déterminer le nom sémantique
  let semantic = 'custom';
  if (unit === 'px') {
    if (numericValue === 0) semantic = 'none';
    else if (numericValue <= 4) semantic = 'tight';
    else if (numericValue <= 8) semantic = 'snug';
    else if (numericValue <= 16) semantic = 'normal';
    else if (numericValue <= 32) semantic = 'relaxed';
    else semantic = 'loose';
  } else if (unit === 'rem') {
    if (numericValue === 0) semantic = 'none';
    else if (numericValue <= 0.25) semantic = 'tight';
    else if (numericValue <= 0.5) semantic = 'snug';
    else if (numericValue <= 1) semantic = 'normal';
    else if (numericValue <= 2) semantic = 'relaxed';
    else semantic = 'loose';
  }

  return {
    value,
    numericValue,
    unit,
    semantic
  };
}

/**
 * Valider une valeur d'espacement
 */
export function validateSpacingValue(value: string): boolean {
  const validUnits = ['px', 'rem', 'em', '%', ''];
  const pattern = /^(-?\d+\.?\d*)(px|rem|em|%)?$/;

  if (!pattern.test(value)) {
    return false;
  }

  const match = value.match(/^(-?\d+\.?\d*)(px|rem|em|%)?$/);
  const unit = match?.[2] || '';

  return validUnits.includes(unit);
}

/**
 * Obtenir des recommandations d'espacement
 */
export function getSpacingRecommendations(
  currentSpacing: Record<string, string>,
  context: 'mobile' | 'desktop' | 'tablet' = 'desktop'
): string[] {
  const recommendations: string[] = [];

  // Vérifier la cohérence de l'échelle
  const values = Object.values(currentSpacing).map(v => parseSpacingValue(v));
  const numericValues = values.map(v => v.numericValue).filter(v => v > 0);

  if (numericValues.length > 0) {
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const ratio = max / min;

    if (ratio > 20) {
      recommendations.push('L\'échelle d\'espacement est très étendue. Considérez de réduire la plage pour plus de cohérence.');
    } else if (ratio < 4) {
      recommendations.push('L\'échelle d\'espacement est limitée. Vous pourriez avoir besoin de plus de variation pour une hiérarchie claire.');
    }
  }

  // Recommandations contextuelles
  if (context === 'mobile') {
    recommendations.push('Pour mobile, utilisez des espacements plus petits (4-16px) pour optimiser l\'espace limité.');
    recommendations.push('Évitez les espacements supérieurs à 32px sur mobile sauf pour les sections principales.');
  } else if (context === 'desktop') {
    recommendations.push('Pour desktop, vous pouvez utiliser une gamme plus large d\'espacements (8-64px).');
    recommendations.push('Assurez-vous d\'avoir suffisamment d\'espacement entre les sections pour une bonne respiration visuelle.');
  }

  // Vérifier l'utilisation des unités
  const hasRem = values.some(v => v.unit === 'rem');
  const hasPx = values.some(v => v.unit === 'px');

  if (hasPx && !hasRem) {
    recommendations.push('Envisagez d\'utiliser des unités rem pour l\'espacement pour une meilleure accessibilité et adaptabilité.');
  }

  return recommendations;
}

/**
 * Créer une configuration d'espacement pour le thème
 */
export function createSpacingConfig(
  preset: string = 'comfortable',
  customOptions?: Partial<SpacingOptions>
): ThemeConfig['spacing'] {
  const spacingPreset = SPACING_PRESETS[preset] || SPACING_PRESETS.comfortable;
  const scale = spacingPreset.scale;

  // Convertir l'échelle générique en SpacingConfig avec toutes les propriétés requises
  return {
    px: scale.px || '1px',
    '0.5': scale['0.5'] || scale['1'] || '0.125rem',
    '1': scale['1'] || '0.25rem',
    '1.5': scale['1.5'] || scale['2'] || '0.5rem',
    '2': scale['2'] || '0.5rem',
    '2.5': scale['2.5'] || scale['3'] || '0.75rem',
    '3': scale['3'] || '0.75rem',
    '4': scale['4'] || '1rem',
    '5': scale['5'] || '1.25rem',
    '6': scale['6'] || '1.5rem',
    '7': scale['7'] || '1.75rem',
    '8': scale['8'] || '2rem',
    '9': scale['9'] || '2.25rem',
    '10': scale['10'] || '2.5rem',
    '11': scale['11'] || '2.75rem',
    '12': scale['12'] || '3rem',
    '14': scale['14'] || '3.5rem',
    '16': scale['16'] || '4rem',
    '20': scale['20'] || '5rem',
    '24': scale['24'] || '6rem',
    '28': scale['28'] || '7rem',
    '32': scale['32'] || '8rem',
    '36': scale['36'] || '9rem',
    '40': scale['40'] || '10rem',
    '44': scale['44'] || '11rem',
    '48': scale['48'] || '12rem',
    '52': scale['52'] || '13rem',
    '56': scale['56'] || '14rem',
    '60': scale['60'] || '15rem',
    '64': scale['64'] || '16rem',
    '72': scale['72'] || '18rem',
    '80': scale['80'] || '20rem',
    '96': scale['96'] || '24rem'
  };
}

/**
 * Exporter les utilitaires par défaut
 */
export default {
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
};
