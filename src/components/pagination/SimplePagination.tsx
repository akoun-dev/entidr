import React from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { SimplePaginationProps, PageSize } from './PaginationTypes';

/**
 * Composant de pagination simple avec navigation basique
 */
export function SimplePagination({
  config,
  state,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  className = '',
  disabled = false,
  style = 'BUTTONS',
  showQuickNav = true,
  showPageSelector = false,
  maxPageButtons = 5
}: SimplePaginationProps) {
  const { currentPage, totalPages, totalItems, pageSize, loading } = state;
  const texts = config.texts || {};

  // Convertir pageSize en nombre pour les calculs
  const pageSizeNum = typeof pageSize === 'number' ? pageSize : parseInt(pageSize);
  const startItem = (currentPage - 1) * pageSizeNum + 1;
  const endItem = Math.min(currentPage * pageSizeNum, totalItems);

  // Générer les numéros de page à afficher
  const generatePageNumbers = () => {
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

  const pageNumbers = generatePageNumbers();

  // Rendu des boutons de navigation
  const renderButtonNavigation = () => (
    <div className="flex items-center space-x-1">
      {showQuickNav && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(1)}
          disabled={currentPage <= 1 || loading || disabled}
          title={texts.first}
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronLeft className="h-4 w-4 -ml-3" />
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1 || loading || disabled}
        title={texts.previous}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );

  // Rendu des numéros de page
  const renderPageNumbers = () => (
    <div className="flex items-center space-x-1">
      {pageNumbers.map(pageNumber => (
        <Button
          key={pageNumber}
          variant={currentPage === pageNumber ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange?.(pageNumber)}
          disabled={loading || disabled}
          className="w-10 h-10"
        >
          {pageNumber}
        </Button>
      ))}
    </div>
  );

  // Rendu de la navigation suivante
  const renderNextNavigation = () => (
    <div className="flex items-center space-x-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages || loading || disabled}
        title={texts.next}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {showQuickNav && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(totalPages)}
          disabled={currentPage >= totalPages || loading || disabled}
          title={texts.last}
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-3" />
        </Button>
      )}
    </div>
  );

  // Rendu du sélecteur de page
  const renderPageSelector = () => {
    if (!showPageSelector) return null;

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">{texts.goTo}</span>
        <Select
          value={currentPage.toString()}
          onValueChange={(value) => onPageChange?.(parseInt(value))}
          disabled={loading || disabled}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <SelectItem key={page} value={page.toString()}>
                {page}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Rendu du sélecteur de taille de page
  const renderPageSizeSelector = () => {
    if (style !== 'SELECT') return null;

    const availableSizes = config.availablePageSizes || [10, 25, 50, 100];

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">{texts.pageSize}</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange?.(parseInt(value) as PageSize)}
          disabled={loading || disabled}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableSizes.map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size === 'ALL' ? texts.items : size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Rendu des informations de pagination
  const renderPageInfo = () => {
    if (!config.showPageInfo) return null;

    return (
      <div className="text-sm text-muted-foreground">
        {texts.showing} {startItem} {texts.to} {endItem} {texts.of} {totalItems} {texts.items}
      </div>
    );
  };

  // Rendu du bouton de rafraîchissement
  const renderRefreshButton = () => {
    if (!onRefresh) return null;

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading || disabled}
        title={texts.loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    );
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Informations et contrôles principaux */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        {renderPageInfo()}

        <div className="flex items-center space-x-2">
          {renderButtonNavigation()}
          {renderPageNumbers()}
          {renderNextNavigation()}
          {renderRefreshButton()}
        </div>

        <div className="flex items-center space-x-2">
          {renderPageSelector()}
          {renderPageSizeSelector()}
        </div>
      </div>

      {/* Navigation simplifiée pour mobile */}
      <div className="flex items-center justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1 || loading || disabled}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {texts.previous}
        </Button>

        <span className="text-sm">
          {texts.page} {currentPage} {texts.of} {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages || loading || disabled}
        >
          {texts.next}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default SimplePagination;
