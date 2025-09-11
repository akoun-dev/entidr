import type { CSSProperties } from 'react';

/**
 * Types de thème disponibles
 */
export type ThemeType = 'light' | 'dark' | 'auto' | 'custom';

/**
 * Modes de détection du thème
 */
export type ThemeDetectionMode = 'system' | 'user' | 'auto';

/**
 * Palette de couleurs sémantiques
 */
export interface ColorPalette {
  // Couleurs principales
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;

  // Couleurs de fond
  background: string;
  surface: string;
  card: string;
  dialog: string;

  // Couleurs de texte
  text: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;

  // Couleurs de bordure
  border: string;
  borderLight: string;
  borderStrong: string;

  // Couleurs d'état
  success: string;
  warning: string;
  error: string;
  info: string;

  // Couleurs interactives
  hover: string;
  active: string;
  focus: string;
  selected: string;

  // Couleurs d'ombre
  shadow: string;
  shadowLight: string;
  shadowStrong: string;
}

/**
 * Configuration des polices
 */
export interface FontConfig {
  // Familles de polices
  sans: string[];
  serif: string[];
  mono: string[];

  // Tailles de police (en rem ou px)
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;

  // Poids de police
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;

  // Hauteur de ligne
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
  lineHeightLoose: number;

  // Espacement des lettres
  letterSpacingTight: string;
  letterSpacingNormal: string;
  letterSpacingWide: string;
}

/**
 * Configuration de l'espacement
 */
export interface SpacingConfig {
  // Échelle d'espacement (en rem ou px)
  px: string;
  '0.5': string;
  '1': string;
  '1.5': string;
  '2': string;
  '2.5': string;
  '3': string;
  '4': string;
  '5': string;
  '6': string;
  '7': string;
  '8': string;
  '9': string;
  '10': string;
  '11': string;
  '12': string;
  '14': string;
  '16': string;
  '20': string;
  '24': string;
  '28': string;
  '32': string;
  '36': string;
  '40': string;
  '44': string;
  '48': string;
  '52': string;
  '56': string;
  '60': string;
  '64': string;
  '72': string;
  '80': string;
  '96': string;
}

/**
 * Configuration des bordures
 */
export interface BorderConfig {
  // Largeur des bordures
  widthNone: string;
  widthSm: string;
  widthMd: string;
  widthLg: string;
  widthXl: string;
  width2xl: string;
  width3xl: string;

  // Style des bordures
  solid: string;
  dashed: string;
  dotted: string;
  double: string;
  groove: string;
  ridge: string;
  inset: string;
  outset: string;

  // Rayons des bordures
  radiusNone: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radius2xl: string;
  radius3xl: string;
  radiusFull: string;
}

/**
 * Configuration des ombres
 */
export interface ShadowConfig {
  // Ombres simples
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;

  // Ombres colorées
  colored: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Ombres internes
  inner: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Configuration des animations
 */
export interface AnimationConfig {
  // Durées
  fast: string;
  normal: string;
  slow: string;

  // Easings
  linear: string;
  ease: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;

  // Delais
  short: string;
  medium: string;
  long: string;
}

/**
 * Configuration des breakpoints
 */
export interface BreakpointConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Configuration complète du thème
 */
export interface ThemeConfig {
  // Métadonnées
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;

  // Type et mode
  type: ThemeType;
  detectionMode: ThemeDetectionMode;

  // Palettes de couleurs
  colors: {
    light: ColorPalette;
    dark: ColorPalette;
  };

  // Configuration des polices
  fonts: FontConfig;

  // Configuration de l'espacement
  spacing: SpacingConfig;

  // Configuration des bordures
  borders: BorderConfig;

  // Configuration des ombres
  shadows: ShadowConfig;

  // Configuration des animations
  animations: AnimationConfig;

  // Configuration des breakpoints
  breakpoints: BreakpointConfig;

  // Options de personnalisation
  customization: {
    // Options activées
    enabled: {
      colors: boolean;
      fonts: boolean;
      spacing: boolean;
      borders: boolean;
      shadows: boolean;
    };

    // Contraintes
    constraints: {
      minFontSize: number;
      maxFontSize: number;
      minSpacing: number;
      maxSpacing: number;
      maxBorderRadius: number;
    };
  };

  // Options d'accessibilité
  accessibility: {
    // Contraste minimum
    minContrastRatio: number;

    // Taille de police minimum
    minFontSize: number;

    // Options de réduction de mouvement
    reduceMotion: boolean;
  };

  // Options de performance
  performance: {
    // Lazy loading des polices
    lazyLoadFonts: boolean;

    // Optimisation des animations
    optimizeAnimations: boolean;

    // Cache des thèmes
    enableCache: boolean;
  };
}

/**
 * État du thème
 */
export interface ThemeState {
  // Thème actuel
  currentTheme: ThemeType;

  // Thème appliqué (peut être différent de currentTheme en mode auto)
  appliedTheme: 'light' | 'dark';

  // Configuration du thème
  config: ThemeConfig;

  // État de chargement
  isLoading: boolean;

  // Erreurs
  error: string | null;

  // Dernière mise à jour
  lastUpdated: Date;
}

/**
 * Options du hook useTheme
 */
export interface UseThemeOptions {
  // Persister les préférences
  persist?: boolean;

  // Clé de stockage
  storageKey?: string;

  // Thème par défaut
  defaultTheme?: ThemeType;

  // Callback de changement
  onThemeChange?: (theme: ThemeType, config: ThemeConfig) => void;
}

/**
 * Résultat du hook useTheme
 */
export interface UseThemeResult {
  // État et configuration
  theme: ThemeState;

  // Actions
  setTheme: (theme: ThemeType) => void;
  setCustomTheme: (config: Partial<ThemeConfig>) => void;
  resetTheme: () => void;

  // Utilitaires
  getColor: (colorKey: keyof ColorPalette) => string;
  getFont: (fontKey: keyof FontConfig) => string;
  getSpacing: (spacingKey: keyof SpacingConfig) => string;
  getBorder: (borderKey: keyof BorderConfig) => string;
  getShadow: (shadowKey: keyof ShadowConfig) => string;

  // État
  isLoading: boolean;
  error: string | null;

  // Refresh
  refresh: () => Promise<void>;
}

/**
 * Props du ThemeProvider
 */
export interface ThemeProviderProps {
  // Configuration du thème
  config?: Partial<ThemeConfig>;

  // Enfants
  children: React.ReactNode;

  // Options
  persist?: boolean;
  storageKey?: string;
  defaultTheme?: ThemeType;

  // Callbacks
  onThemeChange?: (theme: ThemeType, config: ThemeConfig) => void;
  onConfigChange?: (config: ThemeConfig) => void;
}

/**
 * Interface pour les presets de thème
 */
export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  config: Partial<ThemeConfig>;
  preview?: string;
}

/**
 * Interface pour les variables CSS générées
 */
export interface CSSVariables {
  [key: string]: string;
}

/**
 * Interface pour les options de personnalisation
 */
export interface CustomizationOptions {
  // Couleurs à personnaliser
  colors?: Partial<ColorPalette>;

  // Polices à personnaliser
  fonts?: Partial<FontConfig>;

  // Espacement à personnaliser
  spacing?: Partial<SpacingConfig>;

  // Bordures à personnaliser
  borders?: Partial<BorderConfig>;

  // Ombres à personnaliser
  shadows?: Partial<ShadowConfig>;
}

/**
 * Interface pour le sélecteur de thème
 */
export interface ThemeSelectorProps {
  // Thème actuel
  currentTheme: ThemeType;

  // Handler de changement
  onThemeChange: (theme: ThemeType) => void;

  // Options d'affichage
  showLabels?: boolean;
  showIcons?: boolean;
  size?: 'sm' | 'md' | 'lg';

  // Classes CSS
  className?: string;
}

/**
 * Interface pour le panneau de personnalisation
 */
export interface CustomizationPanelProps {
  // Configuration actuelle
  config: ThemeConfig;

  // Handler de changement
  onConfigChange: (config: ThemeConfig) => void;

  // Options d'affichage
  sections?: ('colors' | 'fonts' | 'spacing' | 'borders' | 'shadows')[];

  // Classes CSS
  className?: string;
}
