import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useTheme } from './useTheme';
import { generateCSSVariables, updateCSSVariablesInDOM, removeCSSVariablesFromDOM } from './cssVariablesGenerator';
import type { ThemeProviderProps, ThemeState } from './types';

// Contexte du thème
const ThemeContext = createContext<ThemeState | undefined>(undefined);

/**
 * Fournisseur de thème pour l'application
 */
export function ThemeProvider({
  config,
  children,
  persist = true,
  storageKey = 'theme-preferences',
  defaultTheme = 'light',
  onThemeChange,
  onConfigChange
}: ThemeProviderProps) {
  // Utiliser le hook useTheme pour gérer l'état du thème
  const themeResult = useTheme({
    persist,
    storageKey,
    defaultTheme,
    onThemeChange
  });

  // Appliquer la configuration personnalisée si fournie
  useEffect(() => {
    if (config) {
      themeResult.setCustomTheme(config);
    }
  }, [config, themeResult]);

  // Notifier les changements de configuration
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(themeResult.theme.config);
    }
  }, [themeResult.theme.config, onConfigChange]);

  // Générer et injecter les variables CSS lorsque la configuration change
  useEffect(() => {
    if (themeResult.theme.config) {
      const { light, dark } = generateCSSVariables(themeResult.theme.config);

      // Déterminer quelles variables injecter en fonction du thème appliqué
      const currentTheme = themeResult.theme.appliedTheme;
      const variables = currentTheme === 'dark'
        ? (typeof dark === 'string' ? {} : dark)
        : (typeof light === 'string' ? {} : light);

      // Injecter les variables dans le DOM
      updateCSSVariablesInDOM(variables);

      // Mettre à jour l'attribut data-theme sur l'élément racine
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', currentTheme);
      }
    }

    // Nettoyer les variables CSS lors du démontage
    return () => {
      removeCSSVariablesFromDOM();
    };
  }, [themeResult.theme.config, themeResult.theme.appliedTheme]);

  // Mémoriser la valeur du contexte
  const contextValue = useMemo(() => themeResult.theme, [themeResult.theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte du thème
 */
export function useThemeContext(): ThemeState {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
