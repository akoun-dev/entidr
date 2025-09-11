import React from 'react';
import {
  GroupType,
  AggregateOperator,
  GroupConfig,
  GroupDefinition,
  GroupCondition,
  GroupBuilderProps,
  GroupProps
} from './GroupTypes';

/**
 * État du GroupBuilder
 */
export interface GroupBuilderState {
  /** Définition des groupes actuelle */
  groupDefinition: GroupDefinition;

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
 * Composant de base pour tous les groupes
 */
export abstract class BaseGroup<T extends GroupProps = GroupProps>
  extends React.Component<T> {

  /**
   * Valider la valeur du groupe
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
   * Gérer le changement d'agrégation
   */
  protected abstract handleAggregateChange: (aggregate: AggregateOperator) => void;

  /**
   * Rendre le groupe
   */
  protected abstract renderGroup: () => React.ReactNode;

  /**
   * Rendre le sélecteur d'agrégation
   */
  protected renderAggregateSelector = (): React.ReactNode => {
    const { config, aggregate = config.defaultAggregate || 'COUNT' } = this.props;

    const aggregates = config.aggregates || [
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'FIRST', 'LAST', 'LIST', 'JOIN'
    ];

    return (
      <select
        value={aggregate}
        onChange={(e) => this.handleAggregateChange(e.target.value as AggregateOperator)}
        className="border rounded px-2 py-1 text-sm"
        disabled={config.disabled}
      >
        {aggregates.map(agg => (
          <option key={agg} value={agg}>
            {agg}
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
      'group',
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
          {this.renderGroup()}
          {this.renderAggregateSelector()}
        </div>
        {this.renderHelp()}
        {this.renderErrors()}
      </div>
    );
  }
}

/**
 * Composant GroupBuilder principal
 */
export class GroupBuilder extends React.Component<GroupBuilderProps, GroupBuilderState> {
  constructor(props: GroupBuilderProps) {
    super(props);

    // Initialiser la définition des groupes
    const initialGroupDefinition: GroupDefinition = props.value || {
      conditions: [],
      logic: props.defaultLogic || 'AND',
      id: this.generateId(),
      level: 0
    };

    this.state = {
      groupDefinition: initialGroupDefinition,
      errors: {},
      loading: false,
      validating: false
    };
  }

  /**
   * Générer un identifiant unique
   */
  private generateId = (): string => {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Ajouter une condition de groupement
   */
  private addCondition = (groupId?: string): void => {
    const { groups, maxConditions } = this.props;
    const { groupDefinition } = this.state;

    // Vérifier la limite de conditions
    const totalConditions = this.countConditions(groupDefinition);
    if (maxConditions && totalConditions >= maxConditions) {
      return;
    }

    const newCondition: GroupCondition = {
      field: groups[0]?.field || '',
      type: groups[0]?.type || 'FIELD',
      aggregate: groups[0]?.defaultAggregate || 'COUNT',
      id: this.generateId()
    };

    this.updateGroupDefinition((group) => {
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
   * Ajouter un sous-groupe
   */
  private addGroup = (parentId?: string): void => {
    const { maxGroups } = this.props;
    const { groupDefinition } = this.state;

    // Vérifier la limite de groupes
    const totalGroups = this.countGroups(groupDefinition);
    if (maxGroups && totalGroups >= maxGroups) {
      return;
    }

    const newGroup: GroupDefinition = {
      conditions: [],
      logic: 'AND',
      id: this.generateId(),
      level: parentId ? this.getGroupLevel(parentId) + 1 : 1,
      parent: parentId
    };

    this.updateGroupDefinition((group) => {
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
    this.updateGroupDefinition((group) => {
      group.conditions = group.conditions.filter(condition =>
        !('id' in condition && condition.id === id)
      );
    });
  };

  /**
   * Mettre à jour une condition
   */
  private updateCondition = (id: string, updates: Partial<GroupCondition>): void => {
    this.updateGroupDefinition((group) => {
      this.findConditionById(group, id, (condition) => {
        Object.assign(condition, updates);
      });
    });
  };

  /**
   * Changer la logique d'un groupe
   */
  private changeGroupLogic = (groupId: string, logic: 'AND' | 'OR'): void => {
    this.updateGroupDefinition((group) => {
      this.findGroupById(group, groupId, (foundGroup) => {
        foundGroup.logic = logic;
      });
    });
  };

  /**
   * Appliquer les groupes
   */
  private applyGroups = (): void => {
    const { groupDefinition } = this.state;
    const { onApply } = this.props;

    if (this.validateGroupDefinition(groupDefinition)) {
      onApply?.(groupDefinition);
    }
  };

  /**
   * Réinitialiser les groupes
   */
  private resetGroups = (): void => {
    const { defaultLogic, onReset } = this.props;

    const resetGroup: GroupDefinition = {
      conditions: [],
      logic: defaultLogic || 'AND',
      id: this.generateId(),
      level: 0
    };

    this.setState({ groupDefinition: resetGroup, errors: {} });
    onReset?.();
  };

  /**
   * Valider une définition de groupes
   */
  private validateGroupDefinition = (group: GroupDefinition): boolean => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    const validateCondition = (condition: GroupCondition | GroupDefinition, path: string): void => {
      if ('conditions' in condition) {
        // C'est un groupe
        (condition as GroupDefinition).conditions.forEach((subCondition, index) => {
          validateCondition(subCondition, `${path}.${index}`);
        });
      } else {
        // C'est une condition
        const conditionErrors: string[] = [];
        const typedCondition = condition as GroupCondition;

        if (!typedCondition.field) {
          conditionErrors.push('Le champ est requis');
        }

        if (!typedCondition.aggregate) {
          conditionErrors.push('L\'agrégation est requise');
        }

        if (conditionErrors.length > 0) {
          errors[typedCondition.id || path] = conditionErrors;
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
  private countConditions = (group: GroupDefinition): number => {
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
  private countGroups = (group: GroupDefinition): number => {
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
    group: GroupDefinition,
    id: string,
    callback: (foundGroup: GroupDefinition) => void
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
    group: GroupDefinition,
    id: string,
    callback: (foundCondition: GroupCondition) => void
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
    const { groupDefinition } = this.state;
    let level = 0;

    const findLevel = (group: GroupDefinition, targetId: string, currentLevel: number): number => {
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

    return findLevel(groupDefinition, groupId, 0);
  };

  /**
   * Mettre à jour la définition des groupes
   */
  private updateGroupDefinition = (updater: (group: GroupDefinition) => void): void => {
    const { groupDefinition } = this.state;
    const newGroup = JSON.parse(JSON.stringify(groupDefinition)); // Deep clone
    updater(newGroup);

    this.setState({ groupDefinition: newGroup }, () => {
      this.props.onChange?.(newGroup);
    });
  };

  /**
   * Rendre une condition de groupement
   */
  private renderCondition = (condition: GroupCondition, groupId?: string): React.ReactNode => {
    const { groups, compact, texts } = this.props;
    const { errors } = this.state;

    const config = groups.find(g => g.field === condition.field);
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
          {groups.map(group => (
            <option key={group.field} value={group.field}>
              {group.label || group.field}
            </option>
          ))}
        </select>

        {/* Sélection de l'agrégation */}
        <select
          value={condition.aggregate}
          onChange={(e) => this.updateCondition(condition.id || '', { aggregate: e.target.value as AggregateOperator })}
          className="border rounded px-2 py-1 text-sm"
          disabled={config?.disabled}
        >
          {(config?.aggregates || ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX']).map(aggregate => (
            <option key={aggregate} value={aggregate}>
              {aggregate}
            </option>
          ))}
        </select>

        {/* Champ de valeur (pour les groupes personnalisés) */}
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
   * Rendre un groupe de conditions
   */
  private renderGroup = (group: GroupDefinition, isRoot: boolean = false): React.ReactNode => {
    const { maxConditions, maxGroups, compact, texts } = this.props;
    const { groupDefinition } = this.state;

    const totalConditions = this.countConditions(groupDefinition);
    const totalGroups = this.countGroups(groupDefinition);

    return (
      <div key={group.id} className={`border rounded p-3 ${isRoot ? 'bg-gray-50' : 'bg-white'}`}>
        {/* En-tête du groupe */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {!isRoot && (
              <select
                value={group.logic}
                onChange={(e) => this.changeGroupLogic(group.id || '', e.target.value as 'AND' | 'OR')}
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
              return this.renderGroup(condition as GroupDefinition, false);
            } else {
              return this.renderCondition(condition as GroupCondition, group.id);
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
    const { groupDefinition } = this.state;

    const containerClasses = [
      'group-builder',
      compact ? 'compact' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={containerClasses} style={style}>
        {/* Groupe racine */}
        {this.renderGroup(groupDefinition, true)}

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={this.applyGroups}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {texts?.apply || 'Appliquer'}
          </button>

          <button
            onClick={this.resetGroups}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            {texts?.reset || 'Réinitialiser'}
          </button>
        </div>
      </div>
    );
  }
}

export default GroupBuilder;
