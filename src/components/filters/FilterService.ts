import { FilterGroup, FilterCondition } from './FilterBuilder';
import { FilterConfig, FilterOperator } from './FilterTypes';

/**
 * Service de gestion des filtres
 */
export class FilterService {
  /**
   * Convertir un groupe de filtres en requête SQL WHERE
   */
  static toSqlWhere(filterGroup: FilterGroup, configs: FilterConfig[]): string {
    const conditions = this.processFilterGroup(filterGroup, configs);
    return conditions.length > 0 ? `WHERE ${conditions}` : '';
  }

  /**
   * Convertir un groupe de filtres en paramètres de requête URL
   */
  static toUrlParams(filterGroup: FilterGroup, configs: FilterConfig[]): URLSearchParams {
    const params = new URLSearchParams();
    this.processFilterGroupToParams(filterGroup, configs, params);
    return params;
  }

  /**
   * Convertir des paramètres URL en groupe de filtres
   */
  static fromUrlParams(params: URLSearchParams, configs: FilterConfig[]): FilterGroup {
    const filterGroup: FilterGroup = {
      conditions: [],
      logic: 'AND',
      id: this.generateId(),
      level: 0,
    };

    // Parcourir les paramètres et reconstruire les filtres
    configs.forEach((config) => {
      const fieldPrefix = `filter_${config.field}`;
      const operator = (params.get(`${fieldPrefix}_operator`) || '=') as FilterOperator;
      const value = params.get(`${fieldPrefix}_value`);

      if (value !== null) {
        const condition: FilterCondition = {
          field: config.field,
          operator,
          value: this.parseValue(value, config.type),
          id: this.generateId(),
        };

        // Gérer les valeurs secondaires pour les opérateurs comme 'between'
        const value2 = params.get(`${fieldPrefix}_value2`);
        if (value2 !== null) {
          condition.value2 = this.parseValue(value2, config.type);
        }

        filterGroup.conditions.push(condition);
      }
    });

    return filterGroup;
  }

  /**
   * Valider un groupe de filtres
   */
  static validateFilterGroup(
    filterGroup: FilterGroup,
    configs: FilterConfig[],
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let isValid = true;

    const validateCondition = (condition: FilterCondition | FilterGroup, path: string): void => {
      if ('conditions' in condition) {
        // C'est un groupe
        condition.conditions.forEach((subCondition: any, index: any) => {
          validateCondition(subCondition, `${path}.${index}`);
        });
      } else {
        // C'est une condition
        const config = configs.find((c) => c.field === condition.field);

        if (!config) {
          errors.push(`Configuration non trouvée pour le champ: ${condition.field}`);
          isValid = false;
          return;
        }

        // Valider l'opérateur
        const validOperators = config.operators || this.getDefaultOperators(config.type);
        if (!validOperators.includes(condition.operator)) {
          errors.push(
            `Opérateur invalide '${condition.operator}' pour le champ: ${condition.field}`,
          );
          isValid = false;
        }

        // Valider la valeur
        if (!this.isEmptyValue(condition.value)) {
          const valueError = this.validateValue(condition.value, config);
          if (valueError) {
            errors.push(`Valeur invalide pour ${condition.field}: ${valueError}`);
            isValid = false;
          }
        }

        // Valider la valeur secondaire si nécessaire
        if (condition.value2 !== undefined && !this.isEmptyValue(condition.value2)) {
          const value2Error = this.validateValue(condition.value2, config);
          if (value2Error) {
            errors.push(`Valeur secondaire invalide pour ${condition.field}: ${value2Error}`);
            isValid = false;
          }
        }

        // Valider les champs requis
        if (config.required && this.isEmptyValue(condition.value)) {
          errors.push(`Le champ ${condition.field} est requis`);
          isValid = false;
        }
      }
    };

    filterGroup.conditions.forEach((condition: any, index: any) => {
      validateCondition(condition, `conditions.${index}`);
    });

    return { isValid, errors };
  }

  /**
   * Appliquer un groupe de filtres à un tableau de données
   */
  static applyFilter<T extends Record<string, any>>(
    data: T[],
    filterGroup: FilterGroup,
    configs: FilterConfig[],
  ): T[] {
    return data.filter((item) => this.evaluateFilterGroup(filterGroup, item, configs));
  }

  /**
   * Obtenir les statistiques des filtres
   */
  static getFilterStats(filterGroup: FilterGroup): {
    totalConditions: number;
    totalGroups: number;
    maxDepth: number;
    activeConditions: number;
  } {
    const stats = {
      totalConditions: 0,
      totalGroups: 0,
      maxDepth: 0,
      activeConditions: 0,
    };

    const analyzeGroup = (group: FilterGroup, depth: number): void => {
      stats.totalGroups++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);

    group.conditions.forEach((condition: FilterCondition | FilterGroup) => {
      if ('conditions' in condition) {
        analyzeGroup(condition as FilterGroup, depth + 1);
      } else {
        stats.totalConditions++;
        if (!this.isEmptyValue((condition as FilterCondition).value)) {
          stats.activeConditions++;
        }
      }
    });
    };

    analyzeGroup(filterGroup, 0);
    return stats;
  }

  /**
   * Simplifier un groupe de filtres (supprimer les conditions vides)
   */
  static simplifyFilterGroup(filterGroup: FilterGroup): FilterGroup {
    const simplifiedGroup: FilterGroup = {
      conditions: [],
      logic: filterGroup.logic,
      id: filterGroup.id || this.generateId(),
      level: filterGroup.level,
    };

    filterGroup.conditions.forEach((condition: FilterCondition | FilterGroup) => {
      if ('conditions' in condition) {
        const simplifiedSubGroup = this.simplifyFilterGroup(condition as FilterGroup);
        if (simplifiedSubGroup.conditions.length > 0) {
          simplifiedGroup.conditions.push(simplifiedSubGroup);
        }
      } else {
        if (!this.isEmptyValue((condition as FilterCondition).value)) {
          simplifiedGroup.conditions.push(condition);
        }
      }
    });

    return simplifiedGroup;
  }

  /**
   * Générer un identifiant unique
   */
  private static generateId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Traiter un groupe de filtres pour générer une clause WHERE
   */
  private static processFilterGroup(filterGroup: FilterGroup, configs: FilterConfig[]): string {
    const conditions: string[] = [];

    filterGroup.conditions.forEach((condition: FilterCondition | FilterGroup) => {
      if ('conditions' in condition) {
        // C'est un sous-groupe
        const subGroupCondition = this.processFilterGroup(condition as FilterGroup, configs);
        if (subGroupCondition) {
          conditions.push(`(${subGroupCondition})`);
        }
      } else {
        // C'est une condition simple
        const conditionSql = this.processFilterCondition(condition as FilterCondition, configs);
        if (conditionSql) {
          conditions.push(conditionSql);
        }
      }
    });

    return conditions.length > 0 ? conditions.join(` ${filterGroup.logic} `) : '';
  }

  /**
   * Traiter une condition de filtre pour générer une clause SQL
   */
  private static processFilterCondition(
    condition: FilterCondition,
    configs: FilterConfig[],
  ): string {
    const config = configs.find((c) => c.field === condition.field);
    if (!config) return '';

    const field = this.escapeSqlIdentifier(condition.field);
    const { operator, value, value2 } = condition;

    // Gérer les opérateurs spéciaux
    switch (operator) {
      case 'empty':
        return `${field} IS NULL OR ${field} = ''`;

      case 'not empty':
        return `${field} IS NOT NULL AND ${field} != ''`;

      case 'between':
        if (value2 !== undefined) {
          return `${field} BETWEEN ${this.escapeSqlValue(value)} AND ${this.escapeSqlValue(
            value2,
          )}`;
        }
        return '';

      case 'not between':
        if (value2 !== undefined) {
          return `${field} NOT BETWEEN ${this.escapeSqlValue(value)} AND ${this.escapeSqlValue(
            value2,
          )}`;
        }
        return '';

      case 'in':
        if (Array.isArray(value)) {
          const values = value.map((v) => this.escapeSqlValue(v)).join(', ');
          return `${field} IN (${values})`;
        }
        return '';

      case 'not in':
        if (Array.isArray(value)) {
          const values = value.map((v) => this.escapeSqlValue(v)).join(', ');
          return `${field} NOT IN (${values})`;
        }
        return '';

      case 'like':
        return `${field} LIKE ${this.escapeSqlValue(`%${value}%`)}`;

      case 'not like':
        return `${field} NOT LIKE ${this.escapeSqlValue(`%${value}%`)}`;

      case 'starts with':
        return `${field} LIKE ${this.escapeSqlValue(`${value}%`)}`;

      case 'ends with':
        return `${field} LIKE ${this.escapeSqlValue(`%${value}`)}`;

      default:
        // Opérateurs de comparaison standards
        return `${field} ${operator} ${this.escapeSqlValue(value)}`;
    }
  }

  /**
   * Traiter un groupe de filtres pour générer des paramètres URL
   */
  private static processFilterGroupToParams(
    filterGroup: FilterGroup,
    configs: FilterConfig[],
    params: URLSearchParams,
    parentPrefix: string = '',
  ): void {
    filterGroup.conditions.forEach((condition: FilterCondition | FilterGroup, index: number) => {
      const conditionPrefix = parentPrefix ? `${parentPrefix}_${index}` : `${index}`;

      if ('conditions' in condition) {
        // C'est un sous-groupe
        const groupCondition = condition as FilterGroup;
        params.set(`${conditionPrefix}_logic`, groupCondition.logic);
        this.processFilterGroupToParams(groupCondition, configs, params, conditionPrefix);
      } else {
        // C'est une condition simple
        const filterCondition = condition as FilterCondition;
        const fieldPrefix = `${conditionPrefix}_${filterCondition.field}`;
        params.set(`${fieldPrefix}_operator`, filterCondition.operator);
        params.set(`${fieldPrefix}_value`, String(filterCondition.value));

        if (filterCondition.value2 !== undefined) {
          params.set(`${fieldPrefix}_value2`, String(filterCondition.value2));
        }
      }
    });
  }

  /**
   * Évaluer un groupe de filtres sur un élément de données
   */
  private static evaluateFilterGroup<T extends Record<string, any>>(
    filterGroup: FilterGroup,
    item: T,
    configs: FilterConfig[],
  ): boolean {
    const results: boolean[] = [];

    filterGroup.conditions.forEach((condition: FilterCondition | FilterGroup) => {
      if ('conditions' in condition) {
        // Évaluer le sous-groupe
        results.push(this.evaluateFilterGroup(condition as FilterGroup, item, configs));
      } else {
        // Évaluer la condition simple
        results.push(this.evaluateFilterCondition(condition as FilterCondition, item, configs));
      }
    });

    // Appliquer la logique du groupe (AND/OR)
    return filterGroup.logic === 'AND'
      ? results.every((result) => result)
      : results.some((result) => result);
  }

  /**
   * Évaluer une condition de filtre sur un élément de données
   */
  private static evaluateFilterCondition<T extends Record<string, any>>(
    condition: FilterCondition,
    item: T,
    configs: FilterConfig[],
  ): boolean {
    const config = configs.find((c) => c.field === condition.field);
    if (!config) return true;

    const fieldValue = item[condition.field];
    const { operator, value, value2 } = condition;

    // Gérer les valeurs vides
    if (this.isEmptyValue(value)) {
      return operator === 'empty'
        ? fieldValue === null || fieldValue === undefined || fieldValue === ''
        : operator === 'not empty'
        ? fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
        : true; // Les autres opérateurs ignorent les valeurs vides
    }

    // Convertir les valeurs pour la comparaison
    const typedValue = this.convertValue(value, config.type);
    const typedFieldValue = this.convertValue(fieldValue, config.type);
    const typedValue2 = value2 !== undefined ? this.convertValue(value2, config.type) : undefined;

    switch (operator) {
      case '=':
        return typedFieldValue === typedValue;

      case '!=':
        return typedFieldValue !== typedValue;

      case '>':
        return typedFieldValue > typedValue;

      case '<':
        return typedFieldValue < typedValue;

      case '>=':
        return typedFieldValue >= typedValue;

      case '<=':
        return typedFieldValue <= typedValue;

      case 'between':
        return (
          typedValue2 !== undefined &&
          typedFieldValue >= typedValue &&
          typedFieldValue <= typedValue2
        );

      case 'not between':
        return (
          typedValue2 !== undefined &&
          (typedFieldValue < typedValue || typedFieldValue > typedValue2)
        );

      case 'like':
        return String(typedFieldValue).toLowerCase().includes(String(typedValue).toLowerCase());

      case 'not like':
        return !String(typedFieldValue).toLowerCase().includes(String(typedValue).toLowerCase());

      case 'starts with':
        return String(typedFieldValue).toLowerCase().startsWith(String(typedValue).toLowerCase());

      case 'ends with':
        return String(typedFieldValue).toLowerCase().endsWith(String(typedValue).toLowerCase());

      case 'in':
        return Array.isArray(typedValue) && typedValue.includes(typedFieldValue);

      case 'not in':
        return Array.isArray(typedValue) && !typedValue.includes(typedFieldValue);

      default:
        return true;
    }
  }

  /**
   * Obtenir les opérateurs par défaut pour un type de filtre
   */
  private static getDefaultOperators(type: string): string[] {
    switch (type) {
      case 'TEXT':
        return ['=', '!=', 'like', 'not like', 'starts with', 'ends with', 'empty', 'not empty'];
      case 'NUMBER':
        return ['=', '!=', '>', '<', '>=', '<=', 'between', 'not between', 'empty', 'not empty'];
      case 'DATE':
        return ['=', '!=', '>', '<', '>=', '<=', 'between', 'not between', 'empty', 'not empty'];
      case 'SELECT':
        return ['=', '!=', 'in', 'not in', 'empty', 'not empty'];
      case 'BOOLEAN':
        return ['=', '!=', 'true', 'false', 'empty'];
      case 'RELATION':
        return ['=', '!=', 'in', 'not in', 'exists', 'not exists', 'empty', 'not empty'];
      default:
        return ['=', '!=', 'empty', 'not empty'];
    }
  }

  /**
   * Vérifier si une valeur est considérée comme vide
   */
  private static isEmptyValue(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * Parser une valeur depuis une chaîne de caractères
   */
  private static parseValue(value: string, type: string): any {
    if (this.isEmptyValue(value)) return value;

    switch (type) {
      case 'NUMBER':
        return parseFloat(value);
      case 'BOOLEAN':
        return value.toLowerCase() === 'true';
      case 'DATE':
        return new Date(value);
      case 'SELECT':
      case 'RELATION':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  /**
   * Convertir une valeur selon son type
   */
  private static convertValue(value: any, type: string): any {
    if (this.isEmptyValue(value)) return value;

    switch (type) {
      case 'NUMBER':
        return Number(value);
      case 'BOOLEAN':
        return Boolean(value);
      case 'DATE':
        return new Date(value);
      default:
        return value;
    }
  }

  /**
   * Valider une valeur selon sa configuration
   */
  private static validateValue(value: any, config: FilterConfig): string | null {
    if (this.isEmptyValue(value)) return null;

    switch (config.type) {
      case 'NUMBER':
        if (isNaN(Number(value))) {
          return 'La valeur doit être un nombre';
        }
        break;

      case 'DATE':
        if (isNaN(Date.parse(value))) {
          return 'La valeur doit être une date valide';
        }
        break;

      case 'SELECT':
        if (config.options && !config.options.some((opt: { value: any }) => opt.value === value)) {
          return "La valeur sélectionnée n'est pas valide";
        }
        break;
    }

    // Validation personnalisée
    if (config.customConfig?.validation) {
      const customResult = config.customConfig.validation(value);
      if (customResult !== true) {
        return typeof customResult === 'string' ? customResult : 'La valeur est invalide';
      }
    }

    return null;
  }

  /**
   * Échapper un identifiant SQL
   */
  private static escapeSqlIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  /**
   * Échapper une valeur SQL
   */
  private static escapeSqlValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }

    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }

    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }

    if (Array.isArray(value)) {
      return value.map((v) => this.escapeSqlValue(v)).join(', ');
    }

    return String(value);
  }
}
