import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Upload,
  Download,
  Trash2,
  Share2,
  RefreshCw,
  Grid,
  List,
  LayoutTemplate,
  MoreVertical
} from 'lucide-react';
import { GalleryItem } from './GalleryView';

export interface GalleryViewToolbarProps {
  viewMode: 'grid' | 'list' | 'masonry';
  onViewModeChange: (mode: 'grid' | 'list' | 'masonry') => void;
  sortBy: 'name' | 'date' | 'size' | 'type';
  onSortByChange: (sortBy: 'name' | 'date' | 'size' | 'type') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  filterBy: 'all' | 'image' | 'video' | 'document';
  onFilterByChange: (filterBy: 'all' | 'image' | 'video' | 'document') => void;
  selectedItems: GalleryItem[];
  onDeleteSelected: () => void;
  onDownloadSelected: () => void;
  onShareSelected: () => void;
  onFileUpload: (files: FileList) => void;
  isUploading: boolean;
  multiSelect: boolean;
  selectable: boolean;
  className?: string;
}

export const GalleryViewToolbar: React.FC<GalleryViewToolbarProps> = ({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  filterBy,
  onFilterByChange,
  selectedItems,
  onDeleteSelected,
  onDownloadSelected,
  onShareSelected,
  onFileUpload,
  isUploading,
  multiSelect,
  selectable,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
    // Réinitialiser l'input pour permettre de sélectionner les mêmes fichiers
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSort = (field: 'name' | 'date' | 'size' | 'type') => {
    if (sortBy === field) {
      onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortByChange(field);
      onSortOrderChange('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'date' | 'size' | 'type') => {
    if (sortBy !== field) return <SortAsc className="h-4 w-4" />;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const getSortLabel = (field: 'name' | 'date' | 'size' | 'type') => {
    switch (field) {
      case 'name': return 'Nom';
      case 'date': return 'Date';
      case 'size': return 'Taille';
      case 'type': return 'Type';
    }
  };

  const getFilterLabel = (filter: 'all' | 'image' | 'video' | 'document') => {
    switch (filter) {
      case 'all': return 'Tous';
      case 'image': return 'Images';
      case 'video': return 'Vidéos';
      case 'document': return 'Documents';
    }
  };

  const hasSelection = selectedItems.length > 0;

  return (
    <div className={`gallery-view-toolbar flex flex-col space-y-2 p-2 border-b bg-gray-50 ${className}`}>
      {/* Barre principale */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-48"
            />
          </div>

          {/* Filtre par type */}
          <Select value={filterBy} onValueChange={onFilterByChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{getFilterLabel('all')}</SelectItem>
              <SelectItem value="image">{getFilterLabel('image')}</SelectItem>
              <SelectItem value="video">{getFilterLabel('video')}</SelectItem>
              <SelectItem value="document">{getFilterLabel('document')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Options de tri */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('name')}
              className={`flex items-center space-x-1 ${sortBy === 'name' ? 'bg-blue-50' : ''}`}
            >
              {getSortIcon('name')}
              <span>Nom</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('date')}
              className={`flex items-center space-x-1 ${sortBy === 'date' ? 'bg-blue-50' : ''}`}
            >
              {getSortIcon('date')}
              <span>Date</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('size')}
              className={`flex items-center space-x-1 ${sortBy === 'size' ? 'bg-blue-50' : ''}`}
            >
              {getSortIcon('size')}
              <span>Taille</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('type')}
              className={`flex items-center space-x-1 ${sortBy === 'type' ? 'bg-blue-50' : ''}`}
            >
              {getSortIcon('type')}
              <span>Type</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Actions sur la sélection */}
          {hasSelection && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadSelected}
                className="flex items-center space-x-1"
                title="Télécharger la sélection"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger ({selectedItems.length})</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShareSelected}
                className="flex items-center space-x-1"
                title="Partager la sélection"
              >
                <Share2 className="h-4 w-4" />
                <span>Partager ({selectedItems.length})</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteSelected}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                title="Supprimer la sélection"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer ({selectedItems.length})</span>
              </Button>
            </>
          )}

          {/* Upload */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileUploadClick}
            disabled={isUploading}
            className="flex items-center space-x-1"
            title="Uploader des fichiers"
          >
            {isUploading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>Uploader</span>
          </Button>

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />

          {/* Plus d'options */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            title="Plus d'options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvancedFilters && (
        <div className="advanced-filters flex items-center space-x-4 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mode d'affichage:</span>
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none border-r"
                title="Vue grille"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-r"
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('masonry')}
                className="rounded-none"
                title="Vue maçonnerie"
              >
                <LayoutTemplate className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Tri actuel:</span>
            <span className="text-sm font-medium text-blue-600">
              {getSortLabel(sortBy)} ({sortOrder === 'asc' ? 'croissant' : 'décroissant'})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filtre actuel:</span>
            <span className="text-sm font-medium text-blue-600">
              {getFilterLabel(filterBy)}
            </span>
          </div>

          {hasSelection && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sélection:</span>
              <span className="text-sm font-medium text-blue-600">
                {selectedItems.length} élément{selectedItems.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryViewToolbar;
