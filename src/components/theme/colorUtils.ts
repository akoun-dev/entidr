import type { ColorPalette } from './types';

/**
 * Types pour les variations de couleurs
 */
export type ColorVariation = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type ColorShade = 'lighter' | 'light' | 'base' | 'dark' | 'darker';

/**
 * Interface pour les informations de couleur
 */
export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  luminance: number;
}

/**
 * Interface pour les variations de couleur générées
 */
export interface ColorVariations {
  [key: string]: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

/**
 * Convertir une couleur hexadécimale en RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convertir RGB en HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Convertir HSL en RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Convertir RGB en hexadécimal
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Calculer la luminance d'une couleur
 */
export function calculateLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  const gamma = (color: number) => {
    return color <= 0.03928 ? color / 12.92 : Math.pow((color + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * gamma(r) + 0.7152 * gamma(g) + 0.0722 * gamma(b);
}

/**
 * Calculer le ratio de contraste entre deux couleurs
 */
export function calculateContrast(color1: string, color2: string): number {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Vérifier si le contraste respecte les normes WCAG
 */
export function checkWCAGContrast(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): {
  passes: boolean;
  ratio: number;
  requiredRatio: number;
} {
  const ratio = calculateContrast(color1, color2);
  const requiredRatio = level === 'AA' ? 4.5 : 7;

  return {
    passes: ratio >= requiredRatio,
    ratio,
    requiredRatio
  };
}

/**
 * Éclaircir une couleur
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const newLightness = Math.min(100, hsl.l + percent);
  const newRgb = hslToRgb(hsl.h, hsl.s, newLightness);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Assombrir une couleur
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const newLightness = Math.max(0, hsl.l - percent);
  const newRgb = hslToRgb(hsl.h, hsl.s, newLightness);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Générer des variations de couleur
 */
export function generateColorVariations(baseColor: string): ColorVariations {
  const variations: ColorVariations = {
    50: lightenColor(baseColor, 45),
    100: lightenColor(baseColor, 35),
    200: lightenColor(baseColor, 25),
    300: lightenColor(baseColor, 15),
    400: lightenColor(baseColor, 5),
    500: baseColor,
    600: darkenColor(baseColor, 5),
    700: darkenColor(baseColor, 15),
    800: darkenColor(baseColor, 25),
    900: darkenColor(baseColor, 35)
  };

  return variations;
}

/**
 * Obtenir des informations détaillées sur une couleur
 */
export function getColorInfo(hex: string): ColorInfo {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const luminance = calculateLuminance(hex);

  return {
    hex,
    rgb,
    hsl,
    luminance
  };
}

/**
 * Créer une palette de couleurs sémantiques à partir d'une couleur primaire
 */
export function createSemanticPalette(primaryColor: string): Partial<ColorPalette> {
  const variations = generateColorVariations(primaryColor);
  const colorInfo = getColorInfo(primaryColor);

  // Générer des couleurs complémentaires basées sur la teinte
  const complementaryHue = (colorInfo.hsl.h + 180) % 360;
  const analogousHue1 = (colorInfo.hsl.h + 30) % 360;
  const analogousHue2 = (colorInfo.hsl.h - 30 + 360) % 360;

  const complementaryRgb = hslToRgb(complementaryHue, colorInfo.hsl.s, colorInfo.hsl.l);
  const analogous1Rgb = hslToRgb(analogousHue1, colorInfo.hsl.s, colorInfo.hsl.l);
  const analogous2Rgb = hslToRgb(analogousHue2, colorInfo.hsl.s, colorInfo.hsl.l);

  return {
    primary: primaryColor,
    secondary: rgbToHex(analogous1Rgb.r, analogous1Rgb.g, analogous1Rgb.b),
    accent: rgbToHex(analogous2Rgb.r, analogous2Rgb.g, analogous2Rgb.b),
    neutral: '#6b7280',

    // Couleurs de fond
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    dialog: '#ffffff',

    // Couleurs de texte
    text: '#1f2937',
    textSecondary: '#6b7280',
    textDisabled: '#9ca3af',
    textInverse: '#ffffff',

    // Couleurs de bordure
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderStrong: '#d1d5db',

    // Couleurs d'état
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b),

    // Couleurs interactives
    hover: variations['100'],
    active: variations['200'],
    focus: primaryColor,
    selected: variations['100'],

    // Couleurs d'ombre
    shadow: '#000000',
    shadowLight: '#00000020',
    shadowStrong: '#00000040'
  };
}

/**
 * Ajuster une palette pour le mode sombre
 */
export function adaptPaletteForDarkMode(palette: Partial<ColorPalette>): Partial<ColorPalette> {
  if (!palette.primary) return palette;

  const primaryInfo = getColorInfo(palette.primary);
  const variations = generateColorVariations(palette.primary);

  return {
    ...palette,
    primary: variations['400'],
    secondary: palette.secondary ? lightenColor(palette.secondary, 10) : '#94a3b8',
    accent: palette.accent ? lightenColor(palette.accent, 10) : '#a78bfa',
    neutral: '#9ca3af',

    // Couleurs de fond plus sombres
    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',
    dialog: '#1e293b',

    // Couleurs de texte plus claires
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
    textInverse: '#0f172a',

    // Couleurs de bordure adaptées
    border: '#334155',
    borderLight: '#475569',
    borderStrong: '#1e293b',

    // Couleurs d'état plus lumineuses
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: palette.info ? lightenColor(palette.info, 10) : '#60a5fa',

    // Couleurs interactives adaptées
    hover: '#334155',
    active: '#475569',
    focus: variations['400'],
    selected: '#1e3a8a',

    // Couleurs d'ombre plus intenses
    shadow: '#000000',
    shadowLight: '#00000030',
    shadowStrong: '#00000060'
  };
}

/**
 * Présets de couleurs prédéfinis
 */
export const COLOR_PRESETS = {
  // Présets modernes
  modern: {
    name: 'Moderne',
    primary: '#3b82f6',
    description: 'Bleu moderne et professionnel'
  },

  // Présets naturels
  nature: {
    name: 'Nature',
    primary: '#10b981',
    description: 'Vert inspiré de la nature'
  },

  // Présets créatifs
  creative: {
    name: 'Créatif',
    primary: '#8b5cf6',
    description: 'Violet créatif et inspirant'
  },

  // Présets énergiques
  energetic: {
    name: 'Énergique',
    primary: '#f59e0b',
    description: 'Orange énergique et vibrant'
  },

  // Présets élégants
  elegant: {
    name: 'Élégant',
    primary: '#6366f1',
    description: 'Indigo élégant et sophistiqué'
  },

  // Présets minimalistes
  minimalist: {
    name: 'Minimaliste',
    primary: '#6b7280',
    description: 'Gris minimaliste et épuré'
  },

  // Présets passionnés
  passionate: {
    name: 'Passionné',
    primary: '#ef4444',
    description: 'Rouge passionné et audacieux'
  },

  // Présets calmes
  calm: {
    name: 'Calme',
    primary: '#06b6d4',
    description: 'Cyan calme et apaisant'
  }
};

/**
 * Obtenir un preset de couleur par son nom
 */
export function getColorPreset(name: keyof typeof COLOR_PRESETS): typeof COLOR_PRESETS[keyof typeof COLOR_PRESETS] {
  return COLOR_PRESETS[name];
}

/**
 * Lister tous les presets de couleurs disponibles
 */
export function listColorPresets(): Array<{
  name: keyof typeof COLOR_PRESETS;
  displayName: string;
  primary: string;
  description: string;
}> {
  return Object.entries(COLOR_PRESETS).map(([key, value]) => ({
    name: key as keyof typeof COLOR_PRESETS,
    displayName: value.name,
    primary: value.primary,
    description: value.description
  }));
}

/**
 * Valider une couleur hexadécimale
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Normaliser une couleur hexadécimale
 */
export function normalizeHexColor(hex: string): string {
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  return '#' + hex.toLowerCase();
}

/**
 * Générer une couleur aléatoire
 */
export function generateRandomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
  const lightness = Math.floor(Math.random() * 20) + 40; // 40-60%

  const rgb = hslToRgb(hue, saturation, lightness);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Calculer la couleur de texte optimale pour un fond donné
 */
export function getOptimalTextColor(backgroundColor: string): string {
  const luminance = calculateLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Ajuster la saturation d'une couleur
 */
export function adjustSaturation(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const newSaturation = Math.max(0, Math.min(100, hsl.s + percent));
  const newRgb = hslToRgb(hsl.h, newSaturation, hsl.l);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Ajuster la teinte d'une couleur
 */
export function adjustHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const newHue = (hsl.h + degrees + 360) % 360;
  const newRgb = hslToRgb(newHue, hsl.s, hsl.l);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}
