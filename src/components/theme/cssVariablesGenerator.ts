import type { ThemeConfig, ColorPalette, CSSVariables } from './types';

/**
 * Interface pour les options de génération de variables CSS
 */
export interface CSSVariablesOptions {
  // Préfixe pour les variables
  prefix?: string;

  // Séparateur pour les variables composées
  separator?: string;

  // Inclure les variations de couleurs
  includeVariations?: boolean;

  // Inclure les variables de thème
  includeThemeVariables?: boolean;

  // Format de sortie
  format?: 'css' | 'json' | 'object';
}

/**
 * Options par défaut pour la génération de variables CSS
 */
const DEFAULT_OPTIONS: Required<CSSVariablesOptions> = {
  prefix: '--color',
  separator: '-',
  includeVariations: true,
  includeThemeVariables: true,
  format: 'css'
};

/**
 * Générer une clé de variable CSS à partir d'une clé de couleur
 */
function generateVariableKey(
  key: string,
  options: Required<CSSVariablesOptions>
): string {
  // Convertir camelCase en kebab-case
  const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `${options.prefix}${options.separator}${kebabKey}`;
}

/**
 * Générer les variables CSS pour une palette de couleurs
 */
function generatePaletteVariables(
  palette: ColorPalette,
  theme: 'light' | 'dark',
  options: Required<CSSVariablesOptions>
): CSSVariables {
  const variables: CSSVariables = {};

  // Générer les variables pour chaque couleur de la palette
  Object.entries(palette).forEach(([key, value]) => {
    const variableKey = generateVariableKey(key, options);
    variables[variableKey] = value;
  });

  // Ajouter les variables spécifiques au thème
  if (options.includeThemeVariables) {
    variables[`${options.prefix}${options.separator}theme`] = theme;
    variables[`${options.prefix}${options.separator}mode`] = theme;
  }

  return variables;
}

/**
 * Générer les variables CSS pour les variations de couleurs
 */
function generateVariationVariables(
  baseColor: string,
  variations: Record<string, string>,
  colorName: string,
  options: Required<CSSVariablesOptions>
): CSSVariables {
  const variables: CSSVariables = {};

  if (!options.includeVariations) {
    return variables;
  }

  // Générer les variables pour chaque variation
  Object.entries(variations).forEach(([variation, color]) => {
    const variableKey = `${options.prefix}${options.separator}${colorName}${options.separator}${variation}`;
    variables[variableKey] = color;
  });

  return variables;
}

/**
 * Générer les variables CSS pour les breakpoints
 */
function generateBreakpointVariables(
  breakpoints: ThemeConfig['breakpoints'],
  options: Required<CSSVariablesOptions>
): CSSVariables {
  const variables: CSSVariables = {};

  Object.entries(breakpoints).forEach(([key, value]) => {
    const variableKey = `--breakpoint${options.separator}${key}`;
    variables[variableKey] = value;
  });

  return variables;
}

/**
 * Générer les variables CSS pour les espacements
 */
function generateSpacingVariables(
  spacing: ThemeConfig['spacing'],
  options: Required<CSSVariablesOptions>
): CSSVariables {
  const variables: CSSVariables = {};

  Object.entries(spacing).forEach(([key, value]) => {
    const variableKey = `--spacing${options.separator}${key}`;
    variables[variableKey] = value;
  });

  return variables;
}

/**
 * Générer les variables CSS pour les polices
 */
function generateFontVariables(
  fonts: ThemeConfig['fonts'],
  options: Required<CSSVariablesOptions>
): CSSVariables {
  const variables: CSSVariables = {};

  // Familles de polices
  Object.entries(fonts).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const variableKey = `--font${options.separator}${key}`;
      variables[variableKey] = value.join(', ');
    } else if (typeof value === 'string') {
      const variableKey = `--font${options.separator}${key}`;
      variables[variableKey] = value;
    } else if (typeof value === 'number') {
      const variableKey = `--font${options.separator}${key}`;
      variables[variableKey] = value.toString();
    }
  });

  return variables;
}

/**
 * Générer les variables CSS pour les bordures
 */
function generateBorderVariables(
  borders: ThemeConfig['borders'],
  options: Required<CSSVariablesOptions>
): CSSVariables {
  const variables: CSSVariables = {};

  // Largeurs de bordures
  Object.entries(borders).forEach(([key, value]) => {
    if (key.startsWith('width') || key.startsWith('radius')) {
      const variableKey = `--border${options.separator}${key}`;
      variables[variableKey] = value;
    } else if (typeof value === 'string') {
      const variableKey = `--border${options.separator}${key}`;
      variables[variableKey] = value;
    }
  });

  return variables;
}

/**
 * Générer les variables CSS pour les ombres
 */
function generateShadowVariables(
  shadows: ThemeConfig['shadows'],
  options: Required<CSSVariablesOptions>
): CSSVariables {
  const variables: CSSVariables = {};

  // Ombres simples
  Object.entries(shadows).forEach(([key, value]) => {
    if (key === 'colored') {
      // Ombres colorées
      Object.entries(value).forEach(([colorKey, shadowValue]) => {
        const variableKey = `--shadow${options.separator}${colorKey}`;
        variables[variableKey] = shadowValue;
      });
    } else if (key === 'inner') {
      // Ombres internes
      Object.entries(value).forEach(([sizeKey, shadowValue]) => {
        const variableKey = `--shadow${options.separator}inner${options.separator}${sizeKey}`;
        variables[variableKey] = shadowValue;
      });
    } else if (typeof value === 'string') {
      const variableKey = `--shadow${options.separator}${key}`;
      variables[variableKey] = value;
    }
  });

  return variables;
}

/**
 * Générer les variables CSS pour les animations
 */
function generateAnimationVariables(
  animations: ThemeConfig['animations'],
  options: Required<CSSVariablesOptions>
): CSSVariables {
  const variables: CSSVariables = {};

  Object.entries(animations).forEach(([key, value]) => {
    const variableKey = `--animation${options.separator}${key}`;
    variables[variableKey] = value;
  });

  return variables;
}

/**
 * Convertir les variables en format CSS
 */
function variablesToCSS(variables: CSSVariables, selector = ':root'): string {
  const rules = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  return `${selector} {\n${rules}\n}`;
}

/**
 * Convertir les variables en format JSON
 */
function variablesToJSON(variables: CSSVariables): string {
  return JSON.stringify(variables, null, 2);
}

/**
 * Générer toutes les variables CSS pour une configuration de thème
 */
export function generateCSSVariables(
  config: ThemeConfig,
  options: CSSVariablesOptions = {}
): {
  light: CSSVariables | string;
  dark: CSSVariables | string;
  combined: string;
} {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Générer les variables pour le thème light
  const lightVariables: CSSVariables = {
    ...generatePaletteVariables(config.colors.light, 'light', resolvedOptions),
    ...generateBreakpointVariables(config.breakpoints, resolvedOptions),
    ...generateSpacingVariables(config.spacing, resolvedOptions),
    ...generateFontVariables(config.fonts, resolvedOptions),
    ...generateBorderVariables(config.borders, resolvedOptions),
    ...generateShadowVariables(config.shadows, resolvedOptions),
    ...generateAnimationVariables(config.animations, resolvedOptions)
  };

  // Générer les variables pour le thème dark
  const darkVariables: CSSVariables = {
    ...generatePaletteVariables(config.colors.dark, 'dark', resolvedOptions),
    ...generateBreakpointVariables(config.breakpoints, resolvedOptions),
    ...generateSpacingVariables(config.spacing, resolvedOptions),
    ...generateFontVariables(config.fonts, resolvedOptions),
    ...generateBorderVariables(config.borders, resolvedOptions),
    ...generateShadowVariables(config.shadows, resolvedOptions),
    ...generateAnimationVariables(config.animations, resolvedOptions)
  };

  // Formatter selon le format demandé
  let lightOutput: CSSVariables | string = lightVariables;
  let darkOutput: CSSVariables | string = darkVariables;

  if (resolvedOptions.format === 'css') {
    lightOutput = variablesToCSS(lightVariables);
    darkOutput = variablesToCSS(darkVariables, '[data-theme="dark"]');
  } else if (resolvedOptions.format === 'json') {
    lightOutput = variablesToJSON(lightVariables);
    darkOutput = variablesToJSON(darkVariables);
  }

  // Générer le CSS combiné
  const combinedCSS = `${variablesToCSS(lightVariables)}\n\n${variablesToCSS(darkVariables, '[data-theme="dark"]')}`;

  return {
    light: lightOutput,
    dark: darkOutput,
    combined: combinedCSS
  };
}

/**
 * Mettre à jour les variables CSS dans le DOM
 */
export function updateCSSVariablesInDOM(
  variables: CSSVariables,
  selector = ':root'
): void {
  // Trouver ou créer la balise style
  let styleElement = document.getElementById('theme-css-variables') as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'theme-css-variables';
    document.head.appendChild(styleElement);
  }

  // Générer le CSS et l'injecter
  const css = variablesToCSS(variables, selector);
  styleElement.textContent = css;
}

/**
 * Supprimer les variables CSS du DOM
 */
export function removeCSSVariablesFromDOM(): void {
  const styleElement = document.getElementById('theme-css-variables');
  if (styleElement) {
    styleElement.remove();
  }
}

/**
 * Obtenir la valeur d'une variable CSS
 */
export function getCSSVariableValue(variableName: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  // S'assurer que le nom de la variable commence par --
  const normalizedName = variableName.startsWith('--') ? variableName : `--${variableName}`;

  // Obtenir la valeur depuis le root
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  return computedStyle.getPropertyValue(normalizedName).trim() || null;
}

/**
 * Définir la valeur d'une variable CSS
 */
export function setCSSVariableValue(
  variableName: string,
  value: string,
  element?: HTMLElement
): void {
  if (typeof document === 'undefined') {
    return;
  }

  // S'assurer que le nom de la variable commence par --
  const normalizedName = variableName.startsWith('--') ? variableName : `--${variableName}`;

  // Définir sur l'élément spécifié ou sur le root
  const targetElement = element || document.documentElement;
  targetElement.style.setProperty(normalizedName, value);
}

/**
 * Observer les changements de variables CSS
 */
export function observeCSSVariables(
  callback: (variables: Record<string, string>) => void,
  options?: { immediate?: boolean }
): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => {}; // No-op in non-browser environments
  }

  const observer = new MutationObserver((mutations) => {
    const variables: Record<string, string> = {};

    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target as HTMLElement;
        const style = target.getAttribute('style');

        if (style) {
          // Extraire les variables CSS du style
          const variableMatches = style.match(/(--[^:]+):\s*([^;]+)/g);

          if (variableMatches) {
            variableMatches.forEach((match) => {
              const [variable, value] = match.split(':').map(s => s.trim());
              variables[variable] = value;
            });
          }
        }
      }
    });

    if (Object.keys(variables).length > 0) {
      callback(variables);
    }
  });

  // Observer les changements sur l'élément racine
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
    subtree: false
  });

  // Exécuter immédiatement si demandé
  if (options?.immediate) {
    const currentVariables: Record<string, string> = {};
    const computedStyle = getComputedStyle(document.documentElement);

    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      if (property.startsWith('--')) {
        currentVariables[property] = computedStyle.getPropertyValue(property).trim();
      }
    }

    callback(currentVariables);
  }

  // Retourner la fonction de nettoyage
  return () => observer.disconnect();
}

/**
 * Exporter les utilitaires par défaut
 */
export default {
  generateCSSVariables,
  updateCSSVariablesInDOM,
  removeCSSVariablesFromDOM,
  getCSSVariableValue,
  setCSSVariableValue,
  observeCSSVariables
};
