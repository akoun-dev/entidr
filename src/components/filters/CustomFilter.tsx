import React from 'react';
import { BaseFilter, FilterProps } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';

/**
 * Props spécifiques au CustomFilter
 */
export interface CustomFilterProps extends FilterProps {
  /** Configuration du filtre personnalisé */
  config: FilterConfig & { type: 'CUSTOM' };

  /** Valeur actuelle */
  value?: any;

  /** Composant personnalisé à utiliser */
  component?: React.ComponentType<any>;

  /** Props supplémentaires pour le composant personnalisé */
  componentProps?: Record<string, any>;

  /** Fonction de rendu personnalisée */
  render?: (props: CustomFilterProps) => React.ReactNode;

  /** Fonction de validation personnalisée */
  validate?: (value: any) => boolean | string;

  /** Callback de changement de valeur */
  onChange?: (value: any) => void;
}

/**
 * Composant CustomFilter - Filtre personnalisé avec composant ou logique personnalisée
 */
export class CustomFilter extends BaseFilter<CustomFilterProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (value: any): void => {
    this.props.onChange?.(value);
    this.validate(value);
  };

  /**
   * Rendre le filtre
   */
  protected renderFilter = (): React.ReactNode => {
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
   * Obtenir les opérateurs valides pour ce type de filtre
   */
  static getValidOperators = (): FilterOperator[] => {
    return ['custom' as FilterOperator]; // Opérateur personnalisé par défaut
  };

  /**
   * Valider une valeur pour ce type de filtre
   */
  static validateValue = (value: any, config: FilterConfig): boolean | string => {
    if (value === null || value === undefined || value === '') {
      return !config.required || 'Ce champ est requis';
    }

    // Utiliser la fonction de validation personnalisée si fournie
    if (config.customConfig?.validation) {
      return config.customConfig.validation(value);
    }

    return true;
  };
}

export default CustomFilter;
