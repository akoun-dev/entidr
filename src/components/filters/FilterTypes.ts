/**
 * Types de filtres disponibles
 */
export type FilterType =
  | 'TEXT'      // Champ texte
  | 'NUMBER'    // Champ numérique
  | 'DATE'      // Champ date
  | 'SELECT'    // Champ sélection simple
  | 'MULTISELECT' // Champ sélection multiple
  | 'BOOLEAN'   // Champ booléen
  | 'RELATION'  // Champ de relation
  | 'CUSTOM';   // Champ personnalisé

/**
 * Logique de combinaison des filtres
 */
export type FilterLogic = 'AND' | 'OR';

/**
 * Opérateurs de comparaison pour les filtres
 */
export type FilterOperator =
  | '='           // Égal
  | '!='          // Différent
  | '>'           // Supérieur
  | '<'           // Inférieur
  | '>='          // Supérieur ou égal
  | '<='          // Inférieur ou égal
  | 'between'     // Entre (avec valeur secondaire)
  | 'not between' // Pas entre (avec valeur secondaire)
  | 'in'          // Dans une liste
  | 'not in'      // Pas dans une liste
  | 'like'        // Contient
  | 'not like'    // Ne contient pas
  | 'starts with' // Commence par
  | 'ends with'   // Se termine par
  | 'empty'       // Est vide
  | 'not empty'   // N'est pas vide
  | 'exists'      // Existe (pour les relations)
  | 'not exists'  // N'existe pas (pour les relations)
  | 'true'        // Est vrai (pour les booléens)
  | 'false';      // Est faux (pour les booléens)

/**
 * Configuration des opérateurs par type de filtre
 */
export const FILTER_OPERATORS_BY_TYPE: Record<FilterType, FilterOperator[]> = {
  TEXT: ['=', '!=', 'like', 'not like', 'starts with', 'ends with', 'empty', 'not empty'],
  NUMBER: ['=', '!=', '>', '<', '>=', '<=', 'between', 'not between', 'empty', 'not empty'],
  DATE: ['=', '!=', '>', '<', '>=', '<=', 'between', 'not between', 'empty', 'not empty'],
  SELECT: ['=', '!=', 'in', 'not in', 'empty', 'not empty'],
  MULTISELECT: ['in', 'not in', 'empty', 'not empty'],
  BOOLEAN: ['=', '!=', 'true', 'false', 'empty'],
  RELATION: ['=', '!=', 'in', 'not in', 'exists', 'not exists', 'empty', 'not empty'],
  CUSTOM: ['=', '!=', 'empty', 'not empty']
};

/**
 * Libellés des opérateurs pour l'affichage
 */
export const FILTER_OPERATOR_LABELS: Record<FilterOperator, string> = {
  '=': 'Égal à',
  '!=': 'Différent de',
  '>': 'Supérieur à',
  '<': 'Inférieur à',
  '>=': 'Supérieur ou égal à',
  '<=': 'Inférieur ou égal à',
  'between': 'Entre',
  'not between': 'Pas entre',
  'in': 'Dans la liste',
  'not in': 'Pas dans la liste',
  'like': 'Contient',
  'not like': 'Ne contient pas',
  'starts with': 'Commence par',
  'ends with': 'Se termine par',
  'empty': 'Est vide',
  'not empty': 'N\'est pas vide',
  'exists': 'Existe',
  'not exists': 'N\'existe pas',
  'true': 'Est vrai',
  'false': 'Est faux'
};

/**
 * Types de filtres nécessitant une valeur secondaire
 */
export const FILTERS_WITH_SECONDARY_VALUE: FilterOperator[] = [
  'between',
  'not between'
];

/**
 * Types de filtres acceptant des valeurs multiples
 */
export const FILTERS_WITH_MULTIPLE_VALUES: FilterOperator[] = [
  'in',
  'not in'
];

/**
 * Types de filtres qui ne nécessitent pas de valeur
 */
export const FILTERS_WITHOUT_VALUE: FilterOperator[] = [
  'empty',
  'not empty',
  'exists',
  'not exists',
  'true',
  'false'
];

/**
 * Configuration par défaut pour chaque type de filtre
 */
export const DEFAULT_FILTER_CONFIGS: Record<FilterType, Partial<FilterConfig>> = {
  TEXT: {
    placeholder: 'Entrez une valeur...',
    operators: FILTER_OPERATORS_BY_TYPE.TEXT
  },
  NUMBER: {
    placeholder: 'Entrez un nombre...',
    operators: FILTER_OPERATORS_BY_TYPE.NUMBER
  },
  DATE: {
    placeholder: 'Sélectionnez une date...',
    operators: FILTER_OPERATORS_BY_TYPE.DATE
  },
  SELECT: {
    placeholder: 'Sélectionnez une option...',
    operators: FILTER_OPERATORS_BY_TYPE.SELECT
  },
  MULTISELECT: {
    placeholder: 'Sélectionnez des options...',
    operators: FILTER_OPERATORS_BY_TYPE.MULTISELECT
  },
  BOOLEAN: {
    operators: FILTER_OPERATORS_BY_TYPE.BOOLEAN
  },
  RELATION: {
    placeholder: 'Sélectionnez une relation...',
    operators: FILTER_OPERATORS_BY_TYPE.RELATION
  },
  CUSTOM: {
    operators: FILTER_OPERATORS_BY_TYPE.CUSTOM
  }
};

/**
 * Événements du système de filtrage
 */
export enum FilterEventType {
  FILTER_CHANGED = 'filter_changed',
  FILTER_APPLIED = 'filter_applied',
  FILTER_RESET = 'filter_reset',
  FILTER_VALIDATED = 'filter_validated',
  FILTER_ERROR = 'filter_error'
}

/**
 * Interface pour les événements de filtrage
 */
export interface FilterEvent {
  type: FilterEventType;
  timestamp: Date;
  data?: any;
  error?: string;
}

/**
 * Configuration d'un filtre
 */
export interface FilterConfig {
  /** Nom du champ à filtrer */
  field: string;

  /** Libellé affiché */
  label?: string;

  /** Type de filtre */
  type: FilterType;

  /** Opérateurs disponibles */
  operators?: FilterOperator[];

  /** Valeur par défaut */
  defaultValue?: any;

  /** Options pour les filtres de sélection */
  options?: Array<{ value: any; label: string }>;

  /** Configuration personnalisée */
  customConfig?: Record<string, any>;

  /** Placeholder */
  placeholder?: string;

  /** Aide contextuelle */
  help?: string;

  /** Champ requis */
  required?: boolean;

  /** Champ désactivé */
  disabled?: boolean;

  /** Validation personnalisée */
  validation?: (value: any) => boolean | string;
}

/**
 * État d'un filtre
 */
export interface FilterState {
  /** Valeur actuelle */
  value: any;

  /** Valeur secondaire (pour les opérateurs comme 'between') */
  value2?: any;

  /** Opérateur sélectionné */
  operator: FilterOperator;

  /** Est valide */
  isValid: boolean;

  /** Erreurs de validation */
  errors: string[];

  /** Est en cours d'édition */
  isEditing: boolean;

  /** Est touché */
  isTouched: boolean;
}

/**
 * Configuration du système de filtrage
 */
export interface FilterSystemConfig {
  /** Logique par défaut (AND/OR) */
  defaultLogic: FilterLogic;

  /** Nombre maximum de conditions */
  maxConditions?: number;

  /** Nombre maximum de groupes */
  maxGroups?: number;

  /** Afficher les opérateurs avancés */
  showAdvancedOperators: boolean;

  /** Mode compact */
  compact: boolean;

  /** Validation en temps réel */
  realtimeValidation: boolean;

  /** Appliquer automatiquement les filtres */
  autoApply: boolean;

  /** Délai pour l'application automatique (en ms) */
  autoApplyDelay: number;

  /** Textes personnalisés */
  texts: {
    addCondition: string;
    addGroup: string;
    remove: string;
    apply: string;
    reset: string;
    and: string;
    or: string;
    selectField: string;
    selectOperator: string;
    enterValue: string;
    loading: string;
    noResults: string;
    invalidValue: string;
    requiredField: string;
  };
}

/**
 * Configuration par défaut du système de filtrage
 */
export const DEFAULT_FILTER_SYSTEM_CONFIG: FilterSystemConfig = {
  defaultLogic: 'AND',
  showAdvancedOperators: false,
  compact: false,
  realtimeValidation: true,
  autoApply: false,
  autoApplyDelay: 500,
  texts: {
    addCondition: '+ Condition',
    addGroup: '+ Groupe',
    remove: 'Supprimer',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    and: 'ET',
    or: 'OU',
    selectField: 'Sélectionner un champ',
    selectOperator: 'Sélectionner un opérateur',
    enterValue: 'Entrez une valeur',
    loading: 'Chargement...',
    noResults: 'Aucun résultat',
    invalidValue: 'Valeur invalide',
    requiredField: 'Ce champ est requis'
  }
};

/**
 * Utilitaires pour les types de filtres
 */
export class FilterTypeUtils {
  /**
   * Vérifier si un opérateur nécessite une valeur secondaire
   */
  static needsSecondaryValue(operator: FilterOperator): boolean {
    return FILTERS_WITH_SECONDARY_VALUE.includes(operator);
  }

  /**
   * Vérifier si un opérateur accepte des valeurs multiples
   */
  static acceptsMultipleValues(operator: FilterOperator): boolean {
    return FILTERS_WITH_MULTIPLE_VALUES.includes(operator);
  }

  /**
   * Vérifier si un opérateur nécessite une valeur
   */
  static needsValue(operator: FilterOperator): boolean {
    return !FILTERS_WITHOUT_VALUE.includes(operator);
  }

  /**
   * Obtenir les opérateurs valides pour un type de filtre
   */
  static getValidOperators(type: FilterType): FilterOperator[] {
    return FILTER_OPERATORS_BY_TYPE[type] || [];
  }

  /**
   * Vérifier si un opérateur est valide pour un type de filtre
   */
  static isValidOperator(type: FilterType, operator: FilterOperator): boolean {
    return this.getValidOperators(type).includes(operator);
  }

  /**
   * Obtenir la configuration par défaut pour un type de filtre
   */
  static getDefaultConfig(type: FilterType): Partial<FilterConfig> {
    return DEFAULT_FILTER_CONFIGS[type] || {};
  }

  /**
   * Obtenir le libellé d'un opérateur
   */
  static getOperatorLabel(operator: FilterOperator): string {
    return FILTER_OPERATOR_LABELS[operator] || operator;
  }

  /**
   * Créer une configuration de filtre avec les valeurs par défaut
   */
  static createFilterConfig(
    field: string,
    type: FilterType,
    label?: string,
    overrides: Partial<FilterConfig> = {}
  ): FilterConfig {
    const defaultConfig = this.getDefaultConfig(type);

    return {
      field,
      type,
      label: label || field,
      ...defaultConfig,
      ...overrides
    };
  }
}
