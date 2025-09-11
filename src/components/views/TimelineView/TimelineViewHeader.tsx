import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  LayoutList,
  LayoutDashboard,
  CheckSquare,
  Square,
  Clock,
  RotateCcw
} from 'lucide-react';

export interface TimelineViewHeaderProps {
  title: string;
  eventCount: number;
  selectedCount: number;
  dateRange: { start: Date; end: Date };
  timeScale: 'days' | 'weeks' | 'months' | 'years';
  orientation: 'horizontal' | 'vertical';
  onTimeScaleChange: (scale: 'days' | 'weeks' | 'months' | 'years') => void;
  onOrientationChange: (orientation: 'horizontal' | 'vertical') => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  multiSelect: boolean;
  selectable: boolean;
  className?: string;
}

export const TimelineViewHeader: React.FC<TimelineViewHeaderProps> = ({
  title,
  eventCount,
  selectedCount,
  dateRange,
  timeScale,
  orientation,
  onTimeScaleChange,
  onOrientationChange,
  onSelectAll,
  onClearSelection,
  multiSelect,
  selectable,
  className = ''
}) => {
  const isAllSelected = selectedCount > 0 && selectedCount === eventCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < eventCount;

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
    } else {
      onClearSelection();
    }
  };

  const formatDateRange = () => {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };

    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
  };

  const getTimeScaleLabel = (scale: 'days' | 'weeks' | 'months' | 'years') => {
    switch (scale) {
      case 'days': return 'Jours';
      case 'weeks': return 'Semaines';
      case 'months': return 'Mois';
      case 'years': return 'Années';
    }
  };

  const getOrientationIcon = (orient: 'horizontal' | 'vertical') => {
    return orient === 'horizontal'
      ? <LayoutList className="h-4 w-4" />
      : <LayoutDashboard className="h-4 w-4" />;
  };

  return (
    <div className={`timeline-view-header flex items-center justify-between p-4 border-b ${className}`}>
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">{title}</h2>

        {/* Plage de dates */}
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDateRange()}</span>
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

        {/* Boutons rapides pour changer d'orientation */}
        <div className="flex border rounded-md overflow-hidden">
          <Button
            variant={orientation === 'horizontal' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onOrientationChange('horizontal')}
            className="rounded-none border-r"
            title="Vue horizontale"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={orientation === 'vertical' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onOrientationChange('vertical')}
            className="rounded-none"
            title="Vue verticale"
          >
            <LayoutDashboard className="h-4 w-4" />
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

        {/* Indicateur d'échelle */}
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
          <Clock className="h-4 w-4" />
          <span>{getTimeScaleLabel(timeScale)}</span>
        </div>

        {/* Indicateur d'orientation */}
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
          {getOrientationIcon(orientation)}
          <span>{orientation === 'horizontal' ? 'H' : 'V'}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineViewHeader;
