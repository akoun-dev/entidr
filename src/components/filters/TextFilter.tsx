import React from 'react';
import { BaseFilter, FilterProps } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';
import { DebouncedInput } from '../optimization/DebouncedInput';

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
  protected handleChange = (value: string): void => {
    this.props.onChange?.(value);
    this.validate(value);
  };

  /**
   * Gérer le changement immédiat (pour l'indicateur de chargement)
   */
  protected handleImmediateChange = (value: string): void => {
    // Mettre à jour l'état local si nécessaire pour l'indicateur de chargement
    this.validate(value);
  };

  /**
   * Rendre le filtre
   */
  protected renderFilter = (): React.ReactNode => {
    const {
      config,
      value = '',
      placeholder,
      maxLength,
      minLength,
      pattern,
      multiline,
      disabled
    } = this.props;

    return (
      <DebouncedInput
        value={value}
        onChange={this.handleChange}
        onImmediateChange={this.handleImmediateChange}
        placeholder={placeholder || config.placeholder || 'Entrez une valeur...'}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        multiline={multiline}
        disabled={disabled || config.disabled}
        debounceDelay={300}
        showLoadingIndicator={true}
        className="w-full"
      />
    );
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
