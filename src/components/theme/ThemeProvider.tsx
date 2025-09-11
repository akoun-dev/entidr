import React, { createContext, useContext, useMemo } from 'react';
import { useTheme } from './useTheme';
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
  React.useEffect(() => {
    if (config) {
      themeResult.setCustomTheme(config);
    }
  }, [config, themeResult]);

  // Notifier les changements de configuration
  React.useEffect(() => {
    if (onConfigChange) {
      onConfigChange(themeResult.theme.config);
    }
  }, [themeResult.theme.config, onConfigChange]);

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
