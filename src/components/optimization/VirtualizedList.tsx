import React, { useMemo, useCallback } from 'react';
import { useVirtualization } from '../../hooks/useVirtualization';

/**
 * Props pour le composant VirtualizedList
 */
export interface VirtualizedListProps<T = any> {
  /** Données à afficher */
  data: T[];
  /** Fonction de rendu pour chaque élément */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Hauteur estimée de chaque élément */
  itemHeight?: number;
  /** Hauteur du conteneur */
  height?: number | string;
  /** Largeur du conteneur */
  width?: number | string;
  /** Nombre d'éléments à rendre en plus (overscan) */
  overscan?: number;
  /** Espacement entre les éléments */
  gap?: number;
  /** Classe CSS personnalisée */
  className?: string;
  /** Style personnalisé */
  style?: React.CSSProperties;
  /** Callback quand un élément est cliqué */
  onItemClick?: (item: T, index: number) => void;
  /** Callback quand un élément est double-cliqué */
  onItemDoubleClick?: (item: T, index: number) => void;
  /** Élément à afficher quand il n'y a pas de données */
  emptyComponent?: React.ReactNode;
  /** Élément à afficher pendant le chargement */
  loadingComponent?: React.ReactNode;
  /** Indicateur de chargement */
  isLoading?: boolean;
  /** Activer le défilement horizontal */
  horizontal?: boolean;
  /** Clé unique pour chaque élément */
  keyExtractor?: (item: T, index: number) => string | number;
}

/**
 * Composant VirtualizedList - Liste virtualisée optimisée
 * Idéal pour afficher de grandes quantités de données avec des performances optimales
 */
export function VirtualizedList<T = any>({
  data,
  renderItem,
  itemHeight = 50,
  height = 400,
  width = '100%',
  overscan = 5,
  gap = 0,
  className = '',
  style = {},
  onItemClick,
  onItemDoubleClick,
  emptyComponent,
  loadingComponent,
  isLoading = false,
  horizontal = false,
  keyExtractor = (item: T, index: number) => (item as any).id || index,
}: VirtualizedListProps<T>) {
  const {
    parentRef,
    virtualItems,
    totalSize,
    scrollToIndex,
    scrollToOffset,
  } = useVirtualization({
    count: data.length,
    itemHeight,
    overscan,
    gap,
    horizontal,
  });

  // Gérer le clic sur un élément
  const handleItemClick = useCallback((item: T, index: number) => {
    onItemClick?.(item, index);
  }, [onItemClick]);

  // Gérer le double-clic sur un élément
  const handleItemDoubleClick = useCallback((item: T, index: number) => {
    onItemDoubleClick?.(item, index);
  }, [onItemDoubleClick]);

  // Style du conteneur
  const containerStyle: React.CSSProperties = useMemo(() => ({
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
    overflow: 'auto',
    position: 'relative' as const,
    ...style,
  }), [height, width, style]);

  // Style de l'espace virtuel
  const virtualStyle: React.CSSProperties = useMemo(() => ({
    position: 'relative' as const,
    height: horizontal ? '100%' : totalSize,
    width: horizontal ? totalSize : '100%',
  }), [totalSize, horizontal]);

  // Classes CSS
  const containerClasses = useMemo(() => [
    'virtualized-list',
    'border',
    'border-gray-200',
    'rounded-lg',
    'bg-white',
    className,
  ].filter(Boolean).join(' '), [className]);

  // Si les données sont en cours de chargement
  if (isLoading && loadingComponent) {
    return (
      <div className={containerClasses} style={containerStyle}>
        {loadingComponent}
      </div>
    );
  }

  // S'il n'y a pas de données
  if (data.length === 0 && emptyComponent) {
    return (
      <div className={containerClasses} style={containerStyle}>
        {emptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={containerClasses}
      style={containerStyle}
      data-testid="virtualized-list"
    >
      <div style={virtualStyle}>
        {virtualItems.map((virtualItem) => {
          const item = data[virtualItem.index];
          const key = keyExtractor(item, virtualItem.index);

          // Style de l'élément virtuel
          const itemStyle: React.CSSProperties = {
            position: 'absolute' as const,
            top: horizontal ? 0 : virtualItem.start,
            left: horizontal ? virtualItem.start : 0,
            width: horizontal ? virtualItem.size : '100%',
            height: horizontal ? '100%' : virtualItem.size,
          };

          return (
            <div
              key={key}
              style={itemStyle}
              onClick={() => handleItemClick(item, virtualItem.index)}
              onDoubleClick={() => handleItemDoubleClick(item, virtualItem.index)}
              className="virtualized-list-item"
              data-index={virtualItem.index}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Composant VirtualizedTable - Tableau virtualisé optimisé
 */
export interface VirtualizedTableProps<T = any> {
  /** Données à afficher */
  data: T[];
  /** Colonnes du tableau */
  columns: Array<{
    key: string;
    title: string;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, item: T, index: number) => React.ReactNode;
    sortable?: boolean;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
  }>;
  /** Hauteur estimée de chaque ligne */
  rowHeight?: number;
  /** Hauteur du conteneur */
  height?: number | string;
  /** Largeur du conteneur */
  width?: number | string;
  /** Nombre d'éléments à rendre en plus (overscan) */
  overscan?: number;
  /** Espacement entre les lignes */
  gap?: number;
  /** Classe CSS personnalisée */
  className?: string;
  /** Style personnalisé */
  style?: React.CSSProperties;
  /** Callback quand une ligne est cliquée */
  onRowClick?: (item: T, index: number) => void;
  /** Callback quand une ligne est double-cliquée */
  onRowDoubleClick?: (item: T, index: number) => void;
  /** Élément à afficher quand il n'y a pas de données */
  emptyComponent?: React.ReactNode;
  /** Élément à afficher pendant le chargement */
  loadingComponent?: React.ReactNode;
  /** Indicateur de chargement */
  isLoading?: boolean;
  /** Lignes sélectionnées */
  selectedRows?: T[];
  /** Callback pour la sélection des lignes */
  onRowSelect?: (item: T, selected: boolean) => void;
  /** Callback pour la sélection multiple */
  onRowSelectMultiple?: (items: T[]) => void;
  /** Clé unique pour chaque élément */
  keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualizedTable<T = any>({
  data,
  columns,
  rowHeight = 50,
  height = 400,
  width = '100%',
  overscan = 5,
  gap = 0,
  className = '',
  style = {},
  onRowClick,
  onRowDoubleClick,
  emptyComponent,
  loadingComponent,
  isLoading = false,
  selectedRows = [],
  onRowSelect,
  onRowSelectMultiple,
  keyExtractor = (item: T, index: number) => (item as any).id || index,
}: VirtualizedTableProps<T>) {
  const {
    parentRef,
    virtualItems,
    totalSize,
    scrollToIndex,
  } = useVirtualization({
    count: data.length,
    itemHeight: rowHeight,
    overscan,
    gap,
  });

  // Vérifier si une ligne est sélectionnée
  const isRowSelected = useCallback((item: T) => {
    return selectedRows.some(selected =>
      keyExtractor(selected, 0) === keyExtractor(item, 0)
    );
  }, [selectedRows, keyExtractor]);

  // Gérer la sélection d'une ligne
  const handleRowSelect = useCallback((item: T, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();

    const selected = !isRowSelected(item);
    onRowSelect?.(item, selected);

    const nativeEvent = event.nativeEvent as any;
    if (nativeEvent && (nativeEvent.ctrlKey || nativeEvent.metaKey)) {
      // Sélection multiple avec Ctrl/Cmd
      const newSelected = selected
        ? [...selectedRows, item]
        : selectedRows.filter(row =>
            keyExtractor(row, 0) !== keyExtractor(item, 0)
          );
      onRowSelectMultiple?.(newSelected);
    }
  }, [selectedRows, isRowSelected, onRowSelect, onRowSelectMultiple, keyExtractor]);

  // Gérer le clic sur une ligne
  const handleRowClick = useCallback((item: T, index: number, event: React.MouseEvent) => {
    if (!(event.ctrlKey || event.metaKey)) {
      onRowClick?.(item, index);
    }
  }, [onRowClick]);

  // Style du conteneur
  const containerStyle: React.CSSProperties = useMemo(() => ({
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
    overflow: 'auto',
    position: 'relative' as const,
    ...style,
  }), [height, width, style]);

  // Style de l'espace virtuel
  const virtualStyle: React.CSSProperties = useMemo(() => ({
    position: 'relative' as const,
    height: totalSize,
    width: '100%',
  }), [totalSize]);

  // Classes CSS
  const containerClasses = useMemo(() => [
    'virtualized-table',
    'border',
    'border-gray-200',
    'rounded-lg',
    'bg-white',
    className,
  ].filter(Boolean).join(' '), [className]);

  // Si les données sont en cours de chargement
  if (isLoading && loadingComponent) {
    return (
      <div className={containerClasses} style={containerStyle}>
        {loadingComponent}
      </div>
    );
  }

  // S'il n'y a pas de données
  if (data.length === 0 && emptyComponent) {
    return (
      <div className={containerClasses} style={containerStyle}>
        {emptyComponent}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={containerClasses}
      style={containerStyle}
      data-testid="virtualized-table"
    >
      {/* En-tête du tableau */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
        <div className="flex" style={{ height: rowHeight }}>
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center"
              style={{
                width: column.width,
                textAlign: column.align || 'left',
              }}
            >
              {column.title}
              {column.sortable && (
                <button
                  className="ml-1 text-gray-400 hover:text-gray-600"
                  onClick={() => column.onSort?.(column.key, 'asc')}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Corps virtualisé */}
      <div style={virtualStyle}>
        {virtualItems.map((virtualItem) => {
          const item = data[virtualItem.index];
          const key = keyExtractor(item, virtualItem.index);
          const isSelected = isRowSelected(item);

          // Style de la ligne
          const rowStyle: React.CSSProperties = {
            position: 'absolute' as const,
            top: virtualItem.start,
            left: 0,
            width: '100%',
            height: virtualItem.size,
          };

          return (
            <div
              key={key}
              style={rowStyle}
              className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                isSelected ? 'bg-blue-50' : ''
              }`}
              onClick={(e) => handleRowClick(item, virtualItem.index, e)}
              onDoubleClick={() => onRowDoubleClick?.(item, virtualItem.index)}
              data-index={virtualItem.index}
            >
              <div className="flex h-full" style={{ height: virtualItem.size }}>
                {/* Checkbox pour la sélection */}
                <div className="w-12 px-6 py-4 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleRowSelect(item, e)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Cellules de données */}
                {columns.map((column) => {
                  const value = (item as any)[column.key];
                  const cellContent = column.render
                    ? column.render(value, item, virtualItem.index)
                    : value?.toString() || '-';

                  return (
                    <div
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm flex items-center"
                      style={{
                        width: column.width,
                        textAlign: column.align || 'left',
                      }}
                    >
                      {cellContent}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedList;
