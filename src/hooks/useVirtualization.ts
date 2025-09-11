import { useState, useCallback, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * Options pour la virtualisation
 */
export interface VirtualizationOptions {
  /** Nombre d'éléments à afficher */
  count: number;
  /** Hauteur estimée de chaque élément */
  itemHeight?: number;
  /** Hauteur du conteneur */
  containerHeight?: number;
  /** Largeur du conteneur */
  containerWidth?: number;
  /** Défilement horizontal */
  horizontal?: boolean;
  /** Débordement (nombre d'éléments à rendre en plus) */
  overscan?: number;
  /** Espacement entre les éléments */
  gap?: number;
  /** Direction du défilement */
  direction?: 'ltr' | 'rtl';
}

/**
 * Hook pour la virtualisation de liste
 * @param options Options de virtualisation
 * @returns Objet de virtualisation
 */
export function useVirtualization(options: VirtualizationOptions) {
  const {
    count,
    itemHeight = 50,
    containerHeight = 400,
    containerWidth,
    horizontal = false,
    overscan = 5,
    gap = 0,
    direction = 'ltr',
  } = options;

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight + gap, [itemHeight, gap]),
    overscan,
    horizontal,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const scrollToIndex = useCallback((index: number, align?: 'start' | 'center' | 'end' | 'auto') => {
    virtualizer.scrollToIndex(index, { align });
  }, [virtualizer]);

  const scrollToOffset = useCallback((offset: number, align?: 'start' | 'center' | 'end' | 'auto') => {
    virtualizer.scrollToOffset(offset, { align });
  }, [virtualizer]);

  const measure = useCallback(() => {
    virtualizer.measure();
  }, [virtualizer]);

  return {
    parentRef,
    virtualItems,
    totalSize,
    scrollToIndex,
    scrollToOffset,
    measure,
    virtualizer,
  };
}

/**
 * Hook pour la virtualisation de grille
 */
export function useGridVirtualization(options: VirtualizationOptions & {
  /** Nombre de colonnes */
  columns: number;
  /** Largeur estimée de chaque colonne */
  columnWidth?: number;
}) {
  const {
    count,
    columns,
    itemHeight = 50,
    columnWidth = 100,
    containerHeight = 400,
    containerWidth,
    overscan = 5,
    gap = 0,
    direction = 'ltr',
  } = options;

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(count / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight + gap, [itemHeight, gap]),
    overscan,
  });

  const columnVirtualizer = useVirtualizer({
    count: columns,
    getScrollElement: () => parentRef.current,
    horizontal: true,
    estimateSize: useCallback(() => columnWidth + gap, [columnWidth, gap]),
    overscan,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualColumns = columnVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const totalWidth = columnVirtualizer.getTotalSize();

  const getItemIndex = useCallback((rowIndex: number, columnIndex: number) => {
    return rowIndex * columns + columnIndex;
  }, [columns]);

  const scrollToItem = useCallback((index: number, align?: 'start' | 'center' | 'end' | 'auto') => {
    const rowIndex = Math.floor(index / columns);
    const columnIndex = index % columns;

    rowVirtualizer.scrollToIndex(rowIndex, { align });
    columnVirtualizer.scrollToIndex(columnIndex, { align });
  }, [rowVirtualizer, columnVirtualizer, columns]);

  return {
    parentRef,
    virtualRows,
    virtualColumns,
    totalHeight,
    totalWidth,
    getItemIndex,
    scrollToItem,
    rowVirtualizer,
    columnVirtualizer,
  };
}

/**
 * Hook pour la virtualisation dynamique (taille variable)
 */
export function useDynamicVirtualization(options: VirtualizationOptions & {
  /** Fonction pour obtenir la taille d'un élément */
  getItemSize: (index: number) => number;
}) {
  const {
    count,
    getItemSize,
    containerHeight = 400,
    containerWidth,
    horizontal = false,
    overscan = 5,
    direction = 'ltr',
  } = options;

  const parentRef = useRef<HTMLDivElement>(null);
  const sizeCache = useRef<Map<number, number>>(new Map());

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index) => {
      return sizeCache.current.get(index) ?? 50; // Taille par défaut
    }, []),
    overscan,
    horizontal,
  });

  const measureItem = useCallback((index: number, element: HTMLElement) => {
    const size = horizontal ? element.offsetWidth : element.offsetHeight;
    sizeCache.current.set(index, size);
    virtualizer.measure();
  }, [horizontal, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const scrollToIndex = useCallback((index: number, align?: 'start' | 'center' | 'end' | 'auto') => {
    virtualizer.scrollToIndex(index, { align });
  }, [virtualizer]);

  return {
    parentRef,
    virtualItems,
    totalSize,
    scrollToIndex,
    measureItem,
    virtualizer,
    sizeCache: sizeCache.current,
  };
}

/**
 * Hook pour le défilement virtuel avec cache
 */
export function useVirtualScroll(options: VirtualizationOptions & {
  /** Taille du cache (nombre d'éléments) */
  cacheSize?: number;
  /** Fonction pour charger plus de données */
  onLoadMore?: (startIndex: number, endIndex: number) => Promise<void>;
}) {
  const {
    count,
    itemHeight = 50,
    containerHeight = 400,
    overscan = 5,
    cacheSize = 100,
    onLoadMore,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(Math.min(count, cacheSize));

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: loadedCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const handleScroll = useCallback(async () => {
    if (!onLoadMore || isLoading || loadedCount >= count) return;

    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Charger plus de données quand on approche de la fin
    if (scrollPercentage > 0.8) {
      setIsLoading(true);
      try {
        const newCount = Math.min(loadedCount + cacheSize, count);
        await onLoadMore(loadedCount, newCount - 1);
        setLoadedCount(newCount);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [onLoadMore, isLoading, loadedCount, count, cacheSize]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const reset = useCallback(() => {
    setLoadedCount(Math.min(count, cacheSize));
    virtualizer.scrollToOffset(0);
  }, [count, cacheSize, virtualizer]);

  return {
    parentRef,
    virtualItems,
    totalSize,
    isLoading,
    loadedCount,
    reset,
    virtualizer,
  };
}

export default useVirtualization;
