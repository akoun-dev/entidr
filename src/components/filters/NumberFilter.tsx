import React from 'react';
import { BaseFilter, FilterProps } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';

/**
 * Props spécifiques au NumberFilter
 */
export interface NumberFilterProps extends FilterProps {
  /** Configuration du filtre numérique */
  config: FilterConfig & { type: 'NUMBER' };

  /** Valeur actuelle */
  value?: number | string;

  /** Valeur secondaire (pour les opérateurs comme 'between') */
  value2?: number | string;

  /** Valeur minimale */
  min?: number;

  /** Valeur maximale */
  max?: number;

  /** Pas (pour les inputs de type number) */
  step?: number;

  /** Précision décimale */
  precision?: number;

  /** Callback de changement de valeur */
  onChange?: (value: number | string) => void;

  /** Callback de changement de valeur secondaire */
  onChange2?: (value2: number | string) => void;
}

/**
 * Composant NumberFilter - Filtre pour les champs numériques
 */
export class NumberFilter extends BaseFilter<NumberFilterProps> {
  /**
   * Gérer le changement de valeur principale
   */
  protected handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    this.props.onChange?.(value);
    this.validate(value);
  };

  /**
   * Gérer le changement de valeur secondaire
   */
  protected handleChange2 = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value2 = event.target.value;
    this.props.onChange2?.(value2);
    this.validate(value2);
  };

  /**
   * Formater une valeur numérique
   */
  private formatValue = (value: number | string): string => {
    if (typeof value === 'string') {
      return value;
    }

    const { precision } = this.props;
    if (precision !== undefined) {
      return value.toFixed(precision);
    }

    return value.toString();
  };

  /**
   * Rendre le filtre
   */
  protected renderFilter = (): React.ReactNode => {
    const {
      config,
      value = '',
      value2 = '',
      min,
      max,
      step = 1,
      precision,
      disabled
    } = this.props;

    const commonProps = {
      type: 'number',
      min,
      max,
      step: precision !== undefined ? 10 ** -precision : step,
      disabled: disabled || config.disabled,
      className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    };

    // Vérifier si on a besoin d'afficher deux champs (pour les opérateurs like 'between')
    const needsSecondValue = ['between', 'not between'].includes(config.operators?.[0] || '=');

    if (needsSecondValue) {
      return (
        <div className="flex gap-2">
          <input
            {...commonProps}
            value={this.formatValue(value)}
            onChange={this.handleChange}
            placeholder={config.placeholder || 'Min'}
            className={`${commonProps.className} flex-1`}
          />
          <span className="self-center text-gray-500">et</span>
          <input
            {...commonProps}
            value={this.formatValue(value2)}
            onChange={this.handleChange2}
            placeholder={config.placeholder || 'Max'}
            className={`${commonProps.className} flex-1`}
          />
        </div>
      );
    }

    return (
      <input
        {...commonProps}
        value={this.formatValue(value)}
        onChange={this.handleChange}
        placeholder={config.placeholder || 'Entrez un nombre...'}
      />
    );
  };

  /**
   * Obtenir les opérateurs valides pour ce type de filtre
   */
  static getValidOperators = (): FilterOperator[] => {
    return ['=', '!=', '>', '<', '>=', '<=', 'between', 'not between', 'empty', 'not empty'];
  };

  /**
   * Valider une valeur pour ce type de filtre
   */
  static validateValue = (value: number | string, config: FilterConfig): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return !config.required || 'Ce champ est requis';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return 'Veuillez entrer un nombre valide';
    }

    if (config.customConfig?.validation) {
      return config.customConfig.validation(numValue);
    }

    return true;
  };
}

export default NumberFilter;
