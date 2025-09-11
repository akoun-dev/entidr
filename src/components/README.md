# Composants de l'Application

Ce dossier contient tous les composants réutilisables de l'application, organisés par catégorie.

## Structure

```
src/components/
├── ui/                    # Composants UI de base (boutons, inputs, etc.)
├── pagination/            # Système de pagination
├── actions/               # Système d'actions et de permissions
├── forms/                 # Composants de formulaires (à créer)
├── data/                  # Composants d'affichage de données (à créer)
├── layout/                # Composants de mise en page (à créer)
├── PaginationControls.tsx # Composant principal de pagination
├── index.ts              # Export principal
└── README.md             # Ce fichier
```

## Système de Pagination

Le système de pagination offre trois types de pagination :

### 1. Pagination Simple (`SimplePagination`)

- Navigation basique avec boutons précédent/suivant
- Numéros de page personnalisables
- Sélecteur de taille de page optionnel
- Idéal pour les interfaces simples

```tsx
import { SimplePagination } from '@/components/pagination';

<SimplePagination
  config={paginationConfig}
  state={paginationState}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

### 2. Pagination Avancée (`AdvancedPagination`)

- Navigation complète avec ellipses
- Saut direct à une page spécifique
- Paramètres personnalisables
- Informations détaillées sur la pagination
- Idéale pour les tableaux de données complexes

```tsx
import { AdvancedPagination } from '@/components/pagination';

<AdvancedPagination
  config={paginationConfig}
  state={paginationState}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  showPageSelector={true}
  showDetailedInfo={true}
/>
```

### 3. Défilement Infini (`InfiniteScroll`)

- Chargement automatique au défilement
- Bouton "charger plus" optionnel
- Indicateurs de progression
- Idéal pour les flux de contenu et les réseaux sociaux

```tsx
import { InfiniteScroll } from '@/components/pagination';

<InfiniteScroll
  config={paginationConfig}
  state={paginationState}
  onLoadMore={handleLoadMore}
  threshold={100}
  disableAutoLoad={false}
/>
```

### 4. Contrôleur Principal (`PaginationControls`)

Composant de routage qui choisit automatiquement le type de pagination approprié :

```tsx
import { PaginationControls } from '@/components';

<PaginationControls
  config={{
    type: 'ADVANCED', // 'SIMPLE', 'ADVANCED', ou 'INFINITE'
    style: 'BUTTONS',
    showPageInfo: true,
    maxPageButtons: 7
  }}
  state={paginationState}
  onPageChange={handlePageChange}
/>
```

## Système d'Actions

Le système d'actions fournit une gestion complète des actions utilisateur avec permissions et confirmations.

### 1. Bouton d'Action (`ActionButton`)

Bouton intelligent avec gestion des permissions et confirmations :

```tsx
import { ActionButton } from '@/components/actions';

<ActionButton
  action={{
    id: 'delete-user',
    label: 'Supprimer',
    type: 'DELETE',
    model: 'User',
    permissions: ['DELETE'],
    isDestructive: true,
    requiresConfirmation: true,
    icon: <TrashIcon />
  }}
  onConfirm={handleDelete}
/>
```

### 2. Menu d'Actions (`ActionMenu`)

Menu déroulant pour les actions groupées avec gestion des permissions :

```tsx
import { ActionMenu } from '@/components/actions';

<ActionMenu
  actions={[
    {
      id: 'edit',
      label: 'Modifier',
      type: 'UPDATE',
      permissions: ['UPDATE']
    },
    {
      id: 'delete',
      label: 'Supprimer',
      type: 'DELETE',
      permissions: ['DELETE'],
      isDestructive: true
    }
  ]}
  groups={[
    {
      id: 'bulk',
      label: 'Actions groupées',
      actions: bulkActions
    }
  ]}
  onActionClick={handleAction}
/>
```

### 3. Confirmation d'Action (`ActionConfirmation`)

Dialogue de confirmation avancé avec templates et fonctionnalités supplémentaires :

```tsx
import { ActionConfirmation } from '@/components/actions';

<ActionConfirmation
  config={{
    action: deleteAction,
    showDetails: true,
    reflectionDelay: 3000, // 3 secondes de réflexion
    requireConfirmationInput: true,
    confirmationInputText: 'supprimer'
  }}
  open={showConfirmation}
  onOpenChange={setShowConfirmation}
  onConfirm={executeDelete}
/>
```

### 4. Hook de Permissions (`useActionPermissions`)

Hook pour vérifier les permissions d'une action :

```tsx
import { useActionPermissions } from '@/components/actions';

const { hasPermission, isChecking, refresh } = useActionPermissions({
  action: deleteAction,
  bypass: false
});

if (isChecking) {
  return <Spinner />;
}

if (!hasPermission) {
  return <PermissionDenied />;
}
```

## Types et Interfaces

### Types de Pagination

```typescript
interface PaginationConfig {
  type: PaginationType;        // 'SIMPLE' | 'ADVANCED' | 'INFINITE'
  style: PaginationStyle;      // 'BUTTONS' | 'SELECT' | 'INPUT' | 'SCROLL'
  position: PaginationPosition; // 'TOP' | 'BOTTOM' | 'BOTH'
  defaultPageSize: number;
  showPageInfo: boolean;
  maxPageButtons: number;
  texts: PaginationTexts;
}
```

### Types d'Actions

```typescript
interface ActionConfig {
  id: string;
  label: string;
  type: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'CUSTOM' | 'EXPORT' | 'IMPORT' | 'BATCH';
  model?: string;
  permissions?: PermissionLevel[];
  requiresConfirmation?: boolean;
  isDestructive?: boolean;
  icon?: React.ReactNode;
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  payload?: any;
}
```

## Bonnes Pratiques

### 1. Pagination

- Choisir le type de pagination approprié au cas d'usage
- Utiliser `PaginationControls` pour une flexibilité maximale
- Configurer correctement les tailles de page pour les performances
- Gérer les états de chargement et d'erreur

### 2. Actions

- Définir clairement les permissions requises pour chaque action
- Utiliser les confirmations pour les actions destructives
- Regrouper les actions logiquement dans les menus
- Fournir des icônes et des descriptions claires

### 3. Accessibilité

- Tous les composants supportent l'accessibilité ARIA
- Les boutons ont des labels appropriés
- Les dialogues de confirmation sont focus-trappable
- Les menus déroulants sont navigables au clavier

### 4. Performance

- Les composants sont optimisés pour le rendu
- Le système de permissions utilise un cache intelligent
- La pagination infinie utilise l'Intersection Observer API
- Les actions sont débouncées pour éviter les clics multiples

## Personnalisation

### Thèmes

Les composants utilisent le système de design de l'application et peuvent être personnalisés via les classes CSS :

```css
/* Personnaliser les boutons de pagination */
.pagination-button {
  @apply rounded-lg border-2;
}

/* Personnaliser les menus d'actions */
.action-menu-item {
  @apply hover:bg-gray-100;
}
```

### Templates

Les systèmes de pagination et d'actions supportent des templates personnalisables :

```typescript
const customPaginationTexts = {
  previous: 'Précédent',
  next: 'Suivant',
  first: 'Début',
  last: 'Fin',
  // ...
};

const customConfirmationTemplate = {
  id: 'custom-danger',
  defaultTitle: 'Action dangereuse',
  defaultMessage: 'Cette action est très dangereuse. Continuez ?',
  // ...
};
```

## Exemples d'Utilisation

### Tableau de Données avec Pagination

```tsx
function DataTable() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    loading: false
  });

  const fetchData = async (page: number, size: number) => {
    setPagination(prev => ({ ...prev, loading: true }));
    const response = await api.getData(page, size);
    setData(response.data);
    setPagination(prev => ({
      ...prev,
      loading: false,
      totalItems: response.total,
      totalPages: Math.ceil(response.total / size)
    }));
  };

  return (
    <div>
      <table>
        {/* ... contenu du tableau ... */}
      </table>
      
      <PaginationControls
        config={{ type: 'ADVANCED' }}
        state={pagination}
        onPageChange={(page) => fetchData(page, pagination.pageSize)}
        onPageSizeChange={(size) => fetchData(1, size)}
      />
    </div>
  );
}
```

### Liste d'Éléments avec Actions

```tsx
function UserList() {
  const [users, setUsers] = useState([]);

  const handleUserAction = async (action: ActionConfig, user: User) => {
    switch (action.type) {
      case 'DELETE':
        await api.deleteUser(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        break;
      case 'UPDATE':
        // Ouvrir le modal d'édition
        break;
    }
  };

  return (
    <ul>
      {users.map(user => (
        <li key={user.id} className="flex items-center justify-between">
          <span>{user.name}</span>
          <ActionMenu
            actions={[
              {
                id: 'edit',
                label: 'Modifier',
                type: 'UPDATE',
                model: 'User',
                permissions: ['UPDATE'],
                icon: <EditIcon />
              },
              {
                id: 'delete',
                label: 'Supprimer',
                type: 'DELETE',
                model: 'User',
                permissions: ['DELETE'],
                isDestructive: true,
                icon: <DeleteIcon />
              }
            ]}
            onActionClick={(action) => handleUserAction(action, user)}
          />
        </li>
      ))}
    </ul>
  );
}
```

## Dépannage

### Problèmes Communs

1. **La pagination ne fonctionne pas**
   - Vérifier que les handlers `onPageChange` sont correctement implémentés
   - S'assurer que l'état de pagination est correctement mis à jour

2. **Les actions sont désactivées**
   - Vérifier les permissions de l'utilisateur
   - S'assurer que le contexte de sécurité est correctement configuré
   - Utiliser le hook `useActionPermissions` pour le débogage

3. **Les confirmations ne s'affichent pas**
   - Vérifier que `requiresConfirmation` est à `true`
   - S'assurer que l'état `open` est correctement géré
   - Vérifier la console pour les erreurs

### Débogage

Les composants fournissent plusieurs options de débogage :

```tsx
<ActionButton
  action={action}
  showPermissionStatus={true}  // Affiche le statut des permissions
  bypassPermissions={false}   // Désactiver pour tester
/>

<AdvancedPagination
  config={config}
  state={state}
  showDetailedInfo={true}    // Affiche plus d'informations
/>
```

## Contribuer

Pour ajouter de nouveaux composants ou modifier les existants :

1. Suivre la structure de dossiers établie
2. Implémenter les types TypeScript appropriés
3. Ajouter les tests unitaires
4. Mettre à jour la documentation
5. Exporter les nouveaux composants dans les fichiers `index.ts`

## Dépendances

- React 18+
- TypeScript 4.5+
- Tailwind CSS
- Lucide React (icônes)
- shadcn/ui (composants de base)
