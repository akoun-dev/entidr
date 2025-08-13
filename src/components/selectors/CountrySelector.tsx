/**
 * Composant de sélection de pays
 */
import React from 'react';
import BaseSelector from './BaseSelector';
import { useCountries } from '../../hooks/useReferenceData';

// Interface pour les données de pays
export interface Country {
  id: number | string;
  name: string;
  code: string;
  region?: string;
  [key: string]: any;
}

export interface CountrySelectorProps {
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
 * Composant pour sélectionner un pays
 */
const CountrySelector: React.FC<CountrySelectorProps> = ({
  id,
  label = 'Pays',
  helperText,
  placeholder = 'Sélectionner un pays',
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = '',
  filter = {},
}) => {
  // Utiliser le hook personnalisé pour récupérer les pays
  const { data: countries, loading, error: fetchError } = useCountries(filter);
  
  return (
    <BaseSelector<Country>
      id={id}
      label={label}
      helperText={fetchError ? 'Erreur lors du chargement des pays' : helperText}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      options={countries}
      getOptionId={(country) => country.id.toString()}
      getOptionLabel={(country) => `${country.name} (${country.code})`}
      loading={loading}
      disabled={disabled}
      required={required}
      error={error}
      className={className}
    />
  );
};

export default CountrySelector;
