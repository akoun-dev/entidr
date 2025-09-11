import React from 'react';
import { BaseFilter, FilterProps } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';

/**
 * Option pour un SelectFilter
 */
export interface SelectOption {
  /** Valeur de l'option */
  value: string | number;

  /** Libellé de l'option */
  label: string;

  /** Option désactivée */
  disabled?: boolean;

  /** Données supplémentaires */
  [key: string]: any;
}

/**
 * Props spécifiques au SelectFilter
 */
export interface SelectFilterProps extends FilterProps {
  /** Configuration du filtre select */
  config: FilterConfig & { type: 'SELECT' };

  /** Valeur actuelle */
  value?: string | number | Array<string | number>;

  /** Options disponibles */
  options?: SelectOption[];

  /** Mode multi-sélection */
  multiple?: boolean;

  /** Placeholder personnalisé */
  placeholder?: string;

  /** Autoriser la recherche */
  searchable?: boolean;

  /** Callback de changement de valeur */
  onChange?: (value: string | number | Array<string | number>) => void;
}

/**
 * Composant SelectFilter - Filtre pour les champs à choix multiples
 */
export class SelectFilter extends BaseFilter<SelectFilterProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const { multiple } = this.props;
    const selectElement = event.target;

    if (multiple) {
      // Mode multi-sélection
      const selectedOptions = Array.from(selectElement.selectedOptions).map(option => option.value);
      this.props.onChange?.(selectedOptions as Array<string | number>);
      this.validate(selectedOptions);
    } else {
      // Mode simple
      const value = selectElement.value;
      this.props.onChange?.(value);
      this.validate(value);
    }
  };

  /**
   * Gérer le changement pour les inputs de recherche
   */
  protected handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    this.props.onChange?.(value);
    this.validate(value);
  };

  /**
   * Rendre le filtre
   */
  protected renderFilter = (): React.ReactNode => {
    const {
      config,
      value = '',
      options = config.options || [],
      multiple = false,
      placeholder,
      searchable = false,
      disabled
    } = this.props;

    // Vérifier si on a besoin d'afficher un champ de recherche (pour les opérateurs like 'like')
    const needsSearch = ['like', 'not like', 'starts with', 'ends with'].includes(config.operators?.[0] || '=');

    if (needsSearch) {
      return (
        <input
          type="text"
          value={value}
          onChange={this.handleSearchChange}
          placeholder={placeholder || config.placeholder || 'Rechercher...'}
          disabled={disabled || config.disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      );
    }

    // Mode normal : select
    return (
      <select
        value={value}
        onChange={this.handleChange}
        multiple={multiple}
        disabled={disabled || config.disabled}
        placeholder={placeholder || config.placeholder || 'Sélectionnez une option...'}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          multiple ? 'h-24' : ''
        }`}
      >
        <option value="">
          {placeholder || config.placeholder || 'Sélectionnez une option...'}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={(option as SelectOption).disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  /**
   * Obtenir les opérateurs valides pour ce type de filtre
   */
  static getValidOperators = (): FilterOperator[] => {
    return ['=', '!=', 'in', 'not in', 'empty', 'not empty'];
  };

  /**
   * Valider une valeur pour ce type de filtre
   */
  static validateValue = (value: string | number | Array<string | number>, config: FilterConfig): boolean | string => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return !config.required || 'Ce champ est requis';
    }

    const options = config.options || [];

    if (Array.isArray(value)) {
      // Validation pour la multi-sélection
      const invalidValues = value.filter(v => !options.some(opt => opt.value === v));
      if (invalidValues.length > 0) {
        return 'Certaines valeurs sélectionnées ne sont pas valides';
      }
    } else {
      // Validation pour la sélection simple
      if (!options.some(opt => opt.value === value)) {
        return 'La valeur sélectionnée n\'est pas valide';
      }
    }

    if (config.customConfig?.validation) {
      return config.customConfig.validation(value);
    }

    return true;
  };
}

export default SelectFilter;
