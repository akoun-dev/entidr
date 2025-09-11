import React, { Suspense, ComponentType, ReactNode } from 'react';

/**
 * Props pour le composant LazyViewWrapper
 */
export interface LazyViewWrapperProps {
  /** Composant à charger paresseusement */
  component: ComponentType<any>;
  /** Props à passer au composant */
  componentProps?: Record<string, any>;
  /** Composant de fallback pendant le chargement */
  fallback?: ReactNode;
  /** Composant d'erreur si le chargement échoue */
  errorFallback?: ReactNode;
  /** Délai avant d'afficher le fallback (en ms) */
  delay?: number;
  /** Afficher un indicateur de chargement */
  showLoading?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Style personnalisé */
  style?: React.CSSProperties;
}

/**
 * Composant de chargement par défaut
 */
const DefaultLoading: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Chargement...</span>
  </div>
);

/**
 * Composant d'erreur par défaut
 */
const DefaultError: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="flex items-center justify-center p-4 text-red-600">
    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>Erreur de chargement: {error?.message || 'Erreur inconnue'}</span>
  </div>
);

/**
 * Composant LazyViewWrapper - Wrapper pour le chargement paresseux des vues
 * Gère les états de chargement, d'erreur et fournit une expérience utilisateur fluide
 */
export const LazyViewWrapper: React.FC<LazyViewWrapperProps> = ({
  component: Component,
  componentProps = {},
  fallback,
  errorFallback,
  delay = 200,
  showLoading = true,
  className = '',
  style = {},
}) => {
  // Composant de fallback avec délai
  const DelayedFallback: React.FC = () => {
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setShow(true);
      }, delay);

      return () => clearTimeout(timer);
    }, [delay]);

    if (!show) return null;

    return fallback || (showLoading ? <DefaultLoading /> : null);
  };

  // Gestionnaire d'erreur pour la limite d'erreur
  const ErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        setHasError(true);
        setError(event.error);
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        setHasError(true);
        setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, []);

    if (hasError) {
      return errorFallback || <DefaultError error={error || undefined} />;
    }

    return <>{children}</>;
  };

  return (
    <div className={`lazy-view-wrapper ${className}`} style={style}>
      <ErrorBoundary>
        <Suspense fallback={<DelayedFallback />}>
          <Component {...componentProps} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

/**
 * Hook pour créer un wrapper de vue paresseux
 * @param importFunction Fonction d'import dynamique
 * @param options Options de configuration
 * @returns Composant wrapper configuré
 */
export function createLazyViewWrapper<T = any>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  options: Partial<LazyViewWrapperProps> = {}
) {
  const LazyComponent = React.lazy(importFunction);

  const LazyView: React.FC<Omit<LazyViewWrapperProps, 'component'>> = (props) => {
    return (
      <LazyViewWrapper
        component={LazyComponent}
        {...options}
        {...props}
      />
    );
  };

  return LazyView;
}

/**
 * Composant pour le préchargement conditionnel des vues
 */
export interface ConditionalLazyViewProps extends LazyViewWrapperProps {
  /** Condition pour charger la vue */
  shouldLoad: boolean;
  /** Composant alternatif si la condition n'est pas remplie */
  fallbackComponent?: ReactNode;
}

export const ConditionalLazyView: React.FC<ConditionalLazyViewProps> = ({
  shouldLoad,
  component: Component,
  fallbackComponent,
  ...props
}) => {
  if (!shouldLoad) {
    return <>{fallbackComponent}</>;
  }

  return <LazyViewWrapper component={Component} {...props} />;
};

export default LazyViewWrapper;
