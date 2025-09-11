import React, { useState, useEffect, useCallback } from 'react';
import { GalleryViewHeader } from './GalleryViewHeader';
import { GalleryViewToolbar } from './GalleryViewToolbar';
import { GalleryViewGrid } from './GalleryViewGrid';
import { GalleryViewLightbox } from './GalleryViewLightbox';

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  src: string;
  thumbnail?: string;
  type: 'image' | 'video' | 'document';
  size?: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  selected?: boolean;
}

export interface GalleryViewProps {
  items: GalleryItem[];
  className?: string;
  multiSelect?: boolean;
  selectable?: boolean;
  showToolbar?: boolean;
  showHeader?: boolean;
  initialViewMode?: 'grid' | 'list' | 'masonry';
  initialSortBy?: 'name' | 'date' | 'size' | 'type';
  initialSortOrder?: 'asc' | 'desc';
  initialFilterBy?: 'all' | 'image' | 'video' | 'document';
  onItemSelect?: (item: GalleryItem) => void;
  onItemDoubleClick?: (item: GalleryItem) => void;
  onItemsDelete?: (items: GalleryItem[]) => void;
  onItemsDownload?: (items: GalleryItem[]) => void;
  onItemsShare?: (items: GalleryItem[]) => void;
  onItemUpload?: (files: File[]) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  items,
  className = '',
  multiSelect = false,
  selectable = true,
  showToolbar = true,
  showHeader = true,
  initialViewMode = 'grid',
  initialSortBy = 'date',
  initialSortOrder = 'desc',
  initialFilterBy = 'all',
  onItemSelect,
  onItemDoubleClick,
  onItemsDelete,
  onItemsDownload,
  onItemsShare,
  onItemUpload
}) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(items);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'masonry'>(initialViewMode);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [filterBy, setFilterBy] = useState<'all' | 'image' | 'video' | 'document'>(initialFilterBy);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mettre à jour les éléments quand ils changent
  useEffect(() => {
    setGalleryItems(items);
  }, [items]);

  // Filtrer et trier les éléments
  const processedItems = React.useMemo(() => {
    let filtered = [...galleryItems];

    // Filtrer par type
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => item.type === filterBy);
    }

    // Trier les éléments
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [galleryItems, filterBy, sortBy, sortOrder]);

  const handleItemSelect = useCallback((item: GalleryItem) => {
    if (!selectable) return;

    let newSelectedItems: Set<string>;

    if (multiSelect) {
      newSelectedItems = new Set(selectedItems);
      if (newSelectedItems.has(item.id)) {
        newSelectedItems.delete(item.id);
      } else {
        newSelectedItems.add(item.id);
      }
    } else {
      newSelectedItems = new Set([item.id]);
    }

    setSelectedItems(newSelectedItems);
    onItemSelect?.(item);
  }, [selectable, multiSelect, selectedItems, onItemSelect]);

  const handleItemDoubleClick = useCallback((item: GalleryItem) => {
    setLightboxItem(item);
    onItemDoubleClick?.(item);
  }, [onItemDoubleClick]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === processedItems.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = processedItems.map(item => item.id);
      setSelectedItems(new Set(allIds));
    }
  }, [selectedItems, processedItems]);

  const handleClearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const itemsToDelete = processedItems.filter(item => selectedItems.has(item.id));
    onItemsDelete?.(itemsToDelete);
    setSelectedItems(new Set());
  }, [selectedItems, processedItems, onItemsDelete]);

  const handleDownloadSelected = useCallback(() => {
    const itemsToDownload = processedItems.filter(item => selectedItems.has(item.id));
    onItemsDownload?.(itemsToDownload);
  }, [selectedItems, processedItems, onItemsDownload]);

  const handleShareSelected = useCallback(() => {
    const itemsToShare = processedItems.filter(item => selectedItems.has(item.id));
    onItemsShare?.(itemsToShare);
  }, [selectedItems, processedItems, onItemsShare]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);
    try {
      // Simuler un upload - dans une vraie application, vous enverriez les fichiers au serveur
      const newItems: GalleryItem[] = Array.from(files).map((file, index) => ({
        id: `upload-${Date.now()}-${index}`,
        title: file.name,
        description: `Fichier uploadé: ${file.name}`,
        src: URL.createObjectURL(file), // Pour la prévisualisation locale
        thumbnail: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' : 'document',
        size: file.size,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        metadata: {
          originalFileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        }
      }));

      onItemUpload?.(files);
      setGalleryItems(prev => [...newItems, ...prev]);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onItemUpload]);

  const handleLightboxClose = useCallback(() => {
    setLightboxItem(null);
  }, []);

  const handleLightboxNext = useCallback(() => {
    if (!lightboxItem) return;

    const currentIndex = processedItems.findIndex(item => item.id === lightboxItem.id);
    const nextIndex = (currentIndex + 1) % processedItems.length;
    setLightboxItem(processedItems[nextIndex]);
  }, [lightboxItem, processedItems]);

  const handleLightboxPrevious = useCallback(() => {
    if (!lightboxItem) return;

    const currentIndex = processedItems.findIndex(item => item.id === lightboxItem.id);
    const prevIndex = (currentIndex - 1 + processedItems.length) % processedItems.length;
    setLightboxItem(processedItems[prevIndex]);
  }, [lightboxItem, processedItems]);

  const getSelectedItems = useCallback(() => {
    return processedItems.filter(item => selectedItems.has(item.id));
  }, [selectedItems, processedItems]);

  return (
    <div className={`gallery-view ${className}`}>
      {showHeader && (
        <GalleryViewHeader
          title="Galerie"
          itemCount={processedItems.length}
          selectedCount={selectedItems.size}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          multiSelect={multiSelect}
          selectable={selectable}
        />
      )}

      {showToolbar && (
        <GalleryViewToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          filterBy={filterBy}
          onFilterByChange={setFilterBy}
          selectedItems={getSelectedItems()}
          onDeleteSelected={handleDeleteSelected}
          onDownloadSelected={handleDownloadSelected}
          onShareSelected={handleShareSelected}
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
          multiSelect={multiSelect}
          selectable={selectable}
        />
      )}

      <GalleryViewGrid
        items={processedItems}
        viewMode={viewMode}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        onItemDoubleClick={handleItemDoubleClick}
        selectable={selectable}
        isLoading={isUploading}
      />

      {lightboxItem && (
        <GalleryViewLightbox
          item={lightboxItem}
          items={processedItems}
          onClose={handleLightboxClose}
          onNext={handleLightboxNext}
          onPrevious={handleLightboxPrevious}
          currentIndex={processedItems.findIndex(item => item.id === lightboxItem.id)}
          totalItems={processedItems.length}
        />
      )}
    </div>
  );
};

export default GalleryView;
