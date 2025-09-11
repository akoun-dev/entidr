import React, { useState, useRef, useEffect } from 'react';
import { GalleryViewItem } from './GalleryViewItem';
import { GalleryItem } from './GalleryView';

export interface GalleryViewGridProps {
  items: GalleryItem[];
  viewMode: 'grid' | 'list' | 'masonry';
  selectedItems: Set<string>;
  onItemSelect: (item: GalleryItem) => void;
  onItemDoubleClick: (item: GalleryItem) => void;
  selectable: boolean;
  isLoading?: boolean;
  className?: string;
}

export const GalleryViewGrid: React.FC<GalleryViewGridProps> = ({
  items,
  viewMode,
  selectedItems,
  onItemSelect,
  onItemDoubleClick,
  selectable,
  isLoading = false,
  className = ''
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);

  // Calculer le nombre de colonnes responsive
  useEffect(() => {
    const updateColumns = () => {
      if (!gridRef.current) return;

      const width = gridRef.current.offsetWidth;
      if (width < 640) {
        setColumns(1);
      } else if (width < 768) {
        setColumns(2);
      } else if (width < 1024) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const getGridClasses = () => {
    const baseClasses = 'gallery-grid w-full';

    switch (viewMode) {
      case 'grid':
        return `${baseClasses} grid gap-4`;
      case 'list':
        return `${baseClasses} space-y-2`;
      case 'masonry':
        return `${baseClasses} columns-${columns} gap-4`;
      default:
        return baseClasses;
    }
  };

  const getItemClasses = () => {
    switch (viewMode) {
      case 'grid':
        return 'grid-item';
      case 'list':
        return 'list-item';
      case 'masonry':
        return 'masonry-item break-inside-avoid';
      default:
        return '';
    }
  };

  const handleItemHover = (itemId: string | null) => {
    setHoveredItem(itemId);
  };

  const handleItemClick = (item: GalleryItem) => {
    onItemSelect(item);
  };

  const handleItemDoubleClick = (item: GalleryItem) => {
    onItemDoubleClick(item);
  };

  const renderLoadingState = () => {
    return (
      <div className="loading-state flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des éléments...</p>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="empty-state flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élément à afficher</h3>
          <p className="text-gray-500">
            {items.length === 0
              ? 'Commencez par uploader des fichiers ou ajuster vos filtres.'
              : 'Aucun élément ne correspond à vos critères de recherche.'
            }
          </p>
        </div>
      </div>
    );
  };

  const renderItems = () => {
    return items.map((item) => (
      <div
        key={item.id}
        className={getItemClasses()}
        onMouseEnter={() => handleItemHover(item.id)}
        onMouseLeave={() => handleItemHover(null)}
      >
        <GalleryViewItem
          item={item}
          isSelected={selectedItems.has(item.id)}
          isHovered={hoveredItem === item.id}
          viewMode={viewMode}
          selectable={selectable}
          onClick={() => handleItemClick(item)}
          onDoubleClick={() => handleItemDoubleClick(item)}
        />
      </div>
    ));
  };

  return (
    <div ref={gridRef} className={`gallery-view-grid ${getGridClasses()} ${className}`}>
      {isLoading ? (
        renderLoadingState()
      ) : items.length === 0 ? (
        renderEmptyState()
      ) : (
        renderItems()
      )}
    </div>
  );
};

export default GalleryViewGrid;
