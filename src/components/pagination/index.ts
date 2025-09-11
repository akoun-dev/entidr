// Export des composants principaux
export { PaginationControls } from '../PaginationControls';
export { SimplePagination } from './SimplePagination';
export { AdvancedPagination } from './AdvancedPagination';
export { InfiniteScroll } from './InfiniteScroll';

// Export des types
export type {
  PaginationConfig,
  PaginationState,
  PaginationControlsProps,
  PaginationType,
  PaginationStyle,
  PaginationPosition,
  PageSize
} from './PaginationTypes';

// Note: Les types spécifiques aux composants sont déjà inclus dans PaginationTypes
// export type { SimplePaginationProps } from './SimplePagination';
// export type { AdvancedPaginationProps, InfoFormat } from './AdvancedPagination';
// export type { InfiniteScrollProps } from './InfiniteScroll';

// Export par défaut
export { PaginationControls as default } from '../PaginationControls';
