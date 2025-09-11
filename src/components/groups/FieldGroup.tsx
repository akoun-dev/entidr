import React from 'react';
import { BaseGroup } from './GroupBuilder';
import { GroupConfig, AggregateOperator, GroupProps } from './GroupTypes';

/**
 * Props spécifiques au FieldGroup
 */
export interface FieldGroupProps extends GroupProps {
  /** Configuration du groupe de champ */
  config: GroupConfig & { type: 'FIELD' };

  /** Valeur actuelle */
  value?: string | number;

  /** Valeur minimale */
  min?: number;

  /** Valeur maximale */
  max?: number;

  /** Pas (pour les inputs de type number) */
  step?: number;

  /** Précision décimale */
  precision?: number;

  /** Longueur maximale */
  maxLength?: number;

  /** Longueur minimale */
  minLength?: number;

  /** Pattern de validation */
  pattern?: string;

  /** Mode multiligne */
  multiline?: boolean;

  /** Callback de changement de valeur */
  onChange?: (value: string | number) => void;

  /** Callback de changement d'agrégation */
  onAggregateChange?: (aggregate: AggregateOperator) => void;
}

/**
 * Composant FieldGroup - Groupe pour les champs texte ou numériques
 */
export class FieldGroup extends BaseGroup<FieldGroupProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const value = event.target.value;
    this.props.onChange?.(value);
    this.validate(value);
  };

  /**
   * Gérer le changement d'agrégation
   */
  protected handleAggregateChange = (aggregate: AggregateOperator): void => {
    this.props.onAggregateChange?.(aggregate);
  };

  /**
   * Rendre le groupe
   */
  protected renderGroup = (): React.ReactNode => {
    const {
      config,
      value = '',
      min,
      max,
      step = 1,
      precision,
      maxLength,
      minLength,
      pattern,
      multiline = false,
      disabled
    } = this.props;

    // Déterminer si c'est un champ numérique
    const isNumeric = typeof min !== 'undefined' || typeof max !== 'undefined' || typeof step !== 'undefined' || typeof precision !== 'undefined';

    const commonProps = {
      value,
      onChange: this.handleChange,
      placeholder: config.placeholder || 'Entrez une valeur...',
      disabled: disabled || config.disabled,
      className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    };

    if (multiline) {
      return (
        <textarea
          {...commonProps}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          rows={3}
        />
      );
    }

    if (isNumeric) {
      return (
        <input
          {...commonProps}
          type="number"
          min={min}
          max={max}
          step={precision !== undefined ? 10 ** -precision : step}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type="text"
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
      />
    );
  };

  /**
   * Obtenir les opérateurs d'agrégation valides pour ce type de groupe
   */
  static getValidAggregates = (): AggregateOperator[] => {
    return ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'FIRST', 'LAST', 'LIST', 'JOIN'];
  };

  /**
   * Valider une valeur pour ce type de groupe
   */
  static validateValue = (value: string | number, config: GroupConfig): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return !config.required || 'Ce champ est requis';
    }

    const strValue = String(value);

    // Validation de la longueur
    if (config.customConfig?.minLength !== undefined && strValue.length < config.customConfig.minLength) {
      return `La valeur doit contenir au moins ${config.customConfig.minLength} caractères`;
    }

    if (config.customConfig?.maxLength !== undefined && strValue.length > config.customConfig.maxLength) {
      return `La valeur doit contenir au plus ${config.customConfig.maxLength} caractères`;
    }

    // Validation du pattern
    if (config.customConfig?.pattern) {
      const regex = new RegExp(config.customConfig.pattern);
      if (!regex.test(strValue)) {
        return 'La valeur ne correspond pas au format attendu';
      }
    }

    // Validation numérique
    if (config.customConfig?.min !== undefined || config.customConfig?.max !== undefined) {
      const numValue = parseFloat(strValue);
      if (isNaN(numValue)) {
        return 'Veuillez entrer un nombre valide';
      }

      if (config.customConfig?.min !== undefined && numValue < config.customConfig.min) {
        return `La valeur doit être supérieure ou égale à ${config.customConfig.min}`;
      }

      if (config.customConfig?.max !== undefined && numValue > config.customConfig.max) {
        return `La valeur doit être inférieure ou égale à ${config.customConfig.max}`;
      }
    }

    if (config.customConfig?.validation) {
      return config.customConfig.validation(value);
    }

    return true;
  };
}

export default FieldGroup;
