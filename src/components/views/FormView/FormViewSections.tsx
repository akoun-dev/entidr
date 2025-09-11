import React from 'react';

/**
 * Props pour le composant FormViewSections
 */
export interface FormViewSectionsProps {
  /** Sections du formulaire */
  sections: any[];
  /** Index de la section active */
  activeSection: number;
  /** Données du formulaire */
  formData: any;
  /** Erreurs du formulaire */
  formErrors: Record<string, string>;
  /** Mode lecture seule */
  readonly?: boolean;
  /** Mode compact */
  compact?: boolean;
  /** Callback pour le changement de champ */
  onFieldChange: (fieldName: string, value: any) => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
}

/**
 * Composant FormViewSections - Sections du formulaire
 * Affiche les sections et leurs champs
 */
export const FormViewSections: React.FC<FormViewSectionsProps> = ({
  sections,
  activeSection,
  formData,
  formErrors,
  readonly = false,
  compact = false,
  onFieldChange,
  onEvent,
}) => {
  // Rendu d'un champ de formulaire
  const renderField = (field: any) => {
    const value = formData[field.name];
    const error = formErrors[field.name];
    const isRequired = field.required;
    const isDisabled = readonly || field.readonly;

    // Classes CSS dynamiques
    const fieldClasses = [
      'mb-4',
      compact ? 'mb-3' : '',
    ].join(' ');

    const labelClasses = [
      'block',
      'text-sm',
      'font-medium',
      'text-gray-700',
      isRequired ? 'required' : '',
      compact ? 'text-sm' : '',
    ].join(' ');

    const inputClasses = [
      'mt-1',
      'block',
      'w-full',
      'rounded-md',
      'border-gray-300',
      'shadow-sm',
      'focus:border-blue-500',
      'focus:ring-blue-500',
      'sm:text-sm',
      error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
      isDisabled ? 'bg-gray-50 cursor-not-allowed' : '',
      compact ? 'py-1' : 'py-2',
    ].join(' ');

    const errorClasses = [
      'mt-1',
      'text-sm',
      'text-red-600',
    ].join(' ');

    // Handler pour le changement de valeur
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      let newValue: any = e.target.value;

      // Conversion pour les champs numériques
      if (field.widget === 'NUMBER' || field.widget === 'CURRENCY') {
        newValue = e.target.value ? Number(e.target.value) : null;
      }

      // Conversion pour les booléens
      if (field.widget === 'BOOLEAN') {
        newValue = (e.target as HTMLInputElement).checked;
      }

      onFieldChange(field.name, newValue);
    };

    // Rendu selon le type de widget
    const renderInput = () => {
      switch (field.widget) {
        case 'TEXTAREA':
          return (
            <textarea
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              rows={field.rows || 3}
              className={inputClasses}
              placeholder={field.placeholder}
            />
          );

        case 'SELECT':
          return (
            <select
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClasses}
            >
              <option value="">-- Sélectionner --</option>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'MULTISELECT':
          return (
            <select
              name={field.name}
              value={value || []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                onFieldChange(field.name, selectedOptions);
              }}
              disabled={isDisabled}
              multiple
              className={inputClasses}
              size={field.size || 3}
            >
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'CHECKBOX':
          return (
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={value || false}
                  onChange={handleChange}
                  disabled={isDisabled}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {field.checkboxLabel || field.label}
                </span>
              </label>
            </div>
          );

        case 'RADIO':
          return (
            <div className="mt-2 space-x-4">
              {field.options?.map((option: any) => (
                <label key={option.value} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={field.name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          );

        case 'DATE':
          return (
            <input
              type="date"
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClasses}
            />
          );

        case 'DATETIME':
          return (
            <input
              type="datetime-local"
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClasses}
            />
          );

        case 'TIME':
          return (
            <input
              type="time"
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClasses}
            />
          );

        case 'BOOLEAN':
          return (
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={value || false}
                  onChange={handleChange}
                  disabled={isDisabled}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {field.label}
                </span>
              </label>
            </div>
          );

        case 'EMAIL':
          return (
            <input
              type="email"
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClasses}
              placeholder={field.placeholder || 'exemple@email.com'}
            />
          );

        case 'URL':
          return (
            <input
              type="url"
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClasses}
              placeholder={field.placeholder || 'https://exemple.com'}
            />
          );

        case 'PASSWORD':
          return (
            <input
              type="password"
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClasses}
              placeholder={field.placeholder}
            />
          );

        case 'COLOR':
          return (
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="color"
                name={field.name}
                value={value || '#000000'}
                onChange={handleChange}
                disabled={isDisabled}
                className="h-10 w-16 rounded border border-gray-300"
              />
              <input
                type="text"
                value={value || ''}
                onChange={handleChange}
                disabled={isDisabled}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="#000000"
              />
            </div>
          );

        case 'NUMBER':
        case 'CURRENCY':
          return (
            <div className="mt-1 relative rounded-md shadow-sm">
              {field.widget === 'CURRENCY' && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
              )}
              <input
                type="number"
                name={field.name}
                value={value || ''}
                onChange={handleChange}
                disabled={isDisabled}
                step={field.step || 'any'}
                min={field.min}
                max={field.max}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  field.widget === 'CURRENCY' ? 'pl-7' : ''
                }`}
              />
            </div>
          );

        default:
          // INPUT par défaut
          return (
            <input
              type="text"
              name={field.name}
              value={value || ''}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClasses}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              minLength={field.minLength}
            />
          );
      }
    };

    return (
      <div key={field.name} className={fieldClasses}>
        <label htmlFor={field.name} className={labelClasses}>
          {field.label || field.name}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {field.help && (
            <span className="ml-1 text-gray-400 cursor-help" title={field.help}>
              <svg className="h-4 w-4 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </label>

        {renderInput()}

        {error && (
          <p className={errorClasses}>{error}</p>
        )}

        {field.description && (
          <p className="mt-1 text-sm text-gray-500">{field.description}</p>
        )}
      </div>
    );
  };

  // Rendu d'une section
  const renderSection = (section: any, index: number) => {
    // Si ce n'est pas la section active et qu'il y a plusieurs sections, ne pas afficher
    if (sections.length > 1 && index !== activeSection) {
      return null;
    }

    return (
      <div key={section.name} className="p-6">
        {section.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">{section.description}</p>
          </div>
        )}

        <div className="space-y-4">
          {section.fields.map(renderField)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white">
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default FormViewSections;
