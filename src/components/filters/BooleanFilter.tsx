import React from 'react';
import { BaseFilter, FilterProps } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';

/**
 * Props spécifiques au BooleanFilter
 */
export interface BooleanFilterProps extends FilterProps {
  /** Configuration du filtre booléen */
  config: FilterConfig & { type: 'BOOLEAN' };

  /** Valeur actuelle */
  value?: boolean | string;

  /** Texte pour l'option vrai */
  trueLabel?: string;

  /** Texte pour l'option faux */
  falseLabel?: string;

  /** Texte pour l'option indéfini */
  undefinedLabel?: string;

  /** Callback de changement de valeur */
  onChange?: (value: boolean | string) => void;
}

/**
 * Composant BooleanFilter - Filtre pour les champs booléens
 */
export class BooleanFilter extends BaseFilter<BooleanFilterProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value;

    // Convertir les valeurs string en booléens
    let processedValue: boolean | string = value;
    if (value === 'true') processedValue = true;
    else if (value === 'false') processedValue = false;

    this.props.onChange?.(processedValue);
    this.validate(processedValue);
  };

  /**
   * Rendre le filtre
   */
  protected renderFilter = (): React.ReactNode => {
    const {
      config,
      value,
      trueLabel = 'Vrai',
      falseLabel = 'Faux',
      undefinedLabel = 'Indéfini',
      disabled
    } = this.props;

    // Convertir la valeur en string pour le select
    let selectValue: string = '';
    if (value === true) selectValue = 'true';
    else if (value === false) selectValue = 'false';
    else if (value !== undefined) selectValue = String(value);

    // Vérifier si on a besoin d'afficher un input simple (pour les opérateurs comme '=')
    const needsSimpleInput = ['=', '!='].includes(config.operators?.[0] || '=');

    if (needsSimpleInput) {
      return (
        <select
          value={selectValue}
          onChange={this.handleChange}
          disabled={disabled || config.disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">{undefinedLabel}</option>
          <option value="true">{trueLabel}</option>
          <option value="false">{falseLabel}</option>
        </select>
      );
    }

    // Pour les opérateurs 'true' et 'false', on affiche juste l'état actuel
    const operator = config.operators?.[0] || '=';
    if (operator === 'true' || operator === 'false') {
      const displayValue = operator === 'true' ? trueLabel : falseLabel;
      return (
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
          {displayValue}
        </div>
      );
    }

    // Cas par défaut : select
    return (
      <select
        value={selectValue}
        onChange={this.handleChange}
        disabled={disabled || config.disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">{undefinedLabel}</option>
        <option value="true">{trueLabel}</option>
        <option value="false">{falseLabel}</option>
      </select>
    );
  };

  /**
   * Obtenir les opérateurs valides pour ce type de filtre
   */
  static getValidOperators = (): FilterOperator[] => {
    return ['=', '!=', 'true', 'false', 'empty'];
  };

  /**
   * Valider une valeur pour ce type de filtre
   */
  static validateValue = (value: boolean | string, config: FilterConfig): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return !config.required || 'Ce champ est requis';
    }

    // Les valeurs valides sont : true, false, ou les chaînes correspondantes
    const validValues = [true, false, 'true', 'false'];
    if (!validValues.includes(value)) {
      return 'Veuillez sélectionner une valeur valide (vrai ou faux)';
    }

    if (config.customConfig?.validation) {
      return config.customConfig.validation(value);
    }

    return true;
  };
}

export default BooleanFilter;
