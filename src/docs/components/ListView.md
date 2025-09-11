# ListView - Documentation du Composant

## Overview

Le composant `ListView` est un composant React puissant et flexible pour afficher des données sous forme de tableau ou de liste. Il offre des fonctionnalités complètes de tri, filtrage, pagination, sélection et personnalisation.

## Installation

```typescript
import { ListView } from '../components/views/ListView';
import { EntidrViewDefinition, EntidrSecurityContext } from '../types/entidr-view';
```

## Props

### Props principales

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `view` | `EntidrViewDefinition` | ✅ | Définition de la vue à afficher |
| `securityContext` | `EntidrSecurityContext` | ✅ | Contexte de sécurité pour la gestion des permissions |
| `initialData` | `any[]` | ❌ | Données initiales à afficher |
| `viewState` | `EntidrViewState` | ❌ | État complet de la vue |
| `filteredData` | `any[]` | ❌ | Données filtrées (optimisation) |
| `paginatedData` | `any[]` | ❌ | Données paginées (optimisation) |

### Props de configuration

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `readonly` | `boolean` | `false` | Mode lecture seule |
| `compact` | `boolean` | `false` | Mode compact (affichage réduit) |
| `height` | `string \| number` | `auto` | Hauteur personnalisée du composant |
| `width` | `string \| number` | `100%` | Largeur personnalisée du composant |
| `className` | `string` | `''` | Classes CSS personnalisées |
| `style` | `Record<string, any>` | `{}` | Styles CSS personnalisés |

### Props de callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onDataLoad` | `(data: any[]) => void` | Callback lorsque les données sont chargées |
| `onDataSave` | `(data: any) => Promise<void> \| void` | Callback pour sauvegarder des données |
| `onDataDelete` | `(data: any) => Promise<void> \| void` | Callback pour supprimer des données |
| `onFilterChange` | `(filters: EntidrViewFilter[]) => void` | Callback lorsque les filtres changent |
| `onSortChange` | `(sorts: EntidrViewSort[]) => void` | Callback lorsque le tri change |
| `onGroupChange` | `(groups: EntidrViewGroup[]) => void` | Callback lorsque les groupements changent |
| `onPageChange` | `(page: number) => void` | Callback lorsque la page change |
| `onSelectionChange` | `(selected: any[]) => void` | Callback lorsque la sélection change |
| `onEdit` | `(item: any) => void` | Callback pour éditer un élément |
| `onViewChange` | `(view: EntidrViewDefinition) => void` | Callback lorsque la configuration de la vue change |
| `onEvent` | `(event: string, data: any) => void` | Callback pour les événements personnalisés |

## Utilisation de base

### Exemple simple

```typescript
import React from 'react';
import { ListView } from '../components/views/ListView';
import { EntidrSecurityContext } from '../types/entidr-security';

// Définition de la vue
const userListView: EntidrViewDefinition = {
  id: 'user-list',
  name: 'Liste des utilisateurs',
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
    },
    {
      name: 'name',
      label: 'Nom',
      widget: 'INPUT',
      visible: true,
      editable: true,
      required: true,
      order: 2
    },
    {
      name: 'email',
      label: 'Email',
      widget: 'EMAIL',
      visible: true,
      editable: true,
      required: true,
      order: 3
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
    import: true
  }
};

// Contexte de sécurité
const securityContext: EntidrSecurityContext = {
  user: {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    roles: ['admin'],
    groups: ['users'],
    permissions: ['view:read', 'view:write']
  },
  hasPermission: (permission) => true,
  hasRole: (role) => true,
  isInGroup: (group) => true,
  checkAccess: (resource, action) => true
};

// Données initiales
const initialData = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
];

// Composant
const UserListPage: React.FC = () => {
  const handleSelectionChange = (selected: any[]) => {
    console.log('Éléments sélectionnés:', selected);
  };

  const handleEdit = (item: any) => {
    console.log('Éditer l\'élément:', item);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      
      <ListView
        view={userListView}
        securityContext={securityContext}
        initialData={initialData}
        onSelectionChange={handleSelectionChange}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default UserListPage;
```

## Fonctionnalités avancées

### 1. Tri des colonnes

Le composant supporte le tri multi-colonnes avec indicateurs visuels :

```typescript
const handleSortChange = (sorts: EntidrViewSort[]) => {
  console.log('Nouveau tri:', sorts);
  // Mettre à jour les données triées
};

<ListView
  // ... autres props
  onSortChange={handleSortChange}
/>
```

### 2. Filtrage

Le composant inclut une barre de recherche et des filtres avancés :

```typescript
const handleFilterChange = (filters: EntidrViewFilter[]) => {
  console.log('Nouveaux filtres:', filters);
  // Appliquer les filtres aux données
};

<ListView
  // ... autres props
  onFilterChange={handleFilterChange}
/>
```

### 3. Pagination

Configuration flexible de la pagination :

```typescript
const handlePageChange = (page: number) => {
  console.log('Changement de page:', page);
  // Charger les données pour la nouvelle page
};

<ListView
  // ... autres props
  onPageChange={handlePageChange}
/>
```

### 4. Sélection

Support de la sélection simple et multiple :

```typescript
const handleSelectionChange = (selected: any[]) => {
  console.log('Éléments sélectionnés:', selected);
  // Mettre à jour l'état de sélection
};

<ListView
  // ... autres props
  onSelectionChange={handleSelectionChange}
/>
```

### 5. Actions personnalisées

Ajout d'actions sur chaque ligne et dans la toolbar :

```typescript
const viewWithActions: EntidrViewDefinition = {
  // ... autres propriétés
  actions: [
    {
      id: 'edit',
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
      id: 'delete',
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
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
        type: 'warning'
      }
    }
  ]
};
```

### 6. Personnalisation des colonnes

Configuration avancée des colonnes :

```typescript
const viewWithCustomColumns: EntidrViewDefinition = {
  // ... autres propriétés
  fields: [
    {
      name: 'status',
      label: 'Statut',
      widget: 'SELECT',
      visible: true,
      editable: true,
      required: true,
      order: 4,
      width: '150px',
      align: 'center',
      format: (value: string) => {
        const statusMap = {
          active: { text: 'Actif', color: 'green' },
          inactive: { text: 'Inactif', color: 'red' },
          pending: { text: 'En attente', color: 'orange' }
        };
        return statusMap[value] || { text: value, color: 'gray' };
      },
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
        { value: 'pending', label: 'En attente' }
      ]
    },
    {
      name: 'avatar',
      label: 'Avatar',
      widget: 'IMAGE',
      visible: true,
      editable: true,
      required: false,
      order: 5,
      width: '80px',
      align: 'center',
      format: (value: string) => value || '/default-avatar.png'
    }
  ]
};
```

## Gestion de l'état

### Utilisation avec useState

```typescript
import React, { useState, useEffect } from 'react';
import { ListView } from '../components/views/ListView';
import { EntidrViewState } from '../types/entidr-view';

const UserListWithState: React.FC = () => {
  const [viewState, setViewState] = useState<EntidrViewState>({
    currentView: userListView,
    data: [],
    loading: false,
    error: undefined,
    activeFilters: [],
    activeGroups: [],
    activeSorts: [],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1
    },
    selectedItem: undefined,
    selectedItems: [],
    editMode: false,
    editingItem: undefined,
    expanded: true,
    search: {
      query: '',
      field: 'name',
      active: false
    }
  });

  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [paginatedData, setPaginatedData] = useState<any[]>([]);

  // Simuler le chargement des données
  useEffect(() => {
    const loadData = async () => {
      setViewState(prev => ({ ...prev, loading: true }));
      
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = [
          { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'pending' }
        ];
        
        setViewState(prev => ({
          ...prev,
          data: mockData,
          loading: false,
          pagination: {
            ...prev.pagination,
            total: mockData.length,
            totalPages: Math.ceil(mockData.length / prev.pagination.pageSize)
          }
        }));
      } catch (error) {
        setViewState(prev => ({
          ...prev,
          loading: false,
          error: 'Erreur lors du chargement des données'
        }));
      }
    };

    loadData();
  }, []);

  // Appliquer les filtres et la pagination
  useEffect(() => {
    let result = [...viewState.data];

    // Appliquer les filtres
    viewState.activeFilters.forEach(filter => {
      result = result.filter(item => {
        switch (filter.operator) {
          case '=':
            return item[filter.field] === filter.value;
          case 'like':
            return String(item[filter.field]).toLowerCase().includes(String(filter.value).toLowerCase());
          default:
            return true;
        }
      });
    });

    // Appliquer le tri
    viewState.activeSorts.forEach(sort => {
      result.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        
        if (sort.type === 'ASC') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    });

    setFilteredData(result);

    // Appliquer la pagination
    const startIndex = (viewState.pagination.page - 1) * viewState.pagination.pageSize;
    const endIndex = startIndex + viewState.pagination.pageSize;
    setPaginatedData(result.slice(startIndex, endIndex));
  }, [viewState.data, viewState.activeFilters, viewState.activeSorts, viewState.pagination.page]);

  const handleFilterChange = (filters: EntidrViewFilter[]) => {
    setViewState(prev => ({ ...prev, activeFilters: filters, pagination: { ...prev.pagination, page: 1 } }));
  };

  const handleSortChange = (sorts: EntidrViewSort[]) => {
    setViewState(prev => ({ ...prev, activeSorts: sorts }));
  };

  const handlePageChange = (page: number) => {
    setViewState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  };

  const handleSelectionChange = (selected: any[]) => {
    setViewState(prev => ({
      ...prev,
      selectedItems: selected,
      selectedItem: selected.length === 1 ? selected[0] : undefined
    }));
  };

  if (viewState.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (viewState.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{viewState.error}</div>
      </div>
    );
  }

  return (
    <ListView
      view={viewState.currentView}
      securityContext={securityContext}
      viewState={viewState}
      filteredData={filteredData}
      paginatedData={paginatedData}
      onFilterChange={handleFilterChange}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      onSelectionChange={handleSelectionChange}
    />
  );
};
```

## Performance et optimisation

### 1. Virtualisation

Pour les grands datasets, utilisez la virtualisation :

```typescript
import { useVirtualization } from '../hooks/useVirtualization';

const VirtualizedListView: React.FC = () => {
  const { visibleItems, containerRef } = useVirtualization({
    items: filteredData,
    itemHeight: 50,
    overscan: 5
  });

  return (
    <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
      <ListView
        view={userListView}
        securityContext={securityContext}
        initialData={visibleItems}
        compact={true}
      />
    </div>
  );
};
```

### 2. Mémoisation

Utilisez React.memo pour éviter les rendus inutiles :

```typescript
import React, { memo } from 'react';

const MemoizedListView = memo(ListView);
```

### 3. Optimisation des données

Pré-traitez les données pour améliorer les performances :

```typescript
const optimizedData = useMemo(() => {
  return rawData.map(item => ({
    ...item,
    // Pré-calculer les valeurs formatées
    formattedStatus: formatStatus(item.status),
    formattedDate: formatDate(item.createdAt)
  }));
}, [rawData]);
```

## Accessibilité

Le composant est conçu pour être accessible :

### Attributs ARIA

```typescript
<ListView
  // ... autres props
  aria-label="Liste des utilisateurs"
  aria-describedby="user-list-description"
/>
```

### Navigation au clavier

- `Tab` : Navigation entre les éléments interactifs
- `Enter` : Activer les boutons et liens
- `Espace` : Sélectionner/désélectionner les cases à cocher
- `Ctrl/Cmd + Clic` : Sélection multiple
- `Shift + Clic` : Sélection par plage

### Support lecteur d'écran

- En-têtes de tableau correctement marqués
- États de sélection annoncés
- Messages d'erreur et de succès accessibles

## Thème et personnalisation

### 1. Classes CSS personnalisées

```typescript
<ListView
  // ... autres props
  className="custom-list-view"
/>
```

```css
/* styles.css */
.custom-list-view {
  --list-bg-color: #f8fafc;
  --list-border-color: #e2e8f0;
  --list-header-bg: #f1f5f9;
  --list-hover-bg: #f8fafc;
  --list-selected-bg: #dbeafe;
}

.custom-list-view .list-header {
  background-color: var(--list-header-bg);
}

.custom-list-view .list-row:hover {
  background-color: var(--list-hover-bg);
}

.custom-list-view .list-row.selected {
  background-color: var(--list-selected-bg);
}
```

### 2. Styles personnalisés

```typescript
<ListView
  // ... autres props
  style={{
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}
/>
```

### 3. Personnalisation des cellules

```typescript
const viewWithCustomCells: EntidrViewDefinition = {
  // ... autres propriétés
  fields: [
    {
      name: 'progress',
      label: 'Progression',
      widget: 'PROGRESS',
      visible: true,
      editable: false,
      required: false,
      order: 6,
      className: 'progress-cell',
      style: {
        minWidth: '120px'
      },
      format: (value: number) => (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${value}%` }}
          ></div>
        </div>
      )
    }
  ]
};
```

## Gestion des erreurs

### 1. Affichage des erreurs

```typescript
const [error, setError] = useState<string | null>(null);

const handleError = (errorMessage: string) => {
  setError(errorMessage);
  setTimeout(() => setError(null), 5000);
};

<ListView
  // ... autres props
  error={error}
  onError={handleError}
/>
```

### 2. Validation des données

```typescript
const validateRowData = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.name) {
    errors.push('Le nom est requis');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('L\'email est invalide');
  }
  
  return errors;
};

const handleDataSave = async (data: any) => {
  const errors = validateRowData(data);
  
  if (errors.length > 0) {
    setError(errors.join(', '));
    return;
  }
  
  try {
    await saveData(data);
    setError(null);
  } catch (err) {
    handleError('Erreur lors de la sauvegarde');
  }
};
```

## Tests

### Tests unitaires avec Jest et React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ListView } from '../components/views/ListView';

describe('ListView', () => {
  const mockView = {
    // ... définition de vue de test
  };

  const mockSecurityContext = {
    // ... contexte de sécurité de test
  };

  const mockData = [
    { id: 1, name: 'Test User 1', email: 'test1@example.com' },
    { id: 2, name: 'Test User 2', email: 'test2@example.com' }
  ];

  it('devrait rendre le composant avec les données', () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
      />
    );

    expect(screen.getByText('Test User 1')).toBeInTheDocument();
    expect(screen.getByText('Test User 2')).toBeInTheDocument();
  });

  it('devrait gérer le tri des colonnes', async () => {
    const mockSortChange = vi.fn();
    
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        onSortChange={mockSortChange}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      expect(mockSortChange).toHaveBeenCalled();
    });
  });

  it('devrait gérer la sélection des lignes', async () => {
    const mockSelectionChange = vi.fn();
    
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        onSelectionChange={mockSelectionChange}
      />
    );

    const firstRow = screen.getByText('Test User 1').closest('tr');
    fireEvent.click(firstRow);

    await waitFor(() => {
      expect(mockSelectionChange).toHaveBeenCalled();
    });
  });
});
```

## Bonnes pratiques

### 1. Performance

- Utilisez la virtualisation pour les grands datasets (> 1000 éléments)
- Mémoisez les données calculées
- Utilisez des clés stables pour les éléments de liste
- Évitez les rendus inutiles avec React.memo

### 2. Accessibilité

- Fournissez des labels ARIA appropriés
- Assurez-vous que toutes les interactions sont accessibles au clavier
- Utilisez des couleurs avec un contraste suffisant
- Testez avec des lecteurs d'écran

### 3. Sécurité

- Validez toujours les données côté serveur
- Utilisez le contexte de sécurité pour les permissions
- Nettoyez les entrées utilisateur
- Implémentez la protection CSRF

### 4. Expérience utilisateur

- Fournissez un feedback visuel pour les actions
- Utilisez des indicateurs de chargement
- Implémentez la confirmation pour les actions destructrices
- Supportez le responsive design

## Exemples avancés

### 1. Vue avec édition en ligne

```typescript
const InlineEditableListView: React.FC = () => {
  const [editingCell, setEditingCell] = useState<{ rowId: number; field: string } | null>(null);
  const [data, setData] = useState(mockData);

  const handleCellEdit = (rowId: number, field: string, value: any) => {
    setData(prev => 
      prev.map(item => 
        item.id === rowId ? { ...item, [field]: value } : item
      )
    );
    setEditingCell(null);
  };

  const viewWithInlineEdit: EntidrViewDefinition = {
    // ... autres propriétés
    fields: [
      {
        name: 'name',
        label: 'Nom',
        widget: 'INPUT',
        visible: true,
        editable: true,
        required: true,
        order: 1,
        render: (value: any, item: any) => {
          const isEditing = editingCell?.rowId === item.id && editingCell?.field === 'name';
          
          if (isEditing) {
            return (
              <input
                type="text"
                defaultValue={value}
                onBlur={(e) => handleCellEdit(item.id, 'name', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCellEdit(item.id, 'name', e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    setEditingCell(null);
                  }
                }}
                autoFocus
                className="w-full px-2 py-1 border rounded"
              />
            );
          }
          
          return (
            <span
              onClick={() => setEditingCell({ rowId: item.id, field: 'name' })}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            >
              {value}
            </span>
          );
        }
      }
      // ... autres champs
    ]
  };

  return (
    <ListView
      view={viewWithInlineEdit}
      securityContext={securityContext}
      initialData={data}
    />
  );
};
```

### 2. Vue avec glisser-déposer

```typescript
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DraggableListView: React.FC = () => {
  const [data, setData] = useState(mockData);

  const handleRowDrop = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = data[dragIndex];
    const newItems = [...data];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setData(newItems);
  };

  const DraggableRow: React.FC<{ item: any; index: number }> = ({ item, index }) => {
    const ref = useRef<HTMLTableRowElement>(null);
    
    const [{ isDragging }, drag] = useDrag({
      type: 'ROW',
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [{ handlerId }, drop] = useDrop({
      accept: 'ROW',
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        };
      },
      hover(item: { index: number }, monitor) {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) {
          return;
        }
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = (clientOffset!.y - hoverBoundingRect.top) - hoverMiddleY;
        if (dragIndex < hoverIndex && hoverClientY < 0) {
          return;
        }
        if (dragIndex > hoverIndex && hoverClientY > 0) {
          return;
        }
        handleRowDrop(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    drag(drop(ref));

    return (
      <tr
        ref={ref}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        data-handler-id={handlerId}
        className="cursor-move hover:bg-gray-50"
      >
        <td>{item.id}</td>
        <td>{item.name}</td>
        <td>{item.email}</td>
      </tr>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ListView
        view={userListView}
        securityContext={securityContext}
        initialData={data}
        components={{
          TableRow: DraggableRow
        }}
      />
    </DndProvider>
  );
};
```

## Conclusion

Le composant `ListView` offre une solution complète et flexible pour l'affichage de données tabulaires dans les applications React. Avec ses nombreuses fonctionnalités de tri, filtrage, pagination et personnalisation, il s'adapte à la plupart des cas d'utilisation tout en maintenant de bonnes performances et une excellente accessibilité.

En suivant les bonnes pratiques décrites dans cette documentation et en utilisant les exemples fournis, vous pourrez intégrer efficacement le composant dans vos applications et l'étendre selon vos besoins spécifiques.
