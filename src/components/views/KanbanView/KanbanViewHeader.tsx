import React from 'react';
import { EntidrViewDefinition } from '../../../types/entidr-view';

/**
 * Props pour le composant KanbanViewHeader
 */
export interface KanbanViewHeaderProps {
  /** Définition de la vue */
  view: EntidrViewDefinition;
  /** Nombre total de cartes */
  totalCards: number;
  /** Mode lecture seule */
  readonly?: boolean;
  /** État de chargement */
  loading: boolean;
  /** Message d'erreur */
  error?: string;
  /** Callback pour la configuration */
  onConfig: () => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
}

/**
 * Composant KanbanViewHeader - En-tête du Kanban
 * Affiche le titre, les statistiques et les actions principales
 */
export const KanbanViewHeader: React.FC<KanbanViewHeaderProps> = ({
  view,
  totalCards,
  readonly = false,
  loading,
  error,
  onConfig,
  onEvent,
}) => {
  // Gérer le clic sur le bouton de rafraîchissement
  const handleRefreshClick = () => {
    onEvent('refresh', null);
  };

  // Gérer le clic sur le bouton de vue liste
  const handleListViewClick = () => {
    onEvent('changeView', { viewType: 'LIST' });
  };

  // Gérer le clic sur le bouton de vue formulaire
  const handleFormViewClick = () => {
    onEvent('changeView', { viewType: 'FORM' });
  };

  // Gérer le clic sur le bouton d'ajout
  const handleAddClick = () => {
    onEvent('add', null);
  };

  // Gérer le clic sur le bouton d'export
  const handleExportClick = () => {
    onEvent('export', null);
  };

  // Gérer le clic sur le bouton d'import
  const handleImportClick = () => {
    onEvent('import', null);
  };

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        {/* Informations sur la vue */}
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">{view.name}</h2>
            {view.description && (
              <p className="text-sm text-gray-500">{view.description}</p>
            )}
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-gray-500">Chargement...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 text-red-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
            <span>
              {totalCards} carte{totalCards !== 1 ? 's' : ''} au total
            </span>
            {view.fields.find(field => field.widget === 'SELECT' || field.widget === 'RADIO') && (
              <span>
                Organisé par statut
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Bouton de rafraîchissement */}
          <button
            onClick={handleRefreshClick}
            disabled={loading}
            className="rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            title="Rafraîchir"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Boutons de changement de vue */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={handleListViewClick}
              className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              title="Vue liste"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={handleFormViewClick}
              className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              title="Vue formulaire"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>

          {/* Boutons d'import/export si permissions accordées */}
          {view.permissions?.import && !readonly && (
            <button
              onClick={handleImportClick}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Importer
            </button>
          )}

          {view.permissions?.export && (
            <button
              onClick={handleExportClick}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter
            </button>
          )}

          {/* Bouton de création si permissions accordées */}
          {view.permissions?.create && !readonly && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
          )}

          {/* Bouton de configuration */}
          <button
            onClick={onConfig}
            className="rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Configuration"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Actions personnalisées */}
          {view.actions?.map((action) => (
            <button
              key={action.id}
              onClick={() => onEvent('actionClick', { actionId: action.id })}
              disabled={!action.enabled}
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                action.style === 'primary'
                  ? 'border border-transparent bg-blue-600 text-white hover:bg-blue-700'
                  : action.style === 'secondary'
                  ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : action.style === 'success'
                  ? 'border border-transparent bg-green-600 text-white hover:bg-green-700'
                  : action.style === 'warning'
                  ? 'border border-transparent bg-yellow-600 text-white hover:bg-yellow-700'
                  : action.style === 'danger'
                  ? 'border border-transparent bg-red-600 text-white hover:bg-red-700'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              } ${!action.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {action.icon && (
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {/* Icône générique */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanViewHeader;
