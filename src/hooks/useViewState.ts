import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  EntidrViewDefinition,
  EntidrViewState,
  EntidrViewFilter,
  EntidrViewGroup,
  EntidrViewSort
} from '../types/entidr-view';
import { entidrViewService } from '../services/EntidrViewService';

/**
 * Hook pour gérer l'état d'une vue
 * @param viewId ID de la vue à gérer
 * @param securityContext Contexte de sécurité
 * @returns État et fonctions de gestion de la vue
 */
export function useViewState(
  viewId: string | null,
  securityContext?: any
) {
  const [view, setView] = useState<EntidrViewDefinition | null>(null);
  const [state, setState] = useState<EntidrViewState>({
    currentView: {} as EntidrViewDefinition,
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
      totalPages: 0,
    },
    selectedItem: undefined,
    selectedItems: [],
    editMode: false,
    editingItem: undefined,
    expanded: true,
    search: {
      query: '',
      field: '',
      active: false,
    },
  });

  // Charger la vue
  const loadView = useCallback(async () => {
    if (!viewId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));

      const viewData = await entidrViewService.getViewById(viewId);
      if (!viewData) {
        throw new Error(`Vue avec ID ${viewId} non trouvée`);
      }

      setView(viewData);
      setState(prev => ({
        ...prev,
        currentView: viewData,
        activeFilters: viewData.defaultFilters || [],
        activeGroups: viewData.defaultGroups || [],
        activeSorts: viewData.defaultSorts || [],
        pagination: {
          ...prev.pagination,
          pageSize: viewData.pagination?.pageSize || 20,
        },
      }));

      // Charger les données initiales
      await loadData(viewData);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }));
    }
  }, [viewId]);

  // Charger les données
  const loadData = useCallback(async (viewDefinition: EntidrViewDefinition) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Simuler le chargement des données
      // Dans une implémentation réelle, cela appellerait l'API appropriée
      const mockData = generateMockData(viewDefinition);

      setState(prev => ({
        ...prev,
        data: mockData,
        loading: false,
        pagination: {
          ...prev.pagination,
          total: mockData.length,
          totalPages: Math.ceil(mockData.length / prev.pagination.pageSize),
        },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur de chargement des données',
      }));
    }
  }, []);

  // Rafraîchir les données
  const refreshData = useCallback(async () => {
    if (view) {
      await loadData(view);
    }
  }, [view, loadData]);

  // Mettre à jour les filtres
  const setFilters = useCallback((filters: EntidrViewFilter[]) => {
    setState(prev => ({ ...prev, activeFilters: filters }));
  }, []);

  // Ajouter un filtre
  const addFilter = useCallback((filter: EntidrViewFilter) => {
    setState(prev => ({
      ...prev,
      activeFilters: [...prev.activeFilters, filter],
    }));
  }, []);

  // Supprimer un filtre
  const removeFilter = useCallback((filterId: string) => {
    setState(prev => ({
      ...prev,
      activeFilters: prev.activeFilters.filter(f => f.id !== filterId),
    }));
  }, []);

  // Mettre à jour les groupements
  const setGroups = useCallback((groups: EntidrViewGroup[]) => {
    setState(prev => ({ ...prev, activeGroups: groups }));
  }, []);

  // Mettre à jour les tris
  const setSorts = useCallback((sorts: EntidrViewSort[]) => {
    setState(prev => ({ ...prev, activeSorts: sorts }));
  }, []);

  // Changer de page
  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  // Changer la taille de la page
  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, page: 1 },
    }));
  }, []);

  // Sélectionner un élément
  const selectItem = useCallback((item: any) => {
    setState(prev => ({ ...prev, selectedItem: item }));
  }, []);

  // Sélectionner plusieurs éléments
  const selectItems = useCallback((items: any[]) => {
    setState(prev => ({ ...prev, selectedItems: items }));
  }, []);

  // Basculer le mode d'édition
  const toggleEditMode = useCallback(() => {
    setState(prev => ({ ...prev, editMode: !prev.editMode }));
  }, []);

  // Éditer un élément
  const editItem = useCallback((item: any) => {
    setState(prev => ({
      ...prev,
      editingItem: item,
      editMode: true,
    selectedItem: item,
    expanded: true,
    search: { ...prev.search, active: false },
    selectedItems: [],
    pagination: { ...prev.pagination, page: 1 },
    activeFilters: [],
        activeGroups: [],
        activeSorts: [],
      }));
    }, []);

  // Sauvegarder un élément
  const saveItem = useCallback(async (item: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Simuler la sauvegarde
      // Dans une implémentation réelle, cela appellerait l'API appropriée
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        editMode: false,
        editingItem: undefined,
        selectedItem: undefined,
      }));

      // Rafraîchir les données
      await refreshData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur de sauvegarde',
      }));
    }
  }, [refreshData]);

  // Annuler l'édition
  const cancelEdit = useCallback(() => {
    setState(prev => ({
      ...prev,
      editMode: false,
      editingItem: undefined,
      selectedItem: undefined,
    }));
  }, []);

  // Supprimer un élément
  const deleteItem = useCallback(async (item: any) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Simuler la suppression
      // Dans une implémentation réelle, cela appellerait l'API appropriée
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        selectedItem: undefined,
        selectedItems: prev.selectedItems.filter(i => i !== item),
      }));

      // Rafraîchir les données
      await refreshData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur de suppression',
      }));
    }
  }, [refreshData]);

  // Mettre à jour la recherche
  const setSearch = useCallback((query: string, field: string = '') => {
    setState(prev => ({
      ...prev,
      search: { query, field, active: query.length > 0 },
    }));
  }, []);

  // Basculer l'état développé/réduit
  const toggleExpanded = useCallback(() => {
    setState(prev => ({ ...prev, expanded: !prev.expanded }));
  }, []);

  // Réinitialiser l'état
  const resetState = useCallback(() => {
    if (view) {
      setState(prev => ({
        ...prev,
        data: [],
        loading: false,
        error: undefined,
        activeFilters: view.defaultFilters || [],
        activeGroups: view.defaultGroups || [],
        activeSorts: view.defaultSorts || [],
        pagination: {
          page: 1,
          pageSize: view.pagination?.pageSize || 20,
          total: 0,
          totalPages: 0,
        },
        selectedItem: undefined,
        selectedItems: [],
        editMode: false,
        editingItem: undefined,
        expanded: true,
        search: {
          query: '',
          field: '',
          active: false,
        },
      }));
    }
  }, [view]);

  // Données filtrées et paginées
  const filteredData = useMemo(() => {
    let data = [...state.data];

    // Appliquer la recherche
    if (state.search.active && state.search.query) {
      const query = state.search.query.toLowerCase();
      data = data.filter(item => {
        if (state.search.field) {
          const fieldValue = item[state.search.field];
          return fieldValue?.toString().toLowerCase().includes(query);
        }
        // Recherche sur tous les champs
        return Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(query)
        );
      });
    }

    // Appliquer les filtres
    state.activeFilters.forEach(filter => {
      if (filter.active && filter.value !== undefined) {
        data = data.filter(item => {
          const fieldValue = item[filter.field];
          switch (filter.operator) {
            case '=':
              return fieldValue === filter.value;
            case '!=':
              return fieldValue !== filter.value;
            case '>':
              return fieldValue > filter.value;
            case '<':
              return fieldValue < filter.value;
            case '>=':
              return fieldValue >= filter.value;
            case '<=':
              return fieldValue <= filter.value;
            case 'like':
              return fieldValue?.toString().toLowerCase().includes(filter.value.toString().toLowerCase());
            default:
              return true;
          }
        });
      }
    });

    return data;
  }, [state.data, state.search, state.activeFilters]);

  const paginatedData = useMemo(() => {
    const startIndex = (state.pagination.page - 1) * state.pagination.pageSize;
    return filteredData.slice(startIndex, startIndex + state.pagination.pageSize);
  }, [filteredData, state.pagination]);

  // Effet pour charger la vue au montage
  useEffect(() => {
    loadView();
  }, [loadView]);

  return {
    // État
    view,
    state,
    filteredData,
    paginatedData,

    // Actions
    loadView,
    refreshData,
    setFilters,
    addFilter,
    removeFilter,
    setGroups,
    setSorts,
    setPage,
    setPageSize,
    selectItem,
    selectItems,
    toggleEditMode,
    editItem,
    saveItem,
    cancelEdit,
    deleteItem,
    setSearch,
    toggleExpanded,
    resetState,
  };
}

// Fonction utilitaire pour générer des données de test
function generateMockData(view: EntidrViewDefinition): any[] {
  const data: any[] = [];
  const itemCount = 50; // Nombre d'éléments à générer

  for (let i = 1; i <= itemCount; i++) {
    const item: any = { id: i };

    // Générer des valeurs pour chaque champ
    view.fields.forEach(field => {
      switch (field.widget) {
        case 'INPUT':
        case 'TEXTAREA':
          item[field.name] = `${field.label} ${i}`;
          break;
        case 'EMAIL':
          item[field.name] = `user${i}@example.com`;
          break;
        case 'NUMBER':
          item[field.name] = Math.floor(Math.random() * 1000);
          break;
        case 'BOOLEAN':
          item[field.name] = Math.random() > 0.5;
          break;
        case 'DATE':
          item[field.name] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'SELECT':
          const options = field.options || [];
          item[field.name] = options[Math.floor(Math.random() * options.length)]?.value || `Option ${i}`;
          break;
        default:
          item[field.name] = `Value ${i}`;
      }
    });

    data.push(item);
  }

  return data;
}
