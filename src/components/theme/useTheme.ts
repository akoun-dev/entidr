import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  ThemeType,
  ThemeConfig,
  ThemeState,
  UseThemeOptions,
  UseThemeResult,
  ColorPalette,
  FontConfig,
  SpacingConfig,
  BorderConfig,
  ShadowConfig
} from './types';

// Configuration par défaut du thème
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  id: 'default',
  name: 'Default Theme',
  version: '1.0.0',
  type: 'light',
  detectionMode: 'system',
  colors: {
    light: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      neutral: '#6b7280',
      background: '#ffffff',
      surface: '#f8fafc',
      card: '#ffffff',
      dialog: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      textDisabled: '#9ca3af',
      textInverse: '#ffffff',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      borderStrong: '#d1d5db',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      hover: '#f3f4f6',
      active: '#e5e7eb',
      focus: '#3b82f6',
      selected: '#dbeafe',
      shadow: '#000000',
      shadowLight: '#00000020',
      shadowStrong: '#00000040'
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#a78bfa',
      neutral: '#9ca3af',
      background: '#0f172a',
      surface: '#1e293b',
      card: '#1e293b',
      dialog: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textDisabled: '#64748b',
      textInverse: '#0f172a',
      border: '#334155',
      borderLight: '#475569',
      borderStrong: '#1e293b',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      hover: '#334155',
      active: '#475569',
      focus: '#60a5fa',
      selected: '#1e3a8a',
      shadow: '#000000',
      shadowLight: '#00000030',
      shadowStrong: '#00000060'
    }
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
    lineHeightLoose: 2.0,
    letterSpacingTight: '-0.025em',
    letterSpacingNormal: '0',
    letterSpacingWide: '0.025em'
  },
  spacing: {
    px: '1px',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '1.5': '0.375rem',
    '2': '0.5rem',
    '2.5': '0.625rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '11': '2.75rem',
    '12': '3rem',
    '14': '3.5rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '28': '7rem',
    '32': '8rem',
    '36': '9rem',
    '40': '10rem',
    '44': '11rem',
    '48': '12rem',
    '52': '13rem',
    '56': '14rem',
    '60': '15rem',
    '64': '16rem',
    '72': '18rem',
    '80': '20rem',
    '96': '24rem'
  },
  borders: {
    widthNone: '0',
    widthSm: '1px',
    widthMd: '2px',
    widthLg: '4px',
    widthXl: '8px',
    width2xl: '12px',
    width3xl: '16px',
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    groove: 'groove',
    ridge: 'ridge',
    inset: 'inset',
    outset: 'outset',
    radiusNone: '0',
    radiusSm: '0.125rem',
    radiusMd: '0.375rem',
    radiusLg: '0.5rem',
    radiusXl: '0.75rem',
    radius2xl: '1rem',
    radius3xl: '1.5rem',
    radiusFull: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    colored: {
      success: '0 0 0 3px rgb(34 197 94 / 0.2)',
      warning: '0 0 0 3px rgb(245 158 11 / 0.2)',
      error: '0 0 0 3px rgb(239 68 68 / 0.2)',
      info: '0 0 0 3px rgb(59 130 246 / 0.2)'
    },
    inner: {
      sm: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
      lg: 'inset 0 4px 6px -1px rgb(0 0 0 / 0.1)'
    }
  },
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    short: '100ms',
    medium: '200ms',
    long: '300ms'
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  customization: {
    enabled: {
      colors: true,
      fonts: true,
      spacing: true,
      borders: true,
      shadows: true
    },
    constraints: {
      minFontSize: 12,
      maxFontSize: 96,
      minSpacing: 1,
      maxSpacing: 96,
      maxBorderRadius: 9999
    }
  },
  accessibility: {
    minContrastRatio: 4.5,
    minFontSize: 16,
    reduceMotion: false
  },
  performance: {
    lazyLoadFonts: true,
    optimizeAnimations: true,
    enableCache: true
  }
};

/**
 * Hook pour la gestion du thème
 */
export function useTheme(options: UseThemeOptions = {}): UseThemeResult {
  const {
    persist = true,
    storageKey = 'theme-preferences',
    defaultTheme = 'light',
    onThemeChange
  } = options;

  // État initial
  const [state, setState] = useState<ThemeState>(() => {
    const initialTheme: ThemeType = defaultTheme;
    const appliedTheme: 'light' | 'dark' = initialTheme === 'dark' ? 'dark' : 'light';

    return {
      currentTheme: initialTheme,
      appliedTheme,
      config: DEFAULT_THEME_CONFIG,
      isLoading: true,
      error: null,
      lastUpdated: new Date()
    };
  });

  // Charger les préférences depuis le stockage
  useEffect(() => {
    const loadPreferences = async () => {
      if (!persist) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const preferences = JSON.parse(stored);
          setState(prev => ({
            ...prev,
            currentTheme: preferences.theme || defaultTheme,
            config: { ...prev.config, ...preferences.config },
            isLoading: false,
            lastUpdated: new Date()
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to load theme preferences',
          isLoading: false
        }));
      }
    };

    loadPreferences();
  }, [persist, storageKey, defaultTheme]);

  // Détecter le thème système
  useEffect(() => {
    if (state.currentTheme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const appliedTheme = e.matches ? 'dark' : 'light';
      setState(prev => ({
        ...prev,
        appliedTheme,
        lastUpdated: new Date()
      }));
    };

    mediaQuery.addEventListener('change', handleChange);

    // Appliquer le thème initial
    const appliedTheme = mediaQuery.matches ? 'dark' : 'light';
    setState(prev => ({
      ...prev,
      appliedTheme,
      lastUpdated: new Date()
    }));

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.currentTheme]);

  // Sauvegarder les préférences
  useEffect(() => {
    if (!persist || state.isLoading) return;

    try {
      const preferences = {
        theme: state.currentTheme,
        config: state.config,
        lastUpdated: state.lastUpdated.toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save theme preferences:', error);
    }
  }, [state, persist, storageKey]);

  // Appliquer les variables CSS
  useEffect(() => {
    const root = document.documentElement;
    const palette = state.config.colors[state.appliedTheme];

    // Ajouter une classe pour les transitions douces
    root.classList.add('theme-transitioning');

    // Appliquer les couleurs
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Appliquer les polices
    Object.entries(state.config.fonts).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        root.style.setProperty(`--font-${key}`, value.join(', '));
      } else {
        root.style.setProperty(`--font-${key}`, String(value));
      }
    });

    // Appliquer l'espacement
    Object.entries(state.config.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Appliquer les bordures
    Object.entries(state.config.borders).forEach(([key, value]) => {
      root.style.setProperty(`--border-${key}`, value);
    });

    // Appliquer les ombres
    Object.entries(state.config.shadows).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--shadow-${key}-${subKey}`, String(subValue));
        });
      } else {
        root.style.setProperty(`--shadow-${key}`, value);
      }
    });

    // Appliquer les animations
    Object.entries(state.config.animations).forEach(([key, value]) => {
      root.style.setProperty(`--animation-${key}`, value);
    });

    // Appliquer les breakpoints
    Object.entries(state.config.breakpoints).forEach(([key, value]) => {
      root.style.setProperty(`--breakpoint-${key}`, value);
    });

    // Appliquer la classe de thème
    root.setAttribute('data-theme', state.appliedTheme);

    // Supprimer la classe de transition après un délai
    const transitionTimeout = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300); // Correspond à la durée de la transition CSS

    return () => clearTimeout(transitionTimeout);
  }, [state]);

  // Changer le thème
  const setTheme = useCallback((theme: ThemeType) => {
    setState(prev => {
      const appliedTheme = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme === 'custom' ? 'light' : theme; // Fallback à light pour custom

      const newState: ThemeState = {
        ...prev,
        currentTheme: theme,
        appliedTheme,
        lastUpdated: new Date()
      };

      if (onThemeChange) {
        onThemeChange(theme, newState.config);
      }

      return newState;
    });
  }, [onThemeChange]);

  // Définir un thème personnalisé
  const setCustomTheme = useCallback((config: Partial<ThemeConfig>) => {
    setState(prev => {
      const newConfig = { ...prev.config, ...config };
      const newState: ThemeState = {
        ...prev,
        config: newConfig,
        currentTheme: 'custom',
        lastUpdated: new Date()
      };

      if (onThemeChange) {
        onThemeChange('custom', newConfig);
      }

      return newState;
    });
  }, [onThemeChange]);

  // Réinitialiser le thème
  const resetTheme = useCallback(() => {
    setState(prev => {
      const newState: ThemeState = {
        ...prev,
        currentTheme: defaultTheme,
        appliedTheme: defaultTheme === 'dark' ? 'dark' : 'light',
        config: DEFAULT_THEME_CONFIG,
        lastUpdated: new Date()
      };

      if (onThemeChange) {
        onThemeChange(defaultTheme, newState.config);
      }

      return newState;
    });
  }, [defaultTheme, onThemeChange]);

  // Utilitaires pour accéder aux valeurs du thème
  const getColor = useCallback((colorKey: keyof ColorPalette): string => {
    return state.config.colors[state.appliedTheme][colorKey];
  }, [state.config.colors, state.appliedTheme]);

  const getFont = useCallback((fontKey: keyof FontConfig): string => {
    const value = state.config.fonts[fontKey];
    return Array.isArray(value) ? value.join(', ') : String(value);
  }, [state.config.fonts]);

  const getSpacing = useCallback((spacingKey: keyof SpacingConfig): string => {
    return state.config.spacing[spacingKey];
  }, [state.config.spacing]);

  const getBorder = useCallback((borderKey: keyof BorderConfig): string => {
    return state.config.borders[borderKey];
  }, [state.config.borders]);

  const getShadow = useCallback((shadowKey: keyof ShadowConfig): string => {
    const value = state.config.shadows[shadowKey];
    if (typeof value === 'object') {
      // Pour les ombres colorées, retourner la première valeur
      if ('success' in value) {
        return value.success;
      }
      // Pour les ombres internes, retourner sm
      if ('sm' in value) {
        return value.sm;
      }
    }
    return value;
  }, [state.config.shadows]);

  // Rafraîchir le thème
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (persist) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const preferences = JSON.parse(stored);
          setState(prev => ({
            ...prev,
            currentTheme: preferences.theme || defaultTheme,
            config: { ...prev.config, ...preferences.config },
            isLoading: false,
            lastUpdated: new Date()
          }));
        }
      }
    } catch (error) {
      console.error('Failed to refresh theme:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to refresh theme',
        isLoading: false
      }));
    }
  }, [persist, storageKey, defaultTheme]);

  // Mémoriser le résultat
  const result: UseThemeResult = useMemo(() => ({
    theme: state,
    setTheme,
    setCustomTheme,
    resetTheme,
    getColor,
    getFont,
    getSpacing,
    getBorder,
    getShadow,
    isLoading: state.isLoading,
    error: state.error,
    refresh
  }), [
    state,
    setTheme,
    setCustomTheme,
    resetTheme,
    getColor,
    getFont,
    getSpacing,
    getBorder,
    getShadow,
    refresh
  ]);

  return result;
}

export default useTheme;
