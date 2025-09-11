# Configuration des Vues - Guide Complet

## Overview

Ce guide explique comment configurer les vues dans le système Entidr. La configuration des vues se fait principalement à travers l'interface `EntidrViewDefinition` qui permet de définir tous les aspects d'une vue : champs, filtres, tri, actions, permissions, etc.

## Structure de Configuration

Une vue est définie par l'interface `EntidrViewDefinition` :

```typescript
interface EntidrViewDefinition {
  // Identification
  id: string;
  name: string;
  description?: string;
  
  // Type et modèle
  type: 'LIST' | 'FORM' | 'KANBAN' | 'CALENDAR' | 'CHART' | 'TREE' | 'GALLERY' | 'TIMELINE' | 'MAP' | 'DASHBOARD';
  model: string;
  
  // Configuration des champs
  fields: EntidrViewField[];
  
  // Filtres et tri
  defaultFilters?: EntidrViewFilter[];
  defaultSorts?: EntidrViewSort[];
  
  // Groupement et pagination
  defaultGroups?: EntidrViewGroup[];
  pagination?: EntidrViewPagination;
  
  // Actions
  actions?: EntidrViewAction[];
  
  // État et permissions
  isDefault?: boolean;
  active?: boolean;
  permissions?: EntidrViewPermissions;
  
  // Métadonnées
  metadata?: Record<string, any>;
}
```

## Configuration des Champs

Les champs sont les éléments fondamentaux d'une vue. Chaque champ définit comment une propriété des données doit être affichée et interagie.

### Structure d'un champ

```typescript
interface EntidrViewField {
  // Identification
  name: string;
  label: string;
  
  // Widget et affichage
  widget: EntidrViewWidgetType;
  visible: boolean;
  editable: boolean;
  required: boolean;
  
  // Ordre et dimensionnement
  order: number;
  width?: string | number;
  height?: string | number;
  align?: 'left' | 'center' | 'right';
  
  // Validation
  validation?: {
    pattern?: string;
    min?: number | string;
    max?: number | string;
    custom?: (value: any) => string | true;
  };
  
  // Options pour les widgets de sélection
  options?: Array<{
    value: any;
    label: string;
    disabled?: boolean;
    group?: string;
  }>;
  
  // Formatage personnalisé
  format?: (value: any, item?: any) => string | React.ReactNode;
  
  // Classes et styles
  className?: string;
  style?: Record<string, any>;
  
  // Conditions d'affichage
  visibleIf?: (item: any) => boolean;
  editableIf?: (item: any) => boolean;
  requiredIf?: (item: any) => boolean;
}
```

### Types de widgets disponibles

```typescript
type EntidrViewWidgetType = 
  | 'INPUT'          // Champ texte simple
  | 'TEXTAREA'       // Zone de texte
  | 'SELECT'         // Liste déroulante
  | 'MULTI_SELECT'   // Sélection multiple
  | 'CHECKBOX'       // Case à cocher
  | 'RADIO'          // Bouton radio
  | 'DATE'           // Sélecteur de date
  | 'DATETIME'       // Sélecteur de date/heure
  | 'TIME'           // Sélecteur d'heure
  | 'NUMBER'         // Champ numérique
  | 'CURRENCY'       // Champ monétaire
  | 'EMAIL'          // Champ email
  | 'PHONE'          // Champ téléphone
  | 'URL'            // Champ URL
  | 'PASSWORD'       // Champ mot de passe
  | 'COLOR'          // Sélecteur de couleur
  | 'FILE'           // Upload de fichier
  | 'IMAGE'          // Upload d'image
  | 'RICH_TEXT'      // Éditeur de texte riche
  | 'CODE'           // Éditeur de code
  | 'RATING'         // Évaluation par étoiles
  | 'TAGS'           // Tags
  | 'RELATION'       // Relation entre modèles
  | 'REFERENCE'      // Référence à un autre enregistrement
  | 'COMPUTED'       // Champ calculé
  | 'BOOLEAN'        // Booléen (toggle)
  | 'SLIDER'         // Curseur
  | 'SWITCH'         // Interrupteur
  | 'BADGE'          // Badge
  | 'AVATAR'         // Avatar
  | 'SIGNATURE'      // Signature
  | 'LOCATION'       // Localisation
  | 'PROGRESS'       // Barre de progression;
```

### Exemples de configuration de champs

#### Champ texte simple

```typescript
{
  name: 'username',
  label: "Nom d'utilisateur",
  widget: 'INPUT',
  visible: true,
  editable: true,
  required: true,
  order: 1,
  validation: {
    pattern: '^[a-zA-Z0-9_]{3,20}$',
    custom: (value: string) => {
      if (value.toLowerCase().includes('admin')) {
        return "Le nom d'utilisateur ne peut pas contenir 'admin'";
      }
      return true;
    }
  }
}
```

#### Champ email avec validation

```typescript
{
  name: 'email',
  label: 'Email',
  widget: 'EMAIL',
  visible: true,
  editable: true,
  required: true,
  order: 2,
  validation: {
    pattern: '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  }
}
```

#### Champ sélection avec options

```typescript
{
  name: 'status',
  label: 'Statut',
  widget: 'SELECT',
  visible: true,
  editable: true,
  required: true,
  order: 3,
  width: '120px',
  align: 'center',
  options: [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'pending', label: 'En attente' }
  ],
  format: (value: string) => {
    const statusConfig = {
      active: { text: 'Actif', color: 'green' },
      inactive: { text: 'Inactif', color: 'red' },
      pending: { text: 'En attente', color: 'orange' }
    };
    const config = statusConfig[value] || { text: value, color: 'gray' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  }
}
```

#### Champ date formaté

```typescript
{
  name: 'createdAt',
  label: 'Créé le',
  widget: 'DATE',
  visible: true,
  editable: false,
  required: false,
  order: 4,
  width: '150px',
  format: (value: Date) => value.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
```

#### Champ calculé

```typescript
{
  name: 'fullName',
  label: 'Nom complet',
  widget: 'COMPUTED',
  visible: true,
  editable: false,
  required: false,
  order: 5,
  format: (value: any, item: any) => {
    return `${item.firstName} ${item.lastName}`;
  }
}
```

## Configuration des Filtres

Les filtres permettent aux utilisateurs de restreindre les données affichées selon des critères spécifiques.

### Structure d'un filtre

```typescript
interface EntidrViewFilter {
  // Identification
  id: string;
  label: string;
  
  // Champ et opérateur
  field: string;
  type: EntidrViewFilterType;
  operator: EntidrViewFilterOperator;
  
  // Valeur et état
  value: any;
  active: boolean;
  
  // Options supplémentaires
  options?: Array<{ value: any; label: string }>;
  multiple?: boolean;
  
  // Conditions
  visibleIf?: (data: any[]) => boolean;
}
```

### Types de filtres

```typescript
type EntidrViewFilterType = 
  | 'TEXT'           // Filtre texte
  | 'NUMBER'         // Filtre numérique
  | 'DATE'           // Filtre date
  | 'SELECT'         // Filtre sélection
  | 'BOOLEAN'        // Filtre booléen
  | 'RELATION'       // Filtre relation
  | 'CUSTOM';        // Filtre personnalisé

type EntidrViewFilterOperator = 
  | '=' | '!=' | '>' | '>=' | '<' | '<='    // Opérateurs de comparaison
  | 'like' | 'not_like'                      // Opérateurs de texte
  | 'in' | 'not_in'                          // Opérateurs d'inclusion
  | 'between' | 'not_between'                // Opérateurs d'intervalle
  | 'is_null' | 'is_not_null';                // Opérateurs de nullité
```

### Exemples de configuration de filtres

#### Filtre texte

```typescript
{
  id: 'name-filter',
  field: 'name',
  label: 'Filtrer par nom',
  type: 'TEXT',
  operator: 'like',
  value: '',
  active: false
}
```

#### Filtre sélection

```typescript
{
  id: 'status-filter',
  field: 'status',
  label: 'Filtrer par statut',
  type: 'SELECT',
  operator: '=',
  value: 'active',
  active: true,
  options: [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'pending', label: 'En attente' }
  ]
}
```

#### Filtre date

```typescript
{
  id: 'date-range-filter',
  field: 'createdAt',
  label: 'Période de création',
  type: 'DATE',
  operator: 'between',
  value: { start: null, end: null },
  active: false
}
```

#### Filtre relation

```typescript
{
  id: 'category-filter',
  field: 'categoryId',
  label: 'Filtrer par catégorie',
  type: 'RELATION',
  operator: '=',
  value: '',
  active: false,
  options: [
    { value: 'cat-1', label: 'Catégorie 1' },
    { value: 'cat-2', label: 'Catégorie 2' }
  ]
}
```

## Configuration du Tri

Le tri permet d'ordonner les données selon un ou plusieurs critères.

### Structure d'un tri

```typescript
interface EntidrViewSort {
  // Champ et type
  field: string;
  type: 'ASC' | 'DESC';
  
  // Priorité pour le tri multi-colonnes
  priority: number;
  
  // Configuration supplémentaire
  custom?: (a: any, b: any) => number;
}
```

### Exemples de configuration de tri

#### Tri simple

```typescript
{
  field: 'name',
  type: 'ASC',
  priority: 1
}
```

#### Tri multi-colonnes

```typescript
[
  {
    field: 'status',
    type: 'DESC',
    priority: 1
  },
  {
    field: 'name',
    type: 'ASC',
    priority: 2
  }
]
```

#### Tri personnalisé

```typescript
{
  field: 'priority',
  type: 'ASC',
  priority: 1,
  custom: (a: any, b: any) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  }
}
```

## Configuration du Groupement

Le groupement permet d'organiser les données par catégories.

### Structure d'un groupement

```typescript
interface EntidrViewGroup {
  // Champ et type
  field: string;
  type: EntidrViewGroupType;
  
  // Configuration d'affichage
  label?: string;
  expanded?: boolean;
  
  // Agrégation
  aggregate?: {
    field: string;
    function: 'count' | 'sum' | 'avg' | 'min' | 'max';
    label?: string;
  };
}
```

### Types de groupement

```typescript
type EntidrViewGroupType = 
  | 'FIELD'          // Groupement par champ
  | 'DATE'           // Groupement par date
  | 'RELATION'       // Groupement par relation
  | 'CUSTOM';        // Groupement personnalisé
```

### Exemples de configuration de groupement

#### Groupement par champ

```typescript
{
  field: 'status',
  type: 'FIELD',
  label: 'Statut',
  expanded: true,
  aggregate: {
    field: 'id',
    function: 'count',
    label: 'Utilisateurs'
  }
}
```

#### Groupement par date

```typescript
{
  field: 'createdAt',
  type: 'DATE',
  label: 'Mois de création',
  expanded: true,
  aggregate: {
    field: 'id',
    function: 'count',
    label: 'Créations'
  }
}
```

## Configuration de la Pagination

La pagination permet de diviser les données en pages pour améliorer les performances.

### Structure de la pagination

```typescript
interface EntidrViewPagination {
  // Activation
  enabled: boolean;
  
  // Configuration de base
  pageSize: number;
  pageSizeOptions: number[];
  
  // Position et type
  position: 'top' | 'bottom' | 'both';
  type: 'simple' | 'advanced';
  
  // Options avancées
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}
```

### Exemples de configuration de pagination

#### Pagination simple

```typescript
{
  enabled: true,
  pageSize: 20,
  pageSizeOptions: [10, 20, 50],
  position: 'bottom',
  type: 'simple'
}
```

#### Pagination avancée

```typescript
{
  enabled: true,
  pageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  position: 'both',
  type: 'advanced',
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: true
}
```

## Configuration des Actions

Les actions définissent les boutons et interactions disponibles dans la vue.

### Structure d'une action

```typescript
interface EntidrViewAction {
  // Identification
  id: string;
  label: string;
  icon?: string;
  
  // Type et style
  type: 'BUTTON' | 'MENU' | 'LINK' | 'ICON';
  style: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  
  // État et position
  visible: boolean;
  enabled: boolean;
  position: 'toolbar' | 'row' | 'header' | 'footer';
  
  // Permissions
  permission?: {
    model: string;
    action: string;
    conditions?: Record<string, any>;
  };
  
  // Confirmation
  confirm?: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
  
  // Handler personnalisé
  handler?: (item: any, context: any) => void | Promise<void>;
}
```

### Exemples de configuration d'actions

#### Action d'ajout

```typescript
{
  id: 'add-item',
  label: 'Ajouter',
  icon: 'add',
  type: 'BUTTON',
  style: 'success',
  visible: true,
  enabled: true,
  position: 'toolbar',
  permission: {
    model: 'User',
    action: 'create'
  }
}
```

#### Action d'édition

```typescript
{
  id: 'edit-item',
  label: 'Modifier',
  icon: 'edit',
  type: 'BUTTON',
  style: 'primary',
  visible: true,
  enabled: true,
  position: 'row',
  permission: {
    model: 'User',
    action: 'update'
  }
}
```

#### Action de suppression avec confirmation

```typescript
{
  id: 'delete-item',
  label: 'Supprimer',
  icon: 'delete',
  type: 'BUTTON',
  style: 'danger',
  visible: true,
  enabled: true,
  position: 'row',
  permission: {
    model: 'User',
    action: 'delete'
  },
  confirm: {
    title: 'Confirmation de suppression',
    message: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    type: 'warning'
  }
}
```

#### Action personnalisée

```typescript
{
  id: 'custom-action',
  label: 'Action personnalisée',
  icon: 'settings',
  type: 'BUTTON',
  style: 'secondary',
  visible: true,
  enabled: true,
  position: 'row',
  handler: (item: any, context: any) => {
    console.log('Action personnalisée exécutée pour:', item);
    // Logique personnalisée ici
  }
}
```

## Configuration des Permissions

Les permissions contrôlent l'accès et les actions possibles sur la vue.

### Structure des permissions

```typescript
interface EntidrViewPermissions {
  // Permissions de base
  visible: boolean;
  editable: boolean;
  
  // Permissions CRUD
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  
  // Permissions étendues
  export: boolean;
  import: boolean;
  
  // Permissions basées sur les rôles
  allowedRoles?: string[];
  allowedGroups?: string[];
  
  // Permissions conditionnelles
  conditions?: {
    visible?: (user: any, item?: any) => boolean;
    editable?: (user: any, item?: any) => boolean;
    create?: (user: any) => boolean;
    read?: (user: any, item?: any) => boolean;
    update?: (user: any, item?: any) => boolean;
    delete?: (user: any, item?: any) => boolean;
  };
}
```

### Exemples de configuration de permissions

#### Permissions simples

```typescript
{
  visible: true,
  editable: true,
  create: true,
  read: true,
  update: true,
  delete: true,
  export: true,
  import: true
}
```

#### Permissions basées sur les rôles

```typescript
{
  visible: true,
  editable: true,
  create: true,
  read: true,
  update: true,
  delete: false,
  export: true,
  import: false,
  allowedRoles: ['admin', 'manager']
}
```

#### Permissions conditionnelles

```typescript
{
  visible: true,
  editable: true,
  create: true,
  read: true,
  update: true,
  delete: true,
  export: true,
  import: true,
  conditions: {
    delete: (user: any, item: any) => {
      // Seuls les administrateurs peuvent supprimer leur propre compte
      return user.roles.includes('admin') || user.id !== item.id;
    },
    update: (user: any, item: any) => {
      // Les utilisateurs peuvent modifier leur propre profil
      return user.id === item.id || user.roles.includes('admin');
    }
  }
}
```

## Configuration Complète - Exemple

Voici un exemple complet de configuration de vue pour une liste d'utilisateurs :

```typescript
const userListView: EntidrViewDefinition = {
  // Identification
  id: 'user-list-view',
  name: 'Liste des utilisateurs',
  description: 'Vue complète pour la gestion des utilisateurs',
  
  // Type et modèle
  type: 'LIST',
  model: 'User',
  
  // Configuration des champs
  fields: [
    {
      name: 'id',
      label: 'ID',
      widget: 'INPUT',
      visible: true,
      editable: false,
      required: false,
      order: 1,
      width: '80px'
    },
    {
      name: 'username',
      label: "Nom d'utilisateur",
      widget: 'INPUT',
      visible: true,
      editable: true,
      required: true,
      order: 2,
      validation: {
        pattern: '^[a-zA-Z0-9_]{3,20}$',
        custom: (value: string) => {
          if (value.toLowerCase().includes('admin')) {
            return "Le nom d'utilisateur ne peut pas contenir 'admin'";
          }
          return true;
        }
      }
    },
    {
      name: 'email',
      label: 'Email',
      widget: 'EMAIL',
      visible: true,
      editable: true,
      required: true,
      order: 3
    },
    {
      name: 'firstName',
      label: 'Prénom',
      widget: 'INPUT',
      visible: true,
      editable: true,
      required: true,
      order: 4
    },
    {
      name: 'lastName',
      label: 'Nom',
      widget: 'INPUT',
      visible: true,
      editable: true,
      required: true,
      order: 5
    },
    {
      name: 'status',
      label: 'Statut',
      widget: 'SELECT',
      visible: true,
      editable: true,
      required: true,
      order: 6,
      width: '120px',
      align: 'center',
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
        { value: 'pending', label: 'En attente' }
      ],
      format: (value: string) => {
        const statusConfig = {
          active: { text: 'Actif', color: 'green' },
          inactive: { text: 'Inactif', color: 'red' },
          pending: { text: 'En attente', color: 'orange' }
        };
        const config = statusConfig[value] || { text: value, color: 'gray' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
            {config.text}
          </span>
        );
      }
    },
    {
      name: 'role',
      label: 'Rôle',
      widget: 'SELECT',
      visible: true,
      editable: true,
      required: true,
      order: 7,
      width: '120px',
      align: 'center',
      options: [
        { value: 'admin', label: 'Administrateur' },
        { value: 'manager', label: 'Manager' },
        { value: 'user', label: 'Utilisateur' }
      ]
    },
    {
      name: 'createdAt',
      label: 'Créé le',
      widget: 'DATE',
      visible: true,
      editable: false,
      required: false,
      order: 8,
      width: '150px',
      format: (value: Date) => value.toLocaleDateString('fr-FR')
    },
    {
      name: 'lastLogin',
      label: 'Dernière connexion',
      widget: 'DATETIME',
      visible: true,
      editable: false,
      required: false,
      order: 9,
      width: '180px',
      format: (value: Date) => {
        if (!value) return 'Jamais';
        const now = new Date();
        const diff = now.getTime() - value.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Aujourd\'hui';
        if (days === 1) return 'Hier';
        if (days < 7) return `Il y a ${days} jours`;
        if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
        return value.toLocaleDateString('fr-FR');
      }
    }
  ],
  
  // Filtres par défaut
  defaultFilters: [
    {
      id: 'active-users',
      field: 'status',
      label: 'Utilisateurs actifs',
      type: 'SELECT',
      operator: '=',
      value: 'active',
      active: true
    },
    {
      id: 'name-search',
      field: 'username',
      label: 'Recherche par nom',
      type: 'TEXT',
      operator: 'like',
      value: '',
      active: false
    }
  ],
  
  // Tri par défaut
  defaultSorts: [
    {
      field: 'username',
      type: 'ASC',
      priority: 1
    }
  ],
  
  // Groupement par défaut
  defaultGroups: [
    {
      field: 'status',
      type: 'FIELD',
      label: 'Statut',
      expanded: true,
      aggregate: {
        field: 'id',
        function: 'count',
        label: 'Utilisateurs'
      }
    }
  ],
  
  // Pagination
  pagination: {
    enabled: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    position: 'bottom',
    type: 'advanced',
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true
  },
  
  // Actions
  actions: [
    {
      id: 'add-user',
      label: 'Ajouter un utilisateur',
      icon: 'add',
      type: 'BUTTON',
      style: 'success',
      visible: true,
      enabled: true,
      position: 'toolbar',
      permission: {
        model: 'User',
        action: 'create'
      }
    },
    {
      id: 'edit-user',
      label: 'Modifier',
      icon: 'edit',
      type: 'BUTTON',
      style: 'primary',
      visible: true,
      enabled: true,
      position: 'row',
      permission: {
        model: 'User',
        action: 'update'
      }
    },
    {
      id: 'delete-user',
      label: 'Supprimer',
      icon: 'delete',
      type: 'BUTTON',
      style: 'danger',
      visible: true,
      enabled: true,
      position: 'row',
      permission: {
        model: 'User',
        action: 'delete'
      },
      confirm: {
        title: 'Confirmation de suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
        type: 'warning'
      }
    },
    {
      id: 'export-users',
      label: 'Exporter',
      icon: 'download',
      type: 'BUTTON',
      style: 'secondary',
      visible: true,
      enabled: true,
      position: 'toolbar',
      permission: {
        model: 'User',
        action: 'export'
      }
    },
    {
      id: 'import-users',
      label: 'Importer',
      icon: 'upload',
      type: 'BUTTON',
      style: 'secondary',
      visible: true,
      enabled: true,
      position: 'toolbar',
      permission: {
        model: 'User',
        action: 'import'
      }
    }
  ],
  
  // État et permissions
  isDefault: true,
  active: true,
  permissions: {
    visible: true,
    editable: true,
    create: true,
    read: true,
    update: true,
    delete: true,
    export: true,
    import: true,
    allowedRoles: ['admin', 'manager'],
    conditions: {
      delete: (user: any, item: any) => {
        return user.roles.includes('admin') || user.id !== item.id;
      }
    }
  },
  
  // Métadonnées
  metadata: {
    tags: ['users', 'management', 'admin'],
    category: 'User Management',
    version: '1.0.0',
    author: 'Admin Team',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
};
```

## Bonnes Pratiques de Configuration

### 1. Organisation des champs

- Utilisez l'ordre `order` pour définir la séquence d'affichage
- Regroupez les champs logiquement (informations personnelles, métadonnées, etc.)
- Utilisez des largeurs cohérentes pour les colonnes

### 2. Performance

- Limitez le nombre de champs visibles pour les grands datasets
- Utilisez la pagination pour améliorer les performances
- Évitez les calculs complexes dans les fonctions `format`

### 3. Accessibilité

- Fournissez des labels clairs et descriptifs
- Utilisez des contrastes de couleurs appropriés
- Assurez-vous que toutes les interactions sont accessibles au clavier

### 4. Sécurité

- Utilisez des permissions granulaires
- Validez toutes les entrées utilisateur
- Implémentez des confirmations pour les actions destructrices

### 5. Maintenance

- Documentez les configurations complexes
- Utilisez des métadonnées pour suivre les modifications
- Versionnez les configurations importantes

## Validation des Configurations

Le système fournit des méthodes de validation pour s'assurer que les configurations sont correctes :

```typescript
import { EntidrViewService } from '@entidr/views';

const viewService = new EntidrViewService(cacheService, logger);

// Valider une configuration
const viewConfig = { /* votre configuration */ };
const errors = viewService.validateView(viewConfig);

if (errors.length > 0) {
  console.log('Erreurs de validation:', errors);
  // Corriger les erreurs
} else {
  console.log('La configuration est valide');
}
```

### Erreurs de validation courantes

1. **Champs manquants** : Au moins un champ est requis
2. **Ordres dupliqués** : Plusieurs champs avec le même ordre
3. **Permissions invalides** : Configuration de permissions incorrecte
4. **Options invalides** : Options de sélection mal formatées
5. **Références circulaires** : Dépendances circulaires entre les champs

## Migration et Mise à Jour

### Migration depuis une version antérieure

```typescript
// Ancienne configuration
const oldConfig = {
  // ... configuration ancienne
};

// Nouvelle configuration avec compatibilité ascendante
const newConfig = {
  ...oldConfig,
  // Ajouter les nouvelles propriétés requises
  pagination: oldConfig.pagination || {
    enabled: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50]
  },
  permissions: oldConfig.permissions || {
    visible: true,
    editable: true,
    create: true,
    read: true,
    update: true,
    delete: true
  }
};
```

### Mise à jour des configurations existantes

```typescript
async function updateViewConfig(viewId: string, updates: Partial<EntidrViewDefinition>) {
  try {
    // Récupérer la configuration actuelle
    const currentView = await viewService.getViewById(viewId);
    
    if (!currentView) {
      throw new Error('Vue non trouvée');
    }
    
    // Appliquer les mises à jour
    const updatedView = {
      ...currentView,
      ...updates,
      metadata: {
        ...currentView.metadata,
        updatedAt: new Date().toISOString(),
        version: incrementVersion(currentView.metadata?.version)
      }
    };
    
    // Valider la nouvelle configuration
    const errors = viewService.validateView(updatedView);
    
    if (errors.length > 0) {
      throw new Error(`Configuration invalide: ${errors.join(', ')}`);
    }
    
    // Sauvegarder la configuration mise à jour
    await viewService.updateView(viewId, updatedView);
    
    console.log('Configuration mise à jour avec succès');
    return updatedView;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    throw error;
  }
}
```

## Conclusion

La configuration des vues dans le système Entidr est puissante et flexible. En suivant ce guide et les bonnes pratiques décrites, vous pouvez créer des vues sophistiquées qui répondent à tous vos besoins tout en maintenant de bonnes performances et une sécurité adéquate.

N'oubliez pas de :
- Valider vos configurations avant de les déployer
- Documenter les configurations complexes
- Utiliser les permissions pour contrôler l'accès
- Optimiser pour les performances avec les grands datasets
- Tester vos configurations avec différents scénarios utilisateur

Pour plus d'informations sur l'utilisation des vues configurées, consultez la documentation des composants et des exemples d'utilisation.
