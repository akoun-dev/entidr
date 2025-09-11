import React, { useCallback, useMemo } from 'react';
import { EntidrViewDefinition } from '../../../types/entidr-view';

/**
 * Props pour le composant ListViewTable
 */
export interface ListViewTableProps {
  /** Définition de la vue */
  view: EntidrViewDefinition;
  /** Données à afficher */
  data: any[];
  /** Élément sélectionné */
  selectedItem?: any;
  /** Éléments sélectionnés (multi-sélection) */
  selectedItems?: any[];
  /** Mode lecture seule */
  readonly?: boolean;
  /** Mode compact */
  compact?: boolean;
  /** Callback pour la sélection d'un élément */
  onSelectItem: (item: any) => void;
  /** Callback pour la sélection multiple */
  onSelectMultiple: (items: any[]) => void;
  /** Callback pour le tri */
  onSort: (field: string, direction: 'ASC' | 'DESC') => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
}

/**
 * Composant ListViewTable - Tableau de données
 * Affiche les données sous forme de tableau avec tri et sélection
 */
export const ListViewTable: React.FC<ListViewTableProps> = ({
  view,
  data,
  selectedItem,
  selectedItems = [],
  readonly = false,
  compact = false,
  onSelectItem,
  onSelectMultiple,
  onSort,
  onEvent,
}) => {
  // État du tri
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  // Obtenir les colonnes visibles
  const visibleColumns = useMemo(() => {
    return view.fields
      .filter(field => field.visible)
      .sort((a, b) => a.order - b.order);
  }, [view.fields]);

  // Gérer le clic sur une ligne
  const handleRowClick = useCallback((item: any) => {
    onSelectItem(item);
    onEvent('rowClick', item);
  }, [onSelectItem, onEvent]);

  // Gérer le double-clic sur une ligne
  const handleRowDoubleClick = useCallback((item: any) => {
    onEvent('rowDoubleClick', item);
    if (!readonly) {
      onEvent('edit', item);
    }
  }, [onEvent, readonly]);

  // Gérer le tri d'une colonne
  const handleSort = useCallback((field: string) => {
    let newDirection: 'ASC' | 'DESC' = 'ASC';

    if (sortField === field) {
      newDirection = sortDirection === 'ASC' ? 'DESC' : 'ASC';
    }

    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  }, [sortField, sortDirection, onSort]);

  // Gérer la sélection multiple avec Ctrl/Cmd
  const handleRowClickWithModifier = useCallback((item: any, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Toggle sélection dans la multi-sélection
      const isSelected = selectedItems.some(selected => selected.id === item.id);
      const newSelectedItems = isSelected
        ? selectedItems.filter(selected => selected.id !== item.id)
        : [...selectedItems, item];

      onSelectMultiple(newSelectedItems);
    } else if (event.shiftKey && selectedItem) {
      // Sélection par plage
      const currentIndex = data.findIndex(d => d.id === item.id);
      const selectedIndex = data.findIndex(d => d.id === selectedItem.id);

      if (currentIndex !== -1 && selectedIndex !== -1) {
        const start = Math.min(currentIndex, selectedIndex);
        const end = Math.max(currentIndex, selectedIndex);
        const rangeItems = data.slice(start, end + 1);

        onSelectMultiple(rangeItems);
      }
    } else {
      // Sélection simple
      onSelectItem(item);
    }
  }, [data, selectedItem, selectedItems, onSelectItem, onSelectMultiple]);

  // Gérer le clic sur l'en-tête pour la sélection de tout
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === data.length) {
      onSelectMultiple([]);
    } else {
      onSelectMultiple([...data]);
    }
  }, [data, selectedItems, onSelectMultiple]);

  // Vérifier si tous les éléments sont sélectionnés
  const isAllSelected = useMemo(() => {
    return data.length > 0 && selectedItems.length === data.length;
  }, [data, selectedItems]);

  // Vérifier si certains éléments sont sélectionnés (mais pas tous)
  const isPartiallySelected = useMemo(() => {
    return selectedItems.length > 0 && selectedItems.length < data.length;
  }, [data, selectedItems]);

  // Obtenir l'icône de tri
  const getSortIcon = useCallback((field: string) => {
    if (sortField !== field) {
      return (
        <svg className="ml-1 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }

    return (
      <svg className="ml-1 h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        {sortDirection === 'ASC' ? (
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        )}
      </svg>
    );
  }, [sortField, sortDirection]);

  // Classes CSS dynamiques
  const tableClasses = [
    'min-w-full',
    'divide-y',
    'divide-gray-200',
    compact ? 'text-sm' : '',
  ].join(' ');

  const headerCellClasses = (field: any) => [
    'px-6',
    'py-3',
    'text-left',
    'text-xs',
    'font-medium',
    'text-gray-500',
    'uppercase',
    'tracking-wider',
    'cursor-pointer',
    'hover:bg-gray-50',
    'select-none',
    compact ? 'px-4 py-2' : '',
  ].join(' ');

  const rowClasses = (item: any) => [
    'hover:bg-gray-50',
    'cursor-pointer',
    'transition-colors',
    'duration-150',
    selectedItem?.id === item.id ? 'bg-blue-50' : '',
    selectedItems.some(selected => selected.id === item.id) ? 'bg-blue-100' : '',
    compact ? 'text-sm' : '',
  ].join(' ');

  const cellClasses = (field: any) => [
    'px-6',
    'py-4',
    'whitespace-nowrap',
    'text-sm',
    compact ? 'px-4 py-2' : '',
    field.align === 'center' ? 'text-center' : '',
    field.align === 'right' ? 'text-right' : '',
  ].join(' ');

  // Formatter la valeur d'une cellule
  const formatCellValue = useCallback((field: any, value: any) => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (field.widget) {
      case 'BOOLEAN':
        return value ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Oui
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Non
          </span>
        );

      case 'DATE':
        return new Date(value).toLocaleDateString('fr-FR');

      case 'DATETIME':
        return new Date(value).toLocaleString('fr-FR');

      case 'CURRENCY':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(value);

      case 'NUMBER':
        return new Intl.NumberFormat('fr-FR').format(value);

      case 'EMAIL':
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        );

      case 'URL':
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        );

      default:
        return value?.toString() || '-';
    }
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead className="bg-gray-50">
          <tr>
            {/* Checkbox pour la sélection multiple */}
            <th className="w-12 px-6 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={isPartiallySelected ? null : undefined}
                indeterminate={isPartiallySelected}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </th>

            {/* En-têtes des colonnes */}
            {visibleColumns.map((field) => (
              <th
                key={field.name}
                className={headerCellClasses(field)}
                onClick={() => handleSort(field.name)}
                style={{
                  width: field.width,
                }}
              >
                <div className="flex items-center">
                  <span>{field.label || field.name}</span>
                  {getSortIcon(field.name)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={visibleColumns.length + 1}
                className="px-6 py-12 text-center text-gray-500"
              >
                <div className="flex flex-col items-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucun élément à afficher dans cette vue.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                className={rowClasses(item)}
                onClick={(e) => handleRowClickWithModifier(item, e)}
                onDoubleClick={() => handleRowDoubleClick(item)}
              >
                {/* Checkbox pour la sélection */}
                <td className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.some(selected => selected.id === item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        onSelectMultiple([...selectedItems, item]);
                      } else {
                        onSelectMultiple(selectedItems.filter(selected => selected.id !== item.id));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                {/* Cellules de données */}
                {visibleColumns.map((field) => (
                  <td
                    key={field.name}
                    className={cellClasses(field)}
                    style={{
                      width: field.width,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {formatCellValue(field, item[field.name])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListViewTable;
