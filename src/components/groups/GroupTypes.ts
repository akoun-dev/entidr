/**
 * Types pour le système de groupement
 */

/**
 * Types de groupement disponibles
 */
export type GroupType = 'FIELD' | 'DATE' | 'RELATION' | 'CUSTOM';

/**
 * Opérateurs d'agrégation
 */
export type AggregateOperator =
  | 'COUNT'     // Compter les éléments
  | 'SUM'       // Somme des valeurs numériques
  | 'AVG'       // Moyenne des valeurs numériques
  | 'MIN'       // Valeur minimale
  | 'MAX'       // Valeur maximale
  | 'FIRST'     // Première valeur
  | 'LAST'      // Dernière valeur
  | 'LIST'      // Liste des valeurs
  | 'JOIN'      // Joindre les valeurs en chaîne
  | 'CUSTOM';   // Agrégation personnalisée

/**
 * Périodes pour le groupement par date
 */
export type DatePeriod =
  | 'YEAR'      // Groupement par année
  | 'QUARTER'   // Groupement par trimestre
  | 'MONTH'     // Groupement par mois
  | 'WEEK'      // Groupement par semaine
  | 'DAY'       // Groupement par jour
  | 'HOUR'      // Groupement par heure
  | 'MINUTE'    // Groupement par minute
  | 'CUSTOM';   // Période personnalisée

/**
 * Configuration d'un champ de groupement
 */
export interface GroupConfig {
  /** Champ à grouper */
  field: string;

  /** Type de groupement */
  type: GroupType;

  /** Libellé du champ */
  label?: string;

  /** Description du champ */
  help?: string;

  /** Champ requis */
  required?: boolean;

  /** Champ désactivé */
  disabled?: boolean;

  /** Placeholder */
  placeholder?: string;

  /** Opérateur d'agrégation par défaut */
  defaultAggregate?: AggregateOperator;

  /** Opérateurs d'agrégation disponibles */
  aggregates?: AggregateOperator[];

  /** Configuration personnalisée */
  customConfig?: {
    /** Fonction de groupement personnalisée */
    groupBy?: (value: any) => string;

    /** Fonction d'agrégation personnalisée */
    aggregate?: (values: any[], operator: AggregateOperator) => any;

    /** Fonction de validation personnalisée */
    validation?: (value: any) => boolean | string;

    /** Options supplémentaires */
    [key: string]: any;
  };

  /** Options pour les champs de type SELECT ou RELATION */
  options?: Array<{
    value: any;
    label: string;
    disabled?: boolean;
    [key: string]: any;
  }>;

  /** Configuration spécifique au groupement par date */
  dateConfig?: {
    /** Période de groupement */
    period?: DatePeriod;

    /** Format d'affichage */
    displayFormat?: string;

    /** Fuseau horaire */
    timezone?: string;

    /** Début de la semaine (0 = dimanche, 1 = lundi, etc.) */
    weekStartsOn?: number;
  };
}

/**
 * Condition de groupement individuelle
 */
export interface GroupCondition {
  /** Champ à grouper */
  field: string;

  /** Type de groupement */
  type: GroupType;

  /** Opérateur d'agrégation */
  aggregate: AggregateOperator;

  /** Valeur de groupement (pour les groupes personnalisés) */
  value?: any;

  /** Configuration du groupe */
  config?: GroupConfig;

  /** Identifiant unique */
  id?: string;
}

/**
 * Groupe de conditions de groupement
 */
export interface GroupDefinition {
  /** Conditions du groupe */
  conditions: GroupCondition[];

  /** Logique du groupe (AND/OR) - pour les groupes complexes */
  logic?: 'AND' | 'OR';

  /** Identifiant unique */
  id?: string;

  /** Niveau de profondeur */
  level?: number;

  /** Groupe parent */
  parent?: string;
}

/**
 * Props communes à tous les groupes
 */
export interface GroupProps {
  /** Configuration du groupe */
  config: GroupConfig;

  /** Valeur actuelle */
  value?: any;

  /** Opérateur d'agrégation actuel */
  aggregate?: AggregateOperator;

  /** Callback de changement de valeur */
  onChange?: (value: any) => void;

  /** Callback de changement d'agrégation */
  onAggregateChange?: (aggregate: AggregateOperator) => void;

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
 * Props du composant GroupBuilder
 */
export interface GroupBuilderProps {
  /** Configuration des groupes disponibles */
  groups: GroupConfig[];

  /** Définition actuelle des groupes */
  value?: GroupDefinition;

  /** Callback de changement de valeur */
  onChange?: (value: GroupDefinition) => void;

  /** Callback d'application des groupes */
  onApply?: (groups: GroupDefinition) => void;

  /** Callback de réinitialisation des groupes */
  onReset?: () => void;

  /** Logique par défaut (AND/OR) */
  defaultLogic?: 'AND' | 'OR';

  /** Nombre maximum de conditions */
  maxConditions?: number;

  /** Nombre maximum de groupes */
  maxGroups?: number;

  /** Afficher les opérateurs avancés */
  showAdvancedAggregates?: boolean;

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
    selectAggregate?: string;
    enterValue?: string;
    aggregate?: string;
  };
}

/**
 * Props du composant GroupPanel
 */
export interface GroupPanelProps extends Omit<GroupBuilderProps, 'groups'> {
  /** Configuration des groupes disponibles */
  groups: GroupConfig[];

  /** Titre du panneau */
  title?: string;

  /** Afficher le titre */
  showTitle?: boolean;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style inline */
  style?: Record<string, any>;

  /** Callback de changement de valeur */
  onChange?: (value: GroupDefinition) => void;

  /** Callback d'application des groupes */
  onApply?: (groups: GroupDefinition) => void;

  /** Callback de réinitialisation des groupes */
  onReset?: () => void;

  /** Textes personnalisés */
  texts?: {
    title?: string;
    apply?: string;
    reset?: string;
    clearAll?: string;
    activeGroups?: string;
    noGroups?: string;
  };
}

/**
 * Résultat d'une opération de groupement
 */
export interface GroupResult {
  /** Clé du groupe */
  key: string;

  /** Valeur du groupe */
  value: any;

  /** Libellé du groupe */
  label: string;

  /** Élément du groupe (pour les groupes simples) */
  item?: any;

  /** Éléments du groupe (pour les groupes multiples) */
  items?: any[];

  /** Sous-groupes (pour les groupes hiérarchiques) */
  subGroups?: GroupResult[];

  /** Statistiques d'agrégation */
  aggregates?: Record<AggregateOperator, any>;

  /** Métadonnées du groupe */
  metadata?: Record<string, any>;
}

/**
 * Options pour le groupement de données
 */
export interface GroupOptions {
  /** Conserver les éléments sans groupe */
  keepUngrouped?: boolean;

  /** Trier les groupes par clé */
  sortGroups?: boolean;

  /** Trier les éléments dans les groupes */
  sortItems?: boolean;

  /** Limiter le nombre de groupes */
  maxGroups?: number;

  /** Limiter le nombre d'éléments par groupe */
  maxItemsPerGroup?: number;

  /** Inclure les statistiques d'agrégation */
  includeAggregates?: boolean;

  /** Agrégations à calculer */
  aggregates?: AggregateOperator[];

  /** Fonction de comparaison personnalisée pour le tri */
  compareFn?: (a: any, b: any) => number;

  /** Fonction de clé personnalisée */
  keyFn?: (value: any) => string;
}
