import React from 'react';
import {
  SortDirection,
  SortOperator,
  SortConfig,
  SortDefinition,
  SortCondition,
  SortBuilderProps,
  SortProps,
  SortState
} from './SortTypes';

/**
 * Composant de base pour tous les tris
 */
export abstract class BaseSort<T extends SortProps = SortProps>
  extends React.Component<T> {

  /**
   * Valider la configuration du tri
   */
  protected validate = (): boolean => {
    const { config, onValidate } = this.props;
    const errors: string[] = [];

    // Validation requise
    if (config.required && !config.field) {
      errors.push('Le champ est requis');
    }

    // Validation personnalisée
    if (config.customConfig?.validation) {
      const customResult = config.customConfig.validation(config);
      if (customResult !== true) {
        if (typeof customResult === 'string') {
          errors.push(customResult);
        } else {
          errors.push('La configuration est invalide');
        }
      }
    }

    const isValid = errors.length === 0;
    onValidate?.(isValid, errors);
    return isValid;
  };

  /**
   * Gérer le changement de direction
   */
  protected abstract handleDirectionChange: (direction: SortDirection) => void;

  /**
   * Gérer le changement d'opérateur
   */
  protected abstract handleOperatorChange: (operator: SortOperator) => void;

  /**
   * Rendre le tri
   */
  protected abstract renderSort: () => React.ReactNode;

  /**
   * Rendre le sélecteur de direction
   */
  protected renderDirectionSelector = (): React.ReactNode => {
    const { config, direction = config.defaultDirection || 'ASC' } = this.props;

    return (
      <select
        value={direction}
        onChange={(e) => this.handleDirectionChange(e.target.value as SortDirection)}
        className="border rounded px-2 py-1 text-sm"
        disabled={config.disabled}
      >
        <option value="ASC">↑</option>
        <option value="DESC">↓</option>
      </select>
    );
  };

  /**
   * Rendre le sélecteur d'opérateur
   */
  protected renderOperatorSelector = (): React.ReactNode => {
    const { config, operator = config.defaultOperator || 'NATURAL' } = this.props;

    const operators = config.operators || [
      'NATURAL', 'NUMERIC', 'ALPHA', 'DATE', 'LENGTH', 'CUSTOM'
    ];

    return (
      <select
        value={operator}
        onChange={(e) => this.handleOperatorChange(e.target.value as SortOperator)}
        className="border rounded px-2 py-1 text-sm"
        disabled={config.disabled}
      >
        {operators.map(op => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    );
  };

  /**
   * Rendre le label
   */
  protected renderLabel = (): React.ReactNode => {
    const { config } = this.props;
    if (!config.label) return null;

    return (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  };

  /**
   * Rendre l'aide contextuelle
   */
  protected renderHelp = (): React.ReactNode => {
    const { config } = this.props;
    if (!config.help) return null;

    return (
      <p className="text-xs text-gray-500 mt-1">
        {config.help}
      </p>
    );
  };

  /**
   * Rendre les erreurs
   */
  protected renderErrors = (): React.ReactNode => {
    const { showErrors = true, errorMessage } = this.props;

    if (!showErrors) return null;

    return (
      <div className="text-red-500 text-xs mt-1">
        {errorMessage}
      </div>
    );
  };

  render(): React.ReactNode {
    const { config, className = '', style, focused, invalid } = this.props;

    const containerClasses = [
      'sort',
      config.required ? 'required' : '',
      config.disabled ? 'disabled' : '',
      focused ? 'focused' : '',
      invalid ? 'invalid' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses} style={style}>
        {this.renderLabel()}
        <div className="flex gap-2">
          {this.renderSort()}
          {this.renderDirectionSelector()}
          {this.renderOperatorSelector()}
        </div>
        {this.renderHelp()}
        {this.renderErrors()}
      </div>
    );
  }
}

/**
 * Composant SortBuilder principal
 */
export class SortBuilder extends React.Component<SortBuilderProps, SortState> {
  constructor(props: SortBuilderProps) {
    super(props);

    // Initialiser la définition des tris
    const initialSortDefinition: SortDefinition = props.value || {
      conditions: [],
      logic: 'AND',
      id: this.generateId()
    };

    this.state = {
      sortDefinition: initialSortDefinition,
      errors: {},
      loading: false,
      validating: false
    };
  }

  /**
   * Générer un identifiant unique
   */
  private generateId = (): string => {
    return `sort_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Ajouter une condition de tri
   */
  private addCondition = (): void => {
    const { sorts, maxConditions } = this.props;
    const { sortDefinition } = this.state;

    // Vérifier la limite de conditions
    if (maxConditions && sortDefinition.conditions.length >= maxConditions) {
      return;
    }

    const newCondition: SortCondition = {
      field: sorts[0]?.field || '',
      direction: sorts[0]?.defaultDirection || 'ASC',
      operator: sorts[0]?.defaultOperator || 'NATURAL',
      priority: sortDefinition.conditions.length + 1,
      id: this.generateId()
    };

    this.updateSortDefinition((sort) => {
      sort.conditions.push(newCondition);
    });
  };

  /**
   * Supprimer une condition de tri
   */
  private removeCondition = (id: string): void => {
    this.updateSortDefinition((sort) => {
      sort.conditions = sort.conditions.filter(condition => condition.id !== id);

      // Réorganiser les priorités
      sort.conditions.forEach((condition, index) => {
        condition.priority = index + 1;
      });
    });
  };

  /**
   * Mettre à jour une condition de tri
   */
  private updateCondition = (id: string, updates: Partial<SortCondition>): void => {
    this.updateSortDefinition((sort) => {
      const condition = sort.conditions.find(c => c.id === id);
      if (condition) {
        Object.assign(condition, updates);
      }
    });
  };

  /**
   * Changer la priorité d'une condition
   */
  private changePriority = (id: string, newPriority: number): void => {
    this.updateSortDefinition((sort) => {
      const condition = sort.conditions.find(c => c.id === id);
      if (condition) {
        condition.priority = newPriority;

        // Réorganiser les conditions par priorité
        sort.conditions.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      }
    });
  };

  /**
   * Appliquer les tris
   */
  private applySorts = (): void => {
    const { sortDefinition } = this.state;
    const { onApply } = this.props;

    if (this.validateSortDefinition(sortDefinition)) {
      onApply?.(sortDefinition);
    }
  };

  /**
   * Réinitialiser les tris
   */
  private resetSorts = (): void => {
    const { onReset } = this.props;

    const resetSort: SortDefinition = {
      conditions: [],
      logic: 'AND',
      id: this.generateId()
    };

    this.setState({ sortDefinition: resetSort, errors: {} });
    onReset?.();
  };

  /**
   * Valider une définition de tris
   */
  private validateSortDefinition = (sort: SortDefinition): boolean => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    sort.conditions.forEach((condition) => {
      const conditionErrors: string[] = [];

      if (!condition.field) {
        conditionErrors.push('Le champ est requis');
      }

      if (!condition.direction) {
        conditionErrors.push('La direction est requise');
      }

      if (conditionErrors.length > 0 && condition.id) {
        errors[condition.id] = conditionErrors;
        isValid = false;
      }
    });

    this.setState({ errors });
    return isValid;
  };

  /**
   * Mettre à jour la définition des tris
   */
  private updateSortDefinition = (updater: (sort: SortDefinition) => void): void => {
    const { sortDefinition } = this.state;
    const newSort = JSON.parse(JSON.stringify(sortDefinition)); // Deep clone
    updater(newSort);

    this.setState({ sortDefinition: newSort }, () => {
      this.props.onChange?.(newSort);
    });
  };

  /**
   * Rendre une condition de tri
   */
  private renderCondition = (condition: SortCondition): React.ReactNode => {
    const { sorts, compact, texts } = this.props;
    const { errors } = this.state;

    const config = sorts.find(s => s.field === condition.field);
    const conditionErrors = errors[condition.id || ''];

    return (
      <div key={condition.id} className="flex items-center gap-2 p-2 border rounded bg-white">
        {/* Sélection du champ */}
        <select
          value={condition.field}
          onChange={(e) => this.updateCondition(condition.id || '', { field: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
          disabled={config?.disabled}
        >
          {sorts.map(sort => (
            <option key={sort.field} value={sort.field}>
              {sort.label || sort.field}
            </option>
          ))}
        </select>

        {/* Sélection de la direction */}
        <select
          value={condition.direction}
          onChange={(e) => this.updateCondition(condition.id || '', { direction: e.target.value as SortDirection })}
          className="border rounded px-2 py-1 text-sm"
          disabled={config?.disabled}
        >
          <option value="ASC">↑ {texts?.ascending || 'Croissant'}</option>
          <option value="DESC">↓ {texts?.descending || 'Décroissant'}</option>
        </select>

        {/* Sélection de l'opérateur */}
        <select
          value={condition.operator || 'NATURAL'}
          onChange={(e) => this.updateCondition(condition.id || '', { operator: e.target.value as SortOperator })}
          className="border rounded px-2 py-1 text-sm"
          disabled={config?.disabled}
        >
          {(config?.operators || ['NATURAL', 'NUMERIC', 'ALPHA', 'DATE', 'LENGTH']).map(operator => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>

        {/* Priorité */}
        <input
          type="number"
          value={condition.priority || 1}
          onChange={(e) => this.changePriority(condition.id || '', parseInt(e.target.value) || 1)}
          min="1"
          className="border rounded px-2 py-1 text-sm w-16"
          disabled={config?.disabled}
        />

        {/* Bouton de suppression */}
        <button
          onClick={() => this.removeCondition(condition.id || '')}
          className="text-red-500 hover:text-red-700 p-1"
          title={texts?.remove || 'Supprimer'}
        >
          ×
        </button>

        {/* Erreurs */}
        {conditionErrors && conditionErrors.length > 0 && (
          <div className="text-red-500 text-xs">
            {conditionErrors.join(', ')}
          </div>
        )}
      </div>
    );
  };

  render(): React.ReactNode {
    const { className = '', style, compact, texts, maxConditions } = this.props;
    const { sortDefinition } = this.state;

    const containerClasses = [
      'sort-builder',
      compact ? 'compact' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses} style={style}>
        {/* Conditions de tri */}
        <div className="space-y-2">
          {sortDefinition.conditions.map((condition) => {
            return this.renderCondition(condition);
          })}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={this.addCondition}
            disabled={maxConditions !== undefined && sortDefinition.conditions.length >= maxConditions}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            {texts?.addCondition || '+ Condition'}
          </button>

          <button
            onClick={this.applySorts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {texts?.apply || 'Appliquer'}
          </button>

          <button
            onClick={this.resetSorts}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            {texts?.reset || 'Réinitialiser'}
          </button>
        </div>
      </div>
    );
  }
}

export default SortBuilder;
