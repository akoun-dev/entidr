import React, { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

/**
 * Props pour le composant DebouncedInput
 */
export interface DebouncedInputProps {
  /** Valeur de l'input */
  value?: string;
  /** Valeur par défaut */
  defaultValue?: string;
  /** Callback appelé quand la valeur change (après debounce) */
  onChange?: (value: string) => void;
  /** Callback appelé immédiatement quand la valeur change */
  onImmediateChange?: (value: string) => void;
  /** Délai de debounce en millisecondes */
  debounceDelay?: number;
  /** Placeholder */
  placeholder?: string;
  /** Type de l'input */
  type?: string;
  /** Classe CSS */
  className?: string;
  /** Style inline */
  style?: React.CSSProperties;
  /** Désactivé */
  disabled?: boolean;
  /** Lecture seule */
  readOnly?: boolean;
  /** Longueur maximale */
  maxLength?: number;
  /** Longueur minimale */
  minLength?: number;
  /** Pattern de validation */
  pattern?: string;
  /** Mode multiligne */
  multiline?: boolean;
  /** Nombre de lignes pour le textarea */
  rows?: number;
  /** Auto-focus */
  autoFocus?: boolean;
  /** Référence */
  ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
  /** Afficher un indicateur de chargement */
  showLoadingIndicator?: boolean;
  /** Callback quand le focus est perdu */
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Callback quand le focus est acquis */
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Callback quand une touche est pressée */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Callback quand une touche est relâchée */
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

/**
 * Composant DebouncedInput - Input avec debounce intégré
 * Idéal pour les champs de recherche et de filtrage
 */
export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value,
  defaultValue = '',
  onChange,
  onImmediateChange,
  debounceDelay = 300,
  placeholder,
  type = 'text',
  className = '',
  style,
  disabled = false,
  readOnly = false,
  maxLength,
  minLength,
  pattern,
  multiline = false,
  rows = 3,
  autoFocus = false,
  ref,
  showLoadingIndicator = false,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
}) => {
  const [internalValue, setInternalValue] = useState(value || defaultValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Synchroniser la valeur interne quand la prop value change
  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
    }
  }, [value, internalValue]);

  // Créer le callback débounce
  const debouncedOnChange = useDebouncedCallback(
    (newValue: string) => {
      setIsDebouncing(false);
      onChange?.(newValue);
    },
    debounceDelay
  );

  // Gérer le changement de valeur
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);

      // Appeler le callback immédiat si fourni
      onImmediateChange?.(newValue);

      // Lancer le debounce si le callback onChange est fourni
      if (onChange) {
        setIsDebouncing(true);
        debouncedOnChange(newValue);
      }
    },
    [onImmediateChange, onChange, debouncedOnChange]
  );

  // Classes CSS de base
  const baseClasses = [
    'w-full',
    'px-3',
    'py-2',
    'border',
    'border-gray-300',
    'rounded-md',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'transition-colors',
    'duration-150',
  ];

  // Classes pour l'indicateur de chargement
  const loadingIndicatorClasses = [
    'absolute',
    'right-3',
    'top-1/2',
    'transform',
    '-translate-y-1/2',
    'text-gray-400',
    'animate-spin',
  ];

  const inputClasses = [...baseClasses, className].join(' ');
  const containerClasses = 'relative';

  const commonProps = {
    value: internalValue,
    onChange: handleChange,
    placeholder,
    disabled,
    readOnly,
    maxLength,
    minLength,
    pattern,
    autoFocus,
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    className: inputClasses,
    style,
  };

  return (
    <div className={containerClasses}>
      {multiline ? (
        <textarea
          {...commonProps}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          rows={rows}
        />
      ) : (
        <input
          {...commonProps}
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
        />
      )}

      {showLoadingIndicator && isDebouncing && (
        <div className={loadingIndicatorClasses.join(' ')}>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DebouncedInput;
