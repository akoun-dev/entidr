import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar as Today,
  CalendarDays,
  CalendarRange,
  Calendar,
  List,
  Plus,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Upload,
  Settings,
  Grid3X3,
  Clock,
  MapPin,
  Users,
  Tag
} from 'lucide-react';
import { CalendarEvent } from './CalendarView';

export interface CalendarViewToolbarProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day' | 'list';
  dateRange: string;
  onViewModeChange: (mode: 'month' | 'week' | 'day' | 'list') => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  selectedEvents: CalendarEvent[];
  onDeleteSelected: () => void;
  categories: string[];
  onCategoryFilter: (categories: Set<string>) => void;
  multiSelect: boolean;
  selectable: boolean;
  className?: string;
}

export const CalendarViewToolbar: React.FC<CalendarViewToolbarProps> = ({
  currentDate,
  viewMode,
  dateRange,
  onViewModeChange,
  onToday,
  onPrevious,
  onNext,
  selectedEvents,
  onDeleteSelected,
  categories,
  onCategoryFilter,
  multiSelect,
  selectable,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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

  const hasSelection = selectedEvents.length > 0;

  return (
    <div className={`calendar-view-toolbar flex flex-col space-y-2 p-2 border-b bg-gray-50 ${className}`}>
      {/* Barre principale */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Navigation */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              title="Précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center min-w-[120px]">
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
                      ×
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={selectedCategories.has(category)}
                          onChange={() => handleCategoryToggle(category)}
                          className="rounded"
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
                </div>
              )}
            </div>
          )}

          {/* Actions sur la sélection */}
          {hasSelection && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="flex items-center space-x-1"
                title="Modifier la sélection"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier ({selectedEvents.length})</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteSelected}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                title="Supprimer la sélection"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer ({selectedEvents.length})</span>
              </Button>
            </>
          )}

          {/* Ajouter événement */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="flex items-center space-x-1"
            title="Ajouter un événement"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter</span>
          </Button>

          {/* Plus d'options */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            title="Plus d'options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contrôles avancés */}
      {showAdvancedControls && (
        <div className="advanced-controls flex items-center space-x-4 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Date actuelle:</span>
            <span className="text-sm font-medium text-blue-600">
              {formatDate(currentDate)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mode d'affichage:</span>
            <span className="text-sm font-medium text-blue-600">
              {getViewModeLabel(viewMode)}
            </span>
          </div>

          {hasSelection && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sélection:</span>
              <span className="text-sm font-medium text-blue-600">
                {selectedEvents.length} événement{selectedEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Outils d'export/import */}
          <div className="flex items-center space-x-2 border-l pl-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
              className="flex items-center space-x-1"
              title="Exporter le calendrier"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
              className="flex items-center space-x-1"
              title="Importer des événements"
            >
              <Upload className="h-4 w-4" />
              <span>Importer</span>
            </Button>
          </div>

          {/* Vues rapides */}
          <div className="flex items-center space-x-2 border-l pl-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange('month')}
              className={`flex items-center space-x-1 ${viewMode === 'month' ? 'bg-blue-100' : ''}`}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Mois</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange('week')}
              className={`flex items-center space-x-1 ${viewMode === 'week' ? 'bg-blue-100' : ''}`}
            >
              <CalendarRange className="h-4 w-4" />
              <span>Semaine</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange('day')}
              className={`flex items-center space-x-1 ${viewMode === 'day' ? 'bg-blue-100' : ''}`}
            >
              <Calendar className="h-4 w-4" />
              <span>Jour</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`flex items-center space-x-1 ${viewMode === 'list' ? 'bg-blue-100' : ''}`}
            >
              <List className="h-4 w-4" />
              <span>Liste</span>
            </Button>
          </div>

          {/* Actions supplémentaires */}
          <div className="flex items-center space-x-2 border-l pl-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
              className="flex items-center space-x-1"
              title="Paramètres du calendrier"
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarViewToolbar;
