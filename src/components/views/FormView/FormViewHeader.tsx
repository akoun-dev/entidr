import React from 'react';
import { EntidrViewDefinition } from '../../../types/entidr-view';

/**
 * Props pour le composant FormViewHeader
 */
export interface FormViewHeaderProps {
  /** Définition de la vue */
  view: EntidrViewDefinition;
  /** Élément en cours d'édition */
  editingItem?: any;
  /** Formulaire modifié */
  isDirty: boolean;
  /** Formulaire valide */
  isValid: boolean;
  /** Mode lecture seule */
  readonly?: boolean;
  /** État de chargement */
  loading: boolean;
  /** Message d'erreur */
  error?: string;
  /** Callback pour la suppression */
  onDelete: () => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
}

/**
 * Composant FormViewHeader - En-tête du formulaire
 * Affiche le titre, l'état et les actions principales
 */
export const FormViewHeader: React.FC<FormViewHeaderProps> = ({
  view,
  editingItem,
  isDirty,
  isValid,
  readonly = false,
  loading,
  error,
  onDelete,
  onEvent,
}) => {
  // Gérer le clic sur le bouton de retour
  const handleBackClick = () => {
    onEvent('back', null);
  };

  // Gérer le clic sur le bouton d'aide
  const handleHelpClick = () => {
    onEvent('help', null);
  };

  // Obtenir le titre en fonction du mode
  const getTitle = () => {
    if (editingItem) {
      return `Modification: ${view.name}`;
    }
    return `Nouveau: ${view.name}`;
  };

  // Obtenir le sous-titre
  const getSubtitle = () => {
    if (editingItem) {
      return `ID: ${editingItem.id}`;
    }
    return 'Création d\'un nouvel enregistrement';
  };

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        {/* Informations sur le formulaire */}
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackClick}
              className="mr-2 rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Retour"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
              {view.description && (
                <p className="text-sm text-gray-500">{view.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">{getSubtitle()}</p>
            </div>

            {/* Indicateurs d'état */}
            <div className="flex items-center space-x-2">
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

              {isDirty && (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 text-yellow-500">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-yellow-600">Modifications non sauvegardées</span>
                </div>
              )}

              {!isValid && (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 text-red-500">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-red-600">Erreurs de validation</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Bouton d'aide */}
          <button
            onClick={handleHelpClick}
            className="rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Aide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Bouton de suppression (seulement en mode édition) */}
          {editingItem && view.permissions?.delete && !readonly && (
            <button
              onClick={onDelete}
              className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          )}

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

export default FormViewHeader;
