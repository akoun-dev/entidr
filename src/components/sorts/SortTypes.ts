/**
 * Types pour le système de tri
 */

/**
 * Directions de tri possibles
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Opérateurs de tri personnalisés
 */
export type SortOperator =
  | 'NATURAL'   // Tri naturel (alphanumérique)
  | 'NUMERIC'   // Tri numérique
  | 'ALPHA'     // Tri alphabétique
  | 'DATE'      // Tri par date
  | 'LENGTH'    // Tri par longueur
  | 'CUSTOM';   // Tri personnalisé

/**
 * Condition de tri individuelle
 */
export interface SortCondition {
  /** Champ à trier */
  field: string;

  /** Direction du tri */
  direction: SortDirection;

  /** Opérateur de tri */
  operator?: SortOperator;

  /** Priorité du tri (pour le multi-tri) */
  priority?: number;

  /** Configuration du tri */
  config?: SortConfig;

  /** Identifiant unique */
  id?: string;
}

/**
 * Définition de tri complète
 */
export interface SortDefinition {
  /** Conditions de tri */
  conditions: SortCondition[];

  /** Logique du tri (pour les tris complexes) */
  logic?: 'AND' | 'OR';

  /** Identifiant unique */
  id?: string;
}

/**
 * Configuration d'un champ de tri
 */
export interface SortConfig {
  /** Champ à trier */
  field: string;

  /** Libellé du champ */
  label?: string;

  /** Description du champ */
  help?: string;

  /** Champ requis */
  required?: boolean;

  /** Champ désactivé */
  disabled?: boolean;

  /** Direction par défaut */
  defaultDirection?: SortDirection;

  /** Opérateur par défaut */
  defaultOperator?: SortOperator;

  /** Opérateurs de tri disponibles */
  operators?: SortOperator[];

  /** Type de données du champ */
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';

  /** Configuration personnalisée */
  customConfig?: {
    /** Fonction de comparaison personnalisée */
    compareFn?: (a: any, b: any) => number;

    /** Fonction de transformation personnalisée */
    transformFn?: (value: any) => any;

    /** Fonction de validation personnalisée */
    validation?: (value: any) => boolean | string;

    /** Options supplémentaires */
    [key: string]: any;
  };

  /** Options pour les champs de type SELECT */
  options?: Array<{
    value: any;
    label: string;
    disabled?: boolean;
    [key: string]: any;
  }>;

  /** Configuration spécifique au tri par date */
  dateConfig?: {
    /** Format de la date */
    format?: string;

    /** Fuseau horaire */
    timezone?: string;
  };

  /** Configuration spécifique au tri numérique */
  numberConfig?: {
    /** Précision décimale */
    precision?: number;

    /** Gérer les valeurs nulles */
    nullHandling?: 'first' | 'last' | 'zero';
  };
}

/**
 * Props communes à tous les tris
 */
export interface SortProps {
  /** Configuration du tri */
  config: SortConfig;

  /** Direction actuelle */
  direction?: SortDirection;

  /** Opérateur actuel */
  operator?: SortOperator;

  /** Callback de changement de direction */
  onDirectionChange?: (direction: SortDirection) => void;

  /** Callback de changement d'opérateur */
  onOperatorChange?: (operator: SortOperator) => void;

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
 * Props du composant SortBuilder
 */
export interface SortBuilderProps {
  /** Configuration des tris disponibles */
  sorts: SortConfig[];

  /** Définition actuelle des tris */
  value?: SortDefinition;

  /** Callback de changement de valeur */
  onChange?: (value: SortDefinition) => void;

  /** Callback d'application des tris */
  onApply?: (sorts: SortDefinition) => void;

  /** Callback de réinitialisation des tris */
  onReset?: () => void;

  /** Nombre maximum de conditions */
  maxConditions?: number;

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
    remove?: string;
    apply?: string;
    reset?: string;
    selectField?: string;
    selectOperator?: string;
    ascending?: string;
    descending?: string;
    priority?: string;
    sort?: string;
  };
}

/**
 * Props du composant SortPanel
 */
export interface SortPanelProps extends Omit<SortBuilderProps, 'sorts'> {
  /** Configuration des tris disponibles */
  sorts: SortConfig[];

  /** Titre du panneau */
  title?: string;

  /** Afficher le titre */
  showTitle?: boolean;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style inline */
  style?: Record<string, any>;

  /** Callback de changement de valeur */
  onChange?: (value: SortDefinition) => void;

  /** Callback d'application des tris */
  onApply?: (sorts: SortDefinition) => void;

  /** Callback de réinitialisation des tris */
  onReset?: () => void;

  /** Textes personnalisés */
  texts?: {
    title?: string;
    apply?: string;
    reset?: string;
    clearAll?: string;
    activeSorts?: string;
    noSorts?: string;
  };
}

/**
 * Options pour le tri de données
 */
export interface SortOptions {
  /** Conserver l'ordre original pour les valeurs égales */
  stable?: boolean;

  /** Gérer les valeurs nulles */
  nullHandling?: 'first' | 'last' | 'zero';

  /** Gérer les valeurs indéfinies */
  undefinedHandling?: 'first' | 'last' | 'zero';

  /** Sensibilité à la casse */
  caseSensitive?: boolean;

  /** Ignorer les accents */
  ignoreAccents?: boolean;

  /** Fonction de comparaison personnalisée */
  compareFn?: (a: any, b: any) => number;

  /** Fonction de clé personnalisée */
  keyFn?: (value: any) => any;
}

/**
 * Résultat d'une opération de tri
 */
export interface SortResult {
  /** Données triées */
  data: any[];

  /** Définition de tri utilisée */
  sortDefinition: SortDefinition;

  /** Statistiques du tri */
  stats?: {
    /** Temps d'exécution */
    executionTime: number;
    /** Nombre d'éléments triés */
    totalItems: number;
    /** Nombre de comparaisons */
    comparisons: number;
  };

  /** Métadonnées du tri */
  metadata?: Record<string, any>;
}

/**
 * Configuration du tri multi-colonnes
 */
export interface MultiSortConfig {
  /** Colonnes à trier */
  columns: SortConfig[];

  /** Logique par défaut (AND/OR) */
  defaultLogic?: 'AND' | 'OR';

  /** Nombre maximum de colonnes */
  maxColumns?: number;

  /** Permettre la réorganisation des colonnes */
  allowReorder?: boolean;

  /** Permettre la suppression des colonnes */
  allowRemove?: boolean;
}

/**
 * État du tri
 */
export interface SortState {
  /** Définition actuelle du tri */
  sortDefinition: SortDefinition;

  /** Champ en cours d'édition */
  editingField?: string;

  /** Erreurs de validation */
  errors: Record<string, string[]>;

  /** Est en cours de chargement */
  loading: boolean;

  /** Est en cours de validation */
  validating: boolean;
}
