import React, { useEffect } from 'react';
import { EntidrViewProps, EntidrViewDefinition } from '../types/entidr-view';
import { useViewState } from '../hooks/useViewState';
import { entidrViewRendererService } from '../services/EntidrViewRendererService';
import { LoadingScreen } from './LoadingScreen';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Composant principal de rendu des vues
 * Ce composant gère l'affichage dynamique des différents types de vues
 */
export const EntidrViewRenderer: React.FC<EntidrViewProps> = ({
  view,
  securityContext,
  initialData,
  readonly = false,
  compact = false,
  height,
  width,
  className,
  style,
  onEvent,
  callbacks,
}) => {
  const {
    state,
    filteredData,
    paginatedData,
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
  } = useViewState(view.id, securityContext);

  const [currentComponent, setCurrentComponent] = React.useState<React.ComponentType<EntidrViewProps> | null>(null);

  // Charger le composant approprié pour le type de vue
  useEffect(() => {
    const loadComponent = async () => {
      try {
        const Component = await entidrViewRendererService.getComponentForViewType(view.type);
        setCurrentComponent(() => Component);
      } catch (error) {
        console.error('Erreur lors du chargement du composant:', error);
        setCurrentComponent(null);
      }
    };

    loadComponent();
  }, [view.type]);

  // Gérer les événements
  const handleEvent = (eventName: string, data: any) => {
    // Appeler le callback onEvent si fourni
    if (onEvent) {
      onEvent(eventName, data);
    }

    // Gérer les événements internes
    switch (eventName) {
      case 'refresh':
        refreshData();
        break;
      case 'edit':
        editItem(data);
        break;
      case 'save':
        saveItem(data);
        break;
      case 'cancel':
        cancelEdit();
        break;
      case 'delete':
        deleteItem(data);
        break;
      case 'select':
        selectItem(data);
        break;
      case 'selectMultiple':
        selectItems(data);
        break;
      case 'search':
        setSearch(data.query, data.field);
        break;
      case 'filter':
        setFilters(data);
        break;
      case 'addFilter':
        addFilter(data);
        break;
      case 'removeFilter':
        removeFilter(data);
        break;
      case 'group':
        setGroups(data);
        break;
      case 'sort':
        setSorts(data);
        break;
      case 'pageChange':
        setPage(data);
        break;
      case 'pageSizeChange':
        setPageSize(data);
        break;
      case 'toggleExpand':
        toggleExpanded();
        break;
      case 'reset':
        resetState();
        break;
      default:
        break;
    }

    // Appeler les callbacks spécifiques si fournis
    if (callbacks) {
      switch (eventName) {
        case 'dataLoad':
          callbacks.onDataLoad?.(data);
          break;
        case 'dataSave':
          callbacks.onDataSave?.(data);
          break;
        case 'dataDelete':
          callbacks.onDataDelete?.(data);
          break;
        case 'filterChange':
          callbacks.onFilterChange?.(data);
          break;
        case 'sortChange':
          callbacks.onSortChange?.(data);
          break;
        case 'groupChange':
          callbacks.onGroupChange?.(data);
          break;
        case 'pageChange':
          callbacks.onPageChange?.(data);
          break;
        case 'selectionChange':
          callbacks.onSelectionChange?.(data);
          break;
        case 'edit':
          callbacks.onEdit?.(data);
          break;
        case 'viewChange':
          callbacks.onViewChange?.(data);
          break;
        default:
          break;
      }
    }
  };

  // Props à passer au composant de vue
  const viewProps: EntidrViewProps = {
    view,
    securityContext,
    initialData,
    readonly,
    compact,
    height,
    width,
    className,
    style,
    onEvent: handleEvent,
    callbacks,
  };

  // Afficher l'écran de chargement
  if (state.loading) {
    return (
      <div className={`flex items-center justify-center ${className || ''}`} style={style}>
        <LoadingScreen message="Chargement de la vue..." />
      </div>
    );
  }

  // Afficher l'erreur
  if (state.error) {
    return (
      <div className={`p-4 border border-red-300 bg-red-50 rounded ${className || ''}`} style={style}>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
        <p className="text-red-600 mb-4">{state.error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Afficher le composant de vue
  if (currentComponent) {
    return (
      <ErrorBoundary>
        <div className={`entidr-view-renderer ${className || ''}`} style={style}>
          <currentComponent
            {...viewProps}
            // Passer l'état et les données au composant
            viewState={state}
            filteredData={filteredData}
            paginatedData={paginatedData}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Fallback si aucun composant n'est disponible
  return (
    <div className={`p-4 border border-yellow-300 bg-yellow-50 rounded ${className || ''}`} style={style}>
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        Vue en cours de développement
      </h3>
      <p className="text-yellow-600 mb-2">
        Le composant pour le type de vue "{view.type}" est en cours de développement.
      </p>
      <p className="text-sm text-yellow-500">
        Nom de la vue: {view.name}
      </p>
      <p className="text-sm text-yellow-500">
        Modèle: {view.model}
      </p>
      <div className="mt-4 p-3 bg-yellow-100 rounded">
        <p className="text-xs text-yellow-700">
          Configuration des champs:
        </p>
        <ul className="text-xs text-yellow-600 mt-1">
          {view.fields.map((field, index) => (
            <li key={index}>
              {field.name} ({field.widget}) - {field.visible ? 'Visible' : 'Caché'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EntidrViewRenderer;
