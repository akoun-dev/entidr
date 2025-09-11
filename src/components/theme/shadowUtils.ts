import type { ThemeConfig } from './types';

/**
 * Interface pour les options d'ombres
 */
export interface ShadowOptions {
  // Unité de base (px, rem, em)
  unit?: 'px' | 'rem' | 'em';

  // Facteur d'échelle
  scale?: number;

  // Valeur de base
  base?: number;

  // Activer les animations
  animations?: boolean;

  // Activer les ombres colorées
  coloredShadows?: boolean;
}

/**
 * Interface pour les presets d'ombres
 */
export interface ShadowPreset {
  name: string;
  description: string;
  shadows: Record<string, string>;
  options: ShadowOptions;
}

/**
 * Interface pour les informations d'ombre
 */
export interface ShadowInfo {
  // Valeur d'ombre
  value: string;

  // Valeur numérique du décalage
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;

  // Unité
  unit: string;

  // Couleur
  color: string;

  // Nom sémantique
  semantic: string;

  // Type d'ombre
  type: 'drop' | 'inner' | 'text';
}

/**
 * Système d'ombres standard
 */
export const SHADOW_SCALE = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '3xl': '0 35px 60px -15px rgb(0 0 0 / 0.3)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
} as const;

/**
 * Ombres colorées standard
 */
export const COLORED_SHADOWS = {
  primary: '0 4px 6px -1px hsl(var(--primary) / 0.3), 0 2px 4px -2px hsl(var(--primary) / 0.2)',
  secondary: '0 4px 6px -1px hsl(var(--secondary) / 0.3), 0 2px 4px -2px hsl(var(--secondary) / 0.2)',
  success: '0 4px 6px -1px hsl(var(--success) / 0.3), 0 2px 4px -2px hsl(var(--success) / 0.2)',
  warning: '0 4px 6px -1px hsl(var(--warning) / 0.3), 0 2px 4px -2px hsl(var(--warning) / 0.2)',
  error: '0 4px 6px -1px hsl(var(--destructive) / 0.3), 0 2px 4px -2px hsl(var(--destructive) / 0.2)',
  info: '0 4px 6px -1px hsl(var(--info) / 0.3), 0 2px 4px -2px hsl(var(--info) / 0.2)',
} as const;

/**
 * Presets d'ombres prédéfinis
 */
export const SHADOW_PRESETS: Record<string, ShadowPreset> = {
  minimal: {
    name: 'Minimal',
    description: 'Ombres subtiles et discrètes',
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      md: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
      lg: '0 4px 6px 0 rgb(0 0 0 / 0.1)',
      xl: '0 6px 8px 0 rgb(0 0 0 / 0.1)',
    },
    options: {
      unit: 'px',
      scale: 0.8,
      base: 16,
      animations: false,
      coloredShadows: false
    }
  },

  standard: {
    name: 'Standard',
    description: 'Ombres équilibrées pour usage général',
    shadows: SHADOW_SCALE,
    options: {
      unit: 'px',
      scale: 1,
      base: 16,
      animations: true,
      coloredShadows: true
    }
  },

  dramatic: {
    name: 'Dramatique',
    description: 'Ombres profondes et prononcées',
    shadows: {
      none: 'none',
      sm: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
      DEFAULT: '0 4px 8px 0 rgb(0 0 0 / 0.15)',
      md: '0 8px 16px 0 rgb(0 0 0 / 0.2)',
      lg: '0 16px 32px 0 rgb(0 0 0 / 0.25)',
      xl: '0 24px 48px 0 rgb(0 0 0 / 0.3)',
      '2xl': '0 32px 64px 0 rgb(0 0 0 / 0.35)',
      '3xl': '0 48px 96px 0 rgb(0 0 0 / 0.4)',
      inner: 'inset 0 4px 8px 0 rgb(0 0 0 / 0.2)',
    },
    options: {
      unit: 'px',
      scale: 1.5,
      base: 16,
      animations: true,
      coloredShadows: true
    }
  },

  modern: {
    name: 'Moderne',
    description: 'Ombres douces avec effets colorés',
    shadows: {
      none: 'none',
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      DEFAULT: '0 3px 6px 0 rgba(0, 0, 0, 0.15)',
      md: '0 6px 12px 0 rgba(0, 0, 0, 0.2)',
      lg: '0 12px 24px 0 rgba(0, 0, 0, 0.25)',
      xl: '0 18px 36px 0 rgba(0, 0, 0, 0.3)',
      '2xl': '0 24px 48px 0 rgba(0, 0, 0, 0.35)',
      '3xl': '0 36px 72px 0 rgba(0, 0, 0, 0.4)',
      inner: 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.15)',
    },
    options: {
      unit: 'px',
      scale: 1.2,
      base: 16,
      animations: true,
      coloredShadows: true
    }
  }
};

/**
 * Générer une échelle d'ombres personnalisée
 */
export function generateShadowScale(options: ShadowOptions = {}): Record<string, string> {
  const {
    unit = 'px',
    scale = 1,
    base = 16
  } = options;

  const shadowScale: Record<string, string> = {
    none: 'none'
  };

  // Générer les valeurs d'ombre
  const shadowDefinitions = [
    { key: 'sm', offsetX: 0, offsetY: 1, blur: 2, spread: 0, opacity: 0.05 },
    { key: 'DEFAULT', offsetX: 0, offsetY: 1, blur: 3, spread: 0, opacity: 0.1 },
    { key: 'md', offsetX: 0, offsetY: 4, blur: 6, spread: -1, opacity: 0.1 },
    { key: 'lg', offsetX: 0, offsetY: 10, blur: 15, spread: -3, opacity: 0.1 },
    { key: 'xl', offsetX: 0, offsetY: 20, blur: 25, spread: -5, opacity: 0.1 },
    { key: '2xl', offsetX: 0, offsetY: 25, blur: 50, spread: -12, opacity: 0.25 },
    { key: '3xl', offsetX: 0, offsetY: 35, blur: 60, spread: -15, opacity: 0.3 },
    { key: 'inner', offsetX: 0, offsetY: 2, blur: 4, spread: 0, opacity: 0.06, inset: true }
  ];

  shadowDefinitions.forEach(def => {
    const offsetX = (def.offsetX * scale) / (unit === 'rem' ? base : 1);
    const offsetY = (def.offsetY * scale) / (unit === 'rem' ? base : 1);
    const blur = (def.blur * scale) / (unit === 'rem' ? base : 1);
    const spread = (def.spread * scale) / (unit === 'rem' ? base : 1);

    const inset = def.inset ? 'inset ' : '';
    shadowScale[def.key] = `${inset}${offsetX}${unit} ${offsetY}${unit} ${blur}${unit} ${spread}${unit} rgb(0 0 0 / ${def.opacity})`;
  });

  return shadowScale;
}

/**
 * Générer des variables CSS pour les ombres
 */
export function generateShadowVariables(
  shadows: Record<string, string>,
  coloredShadows: Record<string, string> = {},
  shadowPrefix: string = '--shadow-',
  coloredPrefix: string = '--shadow-colored-'
): string {
  let css = '';

  // Variables d'ombre standard
  Object.entries(shadows).forEach(([key, value]) => {
    css += `${shadowPrefix}${key}: ${value};\n`;
  });

  // Variables d'ombre colorées
  Object.entries(coloredShadows).forEach(([key, value]) => {
    css += `${coloredPrefix}${key}: ${value};\n`;
  });

  return css;
}

/**
 * Créer des utilitaires d'ombre CSS
 */
export function generateShadowUtilities(
  shadows: Record<string, string>,
  coloredShadows: Record<string, string> = {},
  includeAnimations: boolean = true
): string {
  let css = '';

  // Utilitaires d'ombre standard
  Object.entries(shadows).forEach(([key, value]) => {
    css += `.shadow-${key.toLowerCase()} { box-shadow: ${value}; }\n`;
  });

  // Utilitaires d'ombre colorées
  Object.entries(coloredShadows).forEach(([key, value]) => {
    css += `.shadow-colored-${key} { box-shadow: ${value}; }\n`;
  });

  // Animations d'ombre
  if (includeAnimations) {
    css += `
/* Animations d'ombre */
@keyframes shadow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1); }
  50% { box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.2); }
}

@keyframes shadow-float {
  0%, 100% { transform: translateY(0px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
  50% { transform: translateY(-10px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
}

@keyframes shadow-glow {
  0%, 100% { box-shadow: 0 0 5px 0 hsl(var(--primary) / 0.5); }
  50% { box-shadow: 0 0 20px 10px hsl(var(--primary) / 0.8); }
}

.shadow-animate-pulse {
  animation: shadow-pulse 2s ease-in-out infinite;
}

.shadow-animate-float {
  animation: shadow-float 3s ease-in-out infinite;
}

.shadow-animate-glow {
  animation: shadow-glow 2s ease-in-out infinite;
}
`;
  }

  return css;
}

/**
 * Convertir une valeur d'ombre en information structurée
 */
export function parseShadowValue(value: string): ShadowInfo {
  if (value === 'none') {
    return {
      value: 'none',
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      spread: 0,
      unit: 'px',
      color: 'transparent',
      semantic: 'none',
      type: 'drop'
    };
  }

  const insetRegex = /^inset\s+/;
  const isInset = insetRegex.test(value);
  const cleanValue = value.replace(insetRegex, '');

  const parts = cleanValue.match(/(\d+\.?\d*)(px|rem|em)?\s+(\d+\.?\d*)(px|rem|em)?\s+(\d+\.?\d*)(px|rem|em)?\s+(\d+\.?\d*)(px|rem|em)?\s+(.*)$/);

  if (!parts) {
    return {
      value,
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      spread: 0,
      unit: 'px',
      color: 'rgb(0 0 0 / 0.1)',
      semantic: 'custom',
      type: isInset ? 'inner' : 'drop'
    };
  }

  const offsetX = parseFloat(parts[1]);
  const offsetY = parseFloat(parts[3]);
  const blur = parseFloat(parts[5]);
  const spread = parseFloat(parts[7]);
  const unit = parts[2] || parts[4] || parts[6] || parts[8] || 'px';
  const color = parts[9];

  // Déterminer le nom sémantique
  let semantic = 'custom';
  if (offsetX === 0 && offsetY === 0 && blur <= 2) semantic = 'subtle';
  else if (offsetX === 0 && offsetY <= 4 && blur <= 8) semantic = 'light';
  else if (offsetX === 0 && offsetY <= 10 && blur <= 15) semantic = 'medium';
  else if (offsetX === 0 && offsetY <= 20 && blur <= 25) semantic = 'heavy';
  else if (offsetX === 0 && offsetY > 20) semantic = 'dramatic';

  return {
    value,
    offsetX,
    offsetY,
    blur,
    spread,
    unit,
    color,
    semantic,
    type: isInset ? 'inner' : 'drop'
  };
}

/**
 * Valider une valeur d'ombre
 */
export function validateShadowValue(value: string): boolean {
  if (value === 'none') return true;

  const insetRegex = /^inset\s+/;
  const cleanValue = value.replace(insetRegex, '');

  const shadowRegex = /^(\d+\.?\d*)(px|rem|em)?\s+(\d+\.?\d*)(px|rem|em)?\s+(\d+\.?\d*)(px|rem|em)?\s+(\d+\.?\d*)(px|rem|em)?\s+(.*)$/;
  return shadowRegex.test(cleanValue);
}

/**
 * Obtenir des recommandations d'ombres
 */
export function getShadowRecommendations(
  currentShadows: Record<string, string>,
  context: 'mobile' | 'desktop' | 'tablet' = 'desktop'
): string[] {
  const recommendations: string[] = [];

  // Vérifier la cohérence des ombres
  const shadowValues = Object.values(currentShadows).map(v => parseShadowValue(v));
  const maxBlur = Math.max(...shadowValues.map(v => v.blur));

  if (maxBlur > 20 && context === 'mobile') {
    recommendations.push('Pour mobile, utilisez des ombres plus légères (blur ≤ 20px) pour optimiser la performance.');
  }

  // Vérifier l'utilisation d'ombres colorées
  const hasColoredShadows = Object.keys(currentShadows).some(key => key.includes('colored'));

  if (!hasColoredShadows && context === 'desktop') {
    recommendations.push('Pour desktop, envisagez d\'utiliser des ombres colorées pour un effet visuel plus riche.');
  }

  // Recommandations contextuelles
  if (context === 'mobile') {
    recommendations.push('Utilisez des ombres simples et légères pour une meilleure performance sur mobile.');
    recommendations.push('Évitez les ombres multiples sur les petits écrans.');
  } else if (context === 'desktop') {
    recommendations.push('Vous pouvez utiliser des ombres plus complexes et colorées sur desktop.');
    recommendations.push('Les animations d\'ombre sont recommandées pour les interactions.');
  }

  // Vérifier l'utilisation des unités
  const hasRem = shadowValues.some(v => v.unit === 'rem');
  const hasPx = shadowValues.some(v => v.unit === 'px');

  if (hasPx && !hasRem) {
    recommendations.push('Envisagez d\'utiliser des unités rem pour une meilleure accessibilité.');
  }

  return recommendations;
}

/**
 * Créer une configuration d'ombre pour le thème
 */
export function createShadowConfig(
  preset: string = 'standard',
  customOptions?: Partial<ShadowOptions>
): Partial<ThemeConfig> {
  const shadowPreset = SHADOW_PRESETS[preset] || SHADOW_PRESETS.standard;
  const options = { ...shadowPreset.options, ...customOptions };

  return {
    shadows: {
      none: shadowPreset.shadows.none || 'none',
      sm: shadowPreset.shadows.sm || '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: shadowPreset.shadows.DEFAULT || '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      md: shadowPreset.shadows.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: shadowPreset.shadows.lg || '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: shadowPreset.shadows.xl || '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      '2xl': shadowPreset.shadows['2xl'] || '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      '3xl': shadowPreset.shadows['3xl'] || '0 35px 60px -15px rgb(0 0 0 / 0.3)',
      inner: shadowPreset.shadows.inner || 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
      coloredPrimary: COLORED_SHADOWS.primary,
      coloredSecondary: COLORED_SHADOWS.secondary,
      coloredSuccess: COLORED_SHADOWS.success,
      coloredWarning: COLORED_SHADOWS.warning,
      coloredError: COLORED_SHADOWS.error,
      coloredInfo: COLORED_SHADOWS.info,
    }
  };
}

/**
 * Exporter les utilitaires par défaut
 */
export default {
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
};
