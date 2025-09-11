import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calendar,
  Clock,
  LayoutList,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import { TimelineEvent } from './TimelineView';

export interface TimelineViewToolbarProps {
  dateRange: { start: Date; end: Date };
  zoomLevel: number;
  timeScale: 'days' | 'weeks' | 'months' | 'years';
  orientation: 'horizontal' | 'vertical';
  onDateRangeChange: (start: Date, end: Date) => void;
  onZoomChange: (zoomLevel: number) => void;
  onTimeScaleChange: (scale: 'days' | 'weeks' | 'months' | 'years') => void;
  onOrientationChange: (orientation: 'horizontal' | 'vertical') => void;
  selectedEvents: TimelineEvent[];
  onDeleteSelected: () => void;
  multiSelect: boolean;
  selectable: boolean;
  className?: string;
}

export const TimelineViewToolbar: React.FC<TimelineViewToolbarProps> = ({
  dateRange,
  zoomLevel,
  timeScale,
  orientation,
  onDateRangeChange,
  onZoomChange,
  onTimeScaleChange,
  onOrientationChange,
  selectedEvents,
  onDeleteSelected,
  multiSelect,
  selectable,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: dateRange.start.toISOString().split('T')[0],
    end: dateRange.end.toISOString().split('T')[0]
  });

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoomLevel + 0.25, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoomLevel - 0.25, 0.25));
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const timeDiff = dateRange.end.getTime() - dateRange.start.getTime();
    const newStart = new Date(direction === 'prev'
      ? dateRange.start.getTime() - timeDiff
      : dateRange.start.getTime() + timeDiff
    );
    const newEnd = new Date(direction === 'prev'
      ? dateRange.end.getTime() - timeDiff
      : dateRange.end.getTime() + timeDiff
    );
    onDateRangeChange(newStart, newEnd);
  };

  const handleCustomDateRangeChange = () => {
    const newStart = new Date(customDateRange.start);
    const newEnd = new Date(customDateRange.end);
    onDateRangeChange(newStart, newEnd);
  };

  const getTimeScaleLabel = (scale: 'days' | 'weeks' | 'months' | 'years') => {
    switch (scale) {
      case 'days': return 'Jours';
      case 'weeks': return 'Semaines';
      case 'months': return 'Mois';
      case 'years': return 'Années';
    }
  };

  const getQuickDateRanges = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return [
      {
        label: 'Aujourd\'hui',
        start: today,
        end: today
      },
      {
        label: 'Cette semaine',
        start: new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + (6 - today.getDay()) * 24 * 60 * 60 * 1000)
      },
      {
        label: 'Ce mois',
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
      },
      {
        label: 'Cette année',
        start: new Date(today.getFullYear(), 0, 1),
        end: new Date(today.getFullYear(), 11, 31)
      },
      {
        label: '7 derniers jours',
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: today
      },
      {
        label: '30 derniers jours',
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: today
      },
      {
        label: '90 derniers jours',
        start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: today
      }
    ];
  };

  const hasSelection = selectedEvents.length > 0;

  return (
    <div className={`timeline-view-toolbar flex flex-col space-y-2 p-2 border-b bg-gray-50 ${className}`}>
      {/* Barre principale */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Navigation temporelle */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('prev')}
              title="Période précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('next')}
              title="Période suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Plage de dates rapide */}
          <Select
            value=""
            onValueChange={(value) => {
              const range = getQuickDateRanges().find(r => r.label === value);
              if (range) {
                onDateRangeChange(range.start, range.end);
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Plage de dates" />
            </SelectTrigger>
            <SelectContent>
              {getQuickDateRanges().map((range, index) => (
                <SelectItem key={index} value={range.label}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Échelle de temps */}
          <Select value={timeScale} onValueChange={onTimeScaleChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Jours</span>
                </div>
              </SelectItem>
              <SelectItem value="weeks">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4" />
                  <span>Semaines</span>
                </div>
              </SelectItem>
              <SelectItem value="months">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Mois</span>
                </div>
              </SelectItem>
              <SelectItem value="years">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Années</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Zoom */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.25}
              title="Zoom arrière"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              title="Zoom avant"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomReset}
              title="Reset zoom"
            >
              1:1
            </Button>
          </div>

          {/* Orientation */}
          <Select value={orientation} onValueChange={onOrientationChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">
                <div className="flex items-center space-x-2">
                  <LayoutList className="h-4 w-4" />
                  <span>Horizontal</span>
                </div>
              </SelectItem>
              <SelectItem value="vertical">
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Vertical</span>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-48"
            />
          </div>

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
            <span className="text-sm text-gray-600">Plage de dates personnalisée:</span>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-32"
              />
              <span className="text-sm text-gray-500">au</span>
              <Input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-32"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCustomDateRangeChange}
              >
                Appliquer
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Zoom actuel:</span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Échelle actuelle:</span>
            <span className="text-sm font-medium text-blue-600">
              {getTimeScaleLabel(timeScale)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Orientation actuelle:</span>
            <span className="text-sm font-medium text-blue-600">
              {orientation === 'horizontal' ? 'Horizontale' : 'Verticale'}
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
        </div>
      )}
    </div>
  );
};

export default TimelineViewToolbar;
