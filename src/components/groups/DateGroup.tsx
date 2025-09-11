import React from 'react';
import { BaseGroup } from './GroupBuilder';
import { GroupConfig, AggregateOperator, DatePeriod, GroupProps } from './GroupTypes';

/**
 * Props spécifiques au DateGroup
 */
export interface DateGroupProps extends GroupProps {
  /** Configuration du groupe de date */
  config: GroupConfig & { type: 'DATE' };

  /** Valeur actuelle */
  value?: string | Date;

  /** Date minimale */
  min?: string | Date;

  /** Date maximale */
  max?: string | Date;

  /** Période de groupement */
  period?: DatePeriod;

  /** Format d'affichage */
  displayFormat?: string;

  /** Format de soumission */
  submitFormat?: string;

  /** Activer la sélection de l'heure */
  showTime?: boolean;

  /** Activer la sélection des secondes */
  showSeconds?: boolean;

  /** Fuseau horaire */
  timezone?: string;

  /** Callback de changement de valeur */
  onChange?: (value: string | Date) => void;

  /** Callback de changement d'agrégation */
  onAggregateChange?: (aggregate: AggregateOperator) => void;
}

/**
 * Composant DateGroup - Groupe pour les champs date
 */
export class DateGroup extends BaseGroup<DateGroupProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    this.props.onChange?.(value);
    this.validate(value);
  };

  /**
   * Gérer le changement de période
   */
  protected handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const period = event.target.value as DatePeriod;
    // Mettre à jour la configuration personnalisée
    if (this.props.config.customConfig) {
      this.props.config.customConfig.period = period;
    }
  };

  /**
   * Gérer le changement d'agrégation
   */
  protected handleAggregateChange = (aggregate: AggregateOperator): void => {
    this.props.onAggregateChange?.(aggregate);
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
   * Rendre le groupe
   */
  protected renderGroup = (): React.ReactNode => {
    const {
      config,
      value,
      min,
      max,
      period = config.dateConfig?.period || 'MONTH',
      displayFormat = config.dateConfig?.displayFormat,
      showTime = false,
      showSeconds = false,
      disabled
    } = this.props;

    const commonProps = {
      type: 'date',
      value: this.formatDateForInput(value),
      onChange: this.handleChange,
      min: min ? this.formatDateForInput(min) : undefined,
      max: max ? this.formatDateForInput(max) : undefined,
      disabled: disabled || config.disabled,
      className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    };

    return (
      <div className="space-y-2">
        {/* Input de date */}
        <input {...commonProps} />

        {/* Sélecteur de période */}
        <select
          value={period}
          onChange={this.handlePeriodChange}
          disabled={disabled || config.disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="YEAR">Année</option>
          <option value="QUARTER">Trimestre</option>
          <option value="MONTH">Mois</option>
          <option value="WEEK">Semaine</option>
          <option value="DAY">Jour</option>
          <option value="HOUR">Heure</option>
          <option value="MINUTE">Minute</option>
        </select>
      </div>
    );
  };

  /**
   * Obtenir les opérateurs d'agrégation valides pour ce type de groupe
   */
  static getValidAggregates = (): AggregateOperator[] => {
    return ['COUNT', 'MIN', 'MAX', 'FIRST', 'LAST', 'LIST', 'JOIN'];
  };

  /**
   * Valider une valeur pour ce type de groupe
   */
  static validateValue = (value: string | Date, config: GroupConfig): boolean | string => {
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

    // Validation des limites
    if (config.customConfig?.min) {
      const minDate = new Date(config.customConfig.min);
      if (dateValue < minDate) {
        return `La date doit être supérieure ou égale à ${minDate.toLocaleDateString()}`;
      }
    }

    if (config.customConfig?.max) {
      const maxDate = new Date(config.customConfig.max);
      if (dateValue > maxDate) {
        return `La date doit être inférieure ou égale à ${maxDate.toLocaleDateString()}`;
      }
    }

    if (config.customConfig?.validation) {
      return config.customConfig.validation(dateValue);
    }

    return true;
  };

  /**
   * Grouper une valeur par période
   */
  static groupByPeriod = (value: Date, period: DatePeriod, timezone?: string): string => {
    const date = timezone ? new Date(value.toLocaleString('en-US', { timeZone: timezone })) : new Date(value);

    switch (period) {
      case 'YEAR':
        return date.getFullYear().toString();

      case 'QUARTER':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;

      case 'MONTH':
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${date.getFullYear()}-${month}`;

      case 'WEEK':
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;

      case 'DAY':
        const day = date.getDate().toString().padStart(2, '0');
        const month2 = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${date.getFullYear()}-${month2}-${day}`;

      case 'HOUR':
        const hour = date.getHours().toString().padStart(2, '0');
        const day2 = date.getDate().toString().padStart(2, '0');
        const month3 = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${date.getFullYear()}-${month3}-${day2} ${hour}:00`;

      case 'MINUTE':
        const minute = date.getMinutes().toString().padStart(2, '0');
        const hour2 = date.getHours().toString().padStart(2, '0');
        const day3 = date.getDate().toString().padStart(2, '0');
        const month4 = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${date.getFullYear()}-${month4}-${day3} ${hour2}:${minute}`;

      default:
        return date.toISOString();
    }
  };

  /**
   * Formater une date selon le format spécifié
   */
  static formatDate = (value: Date, format: string, timezone?: string): string => {
    const date = timezone ? new Date(value.toLocaleString('en-US', { timeZone: timezone })) : new Date(value);

    return format
      .replace('YYYY', date.getFullYear().toString())
      .replace('YY', date.getFullYear().toString().slice(-2))
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', date.getDate().toString().padStart(2, '0'))
      .replace('HH', date.getHours().toString().padStart(2, '0'))
      .replace('mm', date.getMinutes().toString().padStart(2, '0'))
      .replace('ss', date.getSeconds().toString().padStart(2, '0'));
  };
}

export default DateGroup;
