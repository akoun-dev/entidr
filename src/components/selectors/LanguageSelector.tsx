/**
 * Composant de sélection de langue
 */
import React from 'react';
import BaseSelector from './BaseSelector';
import { useLanguages } from '../../hooks/useReferenceData';

// Interface pour les données de langue
export interface Language {
  id: number | string;
  name: string;
  code: string;
  native_name?: string;
  direction?: 'ltr' | 'rtl';
  [key: string]: any;
}

export interface LanguageSelectorProps {
  id?: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  filter?: Record<string, any>;
}

/**
 * Composant pour sélectionner une langue
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  id,
  label = 'Langue',
  helperText,
  placeholder = 'Sélectionner une langue',
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = '',
  filter = {},
}) => {
  // Utiliser le hook personnalisé pour récupérer les langues
  const { data: languages, loading, error: fetchError } = useLanguages(filter);
  
  return (
    <BaseSelector<Language>
      id={id}
      label={label}
      helperText={fetchError ? 'Erreur lors du chargement des langues' : helperText}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      options={languages}
      getOptionId={(language) => language.id.toString()}
      getOptionLabel={(language) => `${language.name} (${language.code})${language.native_name ? ` - ${language.native_name}` : ''}`}
      loading={loading}
      disabled={disabled}
      required={required}
      error={error}
      className={className}
    />
  );
};

export default LanguageSelector;
