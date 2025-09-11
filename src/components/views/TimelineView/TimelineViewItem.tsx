import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Flag,
  CheckCircle,
  AlertCircle,
  XCircle,
  Target,
  CalendarDays,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { TimelineEvent } from './TimelineView';

export interface TimelineViewItemProps {
  event: TimelineEvent;
  position: { left: number; top: number; width: number; height: number };
  isSelected: boolean;
  orientation: 'horizontal' | 'vertical';
  selectable: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  className?: string;
}

export const TimelineViewItem: React.FC<TimelineViewItemProps> = ({
  event,
  position,
  isSelected,
  orientation,
  selectable,
  onSelect,
  onDoubleClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const getEventIcon = () => {
    switch (event.type) {
      case 'milestone':
        return <Flag className="h-4 w-4" />;
      case 'period':
        return <CalendarDays className="h-4 w-4" />;
      case 'task':
        return <Target className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = () => {
    if (event.color) {
      return event.color;
    }

    switch (event.type) {
      case 'milestone':
        return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'period':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'task':
        return 'bg-green-100 border-green-300 text-green-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getStatusIcon = () => {
    switch (event.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (event.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = () => {
    if (!event.endDate) return '';

    const duration = event.endDate.getTime() - event.startDate.getTime();
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}j${hours > 0 ? ` ${hours}h` : ''}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return '< 1h';
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick();
  };

  const renderHorizontalItem = () => (
    <div
      className={`timeline-item-horizontal absolute cursor-pointer group ${
        isSelected ? 'ring-2 ring-blue-500 z-10' : ''
      }`}
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
        width: `${Math.max(position.width, 2)}%`,
        height: 'calc(100% - 32px)' // Laisser de la place pour l'axe
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-full rounded-lg border-2 ${getEventColor()} transition-all duration-200 ${
        isSelected ? 'shadow-lg' : 'hover:shadow-md'
      }`}>
        {/* Contenu de l'événement */}
        <div className="p-2 h-full flex flex-col">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              {getEventIcon()}
              <h3 className="text-sm font-medium truncate flex-1">
                {event.title}
              </h3>
            </div>

            {(isHovered || isSelected) && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContextMenu(!showContextMenu);
                }}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Description */}
          {event.description && position.width > 5 && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
              {event.description}
            </p>
          )}

          {/* Métadonnées */}
          <div className="mt-auto space-y-1">
            {/* Dates */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(event.startDate).split(' ')[0]}</span>
              {event.endDate && (
                <span>{formatDate(event.endDate).split(' ')[0]}</span>
              )}
            </div>

            {/* Durée */}
            {event.endDate && formatDuration() && (
              <div className="text-xs text-gray-500">
                Durée: {formatDuration()}
              </div>
            )}

            {/* Statut et progression */}
            <div className="flex items-center justify-between">
              {event.status && (
                <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="ml-1">
                    {event.status === 'pending' ? 'En attente' :
                     event.status === 'in-progress' ? 'En cours' :
                     event.status === 'completed' ? 'Terminé' :
                     event.status === 'cancelled' ? 'Annulé' : event.status}
                  </span>
                </Badge>
              )}

              {event.progress !== undefined && event.type === 'task' && (
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${event.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{event.progress}%</span>
                </div>
              )}
            </div>

            {/* Catégorie */}
            {event.category && (
              <Badge variant="secondary" className="text-xs">
                {event.category}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerticalItem = () => (
    <div
      className={`timeline-item-vertical absolute cursor-pointer group ${
        isSelected ? 'ring-2 ring-blue-500 z-10' : ''
      }`}
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
        width: 'calc(100% - 48px)', // Laisser de la place pour l'axe
        height: `${Math.max(position.height, 2)}%`
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-full rounded-lg border-2 ${getEventColor()} transition-all duration-200 ${
        isSelected ? 'shadow-lg' : 'hover:shadow-md'
      }`}>
        {/* Contenu de l'événement */}
        <div className="p-2 w-full flex flex-col">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              {getEventIcon()}
              <h3 className="text-sm font-medium truncate flex-1">
                {event.title}
              </h3>
            </div>

            {(isHovered || isSelected) && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContextMenu(!showContextMenu);
                }}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Description */}
          {event.description && position.height > 5 && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
              {event.description}
            </p>
          )}

          {/* Métadonnées */}
          <div className="mt-auto space-y-1">
            {/* Dates */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(event.startDate).split(' ')[0]}</span>
              {event.endDate && (
                <span>{formatDate(event.endDate).split(' ')[0]}</span>
              )}
            </div>

            {/* Durée */}
            {event.endDate && formatDuration() && (
              <div className="text-xs text-gray-500">
                Durée: {formatDuration()}
              </div>
            )}

            {/* Statut et progression */}
            <div className="flex items-center justify-between">
              {event.status && (
                <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="ml-1">
                    {event.status === 'pending' ? 'En attente' :
                     event.status === 'in-progress' ? 'En cours' :
                     event.status === 'completed' ? 'Terminé' :
                     event.status === 'cancelled' ? 'Annulé' : event.status}
                  </span>
                </Badge>
              )}

              {event.progress !== undefined && event.type === 'task' && (
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${event.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{event.progress}%</span>
                </div>
              )}
            </div>

            {/* Catégorie */}
            {event.category && (
              <Badge variant="secondary" className="text-xs">
                {event.category}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return orientation === 'horizontal' ? renderHorizontalItem() : renderVerticalItem();
};

export default TimelineViewItem;
