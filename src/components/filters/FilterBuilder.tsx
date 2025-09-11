import React from 'react';
import {
  FilterType,
  FilterOperator,
  FilterLogic,
  FilterConfig
} from './FilterTypes';

/**
 * Groupe de conditions de filtre
 */
export interface FilterGroup {
  /** Conditions du groupe */
  conditions: Array<FilterCondition | FilterGroup>;

  /** Logique du groupe (AND/OR) */
  logic: FilterLogic;

  /** Identifiant unique */
  id?: string;

  /** Niveau de profondeur */
  level?: number;

  /** Groupe parent */
  parent?: string;
}

/**
 * Condition de filtre individuelle
 */
export interface FilterCondition {
  /** Champ à filtrer */
  field: string;

  /** Opérateur */
  operator: FilterOperator;

  /** Valeur */
  value: any;

  /** Valeur secondaire (pour les opérateurs comme 'between') */
  value2?: any;

  /** Logique (AND/OR) pour les groupes */
  logic?: FilterLogic;

  /** Identifiant unique */
  id?: string;

  /** Configuration du filtre */
  config?: FilterConfig;
}

/**
 * Props communes à tous les filtres
 */
export interface FilterProps {
  /** Configuration du filtre */
  config: FilterConfig;

  /** Valeur actuelle */
  value?: any;

  /** Callback de changement de valeur */
  onChange?: (value: any) => void;

  /** Callback de validation */
  onValidate?: (isValid: boolean, errors?: string[]) => void;

  /** Mode édition */
  editable?: boolean;

  /** Mode compact */
  compact?: boolean;

  /** Afficher les erreurs */
  showErrors?: boolean;

  /** Message d'erreur personnalisé */
  errorMessage?: string;

  /** Champ en focus */
  focused?: boolean;

  /** Champ invalide */
  invalid?: boolean;

  /** Référence DOM */
  ref?: React.Ref<any>;

  /** Attributs HTML supplémentaires */
  [key: string]: any;
}

/**
 * Props du composant FilterBuilder
 */
export interface FilterBuilderProps {
  /** Configuration des filtres disponibles */
  filters: FilterConfig[];

  /** Valeurs actuelles des filtres */
  value?: FilterGroup;

  /** Callback de changement de valeur */
  onChange?: (value: FilterGroup) => void;

  /** Callback d'application des filtres */
  onApply?: (filters: FilterGroup) => void;

  /** Callback de réinitialisation des filtres */
  onReset?: () => void;

  /** Logique par défaut (AND/OR) */
  defaultLogic?: FilterLogic;

  /** Nombre maximum de conditions */
  maxConditions?: number;

  /** Nombre maximum de groupes */
  maxGroups?: number;

  /** Afficher les opérateurs avancés */
  showAdvancedOperators?: boolean;

  /** Mode compact */
  compact?: boolean;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style inline */
  style?: Record<string, any>;

  /** Textes personnalisés */
  texts?: {
    addCondition?: string;
    addGroup?: string;
    remove?: string;
    apply?: string;
    reset?: string;
    and?: string;
    or?: string;
    selectField?: string;
    selectOperator?: string;
    enterValue?: string;
  };
}


/**
 * État du FilterBuilder
 */
export interface FilterBuilderState {
  /** Groupe de filtres actuel */
  filterGroup: FilterGroup;

  /** Champ en cours d'édition */
  editingField?: string;

  /** Erreurs de validation */
  errors: Record<string, string[]>;

  /** Est en cours de chargement */
  loading: boolean;

  /** Est en cours de validation */
  validating: boolean;
}

/**
 * Composant de base pour tous les filtres
 */
export abstract class BaseFilter<T extends FilterProps = FilterProps>
  extends React.Component<T> {

  /**
   * Valider la valeur du filtre
   */
  protected validate = (value: any): boolean => {
    const { config, onValidate } = this.props;
    const errors: string[] = [];

    // Validation requise
    if (config.required && (value === null || value === undefined || value === '')) {
      errors.push('Ce champ est requis');
    }

    // Validation personnalisée
    if (config.customConfig?.validation) {
      const customResult = config.customConfig.validation(value);
      if (customResult !== true) {
        if (typeof customResult === 'string') {
          errors.push(customResult);
        } else {
          errors.push('La valeur est invalide');
        }
      }
    }

    const isValid = errors.length === 0;
    onValidate?.(isValid, errors);
    return isValid;
  };

  /**
   * Gérer le changement de valeur
   */
  protected abstract handleChange: (value: any) => void;

  /**
   * Rendre le filtre
   */
  protected abstract renderFilter: () => React.ReactNode;

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
    // Note: Les erreurs seront gérées par le composant parent

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
      'filter',
      config.required ? 'required' : '',
      config.disabled ? 'disabled' : '',
      focused ? 'focused' : '',
      invalid ? 'invalid' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses} style={style}>
        {this.renderLabel()}
        {this.renderFilter()}
        {this.renderHelp()}
        {this.renderErrors()}
      </div>
    );
  }
}

/**
 * Composant FilterBuilder principal
 */
export class FilterBuilder extends React.Component<FilterBuilderProps, FilterBuilderState> {
  constructor(props: FilterBuilderProps) {
    super(props);

    // Initialiser le groupe de filtres
    const initialFilterGroup: FilterGroup = props.value || {
      conditions: [],
      logic: props.defaultLogic || 'AND',
      id: this.generateId(),
      level: 0
    };

    this.state = {
      filterGroup: initialFilterGroup,
      errors: {},
      loading: false,
      validating: false
    };
  }

  /**
   * Générer un identifiant unique
   */
  private generateId = (): string => {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Ajouter une condition de filtre
   */
  private addCondition = (groupId?: string): void => {
    const { filters, maxConditions } = this.props;
    const { filterGroup } = this.state;

    // Vérifier la limite de conditions
    const totalConditions = this.countConditions(filterGroup);
    if (maxConditions && totalConditions >= maxConditions) {
      return;
    }

    const newCondition: FilterCondition = {
      field: filters[0]?.field || '',
      operator: filters[0]?.operators?.[0] || '=',
      value: '',
      id: this.generateId()
    };

    this.updateFilterGroup((group) => {
      if (groupId) {
        // Trouver le groupe parent et ajouter la condition
        this.findGroupById(group, groupId, (parentGroup) => {
          parentGroup.conditions.push(newCondition);
        });
      } else {
        // Ajouter au groupe racine
        group.conditions.push(newCondition);
      }
    });
  };

  /**
   * Ajouter un groupe de filtres
   */
  private addGroup = (parentId?: string): void => {
    const { maxGroups } = this.props;
    const { filterGroup } = this.state;

    // Vérifier la limite de groupes
    const totalGroups = this.countGroups(filterGroup);
    if (maxGroups && totalGroups >= maxGroups) {
      return;
    }

    const newGroup: FilterGroup = {
      conditions: [],
      logic: 'AND',
      id: this.generateId(),
      level: parentId ? this.getGroupLevel(parentId) + 1 : 1,
      parent: parentId
    };

    this.updateFilterGroup((group) => {
      if (parentId) {
        // Trouver le groupe parent et ajouter le sous-groupe
        this.findGroupById(group, parentId, (parentGroup) => {
          parentGroup.conditions.push(newGroup);
        });
      } else {
        // Ajouter au groupe racine
        group.conditions.push(newGroup);
      }
    });
  };

  /**
   * Supprimer une condition ou un groupe
   */
  private removeCondition = (id: string): void => {
    this.updateFilterGroup((group) => {
      group.conditions = group.conditions.filter(condition =>
        !('id' in condition && condition.id === id)
      );
    });
  };

  /**
   * Mettre à jour une condition
   */
  private updateCondition = (id: string, updates: Partial<FilterCondition>): void => {
    this.updateFilterGroup((group) => {
      this.findConditionById(group, id, (condition) => {
        Object.assign(condition, updates);
      });
    });
  };

  /**
   * Changer la logique d'un groupe
   */
  private changeGroupLogic = (groupId: string, logic: FilterLogic): void => {
    this.updateFilterGroup((group) => {
      this.findGroupById(group, groupId, (foundGroup) => {
        foundGroup.logic = logic;
      });
    });
  };

  /**
   * Appliquer les filtres
   */
  private applyFilters = (): void => {
    const { filterGroup } = this.state;
    const { onApply } = this.props;

    if (this.validateFilterGroup(filterGroup)) {
      onApply?.(filterGroup);
    }
  };

  /**
   * Réinitialiser les filtres
   */
  private resetFilters = (): void => {
    const { defaultLogic, onReset } = this.props;

    const resetGroup: FilterGroup = {
      conditions: [],
      logic: defaultLogic || 'AND',
      id: this.generateId(),
      level: 0
    };

    this.setState({ filterGroup: resetGroup, errors: {} });
    onReset?.();
  };

  /**
   * Valider un groupe de filtres
   */
  private validateFilterGroup = (group: FilterGroup): boolean => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    const validateCondition = (condition: FilterCondition | FilterGroup, path: string): void => {
      if ('conditions' in condition) {
        // C'est un groupe
        condition.conditions.forEach((subCondition, index) => {
          validateCondition(subCondition, `${path}.${index}`);
        });
      } else {
        // C'est une condition
        const conditionErrors: string[] = [];

        if (!condition.field) {
          conditionErrors.push('Le champ est requis');
        }

        if (!condition.operator) {
          conditionErrors.push('L\'opérateur est requis');
        }

        if (condition.value === undefined || condition.value === null || condition.value === '') {
          const config = this.props.filters.find(f => f.field === condition.field);
          if (config?.required) {
            conditionErrors.push('La valeur est requise');
          }
        }

        if (conditionErrors.length > 0) {
          errors[condition.id || path] = conditionErrors;
          isValid = false;
        }
      }
    };

    group.conditions.forEach((condition, index) => {
      validateCondition(condition, `conditions.${index}`);
    });

    this.setState({ errors });
    return isValid;
  };

  /**
   * Compter le nombre total de conditions
   */
  private countConditions = (group: FilterGroup): number => {
    let count = 0;

    group.conditions.forEach((condition) => {
      if ('conditions' in condition) {
        count += this.countConditions(condition);
      } else {
        count++;
      }
    });

    return count;
  };

  /**
   * Compter le nombre total de groupes
   */
  private countGroups = (group: FilterGroup): number => {
    let count = 1; // Inclure le groupe actuel

    group.conditions.forEach((condition) => {
      if ('conditions' in condition) {
        count += this.countGroups(condition);
      }
    });

    return count;
  };

  /**
   * Trouver un groupe par son ID
   */
  private findGroupById = (
    group: FilterGroup,
    id: string,
    callback: (foundGroup: FilterGroup) => void
  ): void => {
    if (group.id === id) {
      callback(group);
      return;
    }

    group.conditions.forEach((condition) => {
      if ('conditions' in condition) {
        this.findGroupById(condition, id, callback);
      }
    });
  };

  /**
   * Trouver une condition par son ID
   */
  private findConditionById = (
    group: FilterGroup,
    id: string,
    callback: (foundCondition: FilterCondition) => void
  ): void => {
    group.conditions.forEach((condition) => {
      if ('conditions' in condition) {
        this.findConditionById(condition, id, callback);
      } else if (condition.id === id) {
        callback(condition);
      }
    });
  };

  /**
   * Obtenir le niveau d'un groupe
   */
  private getGroupLevel = (groupId: string): number => {
    const { filterGroup } = this.state;
    let level = 0;

    const findLevel = (group: FilterGroup, targetId: string, currentLevel: number): number => {
      if (group.id === targetId) {
        return currentLevel;
      }

      for (const condition of group.conditions) {
        if ('conditions' in condition) {
          const found = findLevel(condition, targetId, currentLevel + 1);
          if (found !== -1) {
            return found;
          }
        }
      }

      return -1;
    };

    return findLevel(filterGroup, groupId, 0);
  };

  /**
   * Mettre à jour le groupe de filtres
   */
  private updateFilterGroup = (updater: (group: FilterGroup) => void): void => {
    const { filterGroup } = this.state;
    const newGroup = JSON.parse(JSON.stringify(filterGroup)); // Deep clone
    updater(newGroup);

    this.setState({ filterGroup: newGroup }, () => {
      this.props.onChange?.(newGroup);
    });
  };

  /**
   * Rendre une condition de filtre
   */
  private renderCondition = (condition: FilterCondition, groupId?: string): React.ReactNode => {
    const { filters, compact, texts } = this.props;
    const { errors } = this.state;

    const config = filters.find(f => f.field === condition.field);
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
          {filters.map(filter => (
            <option key={filter.field} value={filter.field}>
              {filter.label || filter.field}
            </option>
          ))}
        </select>

        {/* Sélection de l'opérateur */}
        <select
          value={condition.operator}
          onChange={(e) => this.updateCondition(condition.id || '', { operator: e.target.value as FilterOperator })}
          className="border rounded px-2 py-1 text-sm"
          disabled={config?.disabled}
        >
          {(config?.operators || []).map(operator => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>

        {/* Champ de valeur */}
        <input
          type="text"
          value={condition.value || ''}
          onChange={(e) => this.updateCondition(condition.id || '', { value: e.target.value })}
          placeholder={config?.placeholder || 'Valeur'}
          className="border rounded px-2 py-1 text-sm flex-1"
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

  /**
   * Rendre un groupe de filtres
   */
  private renderGroup = (group: FilterGroup, isRoot: boolean = false): React.ReactNode => {
    const { maxConditions, maxGroups, compact, texts } = this.props;
    const { filterGroup } = this.state;

    const totalConditions = this.countConditions(filterGroup);
    const totalGroups = this.countGroups(filterGroup);

    return (
      <div key={group.id} className={`border rounded p-3 ${isRoot ? 'bg-gray-50' : 'bg-white'}`}>
        {/* En-tête du groupe */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {!isRoot && (
              <select
                value={group.logic}
                onChange={(e) => this.changeGroupLogic(group.id || '', e.target.value as FilterLogic)}
                className="border rounded px-2 py-1 text-sm font-medium"
              >
                <option value="AND">{texts?.and || 'ET'}</option>
                <option value="OR">{texts?.or || 'OU'}</option>
              </select>
            )}
            <span className="text-sm font-medium text-gray-700">
              Groupe {group.level}
            </span>
          </div>

          {!isRoot && (
            <button
              onClick={() => this.removeCondition(group.id || '')}
              className="text-red-500 hover:text-red-700 p-1"
              title={texts?.remove || 'Supprimer'}
            >
              ×
            </button>
          )}
        </div>

        {/* Conditions du groupe */}
        <div className="space-y-2">
          {group.conditions.map((condition) => {
            if ('conditions' in condition) {
              return this.renderGroup(condition, false);
            } else {
              return this.renderCondition(condition, group.id);
            }
          })}
        </div>

        {/* Boutons d'ajout */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => this.addCondition(group.id)}
            disabled={maxConditions !== undefined && totalConditions >= maxConditions}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            {texts?.addCondition || '+ Condition'}
          </button>

          <button
            onClick={() => this.addGroup(group.id)}
            disabled={maxGroups !== undefined && totalGroups >= maxGroups}
            className="text-green-500 hover:text-green-700 text-sm"
          >
            {texts?.addGroup || '+ Groupe'}
          </button>
        </div>
      </div>
    );
  };

  render(): React.ReactNode {
    const { className = '', style, compact, texts } = this.props;
    const { filterGroup } = this.state;

    const containerClasses = [
      'filter-builder',
      compact ? 'compact' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses} style={style}>
        {/* Groupe racine */}
        {this.renderGroup(filterGroup, true)}

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={this.applyFilters}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {texts?.apply || 'Appliquer'}
          </button>

          <button
            onClick={this.resetFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            {texts?.reset || 'Réinitialiser'}
          </button>
        </div>
      </div>
    );
  }
}

export default FilterBuilder;
