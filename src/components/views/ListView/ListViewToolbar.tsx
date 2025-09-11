import React, { useState, useCallback } from 'react';
import { EntidrViewDefinition, EntidrViewState } from '../../../types/entidr-view';

/**
 * Props pour le composant ListViewToolbar
 */
export interface ListViewToolbarProps {
  /** Définition de la vue */
  view: EntidrViewDefinition;
  /** État actuel de la vue */
  viewState: EntidrViewState;
  /** Mode lecture seule */
  readonly?: boolean;
  /** Mode compact */
  compact?: boolean;
  /** Callback pour la recherche */
  onSearch: (query: string, field?: string) => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
}

/**
 * Composant ListViewToolbar - Barre d'outils de la vue liste
 * Contient la recherche, les filtres et les actions rapides
 */
export const ListViewToolbar: React.FC<ListViewToolbarProps> = ({
  view,
  viewState,
  readonly = false,
  compact = false,
  onSearch,
  onEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  // Gérer la recherche
  const handleSearch = useCallback(() => {
    onSearch(searchQuery, searchField || undefined);
  }, [searchQuery, searchField, onSearch]);

  // Gérer le changement de recherche
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Gérer le changement de champ de recherche
  const handleSearchFieldChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchField(e.target.value);
  }, []);

  // Gérer la touche Entrée dans la recherche
  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Gérer le clic sur le bouton de filtre
  const handleFilterClick = useCallback(() => {
    setShowFilters(!showFilters);
    onEvent('toggleFilters', { show: !showFilters });
  }, [showFilters, onEvent]);

  // Gérer le clic sur le bouton des colonnes
  const handleColumnsClick = useCallback(() => {
    setShowColumns(!showColumns);
    onEvent('toggleColumns', { show: !showColumns });
  }, [showColumns, onEvent]);

  // Gérer le clic sur le bouton de réinitialisation
  const handleResetClick = useCallback(() => {
    setSearchQuery('');
    setSearchField('');
    onSearch('', '');
    onEvent('reset', null);
  }, [onSearch, onEvent]);

  // Obtenir les champs recherchables
  const searchableFields = view.fields.filter(field => field.visible);

  return (
    <div className={`border-b border-gray-200 bg-gray-50 px-4 py-3 ${compact ? 'py-2' : ''}`}>
      <div className="flex items-center justify-between space-x-4">
        {/* Zone de recherche */}
        <div className="flex-1 flex items-center space-x-2">
          <div className="relative flex-1 max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              placeholder="Rechercher..."
              className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearch('', '');
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Sélecteur de champ de recherche */}
          {searchableFields.length > 1 && (
            <select
              value={searchField}
              onChange={handleSearchFieldChange}
              className="rounded-md border-gray-300 py-2 pl-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tous les champs</option>
              {searchableFields.map((field) => (
                <option key={field.name} value={field.name}>
                  {field.label || field.name}
                </option>
              ))}
            </select>
          )}

          {/* Bouton de recherche */}
          <button
            onClick={handleSearch}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Rechercher
          </button>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center space-x-2">
          {/* Bouton de réinitialisation */}
          {(searchQuery || viewState.activeFilters.length > 0) && (
            <button
              onClick={handleResetClick}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Réinitialiser les filtres et la recherche"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {!compact && <span className="ml-2">Réinitialiser</span>}
            </button>
          )}

          {/* Bouton des filtres */}
          <button
            onClick={handleFilterClick}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showFilters || viewState.activeFilters.length > 0
                ? 'border border-blue-500 bg-blue-50 text-blue-700'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Filtres"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {!compact && <span className="ml-2">Filtres</span>}
            {viewState.activeFilters.length > 0 && (
              <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {viewState.activeFilters.length}
              </span>
            )}
          </button>

          {/* Bouton des colonnes */}
          <button
            onClick={handleColumnsClick}
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showColumns
                ? 'border border-blue-500 bg-blue-50 text-blue-700'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Colonnes"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {!compact && <span className="ml-2">Colonnes</span>}
          </button>

          {/* Bouton des paramètres */}
          <button
            onClick={() => onEvent('settings', null)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Paramètres de la vue"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!compact && <span className="ml-2">Paramètres</span>}
          </button>
        </div>
      </div>

      {/* Panneau des filtres (affiché conditionnellement) */}
      {showFilters && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Filtres actifs</h3>
            <button
              onClick={() => onEvent('addFilter', null)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un filtre
            </button>
          </div>

          {viewState.activeFilters.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {viewState.activeFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                >
                  <span>{filter.label}: {filter.value}</span>
                  <button
                    onClick={() => onEvent('removeFilter', filter.id)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-gray-500">Aucun filtre actif</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ListViewToolbar;
