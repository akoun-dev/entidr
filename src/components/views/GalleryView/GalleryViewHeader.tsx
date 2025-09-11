import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Grid,
  List,
  LayoutTemplate,
  CheckSquare,
  Square,
  Upload
} from 'lucide-react';

export interface GalleryViewHeaderProps {
  title: string;
  itemCount: number;
  selectedCount: number;
  viewMode: 'grid' | 'list' | 'masonry';
  onViewModeChange: (mode: 'grid' | 'list' | 'masonry') => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  multiSelect: boolean;
  selectable: boolean;
  className?: string;
}

export const GalleryViewHeader: React.FC<GalleryViewHeaderProps> = ({
  title,
  itemCount,
  selectedCount,
  viewMode,
  onViewModeChange,
  onSelectAll,
  onClearSelection,
  multiSelect,
  selectable,
  className = ''
}) => {
  const isAllSelected = selectedCount > 0 && selectedCount === itemCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < itemCount;

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
    } else {
      onClearSelection();
    }
  };

  const getViewModeIcon = (mode: 'grid' | 'list' | 'masonry') => {
    switch (mode) {
      case 'grid':
        return <Grid className="h-4 w-4" />;
      case 'list':
        return <List className="h-4 w-4" />;
      case 'masonry':
        return <LayoutTemplate className="h-4 w-4" />;
    }
  };

  return (
    <div className={`gallery-view-header flex items-center justify-between p-4 border-b ${className}`}>
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">{title}</h2>

        {/* Compteur d'éléments */}
        <div className="text-sm text-gray-600">
          {itemCount} élément{itemCount !== 1 ? 's' : ''}
          {selectedCount > 0 && (
            <span className="text-blue-600 font-medium">
              ({selectedCount} sélectionné{selectedCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Checkbox pour sélectionner tout */}
        {selectable && itemCount > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={handleCheckboxChange}
              className={isPartiallySelected ? 'data-[state=checked]:bg-blue-500' : ''}
            />
            <label htmlFor="select-all" className="text-sm text-gray-700 cursor-pointer">
              {isAllSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Mode d'affichage */}
        <Select value={viewMode} onValueChange={onViewModeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">
              <div className="flex items-center space-x-2">
                <Grid className="h-4 w-4" />
                <span>Grille</span>
              </div>
            </SelectItem>
            <SelectItem value="list">
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>Liste</span>
              </div>
            </SelectItem>
            <SelectItem value="masonry">
              <div className="flex items-center space-x-2">
                <LayoutTemplate className="h-4 w-4" />
                <span>Maçonnerie</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Boutons rapides pour changer de mode */}
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

        {/* Indicateur de sélection */}
        {selectable && selectedCount > 0 && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            <span>{selectedCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryViewHeader;
