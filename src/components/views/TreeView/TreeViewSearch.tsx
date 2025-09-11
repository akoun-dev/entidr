import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter, ChevronDown, ChevronUp, CaseSensitive, WholeWord } from 'lucide-react';

export interface TreeViewSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClose: () => void;
  placeholder?: string;
  className?: string;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  searchIn: 'label' | 'all' | 'metadata';
  searchType: 'contains' | 'starts' | 'ends' | 'exact';
}

export const TreeViewSearch: React.FC<TreeViewSearchProps> = ({
  searchTerm,
  onSearchChange,
  onClose,
  placeholder = 'Rechercher...',
  className = ''
}) => {
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    searchIn: 'label',
    searchType: 'contains'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger l'historique de recherche depuis le localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('treeview-search-history');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique de recherche:', error);
    }
  }, []);

  // Sauvegarder l'historique de recherche
  const saveToHistory = (term: string) => {
    if (!term.trim()) return;

    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(newHistory);

    try {
      localStorage.setItem('treeview-search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique de recherche:', error);
    }
  };

  // Focus sur l'input à l'ouverture
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearchChange = (term: string) => {
    onSearchChange(term);
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      saveToHistory(searchTerm);
    }
  };

  const handleHistoryItemClick = (term: string) => {
    onSearchChange(term);
    saveToHistory(term);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleOptionChange = (key: keyof SearchOptions, value: any) => {
    setSearchOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getSearchDescription = () => {
    const descriptions = [];

    if (searchOptions.caseSensitive) {
      descriptions.push('Sensible à la casse');
    }

    if (searchOptions.wholeWord) {
      descriptions.push('Mot entier');
    }

    switch (searchOptions.searchIn) {
      case 'label':
        descriptions.push('Dans le libellé');
        break;
      case 'all':
        descriptions.push('Partout');
        break;
      case 'metadata':
        descriptions.push('Dans les métadonnées');
        break;
    }

    switch (searchOptions.searchType) {
      case 'contains':
        descriptions.push('Contient');
        break;
      case 'starts':
        descriptions.push('Commence par');
        break;
      case 'ends':
        descriptions.push('Finit par');
        break;
      case 'exact':
        descriptions.push('Exact');
        break;
    }

    return descriptions.join(', ');
  };

  return (
    <div className={`tree-view-search border-b bg-white p-4 ${className}`}>
      <div className="space-y-3">
        {/* Barre de recherche principale */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchSubmit}
            disabled={!searchTerm.trim()}
          >
            Rechercher
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Options de recherche avancée */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 text-gray-600"
          >
            <Filter className="h-4 w-4" />
            <span>Options avancées</span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {searchTerm && (
            <div className="text-xs text-gray-500">
              {getSearchDescription()}
            </div>
          )}
        </div>

        {/* Panneau d'options avancées */}
        {showAdvanced && (
          <div className="advanced-options space-y-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-4">
              {/* Options de recherche */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="caseSensitive"
                      checked={searchOptions.caseSensitive}
                      onCheckedChange={(checked) => handleOptionChange('caseSensitive', checked)}
                    />
                    <Label htmlFor="caseSensitive" className="flex items-center space-x-1 text-sm">
                      <CaseSensitive className="h-3 w-3" />
                      <span>Sensible à la casse</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wholeWord"
                      checked={searchOptions.wholeWord}
                      onCheckedChange={(checked) => handleOptionChange('wholeWord', checked)}
                    />
                    <Label htmlFor="wholeWord" className="flex items-center space-x-1 text-sm">
                      <WholeWord className="h-3 w-3" />
                      <span>Mot entier</span>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Type de recherche */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Type de recherche</Label>
                <Select
                  value={searchOptions.searchType}
                  onValueChange={(value) => handleOptionChange('searchType', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contient</SelectItem>
                    <SelectItem value="starts">Commence par</SelectItem>
                    <SelectItem value="ends">Finit par</SelectItem>
                    <SelectItem value="exact">Exact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chercher dans */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Chercher dans</Label>
                <Select
                  value={searchOptions.searchIn}
                  onValueChange={(value) => handleOptionChange('searchIn', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="label">Libellé uniquement</SelectItem>
                    <SelectItem value="all">Partout</SelectItem>
                    <SelectItem value="metadata">Métadonnées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Historique de recherche */}
            {searchHistory.length > 0 && (
              <div className="search-history space-y-2">
                <Label className="text-sm font-medium">Recherches récentes</Label>
                <div className="flex flex-wrap gap-1">
                  {searchHistory.map((term, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleHistoryItemClick(term)}
                      className="text-xs"
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeViewSearch;
