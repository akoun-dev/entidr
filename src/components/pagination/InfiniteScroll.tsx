import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import type { InfiniteScrollProps } from './PaginationTypes';

/**
 * Composant de pagination par défilement infini
 */
export function InfiniteScroll({
  config,
  state,
  onLoadMore,
  onRefresh,
  onScroll,
  onNearBottom,
  className = '',
  disabled = false,
  threshold = 100,
  parentElement = null,
  rootElement = null,
  disableAutoLoad = false,
  showLoadMoreButton = true,
  loadMoreButtonText,
  noMoreItemsText,
  showLoadingIndicator = true
}: InfiniteScrollProps) {
  const { loading, loadingMore, hasMoreItems, loadedItems, totalItems } = state;
  const texts = config.texts || {};

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Textes personnalisés ou par défaut
  const finalLoadMoreText = loadMoreButtonText || texts.loadMore || 'Charger plus';
  const finalNoMoreItemsText = noMoreItemsText || texts.noMoreItems || 'Plus d\'éléments à charger';

  // Détecter quand l'utilisateur est proche du bas
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop || window.pageYOffset;
    const scrollHeight = target.scrollHeight || document.documentElement.scrollHeight;
    const clientHeight = target.clientHeight || window.innerHeight;

    setScrollPosition(scrollTop);

    // Calculer si on est proche du bas
    const nearBottom = scrollHeight - (scrollTop + clientHeight) <= threshold;
    setIsNearBottom(nearBottom);

    // Notifier le parent du scroll
    onScroll?.(event);

    // Notifier quand on est proche du bas
    if (nearBottom && !isNearBottom) {
      onNearBottom?.();
    }
  }, [threshold, onScroll, onNearBottom, isNearBottom]);

  // Configurer l'observer pour le chargement automatique
  useEffect(() => {
    if (disableAutoLoad || disabled || loading || loadingMore || !hasMoreItems) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMoreItems && !loading && !loadingMore && !disabled) {
            onLoadMore?.();
          }
        });
      },
      {
        root: rootElement,
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [disableAutoLoad, disabled, loading, loadingMore, hasMoreItems, onLoadMore, threshold, rootElement]);

  // Configurer l'écouteur de scroll
  useEffect(() => {
    const element = parentElement || window;

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [parentElement, handleScroll]);

  // Gérer le chargement manuel
  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMoreItems && !disabled) {
      onLoadMore?.();
    }
  }, [loading, loadingMore, hasMoreItems, disabled, onLoadMore]);

  // Gérer le rafraîchissement
  const handleRefresh = useCallback(() => {
    if (!loading && !disabled) {
      onRefresh?.();
    }
  }, [loading, disabled, onRefresh]);

  // Calculer le pourcentage de chargement
  const loadPercentage = totalItems > 0 ? Math.round((loadedItems / totalItems) * 100) : 0;

  // Rendu de l'indicateur de chargement
  const renderLoadingIndicator = () => {
    if (!showLoadingIndicator || (!loading && !loadingMore)) return null;

    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          {loading ? texts.loading || 'Chargement...' : texts.loading || 'Chargement...'}
        </span>
      </div>
    );
  };

  // Rendu du bouton "Charger plus"
  const renderLoadMoreButton = () => {
    if (!showLoadMoreButton || !hasMoreItems || loading || loadingMore) return null;

    return (
      <div className="flex items-center justify-center py-4">
        <Button
          variant="outline"
          onClick={handleLoadMore}
          disabled={disabled}
          className="min-w-32"
        >
          {finalLoadMoreText}
        </Button>
      </div>
    );
  };

  // Rendu du message "plus d'éléments"
  const renderNoMoreItems = () => {
    if (hasMoreItems || loading || loadingMore) return null;

    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">{finalNoMoreItemsText}</span>
      </div>
    );
  };

  // Rendu des informations de progression
  const renderProgressInfo = () => {
    if (!config.showPageInfo) return null;

    return (
      <div className="flex items-center justify-between py-2 px-4 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">
          {loadedItems} {texts.of || 'sur'} {totalItems} {texts.items || 'éléments'} chargés
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-24 bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadPercentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground min-w-12">
            {loadPercentage}%
          </span>
        </div>
      </div>
    );
  };

  // Rendu des contrôles
  const renderControls = () => (
    <div className={`flex items-center justify-between p-4 border-t ${className}`}>
      {/* Informations de progression */}
      {renderProgressInfo()}

      {/* Contrôles d'action */}
      <div className="flex items-center space-x-2">
        {/* Bouton de rafraîchissement */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || disabled}
            title="Rafraîchir"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Indicateur de position */}
        <div className="text-xs text-muted-foreground">
          Position: {Math.round(scrollPosition)}px
        </div>

        {/* Indicateur d'état */}
        {isNearBottom && (
          <div className="flex items-center text-xs text-blue-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Proche du bas
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Contenu principal (les enfants seront rendus par le parent) */}
      <div className="flex-1">
        {/* L'élément sentinel pour l'intersection observer */}
        <div ref={sentinelRef} className="h-1 w-full" />
      </div>

      {/* Indicateurs de chargement et contrôles */}
      <div className="space-y-2">
        {renderLoadingIndicator()}
        {renderLoadMoreButton()}
        {renderNoMoreItems()}
        {renderControls()}
      </div>

      {/* Overlay de chargement global */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-4 flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium">{texts.loading || 'Chargement...'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default InfiniteScroll;
