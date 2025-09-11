import React from 'react';

/**
 * Props pour le composant FormViewValidation
 */
export interface FormViewValidationProps {
  /** Erreurs de validation */
  errors: Record<string, string>;
  /** Mode compact */
  compact?: boolean;
}

/**
 * Composant FormViewValidation - Messages de validation
 * Affiche les erreurs de validation du formulaire
 */
export const FormViewValidation: React.FC<FormViewValidationProps> = ({
  errors,
  compact = false,
}) => {
  // Obtenir le nombre d'erreurs
  const errorCount = Object.keys(errors).length;

  // S'il n'y a pas d'erreurs, ne rien afficher
  if (errorCount === 0) {
    return null;
  }

  return (
    <div className={`border-l-4 border-red-400 bg-red-50 p-4 ${compact ? 'p-3' : ''}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium text-red-800 ${compact ? 'text-sm' : 'text-base'}`}>
            {errorCount} erreur{errorCount > 1 ? 's' : ''} de validation
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc space-y-1 pl-5">
              {Object.entries(errors).map(([fieldName, errorMessage]) => (
                <li key={fieldName}>
                  <span className="font-medium">{fieldName}:</span> {errorMessage}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                type="button"
                onClick={() => {
                  // Faire défiler jusqu'au premier champ en erreur
                  const firstErrorField = Object.keys(errors)[0];
                  const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                  }
                }}
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                Voir le premier champ en erreur
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormViewValidation;
