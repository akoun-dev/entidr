import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EntidrViewProps, EntidrViewState } from '../../../types/entidr-view';
import { FormViewHeader } from './FormViewHeader';
import { FormViewSections } from './FormViewSections';
import { FormViewActions } from './FormViewActions';
import { FormViewValidation } from './FormViewValidation';

/**
 * Props étendues pour le composant FormView
 */
export interface FormViewProps extends EntidrViewProps {
  /** État actuel de la vue */
  viewState: EntidrViewState;
  /** Données filtrées */
  filteredData: any[];
  /** Données paginées */
  paginatedData: any[];
}

/**
 * Composant FormView - Vue formulaire
 * Affiche un formulaire pour la création et l'édition d'enregistrements
 */
export const FormView: React.FC<FormViewProps> = ({
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
  // État local du formulaire
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  // Initialiser le formulaire avec les données de l'élément en cours d'édition
  useEffect(() => {
    if (viewState.editingItem) {
      setFormData({ ...viewState.editingItem });
      setIsDirty(false);
    } else {
      // Mode création : initialiser avec les valeurs par défaut
      const defaultValues: any = {};
      view.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultValues[field.name] = field.defaultValue;
        } else if (field.required) {
          // Valeurs par défaut pour les champs requis
          switch (field.widget) {
            case 'BOOLEAN':
              defaultValues[field.name] = false;
              break;
            case 'NUMBER':
              defaultValues[field.name] = 0;
              break;
            case 'DATE':
              defaultValues[field.name] = new Date().toISOString().split('T')[0];
              break;
            default:
              defaultValues[field.name] = '';
          }
        }
      });
      setFormData(defaultValues);
      setIsDirty(false);
    }
  }, [viewState.editingItem, view.fields]);

  // Grouper les champs par sections
  const formSections = useMemo(() => {
    const sections: any[] = [];

    // Regrouper les champs par section
    const fieldsBySection: Record<string, any[]> = {};

    view.fields.forEach(field => {
      const sectionName = field.section || 'default';
      if (!fieldsBySection[sectionName]) {
        fieldsBySection[sectionName] = [];
      }
      fieldsBySection[sectionName].push(field);
    });

    // Créer les objets de section
    Object.entries(fieldsBySection).forEach(([sectionName, fields]) => {
      const sectionConfig = view.sections?.find(s => s.name === sectionName);

      sections.push({
        name: sectionName,
        label: sectionConfig?.label || sectionName,
        description: sectionConfig?.description,
        icon: sectionConfig?.icon,
        order: sectionConfig?.order || 0,
        fields: fields.sort((a, b) => a.order - b.order),
        collapsed: sectionConfig?.collapsed || false,
      });
    });

    // Trier les sections par ordre
    return sections.sort((a, b) => a.order - b.order);
  }, [view.fields, view.sections]);

  // Valider le formulaire
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    let formIsValid = true;

    view.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label || field.name} est requis`;
        formIsValid = false;
      }

      // Validation personnalisée
      if (field.validation && formData[field.name]) {
        const { pattern, message } = field.validation;
        if (pattern && !new RegExp(pattern).test(formData[field.name])) {
          errors[field.name] = message || `Format invalide pour ${field.label || field.name}`;
          formIsValid = false;
        }
      }

      // Validation de longueur
      if (field.maxLength && formData[field.name]?.length > field.maxLength) {
        errors[field.name] = `${field.label || field.name} ne peut pas dépasser ${field.maxLength} caractères`;
        formIsValid = false;
      }

      if (field.minLength && formData[field.name]?.length < field.minLength) {
        errors[field.name] = `${field.label || field.name} doit contenir au moins ${field.minLength} caractères`;
        formIsValid = false;
      }
    });

    setFormErrors(errors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [formData, view.fields]);

  // Gérer le changement d'un champ
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    setIsDirty(true);

    // Effacer l'erreur pour ce champ
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [formErrors]);

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback(async () => {
    if (validateForm()) {
      try {
        onEvent('save', formData);
        setIsDirty(false);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  }, [formData, validateForm, onEvent]);

  // Gérer l'annulation
  const handleCancel = useCallback(() => {
    onEvent('cancel', null);
    setIsDirty(false);
    setFormErrors({});
  }, [onEvent]);

  // Gérer la suppression
  const handleDelete = useCallback(async () => {
    if (viewState.editingItem && confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        onEvent('delete', viewState.editingItem);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  }, [viewState.editingItem, onEvent]);

  // Gérer le changement de section active
  const handleSectionChange = useCallback((sectionIndex: number) => {
    setActiveSection(sectionIndex);
    onEvent('sectionChange', { sectionIndex });
  }, [onEvent]);

  // Calculer si le formulaire peut être soumis
  const canSubmit = useMemo(() => {
    return isDirty && isValid && !readonly;
  }, [isDirty, isValid, readonly]);

  // Classes CSS dynamiques
  const containerClasses = [
    'entidr-form-view',
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
      {/* En-tête du formulaire */}
      <FormViewHeader
        view={view}
        editingItem={viewState.editingItem}
        isDirty={isDirty}
        isValid={isValid}
        readonly={readonly}
        loading={viewState.loading}
        error={viewState.error}
        onDelete={handleDelete}
        onEvent={onEvent}
      />

      {/* Contenu principal */}
      <div className={contentClasses}>
        {/* Messages de validation */}
        {!isValid && Object.keys(formErrors).length > 0 && (
          <FormViewValidation
            errors={formErrors}
            compact={compact}
          />
        )}

        {/* Sections du formulaire */}
        {formSections.length > 1 ? (
          // Navigation par onglets si plusieurs sections
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {formSections.map((section, index) => (
                <button
                  key={section.name}
                  onClick={() => handleSectionChange(index)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {section.icon && (
                    <span className="mr-2">{section.icon}</span>
                  )}
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        ) : null}

        {/* Contenu des sections */}
        <div className="flex-1 overflow-y-auto">
          <FormViewSections
            sections={formSections}
            activeSection={activeSection}
            formData={formData}
            formErrors={formErrors}
            readonly={readonly}
            compact={compact}
            onFieldChange={handleFieldChange}
            onEvent={onEvent}
          />
        </div>

        {/* Actions du formulaire */}
        <FormViewActions
          canSubmit={canSubmit}
          isDirty={isDirty}
          readonly={readonly}
          loading={viewState.loading}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onEvent={onEvent}
        />
      </div>
    </div>
  );
};

export default FormView;
