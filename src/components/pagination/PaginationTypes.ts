/**
 * Types pour le système de pagination
 */

/**
 * Types de pagination supportés
 */
export type PaginationType = 'SIMPLE' | 'ADVANCED' | 'INFINITE';

/**
 * Positions de pagination
 */
export type PaginationPosition = 'TOP' | 'BOTTOM' | 'BOTH' | 'NONE';

/**
 * Tailles de page disponibles
 */
export type PageSize = 10 | 25 | 50 | 100 | 200 | 500 | 'ALL';

/**
 * Style de pagination
 */
export type PaginationStyle = 'BUTTONS' | 'SELECT' | 'INPUT' | 'SCROLL';

/**
 * Configuration de pagination de base
 */
export interface PaginationConfig {
  /** Type de pagination */
  type: PaginationType;

  /** Position des contrôles */
  position: PaginationPosition;

  /** Taille de page par défaut */
  defaultPageSize: PageSize;

  /** Tailles de page disponibles */
  availablePageSizes?: PageSize[];

  /** Style des contrôles */
  style: PaginationStyle;

  /** Afficher le nombre total d'éléments */
  showTotalItems?: boolean;

  /** Afficher le nombre de pages */
  showTotalPages?: boolean;

  /** Afficher les informations de pagination */
  showPageInfo?: boolean;

  /** Nombre maximum de boutons de page à afficher */
  maxPageButtons?: number;

  /** Activer le chargement rapide */
  enableQuickNavigation?: boolean;

  /** Textes personnalisés */
  texts?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
    page?: string;
    of?: string;
    items?: string;
    showing?: string;
    to?: string;
    loading?: string;
    loadMore?: string;
        noMoreItems?: string;
        goTo?: string;
        pageSize?: string;
        totalItems?: string;
        totalPages?: string;
      };
    }

    /**
     * État de pagination
     */
    export interface PaginationState {
      /** Page actuelle */
      currentPage: number;

      /** Taille de page actuelle */
      pageSize: PageSize;

      /** Nombre total d'éléments */
      totalItems: number;

      /** Nombre total de pages */
      totalPages: number;

      /** Est en cours de chargement */
      loading: boolean;

      /** Est en train de charger plus */
      loadingMore: boolean;

      /** Tous les éléments ont été chargés */
      hasMoreItems: boolean;

      /** Éléments actuellement chargés */
      loadedItems: number;

      /** Offset pour le chargement infini */
      offset: number;
    }

    /**
     * Props communes à tous les contrôles de pagination
     */
    export interface PaginationProps {
      /** Configuration de pagination */
      config: PaginationConfig;

      /** État de pagination */
      state: PaginationState;

      /** Callback de changement de page */
      onPageChange?: (page: number) => void;

      /** Callback de changement de taille de page */
      onPageSizeChange?: (pageSize: PageSize) => void;

      /** Callback de chargement de plus */
      onLoadMore?: () => void;

      /** Callback de rafraîchissement */
      onRefresh?: () => void;

      /** Classe CSS personnalisée */
      className?: string;

      /** Style inline */
      style?: Record<string, any>;

      /** Désactivé */
      disabled?: boolean;
    }

    /**
     * Props du composant PaginationControls
     */
    export interface PaginationControlsProps extends PaginationProps {
      /** Type de pagination à utiliser */
      type?: PaginationType;

      /** Afficher les contrôles avancés */
      showAdvanced?: boolean;

      /** Afficher le sélecteur de taille de page */
      showPageSizeSelector?: boolean;

      /** Afficher les informations de pagination */
      showPageInfo?: boolean;

      /** Position des contrôles */
      position?: PaginationPosition;

      /** Mode compact */
      compact?: boolean;

      /** Callback de changement d'état */
      onStateChange?: (state: PaginationState) => void;
    }

/**
 * Props du composant SimplePagination
 */
export interface SimplePaginationProps extends Omit<PaginationProps, 'style'> {
  /** Style des contrôles */
  style?: 'BUTTONS' | 'SELECT' | 'INPUT';

      /** Afficher les boutons de navigation rapide */
      showQuickNav?: boolean;

      /** Afficher le sélecteur de page */
      showPageSelector?: boolean;

      /** Nombre maximum de boutons de page */
      maxPageButtons?: number;
    }

    /**
     * Props du composant AdvancedPagination
     */
    export interface AdvancedPaginationProps extends PaginationProps {
      /** Afficher le sélecteur de taille de page */
      showPageSizeSelector?: boolean;

      /** Afficher le sélecteur de page */
      showPageSelector?: boolean;

      /** Afficher les informations détaillées */
      showDetailedInfo?: boolean;

      /** Afficher les boutons de navigation rapide */
      showQuickNav?: boolean;

      /** Nombre maximum de boutons de page */
      maxPageButtons?: number;

      /** Format d'affichage des informations */
      infoFormat?: 'SIMPLE' | 'DETAILED' | 'CUSTOM';

      /** Fonction de formatage personnalisée */
      customInfoFormatter?: (state: PaginationState) => string;
    }

    /**
     * Props du composant InfiniteScroll
     */
    export interface InfiniteScrollProps extends PaginationProps {
      /** Seuil de déclenchement du chargement */
      threshold?: number;

      /** Élément parent pour l'observation */
      parentElement?: HTMLElement | null;

      /** Élément racine pour l'observation */
      rootElement?: HTMLElement | null;

      /** Désactiver le chargement automatique */
      disableAutoLoad?: boolean;

      /** Afficher le bouton "Charger plus" */
      showLoadMoreButton?: boolean;

      /** Texte du bouton "Charger plus" */
      loadMoreButtonText?: string;

      /** Texte quand il n'y a plus d'éléments */
      noMoreItemsText?: string;

      /** Afficher l'indicateur de chargement */
      showLoadingIndicator?: boolean;

      /** Callback de défilement */
      onScroll?: (event: Event) => void;

      /** Callback quand l'utilisateur est proche du bas */
      onNearBottom?: () => void;
    }

    /**
     * Options pour le chargement infini
     */
    export interface InfiniteScrollOptions {
      /** Seuil de déclenchement (en pixels) */
      threshold?: number;

      /** Désactiver le chargement automatique */
      disableAutoLoad?: boolean;

      /** Délai entre les chargements (en ms) */
      debounceDelay?: number;

      /** Activer le chargement au clic */
      enableClickToLoad?: boolean;

      /** Taille de la page pour le chargement infini */
      pageSize?: number;

      /** Conserver les éléments précédents */
      keepPreviousItems?: boolean;

      /** Nombre maximum d'éléments à conserver */
      maxItemsToKeep?: number;
    }

    /**
     * Événements de pagination
     */
    export type PaginationEvent =
      | { type: 'PAGE_CHANGE'; page: number }
      | { type: 'PAGE_SIZE_CHANGE'; pageSize: PageSize }
      | { type: 'LOAD_MORE' }
      | { type: 'REFRESH' }
      | { type: 'RESET' }
      | { type: 'SCROLL'; scrollTop: number }
      | { type: 'NEAR_BOTTOM' };

    /**
     * Résultat d'une opération de pagination
     */
    export interface PaginationResult {
      /** Données paginées */
      data: any[];

      /** État de pagination */
      state: PaginationState;

      /** Événement déclencheur */
      triggerEvent?: PaginationEvent;

      /** Statistiques de la pagination */
      stats?: {
        /** Temps d'exécution */
        executionTime: number;
        /** Nombre d'éléments chargés */
        loadedItems: number;
        /** Nombre de requêtes effectuées */
        requestCount: number;
      };

      /** Métadonnées de la pagination */
      metadata?: Record<string, any>;
    }

    /**
     * Configuration du service de pagination
     */
    export interface PaginationServiceConfig {
      /** URL de base pour les requêtes */
      baseUrl?: string;

      /** Endpoint pour les données */
      endpoint?: string;

      /** Méthode HTTP */
      method?: 'GET' | 'POST';

      /** Paramètres de requête par défaut */
      defaultParams?: Record<string, any>;

      /** En-têtes par défaut */
      defaultHeaders?: Record<string, string>;

      /** Timeout des requêtes */
      timeout?: number;

      /** Nombre maximum de tentatives */
      maxRetries?: number;

      /** Délai entre les tentatives */
      retryDelay?: number;

      /** Activer la mise en cache */
      enableCache?: boolean;

      /** Durée du cache (en ms) */
      cacheDuration?: number;

      /** Activer le préchargement */
      enablePrefetch?: boolean;

      /** Nombre de pages à précharger */
      prefetchPages?: number;
    }

    /**
     * État du service de pagination
     */
    export interface PaginationServiceState {
      /** Cache des données */
      cache: Map<string, { data: any[]; timestamp: number }>;

      /** Requêtes en cours */
      pendingRequests: Set<string>;

      /** Statistiques */
      stats: {
        totalRequests: number;
        cacheHits: number;
        cacheMisses: number;
        averageResponseTime: number;
      };
    }
