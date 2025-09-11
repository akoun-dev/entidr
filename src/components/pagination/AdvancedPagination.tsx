import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import type { AdvancedPaginationProps, PageSize } from './PaginationTypes';

/**
 * Composant de pagination avancée avec fonctionnalités complètes
 */
export function AdvancedPagination({
  config,
  state,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  className = '',
  disabled = false,
  showPageSizeSelector = true,
  showPageSelector = true,
  showDetailedInfo = true,
  showQuickNav = true,
  maxPageButtons = 7,
  infoFormat = 'DETAILED',
  customInfoFormatter
}: AdvancedPaginationProps) {
  const { currentPage, totalPages, totalItems, pageSize, loading } = state;
  const texts = config.texts || {};

  // État pour le saut de page
  const [jumpToPage, setJumpToPage] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Convertir pageSize en nombre pour les calculs
  const pageSizeNum = typeof pageSize === 'number' ? pageSize : parseInt(pageSize);
  const startItem = (currentPage - 1) * pageSizeNum + 1;
  const endItem = Math.min(currentPage * pageSizeNum, totalItems);

  // Générer les numéros de page avec ellipses
  const generatePageNumbers = useCallback(() => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxPageButtons / 2);

    // Toujours inclure la première page
    pages.push(1);

    if (currentPage <= half + 1) {
      // Début de la pagination
      for (let i = 2; i <= maxPageButtons - 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
    } else if (currentPage >= totalPages - half) {
      // Fin de la pagination
      pages.push('ellipsis');
      for (let i = totalPages - maxPageButtons + 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Milieu de la pagination
      pages.push('ellipsis');
      for (let i = currentPage - half + 1; i <= currentPage + half - 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
    }

    // Toujours inclure la dernière page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, maxPageButtons]);

  const pageNumbers = generatePageNumbers();

  // Formater les informations de pagination
  const formatPageInfo = useCallback(() => {
    if (customInfoFormatter) {
      return customInfoFormatter(state);
    }

    switch (infoFormat) {
      case 'SIMPLE':
        return `${currentPage} / ${totalPages}`;

      case 'DETAILED':
        return `${texts.showing} ${startItem} ${texts.to} ${endItem} ${texts.of} ${totalItems} ${texts.items}`;

      case 'CUSTOM':
        return `${texts.page} ${currentPage} ${texts.of} ${totalPages} (${totalItems} ${texts.totalItems})`;

      default:
        return `${currentPage} / ${totalPages}`;
    }
  }, [state, customInfoFormatter, infoFormat, texts, startItem, endItem, totalItems, totalPages, currentPage]);

  // Gérer le saut de page
  const handleJumpToPage = useCallback(() => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages && !loading && !disabled) {
      onPageChange?.(page);
      setJumpToPage('');
    }
  }, [jumpToPage, totalPages, loading, disabled, onPageChange]);

  // Rendu des boutons de navigation rapide
  const renderQuickNavigation = () => (
    <div className="flex items-center space-x-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(1)}
        disabled={currentPage <= 1 || loading || disabled}
        title={texts.first}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

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

  // Rendu des numéros de page avec ellipses
  const renderPageNumbers = () => (
    <div className="flex items-center space-x-1">
      {pageNumbers.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 py-1 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange?.(page)}
            disabled={loading || disabled}
            className="w-10 h-10"
          >
            {page}
          </Button>
        )
      )}
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

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange?.(totalPages)}
        disabled={currentPage >= totalPages || loading || disabled}
        title={texts.last}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );

  // Rendu du sélecteur de saut de page
  const renderPageJumper = () => {
    if (!showPageSelector) return null;

    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">{texts.goTo}</span>
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            min="1"
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
            className="w-16 h-8 text-center"
            disabled={loading || disabled}
            placeholder={currentPage.toString()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToPage}
            disabled={!jumpToPage || loading || disabled}
            className="h-8 px-2"
          >
            OK
          </Button>
        </div>
      </div>
    );
  };

  // Rendu du sélecteur de taille de page
  const renderPageSizeSelector = () => {
    if (!showPageSizeSelector) return null;

    const availableSizes = config.availablePageSizes || [10, 25, 50, 100, 200, 500];

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

  // Rendu des informations détaillées
  const renderDetailedInfo = () => {
    if (!showDetailedInfo) return null;

    return (
      <div className="text-sm text-muted-foreground">
        {formatPageInfo()}
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
          <ChevronsRight className="h-4 w-4" />
        )}
      </Button>
    );
  };

  // Rendu du bouton de paramètres
  const renderSettingsButton = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowSettings(!showSettings)}
      disabled={disabled}
      title="Paramètres de pagination"
    >
      <Settings className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Contrôles principaux */}
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Informations de pagination */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {renderDetailedInfo()}
          {renderPageJumper()}
        </div>

        {/* Contrôles de navigation */}
        <div className="flex items-center space-x-2">
          {renderQuickNavigation()}
          {renderPageNumbers()}
          {renderNextNavigation()}
          {renderRefreshButton()}
          {renderSettingsButton()}
        </div>

        {/* Contrôles de taille */}
        <div className="flex items-center space-x-2">
          {renderPageSizeSelector()}
        </div>
      </div>

      {/* Panneau de paramètres */}
      {showSettings && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <h4 className="text-sm font-medium mb-3">Paramètres de pagination</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Style d'information</label>
              <Select
                value={infoFormat}
                onValueChange={(value) => {
                  // Mettre à jour le format d'info (serait géré par le parent dans une implémentation réelle)
                }}
                disabled={disabled}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIMPLE">Simple</SelectItem>
                  <SelectItem value="DETAILED">Détaillé</SelectItem>
                  <SelectItem value="CUSTOM">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Boutons maximum</label>
              <Input
                type="number"
                min="3"
                max="15"
                value={maxPageButtons}
                onChange={(e) => {
                  // Mettre à jour le nombre max de boutons
                }}
                className="h-8"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Options</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showQuickNav"
                  checked={showQuickNav}
                  onChange={(e) => {
                    // Basculer la navigation rapide
                  }}
                  disabled={disabled}
                />
                <label htmlFor="showQuickNav" className="text-xs">Navigation rapide</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation mobile simplifiée */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1 || loading || disabled}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {texts.previous}
        </Button>

        <div className="text-center">
          <div className="text-sm font-medium">{formatPageInfo()}</div>
          <div className="text-xs text-muted-foreground">
            {texts.page} {currentPage} {texts.of} {totalPages}
          </div>
        </div>

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

export default AdvancedPagination;
