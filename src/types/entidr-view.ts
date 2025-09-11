import { EntidrModelField, EntidrModelRelation } from './entidr-model';
import { EntidrSecurityContext } from './entidr-security';

/**
 * Types de vues supportées
 */
export type EntidrViewType =
  | 'LIST'      // Vue tableau/liste
  | 'FORM'      // Vue formulaire
  | 'KANBAN'    // Vue kanban
  | 'CALENDAR'  // Vue calendrier
  | 'CHART'     // Vue graphique
  | 'TREE'      // Vue arborescente
  | 'GALLERY'   // Vue galerie
  | 'TIMELINE'  // Vue chronologique
  | 'MAP'       // Vue carte
  | 'DASHBOARD' // Vue dashboard;

/**
 * Types de widgets pour les champs
 */
export type EntidrViewWidget =
  | 'INPUT'         // Champ de saisie simple
  | 'TEXTAREA'      // Zone de texte
  | 'SELECT'        // Liste déroulante
  | 'MULTISELECT'   // Sélection multiple
  | 'CHECKBOX'      // Case à cocher
  | 'RADIO'         // Bouton radio
  | 'DATE'          // Sélecteur de date
  | 'DATETIME'      // Sélecteur de date/heure
  | 'TIME'          // Sélecteur d'heure
  | 'NUMBER'        // Champ numérique
  | 'CURRENCY'      // Champ monétaire
  | 'EMAIL'         // Champ email
  | 'PHONE'         // Champ téléphone
  | 'URL'           // Champ URL
  | 'PASSWORD'      // Champ mot de passe
  | 'COLOR'         // Sélecteur de couleur
  | 'FILE'          // Sélecteur de fichier
  | 'IMAGE'         // Sélecteur d'image
  | 'RICHTEXT'      // Éditeur de texte riche
  | 'CODE'          // Éditeur de code
  | 'RATING'        // Étoiles de notation
  | 'TAGS'          // Tags
  | 'RELATION'      // Champ de relation
  | 'REFERENCE'     // Champ de référence
  | 'COMPUTED'      // Champ calculé
  | 'BOOLEAN'       // Toggle booléen
  | 'SLIDER'        // Curseur
  | 'SWITCH'        // Interrupteur
  | 'BADGE'         // Badge
  | 'AVATAR'        // Avatar
  | 'SIGNATURE'     // Signature
  | 'LOCATION'      // Localisation
  | 'PROGRESS'      // Barre de progression;

/**
 * Configuration d'un champ dans une vue
 */
export interface EntidrViewFieldConfig {
  /** Nom du champ */
  name: string;

  /** Libellé affiché */
  label?: string;

  /** Widget à utiliser */
  widget: EntidrViewWidget;

  /** Champ visible */
  visible: boolean;

  /** Champ modifiable */
  editable: boolean;

  /** Champ requis */
  required: boolean;

  /** Champ en lecture seule */
  readonly?: boolean;

  /** Ordre d'affichage */
  order: number;

  /** Largeur de la colonne (pour les vues tableau) */
  width?: string | number;

  /** Alignement du texte */
  align?: 'left' | 'center' | 'right';

  /** Formatage */
  format?: string;

  /** Valeur par défaut */
  defaultValue?: any;

  /** Options pour les widgets de sélection */
  options?: Array<{ value: any; label: string }>;

  /** Validation */
  validation?: {
    min?: number | string;
    max?: number | string;
    pattern?: string;
    custom?: (value: any) => boolean | string;
  };

  /** Aide contextuelle */
  help?: string;

  /** Placeholder */
  placeholder?: string;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style inline */
  style?: Record<string, any>;

  /** Événements personnalisés */
  events?: Record<string, Function>;

  /** Conditions d'affichage */
  conditions?: {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not in' | 'like';
    value: any;
  }[];
}

/**
 * Type de filtre
 */
export type EntidrFilterType =
  | 'TEXT'      // Filtre texte
  | 'NUMBER'    // Filtre numérique
  | 'DATE'      // Filtre date
  | 'SELECT'    // Filtre sélection
  | 'BOOLEAN'   // Filtre booléen
  | 'RELATION'  // Filtre relation
  | 'CUSTOM'    // Filtre personnalisé;

/**
 * Opérateurs de filtre
 */
export type EntidrFilterOperator =
  | '='         // Égal
  | '!='        // Différent
  | '>'         // Supérieur
  | '<'         // Inférieur
  | '>='        // Supérieur ou égal
  | '<='        // Inférieur ou égal
  | 'like'      // Contient
  | 'ilike'     // Contient (insensible à la casse)
  | 'in'        // Dans la liste
  | 'not in'    // Pas dans la liste
  | 'is null'   // Est nul
  | 'is not null' // N'est pas nul
  | 'between'   // Entre
  | 'not between'; // Pas entre

/**
 * Configuration d'un filtre
 */
export interface EntidrViewFilter {
  /** Identifiant unique du filtre */
  id: string;

  /** Nom du champ */
  field: string;

  /** Libellé du filtre */
  label: string;

  /** Type de filtre */
  type: EntidrFilterType;

  /** Opérateur */
  operator: EntidrFilterOperator;

  /** Valeur du filtre */
  value?: any;

  /** Valeurs multiples (pour les opérateurs in/not in) */
  values?: any[];

  /** Filtre actif */
  active: boolean;

  /** Options pour les filtres de sélection */
  options?: Array<{ value: any; label: string }>;

  /** Configuration avancée */
  config?: {
    /** Champ dépendant */
    dependsOn?: string;
    /** Condition d'affichage */
    condition?: (data: any) => boolean;
    /** Fonction de validation personnalisée */
    validate?: (value: any) => boolean | string;
  };
}

/**
 * Type de groupement
 */
export type EntidrGroupType =
  | 'FIELD'     // Groupement par champ
  | 'DATE'      // Groupement par date
  | 'RELATION'  // Groupement par relation
  | 'CUSTOM'    // Groupement personnalisé;

/**
 * Configuration d'un groupement
 */
export interface EntidrViewGroup {
  /** Identifiant unique du groupement */
  id: string;

  /** Nom du champ */
  field: string;

  /** Libellé du groupement */
  label: string;

  /** Type de groupement */
  type: EntidrGroupType;

  /** Ordre de groupement */
  order: number;

  /** Groupement développé par défaut */
  expanded?: boolean;

  /** Afficher les sous-totaux */
  showSubtotals?: boolean;

  /** Agrégations */
  aggregations?: {
    field: string;
    operation: 'count' | 'sum' | 'avg' | 'min' | 'max';
    label: string;
    format?: string;
  }[];

  /** Configuration spécifique au type */
  config?: {
    /** Format de date pour le groupement par date */
    dateFormat?: 'year' | 'quarter' | 'month' | 'week' | 'day';
    /** Niveaux de groupement */
    levels?: string[];
  };
}

/**
 * Type de tri
 */
export type EntidrSortType = 'ASC' | 'DESC';

/**
 * Configuration d'un tri
 */
export interface EntidrViewSort {
  /** Nom du champ */
  field: string;

  /** Type de tri */
  type: EntidrSortType;

  /** Ordre de priorité */
  priority: number;
}

/**
 * Configuration de la pagination
 */
export interface EntidrViewPagination {
  /** Pagination activée */
  enabled: boolean;

  /** Nombre d'éléments par page */
  pageSize: number;

  /** Options de taille de page */
  pageSizeOptions: number[];

  /** Position de la pagination */
  position: 'top' | 'bottom' | 'both';

  /** Type de pagination */
  type: 'simple' | 'advanced' | 'infinite';
}

/**
 * Configuration d'une action
 */
export interface EntidrViewAction {
  /** Identifiant unique de l'action */
  id: string;

  /** Libellé de l'action */
  label: string;

  /** Icône */
  icon?: string;

  /** Type d'action */
  type: 'BUTTON' | 'MENU' | 'ICON' | 'LINK';

  /** Style de l'action */
  style?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  /** Action visible */
  visible: boolean;

  /** Action activée */
  enabled: boolean;

  /** Position de l'action */
  position?: 'toolbar' | 'row' | 'context' | 'footer';

  /** Permission requise */
  permission?: {
    model: string;
    action: string;
  };

  /** Fonction à exécuter */
  handler?: (data: any, context: EntidrSecurityContext) => Promise<void> | void;

  /** Route de navigation */
  route?: string;

  /** Confirmation requise */
  confirm?: {
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
  };

  /** Conditions d'affichage */
  conditions?: {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not in';
    value: any;
  }[];
}

/**
 * Configuration du thème
 */
export interface EntidrViewTheme {
  /** Couleur principale */
  primaryColor?: string;

  /** Couleur secondaire */
  secondaryColor?: string;

  /** Couleur d'arrière-plan */
  backgroundColor?: string;

  /** Couleur du texte */
  textColor?: string;

  /** Couleur des bordures */
  borderColor?: string;

  /** Taille de la police */
  fontSize?: string;

  /** Famille de police */
  fontFamily?: string;

  /** Espacement */
  spacing?: string;

  /** Rayons des coins */
  borderRadius?: string;

  /** Ombres */
  shadows?: boolean;

  /** Thème sombre */
  darkMode?: boolean;
}

/**
 * Configuration des permissions
 */
export interface EntidrViewPermissions {
  /** Vue visible */
  visible: boolean;

  /** Vue modifiable */
  editable: boolean;

  /** Création autorisée */
  create: boolean;

  /** Lecture autorisée */
  read: boolean;

  /** Mise à jour autorisée */
  update: boolean;

  /** Suppression autorisée */
  delete: boolean;

  /** Export autorisé */
  export: boolean;

  /** Import autorisé */
  import: boolean;

  /** Groupes autorisés */
  allowedGroups?: string[];

  /** Rôles autorisés */
  allowedRoles?: string[];

  /** Conditions d'accès */
  conditions?: {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not in';
    value: any;
  }[];
}

/**
 * Configuration d'un graphique
 */
export interface EntidrChartConfig {
  /** Type de graphique */
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polar' | 'scatter' | 'bubble';

  /** Données du graphique */
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
      fill?: boolean;
    }>;
  };

  /** Options du graphique */
  options: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      title?: {
        display: boolean;
        text: string;
      };
      legend?: {
        display: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
    };
    scales?: {
      x?: {
        display: boolean;
        title?: {
          display: boolean;
          text: string;
        };
      };
      y?: {
        display: boolean;
        title?: {
          display: boolean;
          text: string;
        };
      };
    };
  };
}

/**
 * Configuration du calendrier
 */
export interface EntidrCalendarConfig {
  /** Vue par défaut */
  defaultView: 'dayGridMonth' | 'dayGridWeek' | 'dayGridDay' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

  /** Format de l'heure */
  eventTimeFormat?: string;

  /** Première heure de la journée */
  scrollTime?: string;

  /** Hauteur */
  height?: 'auto' | 'parent' | number;

  /** Weekends visibles */
  weekends?: boolean;

  /** Configuration des événements */
  events?: {
    /** Champ de date de début */
    startField: string;
    /** Champ de date de fin */
    endField: string;
    /** Champ du titre */
    titleField: string;
    /** Champ de la couleur */
    colorField?: string;
  };
}

/**
 * Configuration du kanban
 */
export interface EntidrKanbanConfig {
  /** Champ d'état */
  statusField: string;

  /** Colonnes statiques */
  staticColumns?: Array<{
    id: string;
    title: string;
    status: string;
    color?: string;
    limit?: number;
  }>;

  /** Colonnes dynamiques */
  dynamicColumns?: {
    field: string;
    sort?: 'asc' | 'desc';
  };

  /** Configuration des cartes */
  cardConfig?: {
    /** Champ du titre */
    titleField: string;
    /** Champ de la description */
    descriptionField?: string;
    /** Champ de l'image */
    imageField?: string;
    /** Champ de la couleur */
    colorField?: string;
    /** Champs supplémentaires */
    additionalFields?: string[];
  };

  /** Drag-drop activé */
  dragDrop?: boolean;

  /** Limites par colonne */
  columnLimits?: boolean;
}

/**
 * Définition complète d'une vue
 */
export interface EntidrViewDefinition {
  /** Identifiant unique de la vue */
  id: string;

  /** Nom de la vue */
  name: string;

  /** Description de la vue */
  description?: string;

  /** Modèle associé */
  model: string;

  /** Type de vue */
  type: EntidrViewType;

  /** Vue par défaut */
  isDefault?: boolean;

  /** Vue système (non modifiable) */
  isSystem?: boolean;

  /** Vue active */
  active: boolean;

  /** Configuration des champs */
  fields: EntidrViewFieldConfig[];

  /** Filtres par défaut */
  defaultFilters?: EntidrViewFilter[];

  /** Groupements par défaut */
  defaultGroups?: EntidrViewGroup[];

  /** Tri par défaut */
  defaultSorts?: EntidrViewSort[];

  /** Configuration de la pagination */
  pagination?: EntidrViewPagination;

  /** Actions disponibles */
  actions?: EntidrViewAction[];

  /** Configuration du thème */
  theme?: EntidrViewTheme;

  /** Permissions */
  permissions?: EntidrViewPermissions;

  /** Configuration spécifique au type de vue */
  chartConfig?: EntidrChartConfig;
  calendarConfig?: EntidrCalendarConfig;
  kanbanConfig?: EntidrKanbanConfig;

  /** Métadonnées */
  metadata?: {
    /** Créateur de la vue */
    createdBy?: string;
    /** Date de création */
    createdAt?: Date;
    /** Modificateur de la vue */
    modifiedBy?: string;
    /** Date de modification */
    modifiedAt?: Date;
    /** Version de la vue */
    version?: number;
    /** Tags */
    tags?: string[];
    /** Catégorie */
    category?: string;
  };

  /** Configuration avancée */
  advanced?: {
    /** Requête personnalisée */
    customQuery?: string;
    /** Données personnalisées */
    customData?: Record<string, any>;
    /** Hooks du cycle de vie */
    lifecycle?: {
      beforeLoad?: () => Promise<void> | void;
      afterLoad?: (data: any) => Promise<void> | void;
      beforeSave?: (data: any) => Promise<void> | void;
      afterSave?: (data: any) => Promise<void> | void;
      beforeDelete?: (data: any) => Promise<void> | void;
      afterDelete?: (data: any) => Promise<void> | void;
    };
    /** Internationalisation */
    i18n?: {
      /** Champ pour la traduction */
      translateField?: string;
      /** Langues supportées */
      supportedLanguages?: string[];
    };
  };
}

/**
 * État d'une vue
 */
export interface EntidrViewState {
  /** Vue actuelle */
  currentView: EntidrViewDefinition;

  /** Données chargées */
  data: any[];

  /** Chargement en cours */
  loading: boolean;

  /** Erreur */
  error?: string;

  /** Filtres actifs */
  activeFilters: EntidrViewFilter[];

  /** Groupements actifs */
  activeGroups: EntidrViewGroup[];

  /** Tri actif */
  activeSorts: EntidrViewSort[];

  /** Pagination */
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  /** Élément sélectionné */
  selectedItem?: any;

  /** Éléments sélectionnés (multi-sélection) */
  selectedItems?: any[];

  /** Mode d'édition */
  editMode: boolean;

  /** Élément en cours d'édition */
  editingItem?: any;

  /** Vue développée/réduite */
  expanded: boolean;

  /** Recherche */
  search: {
    query: string;
    field: string;
    active: boolean;
  };
}

/**
 * Props du composant de vue
 */
export interface EntidrViewProps {
  /** Définition de la vue */
  view: EntidrViewDefinition;

  /** Contexte de sécurité */
  securityContext: EntidrSecurityContext;

  /** Données initiales */
  initialData?: any[];

  /** Mode lecture seule */
  readonly?: boolean;

  /** Mode compact */
  compact?: boolean;

  /** Hauteur personnalisée */
  height?: string | number;

  /** Largeur personnalisée */
  width?: string | number;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style personnalisé */
  style?: Record<string, any>;

  /** Événements */
  onEvent?: (event: string, data: any) => void;

  /** Callbacks */
  callbacks?: {
    onDataLoad?: (data: any[]) => void;
    onDataSave?: (data: any) => Promise<void> | void;
    onDataDelete?: (data: any) => Promise<void> | void;
    onFilterChange?: (filters: EntidrViewFilter[]) => void;
    onSortChange?: (sorts: EntidrViewSort[]) => void;
    onGroupChange?: (groups: EntidrViewGroup[]) => void;
    onPageChange?: (page: number) => void;
    onSelectionChange?: (selected: any[]) => void;
    onEdit?: (item: any) => void;
    onViewChange?: (view: EntidrViewDefinition) => void;
  };
}

/**
 * Interface pour le service de gestion des vues
 */
export interface EntidrViewService {
  /** Récupérer toutes les vues */
  getAllViews(): Promise<EntidrViewDefinition[]>;

  /** Récupérer une vue par son ID */
  getViewById(id: string): Promise<EntidrViewDefinition | null>;

  /** Récupérer les vues pour un modèle */
  getViewsForModel(model: string): Promise<EntidrViewDefinition[]>;

  /** Créer une nouvelle vue */
  createView(view: Omit<EntidrViewDefinition, 'id' | 'createdAt' | 'modifiedAt'>): Promise<EntidrViewDefinition>;

  /** Mettre à jour une vue */
  updateView(id: string, updates: Partial<EntidrViewDefinition>): Promise<EntidrViewDefinition>;

  /** Supprimer une vue */
  deleteView(id: string): Promise<boolean>;

  /** Dupliquer une vue */
  duplicateView(id: string, newName?: string): Promise<EntidrViewDefinition>;

  /** Valider une vue */
  validateView(view: EntidrViewDefinition): string[];

  /** Exporter une vue */
  exportView(id: string): Promise<string>;

  /** Importer une vue */
  importView(data: string): Promise<EntidrViewDefinition>;
}

/**
 * Interface pour le service de rendu des vues
 */
export interface EntidrViewRendererService {
  /** Rendre une vue */
  renderView(view: EntidrViewDefinition, props: EntidrViewProps): Promise<JSX.Element>;

  /** Récupérer le composant pour un type de vue */
  getComponentForViewType(type: EntidrViewType): Promise<React.ComponentType<EntidrViewProps>>;

  /** Enregistrer un composant personnalisé */
  registerCustomComponent(type: EntidrViewType, component: React.ComponentType<EntidrViewProps>): void;

  /** Obtenir les widgets disponibles */
  getAvailableWidgets(): Promise<EntidrViewWidget[]>;

  /** Obtenir les types de filtres disponibles */
  getAvailableFilterTypes(): Promise<EntidrFilterType[]>;

  /** Obtenir les types de groupement disponibles */
  getAvailableGroupTypes(): Promise<EntidrGroupType[]>;
}

export default EntidrViewDefinition;
