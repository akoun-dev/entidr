import React from 'react';
import {
  PaginationType,
  PaginationPosition,
  PageSize,
  PaginationConfig,
  PaginationState,
  PaginationControlsProps,
  PaginationEvent
} from './PaginationTypes';

/**
 * Composant PaginationControls - Contrôles de pagination principaux
 */
export class PaginationControls extends React.Component<PaginationControlsProps> {
  /**
   * Générer un identifiant unique
   */
  private generateId = (): string => {
    return `pagination_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Calculer le nombre total de pages
   */
  private calculateTotalPages = (totalItems: number, pageSize: PageSize): number => {
    if (pageSize === 'ALL') return 1;
    return Math.ceil(totalItems / pageSize);
  };

  /**
   * Calculer l'index de départ
   */
  private calculateStartIndex = (currentPage: number, pageSize: PageSize): number => {
    if (pageSize === 'ALL') return 0;
    return (currentPage - 1) * pageSize;
  };

  /**
   * Calculer l'index de fin
   */
  private calculateEndIndex = (currentPage: number, pageSize: PageSize, totalItems: number): number => {
    if (pageSize === 'ALL') return totalItems;
    const endIndex = currentPage * pageSize;
    return Math.min(endIndex, totalItems);
  };

  /**
   * Gérer le changement de page
   */
  private handlePageChange = (page: number): void => {
    const { state, onPageChange } = this.props;
    const totalPages = this.calculateTotalPages(state.totalItems, state.pageSize);

    if (page >= 1 && page <= totalPages && !state.loading) {
      onPageChange?.(page);
    }
  };

  /**
   * Gérer le changement de taille de page
   */
  private handlePageSizeChange = (pageSize: PageSize): void => {
    const { onPageSizeChange } = this.props;
    onPageSizeChange?.(pageSize);
  };

  /**
   * Gérer le chargement de plus
   */
  private handleLoadMore = (): void => {
    const { onLoadMore, state } = this.props;
    if (!state.loadingMore && state.hasMoreItems) {
      onLoadMore?.();
    }
  };

  /**
   * Gérer le rafraîchissement
   */
  private handleRefresh = (): void => {
    const { onRefresh, state } = this.props;
    if (!state.loading) {
      onRefresh?.();
    }
  };

  /**
   * Gérer la navigation vers la première page
   */
  private goToFirstPage = (): void => {
    this.handlePageChange(1);
  };

  /**
   * Gérer la navigation vers la page précédente
   */
  private goToPreviousPage = (): void => {
    const { state } = this.props;
    this.handlePageChange(state.currentPage - 1);
  };

  /**
   * Gérer la navigation vers la page suivante
   */
  private goToNextPage = (): void => {
    const { state } = this.props;
    this.handlePageChange(state.currentPage + 1);
  };

  /**
   * Gérer la navigation vers la dernière page
   */
  private goToLastPage = (): void => {
    const { state } = this.props;
    const totalPages = this.calculateTotalPages(state.totalItems, state.pageSize);
    this.handlePageChange(totalPages);
  };

  /**
   * Générer les numéros de page à afficher
   */
  private generatePageNumbers = (): number[] => {
    const { state, config } = this.props;
    const { currentPage, totalPages } = state;
    const maxPageButtons = config.maxPageButtons || 5;

    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxPageButtons / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = maxPageButtons;
    } else if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxPageButtons + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  /**
   * Rendre les informations de pagination
   */
  private renderPageInfo = (): React.ReactNode => {
    const { state, config } = this.props;
    const { currentPage, totalItems } = state;
    const pageSize = state.pageSize;
    const startIndex = this.calculateStartIndex(currentPage, pageSize);
    const endIndex = this.calculateEndIndex(currentPage, pageSize, totalItems);
    const totalPages = this.calculateTotalPages(totalItems, pageSize);

    if (!config.showPageInfo) return null;

    const texts = config.texts || {};

    return (
      <div className="pagination-info text-sm text-gray-600">
        {texts.showing || 'Affichage'} {startIndex + 1} {texts.to || 'à'} {endIndex} {texts.of || 'de'}{' '}
        {totalItems} {texts.items || 'éléments'}
        {config.showTotalPages && (
          <span>
            {' '}(Page {currentPage} {texts.of || 'de'} {totalPages})
          </span>
        )}
      </div>
    );
  };

  /**
   * Rendre le sélecteur de taille de page
   */
  private renderPageSizeSelector = (): React.ReactNode => {
    const { state, config, disabled } = this.props;
    const { pageSize } = state;

    if (!config.showPageSizeSelector) return null;

    const availablePageSizes = config.availablePageSizes || [10, 25, 50, 100];
    const texts = config.texts || {};

    return (
      <select
        value={pageSize}
        onChange={(e) => this.handlePageSizeChange(e.target.value as PageSize)}
        disabled={disabled || state.loading}
        className="border rounded px-2 py-1 text-sm"
      >
        {availablePageSizes.map(size => (
          <option key={size} value={size}>
            {size === 'ALL' ? 'Tous' : `${size} ${texts.pageSize || 'par page'}`}
          </option>
        ))}
      </select>
    );
  };

  /**
   * Rendre les boutons de navigation
   */
  private renderNavigationButtons = (): React.ReactNode => {
    const { state, config, disabled } = this.props;
    const { currentPage, totalPages } = state;
    const texts = config.texts || {};

    return (
      <div className="flex gap-1">
        <button
          onClick={this.goToFirstPage}
          disabled={disabled || state.loading || currentPage === 1}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
          title={texts.first || 'Première'}
        >
          «
        </button>
        <button
          onClick={this.goToPreviousPage}
          disabled={disabled || state.loading || currentPage === 1}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
          title={texts.previous || 'Précédent'}
        >
          ‹
        </button>
        <button
          onClick={this.goToNextPage}
          disabled={disabled || state.loading || currentPage === totalPages}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
          title={texts.next || 'Suivant'}
        >
          ›
        </button>
        <button
          onClick={this.goToLastPage}
          disabled={disabled || state.loading || currentPage === totalPages}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
          title={texts.last || 'Dernière'}
        >
          »
        </button>
      </div>
    );
  };

  /**
   * Rendre les numéros de page
   */
  private renderPageNumbers = (): React.ReactNode => {
    const { state, config, disabled } = this.props;
    const { currentPage } = state;
    const pageNumbers = this.generatePageNumbers();

    if (!config.maxPageButtons || pageNumbers.length <= 1) return null;

    return (
      <div className="flex gap-1">
        {pageNumbers.map(pageNumber => (
          <button
            key={pageNumber}
            onClick={() => this.handlePageChange(pageNumber)}
            disabled={disabled || state.loading || pageNumber === currentPage}
            className={`px-2 py-1 text-sm border rounded ${
              pageNumber === currentPage
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            {pageNumber}
          </button>
        ))}
      </div>
    );
  };

  /**
   * Rendre le bouton de rafraîchissement
   */
  private renderRefreshButton = (): React.ReactNode => {
    const { state, disabled } = this.props;
    const texts = this.props.config.texts || {};

    return (
      <button
        onClick={this.handleRefresh}
        disabled={disabled || state.loading}
        className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
        title="Rafraîchir"
      >
        {state.loading ? '⏳' : '🔄'}
      </button>
    );
  };

  /**
   * Rendre les contrôles de pagination simple
   */
  private renderSimplePagination = (): React.ReactNode => {
    return (
      <div className="flex items-center gap-2">
        {this.renderNavigationButtons()}
        {this.renderPageNumbers()}
        {this.renderPageSizeSelector()}
        {this.renderRefreshButton()}
      </div>
    );
  };

  /**
   * Rendre les contrôles de pagination avancée
   */
  private renderAdvancedPagination = (): React.ReactNode => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {this.renderPageInfo()}
          <div className="flex items-center gap-2">
            {this.renderPageSizeSelector()}
            {this.renderRefreshButton()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          {this.renderNavigationButtons()}
          {this.renderPageNumbers()}
        </div>
      </div>
    );
  };

  /**
   * Rendre les contrôles de chargement infini
   */
  private renderInfiniteScroll = (): React.ReactNode => {
    const { state, disabled } = this.props;
    const texts = this.props.config.texts || {};

    return (
      <div className="flex flex-col items-center gap-2">
        {state.loadingMore && (
          <div className="text-sm text-gray-600">
            {texts.loading || 'Chargement...'}
          </div>
        )}
        {state.hasMoreItems && !state.loadingMore && (
          <button
            onClick={this.handleLoadMore}
            disabled={disabled}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {texts.loadMore || 'Charger plus'}
          </button>
        )}
        {!state.hasMoreItems && (
          <div className="text-sm text-gray-500">
            {texts.noMoreItems || 'Plus d\'éléments à charger'}
          </div>
        )}
      </div>
    );
  };

  render(): React.ReactNode {
    const { type, config, className = '', style, position } = this.props;

    const containerClasses = [
      'pagination-controls',
      `pagination-${config.type.toLowerCase()}`,
      position ? `pagination-${position.toLowerCase()}` : '',
      className
    ].filter(Boolean).join(' ');

    let content: React.ReactNode;

    switch (type || config.type) {
      case 'SIMPLE':
        content = this.renderSimplePagination();
        break;
      case 'ADVANCED':
        content = this.renderAdvancedPagination();
        break;
      case 'INFINITE':
        content = this.renderInfiniteScroll();
        break;
      default:
        content = this.renderSimplePagination();
    }

    return (
      <div className={containerClasses} style={style}>
        {content}
      </div>
    );
  }
}

export default PaginationControls;
