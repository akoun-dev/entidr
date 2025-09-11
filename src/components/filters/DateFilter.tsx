import React from 'react';
import { BaseFilter, FilterProps } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';

/**
 * Props spécifiques au DateFilter
 */
export interface DateFilterProps extends FilterProps {
  /** Configuration du filtre date */
  config: FilterConfig & { type: 'DATE' };

  /** Valeur actuelle */
  value?: string | Date;

  /** Valeur secondaire (pour les opérateurs comme 'between') */
  value2?: string | Date;

  /** Date minimale */
  min?: string | Date;

  /** Date maximale */
  max?: string | Date;

  /** Format d'affichage */
  displayFormat?: string;

  /** Format de soumission */
  submitFormat?: string;

  /** Activer la sélection de l'heure */
  showTime?: boolean;

  /** Activer la sélection des secondes */
  showSeconds?: boolean;

  /** Callback de changement de valeur */
  onChange?: (value: string | Date) => void;

  /** Callback de changement de valeur secondaire */
  onChange2?: (value2: string | Date) => void;
}

/**
 * Composant DateFilter - Filtre pour les champs date
 */
export class DateFilter extends BaseFilter<DateFilterProps> {
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
   * Formater une date pour l'input
   */
  private formatDateForInput = (date: string | Date | undefined): string => {
    if (!date) return '';

    if (typeof date === 'string') {
      return date; // Supposons que la chaîne est déjà au format YYYY-MM-DD
    }

    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  /**
   * Rendre le filtre
   */
  protected renderFilter = (): React.ReactNode => {
    const {
      config,
      value,
      value2,
      min,
      max,
      disabled
    } = this.props;

    const commonProps = {
      type: 'date',
      min: min ? this.formatDateForInput(min) : undefined,
      max: max ? this.formatDateForInput(max) : undefined,
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
            value={this.formatDateForInput(value)}
            onChange={this.handleChange}
            placeholder={config.placeholder || 'Date de début'}
            className={`${commonProps.className} flex-1`}
          />
          <span className="self-center text-gray-500">et</span>
          <input
            {...commonProps}
            value={this.formatDateForInput(value2)}
            onChange={this.handleChange2}
            placeholder={config.placeholder || 'Date de fin'}
            className={`${commonProps.className} flex-1`}
          />
        </div>
      );
    }

    return (
      <input
        {...commonProps}
        value={this.formatDateForInput(value)}
        onChange={this.handleChange}
        placeholder={config.placeholder || 'Sélectionnez une date...'}
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
  static validateValue = (value: string | Date, config: FilterConfig): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return !config.required || 'Ce champ est requis';
    }

    let dateValue: Date;

    if (typeof value === 'string') {
      dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        return 'Veuillez entrer une date valide';
      }
    } else {
      dateValue = value;
    }

    if (config.customConfig?.validation) {
      return config.customConfig.validation(dateValue);
    }

    return true;
  };
}

export default DateFilter;
