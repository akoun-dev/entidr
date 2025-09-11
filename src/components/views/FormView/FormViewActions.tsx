import React from 'react';

/**
 * Props pour le composant FormViewActions
 */
export interface FormViewActionsProps {
  /** Le formulaire peut être soumis */
  canSubmit: boolean;
  /** Le formulaire a été modifié */
  isDirty: boolean;
  /** Mode lecture seule */
  readonly?: boolean;
  /** État de chargement */
  loading: boolean;
  /** Callback pour la soumission */
  onSubmit: () => void;
  /** Callback pour l'annulation */
  onCancel: () => void;
  /** Callback pour la suppression */
  onDelete: () => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
}

/**
 * Composant FormViewActions - Actions du formulaire
 * Affiche les boutons d'action en bas du formulaire
 */
export const FormViewActions: React.FC<FormViewActionsProps> = ({
  canSubmit,
  isDirty,
  readonly = false,
  loading,
  onSubmit,
  onCancel,
  onDelete,
  onEvent,
}) => {
  // Gérer le clic sur le bouton de sauvegarde
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Gérer le clic sur le bouton d'annulation
  const handleCancel = () => {
    // Si le formulaire est modifié, demander confirmation
    if (isDirty && !readonly) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  // Gérer le clic sur le bouton de réinitialisation
  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le formulaire ? Toutes les modifications seront perdues.')) {
      onEvent('reset', null);
    }
  };

  // Gérer le clic sur le bouton de duplication
  const handleDuplicate = () => {
    onEvent('duplicate', null);
  };

  // Gérer le clic sur le bouton d'impression
  const handlePrint = () => {
    onEvent('print', null);
    window.print();
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Actions à gauche */}
        <div className="flex items-center space-x-2">
          {/* Bouton de réinitialisation (si modifié et pas lecture seule) */}
          {isDirty && !readonly && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
          )}

          {/* Bouton de duplication (seulement en mode édition) */}
          {!readonly && (
            <button
              type="button"
              onClick={handleDuplicate}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Dupliquer
            </button>
          )}

          {/* Bouton d'impression */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center space-x-3">
          {/* Bouton d'annulation */}
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            Annuler
          </button>

          {/* Bouton de sauvegarde */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              canSubmit && !loading
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sauvegarde...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Indicateur d'état supplémentaire */}
      {isDirty && !readonly && (
        <div className="mt-2 text-center">
          <p className="text-xs text-yellow-600">
            <svg className="inline-block h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Des modifications n'ont pas été sauvegardées
          </p>
        </div>
      )}
    </div>
  );
};

export default FormViewActions;
