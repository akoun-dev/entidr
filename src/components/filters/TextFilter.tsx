import React from 'react';
import { BaseFilter, FilterProps } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';

/**
 * Props spécifiques au TextFilter
 */
export interface TextFilterProps extends FilterProps {
  /** Configuration du filtre texte */
  config: FilterConfig & { type: 'TEXT' };

  /** Valeur actuelle */
  value?: string;

  /** Placeholder personnalisé */
  placeholder?: string;

  /** Longueur maximale */
  maxLength?: number;

  /** Longueur minimale */
  minLength?: number;

  /** Pattern de validation */
  pattern?: string;

  /** Mode multiligne */
  multiline?: boolean;

  /** Callback de changement de valeur */
  onChange?: (value: string) => void;
}

/**
 * Composant TextFilter - Filtre pour les champs texte
 */
export class TextFilter extends BaseFilter<TextFilterProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const value = event.target.value;
    this.props.onChange?.(value);
    this.validate(value);
  };

  /**
   * Rendre le filtre
   */
  protected renderFilter = (): React.ReactNode => {
    const { config, value = '', placeholder, maxLength, minLength, pattern, multiline, disabled } = this.props;

    const commonProps = {
      value,
      onChange: this.handleChange,
      placeholder: placeholder || config.placeholder || 'Entrez une valeur...',
      maxLength,
      minLength,
      pattern,
      disabled: disabled || config.disabled,
      className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    };

    if (multiline) {
      return (
        <textarea
          {...commonProps}
          rows={3}
          className={`${commonProps.className} resize-vertical`}
        />
      );
    }

    return <input type="text" {...commonProps} />;
  };

  /**
   * Obtenir les opérateurs valides pour ce type de filtre
   */
  static getValidOperators = (): FilterOperator[] => {
    return ['=', '!=', 'like', 'not like', 'starts with', 'ends with', 'empty', 'not empty'];
  };

  /**
   * Valider une valeur pour ce type de filtre
   */
  static validateValue = (value: string, config: FilterConfig): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return !config.required || 'Ce champ est requis';
    }

    if (config.customConfig?.validation) {
      return config.customConfig.validation(value);
    }

    return true;
  };
}

export default TextFilter;
