import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';

export interface TreeViewToolbarProps {
  searchable: boolean;
  onSearchOpen: () => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  onNodeAdd?: () => void;
  onNodeEdit?: () => void;
  onNodeDelete?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export const TreeViewToolbar: React.FC<TreeViewToolbarProps> = ({
  searchable,
  onSearchOpen,
  onSearch,
  searchTerm,
  onNodeAdd,
  onNodeEdit,
  onNodeDelete,
  onRefresh,
  onExport,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | 'folder' | 'file'>('all');

  const handleSort = (field: 'name' | 'type' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    onSearch(term);
    if (term && searchable) {
      onSearchOpen();
    }
  };

  return (
    <div className={`tree-view-toolbar flex items-center justify-between p-2 border-b bg-gray-50 ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Recherche rapide */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Recherche rapide..."
            value={searchTerm}
            onChange={handleQuickSearch}
            className="pl-8 w-48"
          />
        </div>

        {/* Filtre */}
        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="folder">Dossiers</SelectItem>
            <SelectItem value="file">Fichiers</SelectItem>
          </SelectContent>
        </Select>

        {/* Tri */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('name')}
          className={`flex items-center space-x-1 ${sortBy === 'name' ? 'bg-blue-50' : ''}`}
        >
          {sortBy === 'name' && sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
          <span>Nom</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('type')}
          className={`flex items-center space-x-1 ${sortBy === 'type' ? 'bg-blue-50' : ''}`}
        >
          {sortBy === 'type' && sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
          <span>Type</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Actions */}
        {onNodeAdd && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNodeAdd}
            className="flex items-center space-x-1"
            title="Ajouter un élément"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter</span>
          </Button>
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            title="Exporter"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onSearchOpen}
          disabled={!searchable}
          title="Recherche avancée"
        >
          <Filter className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          title="Paramètres"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TreeViewToolbar;
