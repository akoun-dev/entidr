/**
 * Composant de sélection de devise
 */
import React from 'react';
import BaseSelector from './BaseSelector';
import { useCurrencies } from '../../hooks/useReferenceData';

// Interface pour les données de devise
export interface Currency {
  id: number | string;
  name: string;
  code: string;
  symbol: string;
  rate?: number;
  [key: string]: any;
}

export interface CurrencySelectorProps {
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
 * Composant pour sélectionner une devise
 */
const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  id,
  label = 'Devise',
  helperText,
  placeholder = 'Sélectionner une devise',
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = '',
  filter = {},
}) => {
  // Utiliser le hook personnalisé pour récupérer les devises
  const { data: currencies, loading, error: fetchError } = useCurrencies(filter);
  
  return (
    <BaseSelector<Currency>
      id={id}
      label={label}
      helperText={fetchError ? 'Erreur lors du chargement des devises' : helperText}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      options={currencies}
      getOptionId={(currency) => currency.id.toString()}
      getOptionLabel={(currency) => `${currency.name} (${currency.symbol} ${currency.code})`}
      loading={loading}
      disabled={disabled}
      required={required}
      error={error}
      className={className}
    />
  );
};

export default CurrencySelector;
