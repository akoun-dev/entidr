import React from 'react';
import type {
  PaginationConfig,
  PaginationState,
  PaginationControlsProps
} from './pagination/PaginationTypes';
import { SimplePagination } from './pagination/SimplePagination';
import { AdvancedPagination } from './pagination/AdvancedPagination';
import { InfiniteScroll } from './pagination/InfiniteScroll';

/**
 * Composant principal de pagination qui route vers le type approprié
 */
export function PaginationControls({
  config,
  state,
  onPageChange,
  onPageSizeChange,
  onLoadMore,
  onRefresh,
  className = '',
  disabled = false
}: PaginationControlsProps) {
  // Configuration par défaut
  const defaultConfig: PaginationConfig = {
    type: 'SIMPLE',
    position: 'BOTTOM',
    defaultPageSize: 10,
    style: 'BUTTONS',
    showTotalItems: true,
    showPageInfo: true,
    maxPageButtons: 5,
    enableQuickNavigation: true,
    texts: {
      previous: 'Précédent',
      next: 'Suivant',
      first: 'Premier',
      last: 'Dernier',
      page: 'Page',
      of: 'sur',
      items: 'éléments',
      showing: 'Affichage',
      to: 'à',
      loading: 'Chargement...',
      loadMore: 'Charger plus',
      noMoreItems: 'Plus d\'éléments',
      goTo: 'Aller à',
      pageSize: 'Par page',
      totalItems: 'Total',
      totalPages: 'Pages'
    }
  };

  // État par défaut
  const defaultState: PaginationState = {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    loading: false,
    loadingMore: false,
    hasMoreItems: true,
    loadedItems: 0,
    offset: 0
  };

  const finalConfig: PaginationConfig = { ...defaultConfig, ...config };
  const finalState: PaginationState = { ...defaultState, ...state };

  // Router vers le composant approprié en fonction du type
  switch (finalConfig.type) {
    case 'SIMPLE':
      return (
        <SimplePagination
          config={finalConfig}
          state={finalState}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onRefresh={onRefresh}
          className={className}
          disabled={disabled}
          style={finalConfig.style === 'SCROLL' ? 'BUTTONS' : finalConfig.style}
          showQuickNav={finalConfig.enableQuickNavigation}
          maxPageButtons={finalConfig.maxPageButtons}
        />
      );

    case 'ADVANCED':
      return (
        <AdvancedPagination
          config={finalConfig}
          state={finalState}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onRefresh={onRefresh}
          className={className}
          disabled={disabled}
          showPageSizeSelector={true}
          showPageSelector={true}
          showDetailedInfo={finalConfig.showPageInfo}
          showQuickNav={finalConfig.enableQuickNavigation}
          maxPageButtons={finalConfig.maxPageButtons}
          infoFormat="DETAILED"
        />
      );

    case 'INFINITE':
      return (
        <InfiniteScroll
          config={finalConfig}
          state={finalState}
          onLoadMore={onLoadMore}
          onRefresh={onRefresh}
          className={className}
          disabled={disabled}
          threshold={100}
          disableAutoLoad={false}
          showLoadMoreButton={true}
          showLoadingIndicator={true}
        />
      );

    default:
      return (
        <SimplePagination
          config={finalConfig}
          state={finalState}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onRefresh={onRefresh}
          className={className}
          disabled={disabled}
          style={finalConfig.style === 'SCROLL' ? 'BUTTONS' : finalConfig.style}
          showQuickNav={finalConfig.enableQuickNavigation}
          maxPageButtons={finalConfig.maxPageButtons}
        />
      );
  }
}

export default PaginationControls;
