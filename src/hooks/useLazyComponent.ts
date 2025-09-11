import { useState, useEffect, useCallback, Suspense, lazy, ComponentType, ReactNode } from 'react';

/**
 * Options pour le chargement paresseux
 */
export interface LazyComponentOptions {
  /** Délai avant de commencer le chargement (en ms) */
  delay?: number;
  /** Précharger le composant */
  preload?: boolean;
  /** Composant de chargement personnalisé */
  loadingComponent?: ComponentType;
  /** Composant d'erreur personnalisé */
  errorComponent?: ComponentType<{ error: Error }>;
  /** Callback quand le chargement commence */
  onLoadStart?: () => void;
  /** Callback quand le chargement est terminé */
  onLoadComplete?: () => void;
  /** Callback quand il y a une erreur */
  onLoadError?: (error: Error) => void;
}

/**
 * État du chargement paresseux
 */
interface LazyComponentState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  Component: ComponentType<any> | null;
}

/**
 * Hook pour charger un composant de manière paresseuse
 * @param importFunction Fonction d'import dynamique
 * @param options Options de configuration
 * @returns État et fonctions de gestion du composant paresseux
 */
export function useLazyComponent<T = any>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentOptions = {}
) {
  const {
    delay = 0,
    preload = false,
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
    onLoadStart,
    onLoadComplete,
    onLoadError,
  } = options;

  const [state, setState] = useState<LazyComponentState>({
    isLoading: false,
    isLoaded: false,
    error: null,
    Component: null,
  });

  // Charger le composant
  const loadComponent = useCallback(async () => {
    if (state.isLoaded || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    onLoadStart?.();

    try {
      const module = await importFunction();
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        Component: module.default,
      }));
      onLoadComplete?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erreur de chargement du composant');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err,
      }));
      onLoadError?.(err);
    }
  }, [importFunction, state.isLoaded, state.isLoading, onLoadStart, onLoadComplete, onLoadError]);

  // Précharger le composant
  const preloadComponent = useCallback(() => {
    if (!state.isLoaded && !state.isLoading) {
      loadComponent();
    }
  }, [loadComponent, state.isLoaded, state.isLoading]);

  // Charger avec délai
  const loadWithDelay = useCallback(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        loadComponent();
      }, delay);
      return () => clearTimeout(timer);
    } else {
      loadComponent();
    }
  }, [loadComponent, delay]);

  // Effet pour le préchargement
  useEffect(() => {
    if (preload && !state.isLoaded && !state.isLoading) {
      preloadComponent();
    }
  }, [preload, state.isLoaded, state.isLoading, preloadComponent]);

  // Effet pour le chargement avec délai
  useEffect(() => {
    if (!preload && !state.isLoaded && !state.isLoading) {
      const cleanup = loadWithDelay();
      return cleanup;
    }
  }, [preload, state.isLoaded, state.isLoading, loadWithDelay]);

  // Wrapper du composant avec gestion des états
  const LazyComponentWrapper = useCallback((props: T) => {
    if (state.error && ErrorComponent) {
      const ErrorComp = ErrorComponent;
      return <ErrorComp error={state.error} />;
    }

    if (state.isLoading && LoadingComponent) {
      const LoadingComp = LoadingComponent;
      return <LoadingComp />;
    }

    if (state.Component) {
      const Comp = state.Component;
      return <Comp {...props} />;
    }

    // État initial - retourner null ou le composant de chargement
    return LoadingComponent ? <LoadingComponent /> : null;
  }, [state, LoadingComponent, ErrorComponent]);

  return {
    LazyComponent: LazyComponentWrapper,
    isLoading: state.isLoading,
    isLoaded: state.isLoaded,
    error: state.error,
    load: loadComponent,
    preload: preloadComponent,
  };
}

/**
 * Hook pour créer un composant paresseux avec suspense
 * @param importFunction Fonction d'import dynamique
 * @param fallback Composant de fallback
 * @returns Composant paresseux
 */
export function useLazyComponentWithSuspense<T = any>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType
) {
  const LazyComponent = lazy(importFunction);

  const LazyComponentWithSuspense = useCallback((props: T) => {
    const FallbackComponent = fallback || (() => <div>Chargement...</div>);

    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }, [LazyComponent, fallback]);

  return LazyComponentWithSuspense;
}

/**
 * Hook pour le chargement paresseux conditionnel
 * @param condition Condition pour charger le composant
 * @param importFunction Fonction d'import dynamique
 * @param options Options de configuration
 * @returns Composant conditionnellement chargé
 */
export function useConditionalLazyComponent<T = any>(
  condition: boolean,
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentOptions = {}
) {
  const {
    delay = 0,
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
  } = options;

  const shouldLoad = condition;

  const {
    LazyComponent,
    isLoading,
    isLoaded,
    error,
    load,
  } = useLazyComponent<T>(importFunction, {
    ...options,
    preload: shouldLoad,
  });

  // Composant conditionnel
  const ConditionalLazyComponent = useCallback((props: T) => {
    if (!shouldLoad) {
      return null;
    }

    return <LazyComponent {...props} />;
  }, [shouldLoad, LazyComponent]);

  return {
    ConditionalLazyComponent,
    isLoading,
    isLoaded,
    error,
    load,
    shouldLoad,
  };
}

/**
 * Hook pour le chargement paresseux de plusieurs composants
 * @param components Objet des composants à charger
 * @param options Options de configuration
 * @returns État des composants chargés
 */
export function useMultipleLazyComponents<T extends Record<string, any>>(
  components: Record<keyof T, () => Promise<{ default: ComponentType<any> }>>,
  options: LazyComponentOptions = {}
) {
  const [states, setStates] = useState<Record<keyof T, LazyComponentState>>(
    Object.keys(components).reduce((acc, key) => {
      acc[key as keyof T] = {
        isLoading: false,
        isLoaded: false,
        error: null,
        Component: null,
      };
      return acc;
    }, {} as Record<keyof T, LazyComponentState>)
  );

  const loadComponent = useCallback(async (componentKey: keyof T) => {
    const state = states[componentKey];
    if (state.isLoaded || state.isLoading) return;

    setStates(prev => ({
      ...prev,
      [componentKey]: { ...prev[componentKey], isLoading: true, error: null },
    }));
    options.onLoadStart?.();

    try {
      const module = await components[componentKey]();
      setStates(prev => ({
        ...prev,
        [componentKey]: {
          ...prev[componentKey],
          isLoading: false,
          isLoaded: true,
          Component: module.default,
        },
      }));
      options.onLoadComplete?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erreur de chargement du composant');
      setStates(prev => ({
        ...prev,
        [componentKey]: {
          ...prev[componentKey],
          isLoading: false,
          error: err,
        },
      }));
      options.onLoadError?.(err);
    }
  }, [components, states, options]);

  const loadAllComponents = useCallback(async () => {
    await Promise.all(
      Object.keys(components).map(key => loadComponent(key as keyof T))
    );
  }, [components, loadComponent]);

  const getComponent = useCallback((componentKey: keyof T) => {
    const state = states[componentKey];

    const ComponentWrapper = (props: any) => {
      if (state.error && options.errorComponent) {
        const ErrorComp = options.errorComponent;
        return <ErrorComp error={state.error} />;
      }

      if (state.isLoading && options.loadingComponent) {
        const LoadingComp = options.loadingComponent;
        return <LoadingComp />;
      }

      if (state.Component) {
        const Comp = state.Component;
        return <Comp {...props} />;
      }

      return options.loadingComponent ? <options.loadingComponent /> : null;
    };

    return ComponentWrapper;
  }, [states, options]);

  return {
    states,
    loadComponent,
    loadAllComponents,
    getComponent,
    isAllLoaded: Object.values(states).every(state => state.isLoaded),
    isLoadingAny: Object.values(states).some(state => state.isLoading),
  };
}

export default useLazyComponent;
