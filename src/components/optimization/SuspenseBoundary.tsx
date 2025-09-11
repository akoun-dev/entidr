import React, { Component, ReactNode, ComponentType, ErrorInfo } from 'react';

/**
 * Props pour le composant SuspenseBoundary
 */
export interface SuspenseBoundaryProps {
  /** Enfants à envelopper */
  children: ReactNode;
  /** Composant de fallback pendant le chargement */
  fallback?: ReactNode | ComponentType<{ error?: Error; retry?: () => void }>;
  /** Composant d'erreur si le chargement échoue */
  errorFallback?: ReactNode | ComponentType<{ error: Error; retry?: () => void }>;
  /** Callback quand une erreur est capturée */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Callback quand le composant est réinitialisé */
  onReset?: () => void;
  /** Activer la réinitialisation automatique */
  autoReset?: boolean;
  /** Délai pour la réinitialisation automatique (en ms) */
  resetDelay?: number;
  /** Nombre maximal de tentatives */
  maxRetries?: number;
  /** Classe CSS personnalisée */
  className?: string;
  /** Style personnalisé */
  style?: React.CSSProperties;
}

/**
 * État interne du composant
 */
interface SuspenseBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Composant de chargement par défaut
 */
const DefaultLoading: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600 text-lg">Chargement en cours...</span>
  </div>
);

/**
 * Composant d'erreur par défaut
 */
const DefaultErrorFallback: React.FC<{
  error: Error;
  retry?: () => void;
  retryCount?: number;
  maxRetries?: number;
}> = ({ error, retry, retryCount = 0, maxRetries = 3 }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-600 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Une erreur est survenue
    </h3>
    <p className="text-gray-600 mb-4 max-w-md">
      {error.message || 'Une erreur inattendue s\'est produite lors du chargement du composant.'}
    </p>
    {retry && retryCount < maxRetries && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Réessayer ({maxRetries - retryCount} tentatives restantes)
      </button>
    )}
    {retryCount >= maxRetries && (
      <p className="text-sm text-gray-500">
        Nombre maximal de tentatives atteint. Veuillez rafraîchir la page.
      </p>
    )}
  </div>
);

/**
 * Composant SuspenseBoundary - Limite d'erreur avancée pour React Suspense
 * Fournit une gestion robuste des erreurs, des tentatives de récupération et des états de chargement
 */
export class SuspenseBoundary extends Component<SuspenseBoundaryProps, SuspenseBoundaryState> {
  private resetTimer: NodeJS.Timeout | null = null;

  constructor(props: SuspenseBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SuspenseBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);

    // Log l'erreur pour le débogage
    console.error('SuspenseBoundary caught an error:', error, errorInfo);

    // Réinitialisation automatique si activée
    if (this.props.autoReset && this.props.resetDelay) {
      this.scheduleReset();
    }
  }

  private scheduleReset = () => {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    this.resetTimer = setTimeout(() => {
      this.reset();
    }, this.props.resetDelay);
  };

  private reset = () => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: this.state.retryCount + 1,
    });

    this.props.onReset?.();
  };

  private retry = () => {
    this.reset();
  };

  private canRetry = (): boolean => {
    const { maxRetries = 3 } = this.props;
    return this.state.retryCount < maxRetries;
  };

  private renderFallback = (fallback: ReactNode | ComponentType<{ error?: Error; retry?: () => void }>) => {
    if (React.isValidElement(fallback)) {
      return fallback;
    }

    if (typeof fallback === 'function') {
      const FallbackComponent = fallback as ComponentType<{ error?: Error; retry?: () => void }>;
      return (
        <FallbackComponent
          error={this.state.error || undefined}
          retry={this.canRetry() ? this.retry : undefined}
        />
      );
    }

    return null;
  };

  private renderErrorFallback = (errorFallback: ReactNode | ComponentType<{ error: Error; retry?: () => void }>) => {
    if (React.isValidElement(errorFallback)) {
      return errorFallback;
    }

    if (typeof errorFallback === 'function') {
      const ErrorFallbackComponent = errorFallback as ComponentType<{ error: Error; retry?: () => void }>;
      return (
        <ErrorFallbackComponent
          error={this.state.error!}
          retry={this.canRetry() ? this.retry : undefined}
        />
      );
    }

    return (
      <DefaultErrorFallback
        error={this.state.error!}
        retry={this.canRetry() ? this.retry : undefined}
        retryCount={this.state.retryCount}
        maxRetries={this.props.maxRetries}
      />
    );
  };

  componentWillUnmount() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
  }

  render() {
    const {
      children,
      fallback = <DefaultLoading />,
      errorFallback,
      className = '',
      style = {},
    } = this.props;

    const { hasError, error } = this.state;

    const containerStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      minHeight: '200px',
      ...style,
    };

    if (hasError && error) {
      return (
        <div className={`suspense-boundary suspense-boundary-error ${className}`} style={containerStyle}>
          {this.renderErrorFallback(errorFallback)}
        </div>
      );
    }

    return (
      <React.Suspense
        fallback={
          <div className={`suspense-boundary suspense-boundary-loading ${className}`} style={containerStyle}>
            {this.renderFallback(fallback)}
          </div>
        }
      >
        <div className={`suspense-boundary suspense-boundary-content ${className}`} style={containerStyle}>
          {children}
        </div>
      </React.Suspense>
    );
  }
}

/**
 * Hook pour créer une limite d'erreur avec configuration personnalisée
 * @param config Configuration de la limite d'erreur
 * @returns Composant SuspenseBoundary configuré
 */
export function createSuspenseBoundary(config: Partial<SuspenseBoundaryProps> = {}) {
  const ConfiguredSuspenseBoundary: React.FC<SuspenseBoundaryProps> = (props) => {
    return <SuspenseBoundary {...config} {...props} />;
  };

  return ConfiguredSuspenseBoundary;
}

/**
 * Composant d'ordre supérieur pour ajouter une limite d'erreur à un composant
 */
export function withSuspenseBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  boundaryProps: Partial<SuspenseBoundaryProps> = {}
) {
  const WithSuspenseBoundary: React.FC<P> = (props) => {
    return (
      <SuspenseBoundary {...boundaryProps}>
        <WrappedComponent {...props} />
      </SuspenseBoundary>
    );
  };

  WithSuspenseBoundary.displayName = `WithSuspenseBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithSuspenseBoundary;
}

export default SuspenseBoundary;
