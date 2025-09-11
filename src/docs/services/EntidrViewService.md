# EntidrViewService - Documentation de l'API

## Overview

Le `EntidrViewService` est le service principal responsable de la gestion des vues dans l'application Entidr. Il fournit une API complète pour créer, lire, mettre à jour, supprimer et gérer les vues de données.

## Installation

```typescript
import { EntidrViewService } from '../services/EntidrViewService';
import { EntidrViewCacheService } from '../services/EntidrViewCacheService';
import { EntidrLogger } from '../utils/logger';

// Initialisation
const cacheService = new EntidrViewCacheService();
const logger = new EntidrLogger('EntidrViewService');
const viewService = new EntidrViewService(cacheService, logger);
```

## API Reference

### Méthodes principales

#### `getAllViews(): Promise<EntidrViewDefinition[]>`

Récupère toutes les vues disponibles dans le système.

**Retourne:** `Promise<EntidrViewDefinition[]>` - Une promesse qui résout avec un tableau de définitions de vues.

**Exemple:**
```typescript
try {
  const views = await viewService.getAllViews();
  console.log('Vues disponibles:', views);
} catch (error) {
  console.error('Erreur lors de la récupération des vues:', error);
}
```

**Comportement:**
- Utilise le cache pour améliorer les performances
- Cache key: `views:all`
- Cache TTL: 5 minutes (300 secondes)
- Journalise les erreurs avec le niveau `error`

---

#### `getViewById(id: string): Promise<EntidrViewDefinition | null>`

Récupère une vue spécifique par son identifiant.

**Paramètres:**
- `id` (`string`) - L'identifiant unique de la vue

**Retourne:** `Promise<EntidrViewDefinition | null>` - Une promesse qui résout avec la définition de la vue ou `null` si non trouvée.

**Exemple:**
```typescript
const viewId = 'user-list-view';
const view = await viewService.getViewById(viewId);

if (view) {
  console.log('Vue trouvée:', view.name);
} else {
  console.log('Vue non trouvée');
}
```

---

#### `getViewsForModel(model: string): Promise<EntidrViewDefinition[]>`

Récupère toutes les vues associées à un modèle de données spécifique.

**Paramètres:**
- `model` (`string`) - Le nom du modèle de données

**Retourne:** `Promise<EntidrViewDefinition[]>` - Une promesse qui résout avec un tableau de vues pour le modèle spécifié.

**Exemple:**
```typescript
const userModelViews = await viewService.getViewsForModel('User');
console.log('Vues pour le modèle User:', userModelViews);
```

---

#### `createView(view: Omit<EntidrViewDefinition, 'id' | 'createdAt' | 'modifiedAt'>): Promise<EntidrViewDefinition>`

Crée une nouvelle vue dans le système.

**Paramètres:**
- `view` (`Omit<EntidrViewDefinition, 'id' | 'createdAt' | 'modifiedAt'>`) - La définition de la vue sans les champs générés automatiquement

**Retourne:** `Promise<EntidrViewDefinition>` - Une promesse qui résout avec la vue créée, y compris l'ID et les timestamps générés.

**Lève:** `Error` - Si la vue est invalide ou si une erreur survient lors de la création.

**Exemple:**
```typescript
const newView = {
  name: 'Liste des utilisateurs',
  description: 'Vue tableau pour la gestion des utilisateurs',
  type: 'LIST',
  model: 'User',
  fields: [
    {
      name: 'id',
      label: 'ID',
      widget: 'INPUT',
      visible: true,
      editable: false,
      required: false,
      order: 1
    }
    // ... autres champs
  ],
  isDefault: false,
  active: true,
  permissions: {
    visible: true,
    editable: true,
    create: true,
    read: true,
    update: true,
    delete: true,
    export: true,
    import: true
  }
};

try {
  const createdView = await viewService.createView(newView);
  console.log('Vue créée:', createdView.id);
} catch (error) {
  console.error('Erreur lors de la création de la vue:', error);
}
```

**Comportement:**
- Valide la vue avant création
- Génère automatiquement l'ID et les timestamps
- Invalide le cache `views:all`
- Journalise l'opération avec le niveau `info`

---

#### `updateView(id: string, updates: Partial<EntidrViewDefinition>): Promise<EntidrViewDefinition>`

Met à jour une vue existante.

**Paramètres:**
- `id` (`string`) - L'identifiant de la vue à mettre à jour
- `updates` (`Partial<EntidrViewDefinition>`) - Les modifications à appliquer

**Retourne:** `Promise<EntidrViewDefinition>` - Une promesse qui résout avec la vue mise à jour.

**Lève:** `Error` - Si la vue n'existe pas ou si une erreur survient lors de la mise à jour.

**Exemple:**
```typescript
const viewId = 'user-list-view';
const updates = {
  name: 'Liste des utilisateurs (mise à jour)',
  description: 'Description mise à jour'
};

try {
  const updatedView = await viewService.updateView(viewId, updates);
  console.log('Vue mise à jour:', updatedView.name);
} catch (error) {
  console.error('Erreur lors de la mise à jour de la vue:', error);
}
```

**Comportement:**
- Vérifie que la vue existe avant la mise à jour
- Met à jour le timestamp `modifiedAt`
- Invalide le cache `views:all`
- Journalise l'opération avec le niveau `info`

---

#### `deleteView(id: string): Promise<boolean>`

Supprime une vue du système.

**Paramètres:**
- `id` (`string`) - L'identifiant de la vue à supprimer

**Retourne:** `Promise<boolean>` - Une promesse qui résout avec `true` si la suppression a réussi, `false` sinon.

**Exemple:**
```typescript
const viewId = 'old-user-view';
const deleted = await viewService.deleteView(viewId);

if (deleted) {
  console.log('Vue supprimée avec succès');
} else {
  console.log('Échec de la suppression de la vue');
}
```

**Comportement:**
- Vérifie que la vue existe avant la suppression
- Invalide le cache `views:all`
- Journalise l'opération avec le niveau `info`

---

#### `duplicateView(id: string, newName?: string): Promise<EntidrViewDefinition>`

Duplique une vue existante avec un nouveau nom.

**Paramètres:**
- `id` (`string`) - L'identifiant de la vue à dupliquer
- `newName` (`string`, optionnel) - Le nouveau nom pour la vue dupliquée. Si non fourni, utilise le nom original avec " (copie)"

**Retourne:** `Promise<EntidrViewDefinition>` - Une promesse qui résout avec la vue dupliquée.

**Lève:** `Error` - Si la vue source n'existe pas ou si une erreur survient lors de la duplication.

**Exemple:**
```typescript
const sourceViewId = 'user-list-view';
try {
  const duplicatedView = await viewService.duplicateView(sourceViewId, 'Liste des utilisateurs - Archive');
  console.log('Vue dupliquée:', duplicatedView.id);
} catch (error) {
  console.error('Erreur lors de la duplication de la vue:', error);
}
```

**Comportement:**
- Génère un nouvel ID pour la vue dupliquée
- Réinitialise les timestamps
- Invalide le cache `views:all`
- Journalise l'opération avec le niveau `info`

---

#### `validateView(view: EntidrViewDefinition): string[]`

Valide une définition de vue et retourne les erreurs de validation.

**Paramètres:**
- `view` (`EntidrViewDefinition`) - La définition de vue à valider

**Retourne:** `string[]` - Un tableau contenant les messages d'erreur. Un tableau vide indique que la vue est valide.

**Exemple:**
```typescript
const viewToValidate = {
  name: '', // Nom invalide
  type: 'LIST',
  model: 'User',
  fields: []
};

const errors = viewService.validateView(viewToValidate);

if (errors.length === 0) {
  console.log('La vue est valide');
} else {
  console.log('Erreurs de validation:', errors);
  // Output: ["Le nom de la vue est requis", "Au moins un champ est requis"]
}
```

**Critères de validation:**
- Le nom est requis et ne doit pas être vide
- Le type doit être valide
- Le modèle doit être spécifié
- Au moins un champ doit être défini
- Les champs doivent avoir des configurations valides
- Les permissions doivent être correctement définies

---

#### `exportView(id: string): Promise<string>`

Exporte une vue au format JSON.

**Paramètres:**
- `id` (`string`) - L'identifiant de la vue à exporter

**Retourne:** `Promise<string>` - Une promesse qui résout avec la représentation JSON de la vue.

**Lève:** `Error` - Si la vue n'existe pas ou si une erreur survient lors de l'export.

**Exemple:**
```typescript
const viewId = 'user-list-view';
try {
  const exportedData = await viewService.exportView(viewId);
  console.log('Vue exportée:', exportedData);
  
  // Sauvegarder dans un fichier
  const blob = new Blob([exportedData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${viewId}.json`;
  a.click();
  URL.revokeObjectURL(url);
} catch (error) {
  console.error('Erreur lors de l\'export de la vue:', error);
}
```

**Format d'export:**
```json
{
  "view": {
    "id": "user-list-view",
    "name": "Liste des utilisateurs",
    // ... autres propriétés de la vue
  },
  "metadata": {
    "exportedAt": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

---

#### `importView(data: string): Promise<EntidrViewDefinition>`

Importe une vue depuis une chaîne JSON.

**Paramètres:**
- `data` (`string`) - La représentation JSON de la vue à importer

**Retourne:** `Promise<EntidrViewDefinition>` - Une promesse qui résout avec la vue importée.

**Lève:** `Error` - Si les données sont invalides, si le JSON est malformé, ou si une erreur survient lors de l'import.

**Exemple:**
```typescript
const jsonData = `{
  "view": {
    "name": "Vue importée",
    "type": "LIST",
    "model": "User",
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "widget": "INPUT",
        "visible": true,
        "editable": false,
        "required": false,
        "order": 1
      }
    ],
    "isDefault": false,
    "active": true,
    "permissions": {
      "visible": true,
      "editable": true,
      "create": true,
      "read": true,
      "update": true,
      "delete": true,
      "export": true,
      "import": true
    }
  }
}`;

try {
  const importedView = await viewService.importView(jsonData);
  console.log('Vue importée:', importedView.id);
} catch (error) {
  console.error('Erreur lors de l\'import de la vue:', error);
}
```

**Comportement:**
- Parse et valide les données JSON
- Valide la définition de vue
- Génère un nouvel ID pour la vue importée
- Crée les timestamps
- Invalide le cache `views:all`
- Journalise l'opération avec le niveau `info`

---

## Gestion des erreurs

Le service utilise un système de gestion d'erreurs cohérent :

### Types d'erreurs

1. **ValidationError** - Erreurs de validation des données
2. **NotFoundError** - Vue ou ressource non trouvée
3. **DatabaseError** - Erreurs de base de données
4. **CacheError** - Erreurs du système de cache
5. **ImportError** - Erreurs lors de l'import de données

### Journalisation

Toutes les opérations sont journalisées avec des niveaux appropriés :

- `info` : Opérations réussies (création, mise à jour, suppression)
- `warn` : Opérations avec des avertissements
- `error` : Erreurs et échecs d'opérations

### Exemple de gestion d'erreurs

```typescript
import { EntidrViewService, ViewError } from '../services/EntidrViewService';

async function safeViewOperation() {
  try {
    const view = await viewService.getViewById('non-existent-id');
    return view;
  } catch (error) {
    if (error instanceof ViewError) {
      switch (error.code) {
        case 'NOT_FOUND':
          console.log('Vue non trouvée');
          break;
        case 'VALIDATION_ERROR':
          console.log('Erreur de validation:', error.message);
          break;
        case 'DATABASE_ERROR':
          console.log('Erreur de base de données:', error.message);
          break;
        default:
          console.log('Erreur inconnue:', error.message);
      }
    } else {
      console.error('Erreur inattendue:', error);
    }
    return null;
  }
}
```

## Performance et Cache

### Stratégie de cache

Le service utilise un cache en mémoire pour améliorer les performances :

- **Cache key pattern**: `views:${operation}` (ex: `views:all`)
- **TTL par défaut**: 5 minutes (300 secondes)
- **Invalidation automatique**: Lors des opérations d'écriture (create, update, delete)

### Méthodes de cache

```typescript
// Forcer le rafraîchissement du cache
await viewService.refreshCache();

// Vider tout le cache des vues
await viewService.clearCache();

// Obtenir les statistiques du cache
const stats = await viewService.getCacheStats();
console.log('Cache hits:', stats.hits);
console.log('Cache misses:', stats.misses);
```

## Bonnes pratiques

### 1. Utilisation du cache

```typescript
// Bon : Laisser le service gérer le cache
const views = await viewService.getAllViews();

// Éviter : Contourner le cache
const views = await viewService.getAllViews({ useCache: false });
```

### 2. Gestion des erreurs

```typescript
// Bon : Toujours utiliser try/catch
try {
  const view = await viewService.createView(newView);
} catch (error) {
  // Gérer l'erreur de manière appropriée
}

// Éviter : Ne pas gérer les erreurs
const view = await viewService.createView(newView); // Risque de crash
```

### 3. Validation des données

```typescript
// Bon : Valider avant de créer
const errors = viewService.validateView(viewToCreate);
if (errors.length > 0) {
  console.log('Erreurs:', errors);
  return;
}
const createdView = await viewService.createView(viewToCreate);

// Alternative : Laisser le service valider (mais moins efficace)
try {
  const createdView = await viewService.createView(viewToCreate);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.log('Vue invalide');
  }
}
```

### 4. Import/Export

```typescript
// Bon : Utiliser les méthodes dédiées
const exportedData = await viewService.exportView(viewId);
const importedView = await viewService.importView(exportedData);

// Éviter : Manipuler manuellement les données
const view = await viewService.getViewById(viewId);
const manualExport = JSON.stringify(view); // Perte des métadonnées
```

## Exemples d'utilisation

### Création d'une vue complète

```typescript
async function createCompleteUserView() {
  const userView = {
    name: 'Gestion des utilisateurs',
    description: 'Vue complète pour la gestion des utilisateurs avec filtres et actions',
    type: 'LIST' as const,
    model: 'User',
    fields: [
      {
        name: 'id',
        label: 'ID',
        widget: 'INPUT' as const,
        visible: true,
        editable: false,
        required: false,
        order: 1
      },
      {
        name: 'username',
        label: 'Nom d\'utilisateur',
        widget: 'INPUT' as const,
        visible: true,
        editable: true,
        required: true,
        order: 2,
        validation: {
          pattern: '^[a-zA-Z0-9_]{3,20}$',
          custom: (value: string) => {
            if (value.includes('admin')) {
              return 'Le nom d\'utilisateur ne peut pas contenir "admin"';
            }
            return true;
          }
        }
      },
      {
        name: 'email',
        label: 'Email',
        widget: 'EMAIL' as const,
        visible: true,
        editable: true,
        required: true,
        order: 3
      },
      {
        name: 'status',
        label: 'Statut',
        widget: 'SELECT' as const,
        visible: true,
        editable: true,
        required: true,
        order: 4,
        options: [
          { value: 'active', label: 'Actif' },
          { value: 'inactive', label: 'Inactif' },
          { value: 'pending', label: 'En attente' }
        ]
      }
    ],
    defaultFilters: [
      {
        id: 'status-active',
        field: 'status',
        label: 'Utilisateurs actifs',
        type: 'SELECT' as const,
        operator: '=',
        value: 'active',
        active: true
      }
    ],
    defaultSorts: [
      {
        field: 'username',
        type: 'ASC' as const,
        priority: 1
      }
    ],
    pagination: {
      enabled: true,
      pageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
      position: 'bottom' as const,
      type: 'advanced' as const
    },
    actions: [
      {
        id: 'edit-user',
        label: 'Modifier',
        icon: 'edit',
        type: 'BUTTON' as const,
        style: 'primary' as const,
        visible: true,
        enabled: true,
        position: 'row' as const,
        permission: {
          model: 'User',
          action: 'update'
        }
      },
      {
        id: 'delete-user',
        label: 'Supprimer',
        icon: 'delete',
        type: 'BUTTON' as const,
        style: 'danger' as const,
        visible: true,
        enabled: true,
        position: 'row' as const,
        permission: {
          model: 'User',
          action: 'delete'
        },
        confirm: {
          title: 'Confirmation de suppression',
          message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
          type: 'warning' as const
        }
      }
    ],
    isDefault: false,
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
      allowedRoles: ['admin', 'manager']
    },
    metadata: {
      tags: ['users', 'management'],
      category: 'User Management'
    }
  };

  try {
    const createdView = await viewService.createView(userView);
    console.log('Vue créée avec succès:', createdView.id);
    return createdView;
  } catch (error) {
    console.error('Erreur lors de la création de la vue:', error);
    throw error;
  }
}
```

### Migration de vues

```typescript
async function migrateViews() {
  try {
    // Exporter toutes les vues existantes
    const allViews = await viewService.getAllViews();
    const exportData = await Promise.all(
      allViews.map(view => viewService.exportView(view.id))
    );

    // Sauvegarder les exports
    const backup = {
      exportedAt: new Date().toISOString(),
      views: exportData
    };
    
    console.log('Backup créé avec', exportData.length, 'vues');
    
    // Exemple de traitement sur les vues
    for (const viewData of exportData) {
      const parsed = JSON.parse(viewData);
      const view = parsed.view;
      
      // Mettre à jour certaines propriétés
      if (view.permissions) {
        view.permissions.allowedGroups = ['users'];
      }
      
      // Réimporter la vue mise à jour
      const updatedViewData = JSON.stringify({ view });
      await viewService.importView(updatedViewData);
    }
    
    console.log('Migration terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    throw error;
  }
}
```

## Conclusion

Le `EntidrViewService` fournit une API robuste et complète pour la gestion des vues dans l'application Entidr. En suivant les bonnes pratiques et en utilisant les méthodes appropriées, vous pouvez créer, gérer et maintenir efficacement les vues de données tout en garantissant de bonnes performances et une gestion d'erreurs cohérente.

Pour plus d'informations sur l'utilisation des vues dans les composants React, consultez la documentation des composants de vue.
