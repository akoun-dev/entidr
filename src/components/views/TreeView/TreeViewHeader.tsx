import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

export interface TreeViewHeaderProps {
  title: string;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSearchOpen: () => void;
  searchable: boolean;
  className?: string;
}

export const TreeViewHeader: React.FC<TreeViewHeaderProps> = ({
  title,
  onExpandAll,
  onCollapseAll,
  onSearchOpen,
  searchable,
  className = ''
}) => {
  return (
    <div className={`tree-view-header flex items-center justify-between p-4 border-b ${className}`}>
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExpandAll}
          className="flex items-center space-x-1"
          title="Développer tout"
        >
          <ChevronDown className="h-4 w-4" />
          <span>Tout développer</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onCollapseAll}
          className="flex items-center space-x-1"
          title="Réduire tout"
        >
          <ChevronRight className="h-4 w-4" />
          <span>Tout réduire</span>
        </Button>

        {searchable && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSearchOpen}
            className="flex items-center space-x-1"
            title="Rechercher"
          >
            <Search className="h-4 w-4" />
            <span>Rechercher</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TreeViewHeader;
