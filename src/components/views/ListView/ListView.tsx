import React, { useCallback, useMemo } from 'react';
import { EntidrViewProps, EntidrViewState } from '../../../types/entidr-view';
import { ListViewHeader } from './ListViewHeader';
import { ListViewToolbar } from './ListViewToolbar';
import { ListViewTable } from './ListViewTable';

/**
 * Props étendues pour le composant ListView
 */
export interface ListViewProps extends EntidrViewProps {
  /** État actuel de la vue */
  viewState: EntidrViewState;
  /** Données filtrées */
  filteredData: any[];
  /** Données paginées */
  paginatedData: any[];
}

/**
 * Composant ListView - Vue tableau/liste
 * Affiche les données sous forme de tableau avec pagination, tri et filtrage
 */
export const ListView: React.FC<ListViewProps> = ({
  view,
  viewState,
  filteredData,
  paginatedData,
  securityContext,
  readonly = false,
  compact = false,
  height,
  width,
  className,
  style,
  onEvent,
  callbacks,
}) => {
  // Calculer les statistiques pour l'affichage
  const stats = useMemo(() => ({
    total: filteredData.length,
    displayed: paginatedData.length,
    page: viewState.pagination.page,
    totalPages: viewState.pagination.totalPages,
    pageSize: viewState.pagination.pageSize,
  }), [filteredData, paginatedData, viewState.pagination]);

  // Gérer les événements du composant
  const handleEvent = useCallback((eventName: string, data: any) => {
    // Transmettre les événements au parent
    if (onEvent) {
      onEvent(eventName, data);
    }
  }, [onEvent]);

  // Gérer la sélection d'un élément
  const handleSelectItem = useCallback((item: any) => {
    handleEvent('select', item);
  }, [handleEvent]);

  // Gérer la sélection multiple
  const handleSelectMultiple = useCallback((items: any[]) => {
    handleEvent('selectMultiple', items);
  }, [handleEvent]);

  // Gérer le tri
  const handleSort = useCallback((field: string, direction: 'ASC' | 'DESC') => {
    handleEvent('sort', { field, type: direction, priority: 1 });
  }, [handleEvent]);

  // Gérer le changement de page
  const handlePageChange = useCallback((page: number) => {
    handleEvent('pageChange', page);
  }, [handleEvent]);

  // Gérer le changement de taille de page
  const handlePageSizeChange = useCallback((pageSize: number) => {
    handleEvent('pageSizeChange', pageSize);
  }, [handleEvent]);

  // Gérer la recherche
  const handleSearch = useCallback((query: string, field?: string) => {
    handleEvent('search', { query, field });
  }, [handleEvent]);

  // Gérer le rafraîchissement
  const handleRefresh = useCallback(() => {
    handleEvent('refresh', null);
  }, [handleEvent]);

  // Classes CSS dynamiques
  const containerClasses = [
    'entidr-list-view',
    'flex',
    'flex-col',
    'h-full',
    compact ? 'compact' : '',
    className || '',
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'flex-1',
    'overflow-hidden',
    'flex',
    'flex-col',
  ].join(' ');

  return (
    <div
      className={containerClasses}
      style={{
        height,
        width,
        ...style,
      }}
    >
      {/* En-tête de la vue */}
      <ListViewHeader
        view={view}
        stats={stats}
        loading={viewState.loading}
        error={viewState.error}
        readonly={readonly}
        onRefresh={handleRefresh}
        onEvent={handleEvent}
      />

      {/* Contenu principal */}
      <div className={contentClasses}>
        {/* Barre d'outils (recherche, filtres, actions) */}
        <ListViewToolbar
          view={view}
          viewState={viewState}
          readonly={readonly}
          compact={compact}
          onSearch={handleSearch}
          onEvent={handleEvent}
        />

        {/* Tableau de données */}
        <ListViewTable
          view={view}
          data={paginatedData}
          selectedItem={viewState.selectedItem}
          selectedItems={viewState.selectedItems}
          readonly={readonly}
          compact={compact}
          onSelectItem={handleSelectItem}
          onSelectMultiple={handleSelectMultiple}
          onSort={handleSort}
          onEvent={handleEvent}
        />

        {/* Pagination */}
        {view.pagination?.enabled && (
          <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{(stats.page - 1) * stats.pageSize + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(stats.page * stats.pageSize, stats.total)}
                </span>{' '}
                sur <span className="font-medium">{stats.total}</span> résultats
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={stats.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} par page
                    </option>
                  ))}
                </select>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(stats.page - 1)}
                    disabled={stats.page <= 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => handlePageChange(stats.page + 1)}
                    disabled={stats.page >= stats.totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
