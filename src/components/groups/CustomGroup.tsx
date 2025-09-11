import React from 'react';
import { BaseGroup } from './GroupBuilder';
import { GroupConfig, AggregateOperator, GroupProps } from './GroupTypes';

/**
 * Props spécifiques au CustomGroup
 */
export interface CustomGroupProps extends GroupProps {
  /** Configuration du groupe personnalisé */
  config: GroupConfig & { type: 'CUSTOM' };

  /** Valeur actuelle */
  value?: any;

  /** Composant personnalisé à utiliser */
  component?: React.ComponentType<any>;

  /** Props supplémentaires pour le composant personnalisé */
  componentProps?: Record<string, any>;

  /** Fonction de rendu personnalisée */
  render?: (props: CustomGroupProps) => React.ReactNode;

  /** Fonction de groupement personnalisée */
  groupBy?: (value: any) => string;

  /** Fonction d'agrégation personnalisée */
  customAggregate?: (values: any[], operator: AggregateOperator) => any;

  /** Callback de changement de valeur */
  onChange?: (value: any) => void;

  /** Callback de changement d'agrégation */
  onAggregateChange?: (aggregate: AggregateOperator) => void;
}

/**
 * Composant CustomGroup - Groupe personnalisé avec composant ou logique personnalisée
 */
export class CustomGroup extends BaseGroup<CustomGroupProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (value: any): void => {
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
      value,
      component: CustomComponent,
      componentProps = {},
      render: customRender,
      disabled
    } = this.props;

    // Si une fonction de rendu personnalisée est fournie, l'utiliser
    if (customRender) {
      return customRender(this.props);
    }

    // Si un composant personnalisé est fourni, l'utiliser
    if (CustomComponent) {
      return (
        <CustomComponent
          value={value}
          onChange={this.handleChange}
          disabled={disabled || config.disabled}
          config={config}
          {...componentProps}
        />
      );
    }

    // Par défaut, afficher un input text simple
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => this.handleChange(e.target.value)}
        placeholder={config.placeholder || 'Entrez une valeur...'}
        disabled={disabled || config.disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    );
  };

  /**
   * Obtenir les opérateurs d'agrégation valides pour ce type de groupe
   */
  static getValidAggregates = (): AggregateOperator[] => {
    return ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'FIRST', 'LAST', 'LIST', 'JOIN', 'CUSTOM'];
  };

  /**
   * Valider une valeur pour ce type de groupe
   */
  static validateValue = (value: any, config: GroupConfig): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return !config.required || 'Ce champ est requis';
    }

    // Utiliser la fonction de validation personnalisée si fournie
    if (config.customConfig?.validation) {
      return config.customConfig.validation(value);
    }

    return true;
  };

  /**
   * Grouper une valeur avec la fonction personnalisée
   */
  static groupByCustom = (value: any, groupByFn?: (value: any) => string): string => {
    if (groupByFn) {
      return groupByFn(value);
    }

    // Groupement par défaut
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  /**
   * Agréger des valeurs avec la fonction personnalisée
   */
  static aggregateCustom = (
    values: any[],
    operator: AggregateOperator,
    aggregateFn?: (values: any[], operator: AggregateOperator) => any
  ): any => {
    if (aggregateFn) {
      return aggregateFn(values, operator);
    }

    // Agrégation par défaut
    switch (operator) {
      case 'COUNT':
        return values.length;

      case 'SUM':
        return values.reduce((sum, val) => sum + (Number(val) || 0), 0);

      case 'AVG':
        if (values.length === 0) return 0;
        const sum = values.reduce((s, val) => s + (Number(val) || 0), 0);
        return sum / values.length;

      case 'MIN':
        return Math.min(...values.map(v => Number(v) || Infinity));

      case 'MAX':
        return Math.max(...values.map(v => Number(v) || -Infinity));

      case 'FIRST':
        return values[0];

      case 'LAST':
        return values[values.length - 1];

      case 'LIST':
        return values;

      case 'JOIN':
        return values.join(', ');

      case 'CUSTOM':
      default:
        return values;
    }
  };

  /**
   * Créer une clé de groupe personnalisée
   */
  static createGroupKey = (
    value: any,
    field: string,
    groupByFn?: (value: any) => string
  ): string => {
    const groupValue = CustomGroup.groupByCustom(value, groupByFn);
    return `${field}_${groupValue}`;
  };

  /**
   * Grouper des données avec une logique personnalisée
   */
  static groupByCustomLogic = (
    items: any[],
    field: string,
    groupByFn?: (value: any) => string
  ): Record<string, any[]> => {
    const groups: Record<string, any[]> = {};

    items.forEach(item => {
      const value = item[field];
      const key = CustomGroup.createGroupKey(value, field, groupByFn);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return groups;
  };

  /**
   * Appliquer des agrégations personnalisées
   */
  static applyAggregations = (
    groups: Record<string, any[]>,
    operators: AggregateOperator[],
    aggregateFn?: (values: any[], operator: AggregateOperator) => any
  ): Record<string, Record<AggregateOperator, any>> => {
    const result: Record<string, Record<AggregateOperator, any>> = {};

    Object.entries(groups).forEach(([key, items]) => {
      result[key] = {};

      operators.forEach(operator => {
        result[key][operator] = CustomGroup.aggregateCustom(
          items.map(item => item.value),
          operator,
          aggregateFn
        );
      });
    });

    return result;
  };
}

export default CustomGroup;
