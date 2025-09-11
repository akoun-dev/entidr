import React, { useState } from 'react';
import type { FontInfo } from './fontUtils';

/**
 * Interface pour les options de chargement de police
 */
export interface FontLoaderOptions {
  // Timeout de chargement (ms)
  timeout?: number;

  // Activer le chargement paresseux
  lazyLoad?: boolean;

  // Précharger les polices
  preload?: boolean;

  // Observer les changements de police
  observeChanges?: boolean;

  // Callback de progression
  onProgress?: (loaded: number, total: number) => void;

  // Callback de complétion
  onComplete?: () => void;

  // Callback d'erreur
  onError?: (error: Error) => void;
}

/**
 * Interface pour l'état de chargement d'une police
 */
export interface FontLoadState {
  // Famille de police
  family: string;

  // URL de la police
  url?: string;

  // État de chargement
  status: 'loading' | 'loaded' | 'error' | 'not-loaded';

  // Progression (0-100)
  progress: number;

  // Message d'erreur
  error?: string;

  // Timestamp de chargement
  loadedAt?: number;
}

/**
 * Interface pour le résultat du chargement
 */
export interface FontLoadResult {
  // Succès du chargement
  success: boolean;

  // Police chargée
  font?: FontInfo;

  // Erreur si échec
  error?: Error;

  // Temps de chargement (ms)
  loadTime?: number;
}

/**
 * Service de chargement de polices
 */
export class FontLoaderService {
  private static instance: FontLoaderService;
  private loadingFonts: Map<string, FontLoadState> = new Map();
  private loadedFonts: Set<string> = new Set();
  private observers: Map<string, MutationObserver> = new Map();

  /**
   * Obtenir l'instance singleton
   */
  static getInstance(): FontLoaderService {
    if (!FontLoaderService.instance) {
      FontLoaderService.instance = new FontLoaderService();
    }
    return FontLoaderService.instance;
  }

  /**
   * Extraire le nom de la famille d'une chaîne complète
   */
  private extractFamilyName(fontFamily: string): string {
    return fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  }

  /**
   * Créer une URL Google Fonts pour une famille de police
   */
  private createGoogleFontsUrl(fontFamily: string, weight?: number | string): string {
    const familyName = this.extractFamilyName(fontFamily);
    const weightParam = weight ? `:wght@${weight}` : '';
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyName)}${weightParam}&display=swap`;
  }

  /**
   * Charger une police depuis Google Fonts
   */
  async loadGoogleFont(
    fontFamily: string,
    weight?: number | string,
    options: FontLoaderOptions = {}
  ): Promise<FontLoadResult> {
    const familyName = this.extractFamilyName(fontFamily);
    const startTime = Date.now();

    // Vérifier si déjà chargée
    if (this.loadedFonts.has(familyName)) {
      return {
        success: true,
        font: { family: fontFamily, weight },
        loadTime: 0
      };
    }

    // Vérifier si déjà en cours de chargement
    if (this.loadingFonts.has(familyName)) {
      return this.waitForFontLoad(familyName, options.timeout || 10000);
    }

    // Créer l'état de chargement
    const loadState: FontLoadState = {
      family: familyName,
      status: 'loading',
      progress: 0
    };
    this.loadingFonts.set(familyName, loadState);

    try {
      // Créer l'URL de la police
      const fontUrl = this.createGoogleFontsUrl(fontFamily, weight);

      // Créer l'élément link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';

      // Promesse de chargement
      const loadPromise = new Promise<void>((resolve, reject) => {
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load font: ${familyName}`));
      });

      // Timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Font load timeout: ${familyName}`));
        }, options.timeout || 10000);
      });

      // Ajouter au document
      document.head.appendChild(link);

      // Attendre le chargement
      await Promise.race([loadPromise, timeoutPromise]);

      // Vérifier si la police est réellement disponible
      const isAvailable = await this.checkFontAvailability(familyName);

      if (!isAvailable) {
        throw new Error(`Font not available after load: ${familyName}`);
      }

      // Mettre à jour l'état
      loadState.status = 'loaded';
      loadState.progress = 100;
      loadState.loadedAt = Date.now();
      this.loadedFonts.add(familyName);

      // Nettoyer
      this.loadingFonts.delete(familyName);

      const loadTime = Date.now() - startTime;
      options.onComplete?.();

      return {
        success: true,
        font: { family: fontFamily, weight },
        loadTime
      };

    } catch (error) {
      // Mettre à jour l'état d'erreur
      loadState.status = 'error';
      loadState.error = error instanceof Error ? error.message : String(error);
      this.loadingFonts.delete(familyName);

      options.onError?.(error instanceof Error ? error : new Error(String(error)));

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        loadTime: Date.now() - startTime
      };
    }
  }

  /**
   * Attendre le chargement d'une police
   */
  private async waitForFontLoad(
    familyName: string,
    timeout: number
  ): Promise<FontLoadResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const loadState = this.loadingFonts.get(familyName);

        if (!loadState) {
          clearInterval(checkInterval);
          resolve({
            success: true,
            font: { family: familyName },
            loadTime: Date.now() - startTime
          });
          return;
        }

        if (loadState.status === 'loaded') {
          clearInterval(checkInterval);
          resolve({
            success: true,
            font: { family: familyName },
            loadTime: Date.now() - startTime
          });
        } else if (loadState.status === 'error') {
          clearInterval(checkInterval);
          resolve({
            success: false,
            error: new Error(loadState.error),
            loadTime: Date.now() - startTime
          });
        }

        // Vérifier le timeout
        if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve({
            success: false,
            error: new Error(`Font load timeout: ${familyName}`),
            loadTime: Date.now() - startTime
          });
        }
      }, 100);
    });
  }

  /**
   * Vérifier la disponibilité d'une police
   */
  private async checkFontAvailability(familyName: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Créer un canvas pour tester
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        resolve(false);
        return;
      }

      // Texte de test
      const testText = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

      // Mesurer avec la police par défaut
      context.font = '16px monospace';
      const defaultWidth = context.measureText(testText).width;

      // Mesurer avec la police à tester
      context.font = `16px "${familyName}", monospace`;
      const testWidth = context.measureText(testText).width;

      // La police est disponible si les largeurs sont différentes
      resolve(testWidth !== defaultWidth);
    });
  }

  /**
   * Précharger plusieurs polices
   */
  async preloadFonts(
    fonts: Array<{ family: string; weight?: number | string }>,
    options: FontLoaderOptions = {}
  ): Promise<FontLoadResult[]> {
    const results: FontLoadResult[] = [];
    const total = fonts.length;

    for (let i = 0; i < fonts.length; i++) {
      const { family, weight } = fonts[i];
      const result = await this.loadGoogleFont(family, weight, options);
      results.push(result);

      options.onProgress?.(i + 1, total);
    }

    return results;
  }

  /**
   * Observer les changements de police dans un élément
   */
  observeFontChanges(
    element: Element,
    callback: (fontFamily: string) => void
  ): () => void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const computedStyle = window.getComputedStyle(element);
          const fontFamily = computedStyle.fontFamily;

          if (fontFamily) {
            callback(fontFamily);
          }
        }
      }
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style']
    });

    const elementId = element.id || Math.random().toString(36).substr(2, 9);
    this.observers.set(elementId, observer);

    return () => {
      observer.disconnect();
      this.observers.delete(elementId);
    };
  }

  /**
   * Obtenir l'état de chargement des polices
   */
  getFontLoadStates(): FontLoadState[] {
    return Array.from(this.loadingFonts.values());
  }

  /**
   * Obtenir les polices chargées
   */
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }

  /**
   * Vérifier si une police est chargée
   */
  isFontLoaded(familyName: string): boolean {
    return this.loadedFonts.has(this.extractFamilyName(familyName));
  }

  /**
   * Nettoyer les ressources
   */
  cleanup(): void {
    // Arrêter tous les observateurs
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    // Réinitialiser les états
    this.loadingFonts.clear();
    this.loadedFonts.clear();
  }
}

/**
 * Hook pour charger des polices
 */
export function useFontLoader() {
  const loader = FontLoaderService.getInstance();

  const loadFont = async (
    fontFamily: string,
    weight?: number | string,
    options?: FontLoaderOptions
  ): Promise<FontLoadResult> => {
    return loader.loadGoogleFont(fontFamily, weight, options);
  };

  const preloadFonts = async (
    fonts: Array<{ family: string; weight?: number | string }>,
    options?: FontLoaderOptions
  ): Promise<FontLoadResult[]> => {
    return loader.preloadFonts(fonts, options);
  };

  const isFontLoaded = (familyName: string): boolean => {
    return loader.isFontLoaded(familyName);
  };

  const getLoadStates = (): FontLoadState[] => {
    return loader.getFontLoadStates();
  };

  const getLoadedFonts = (): string[] => {
    return loader.getLoadedFonts();
  };

  return {
    loadFont,
    preloadFonts,
    isFontLoaded,
    getLoadStates,
    getLoadedFonts
  };
}

/**
 * Composant pour le chargement asynchrone de polices
 */
export function AsyncFontLoader({
  fonts,
  children,
  fallback,
  options = {}
}: {
  fonts: Array<{ family: string; weight?: number | string }>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  options?: FontLoaderOptions;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { preloadFonts } = useFontLoader();

  React.useEffect(() => {
    const loadFonts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const results = await preloadFonts(fonts, {
          ...options,
          onComplete: () => setIsLoading(false)
        });

        const hasErrors = results.some(result => !result.success);
        if (hasErrors) {
          const firstError = results.find(result => !result.success)?.error;
          if (firstError) {
            setError(firstError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    loadFonts();
  }, [fonts, options, preloadFonts]);

  if (isLoading) {
    return fallback || React.createElement('div', null, 'Chargement des polices...');
  }

  if (error) {
    return fallback || React.createElement('div', null, `Erreur de chargement des polices: ${error?.message}`);
  }

  return React.createElement(React.Fragment, null, children);
}

export default FontLoaderService;
