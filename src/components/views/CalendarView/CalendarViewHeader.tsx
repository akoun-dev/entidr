import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar as Today,
  Grid3X3,
  List,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  Square,
  Filter,
  X
} from 'lucide-react';

export interface CalendarViewHeaderProps {
  eventCount: number;
  selectedCount: number;
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day' | 'list';
  dateRange: string;
  onViewModeChange: (mode: 'month' | 'week' | 'day' | 'list') => void;
  onSearch: (term: string) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  categories: string[];
  onCategoryFilter: (categories: Set<string>) => void;
  multiSelect: boolean;
  selectable: boolean;
  className?: string;
}

export const CalendarViewHeader: React.FC<CalendarViewHeaderProps> = ({
  eventCount,
  selectedCount,
  currentDate,
  viewMode,
  dateRange,
  onViewModeChange,
  onSearch,
  onToday,
  onPrevious,
  onNext,
  onSelectAll,
  onClearSelection,
  categories,
  onCategoryFilter,
  multiSelect,
  selectable,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const isAllSelected = selectedCount > 0 && selectedCount === eventCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < eventCount;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
    } else {
      onClearSelection();
    }
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
    onCategoryFilter(newCategories);
  };

  const clearCategoryFilter = () => {
    setSelectedCategories(new Set());
    onCategoryFilter(new Set());
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getViewModeIcon = (mode: 'month' | 'week' | 'day' | 'list') => {
    switch (mode) {
      case 'month':
        return <CalendarDays className="h-4 w-4" />;
      case 'week':
        return <CalendarRange className="h-4 w-4" />;
      case 'day':
        return <Calendar className="h-4 w-4" />;
      case 'list':
        return <List className="h-4 w-4" />;
    }
  };

  const getViewModeLabel = (mode: 'month' | 'week' | 'day' | 'list') => {
    switch (mode) {
      case 'month': return 'Mois';
      case 'week': return 'Semaine';
      case 'day': return 'Jour';
      case 'list': return 'Liste';
    }
  };

  return (
    <div className={`calendar-view-header flex items-center justify-between p-4 border-b ${className}`}>
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">Calendrier</h2>

        {/* Navigation et date */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            title="Précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-gray-700">
              {dateRange}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(currentDate)}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            title="Suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="flex items-center space-x-1"
            title="Aujourd'hui"
          >
            <Today className="h-4 w-4" />
            <span>Aujourd'hui</span>
          </Button>
        </div>

        {/* Compteur d'événements */}
        <div className="text-sm text-gray-600">
          {eventCount} événement{eventCount !== 1 ? 's' : ''}
          {selectedCount > 0 && (
            <span className="text-blue-600 font-medium">
              ({selectedCount} sélectionné{selectedCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        {/* Checkbox pour sélectionner tout */}
        {selectable && eventCount > 0 && (
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
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 w-48"
          />
        </div>

        {/* Filtre par catégorie */}
        {categories.length > 0 && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>Catégories</span>
              {selectedCategories.size > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCategories.size}
                </Badge>
              )}
            </Button>

            {showCategoryFilter && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Filtrer par catégorie</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCategoryFilter}
                    className="p-1 h-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.has(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>

                {selectedCategories.size > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      {selectedCategories.size} catégorie{selectedCategories.size !== 1 ? 's' : ''} sélectionnée{selectedCategories.size !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mode d'affichage */}
        <Select value={viewMode} onValueChange={onViewModeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4" />
                <span>Mois</span>
              </div>
            </SelectItem>
            <SelectItem value="week">
              <div className="flex items-center space-x-2">
                <CalendarRange className="h-4 w-4" />
                <span>Semaine</span>
              </div>
            </SelectItem>
            <SelectItem value="day">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Jour</span>
              </div>
            </SelectItem>
            <SelectItem value="list">
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>Liste</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

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

        {/* Indicateur de mode d'affichage */}
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
          {getViewModeIcon(viewMode)}
          <span>{getViewModeLabel(viewMode)}</span>
        </div>

        {/* Indicateur de filtre */}
        {selectedCategories.size > 0 && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
            <Filter className="h-4 w-4" />
            <span>{selectedCategories.size}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarViewHeader;
