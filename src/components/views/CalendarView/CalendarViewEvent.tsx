import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  CalendarDays,
  List,
  Copy,
  Share,
  Bell,
  User,
  Info
} from 'lucide-react';
import { CalendarEvent } from './CalendarView';

export interface CalendarViewEventProps {
  event: CalendarEvent;
  isSelected: boolean;
  selectable: boolean;
  onEventSelect: (event: CalendarEvent) => void;
  onEventDoubleClick: (event: CalendarEvent) => void;
  className?: string;
}

export const CalendarViewEvent: React.FC<CalendarViewEventProps> = ({
  event,
  isSelected,
  selectable,
  onEventSelect,
  onEventDoubleClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusIcon = (status?: CalendarEvent['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'tentative':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: CalendarEvent['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'tentative':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: CalendarEvent['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'reminder':
        return <AlertCircle className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'holiday':
        return <CalendarDays className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'event':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      case 'holiday':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventColor = (event: CalendarEvent): string => {
    if (event.color) {
      return event.color;
    }

    switch (event.type) {
      case 'event':
        return 'bg-blue-500 border-blue-600';
      case 'task':
        return 'bg-green-500 border-green-600';
      case 'reminder':
        return 'bg-yellow-500 border-yellow-600';
      case 'meeting':
        return 'bg-purple-500 border-purple-600';
      case 'holiday':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateTime = (startDate: Date, endDate: Date): string => {
    const sameDay = startDate.toDateString() === endDate.toDateString();

    if (sameDay) {
      return `${formatDate(startDate)} • ${formatTime(startDate)} - ${formatTime(endDate)}`;
    } else {
      return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEventDoubleClick(event);
  };

  const renderEvent = () => (
    <div
      className={`calendar-event relative rounded-lg border p-3 cursor-pointer transition-all duration-200 ${
        getEventColor(event)
      } ${
        isSelected ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-lg' : ''
      } ${isHovered ? 'shadow-md' : ''} ${selectable ? 'pointer-events-auto' : 'pointer-events-none'} ${className}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
    >
      {/* En-tête de l'événement */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getTypeIcon(event.type)}
          <h4 className="text-sm font-medium text-white truncate flex-1">
            {event.title}
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon(event.status)}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto text-white hover:bg-white hover:bg-opacity-20"
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu(!showContextMenu);
            }}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center space-x-1 mb-2 flex-wrap">
        <Badge variant="outline" className={`text-xs ${getTypeColor(event.type)}`}>
          {event.type === 'event' ? 'Événement' :
           event.type === 'task' ? 'Tâche' :
           event.type === 'reminder' ? 'Rappel' :
           event.type === 'meeting' ? 'Réunion' :
           event.type === 'holiday' ? 'Jour férié' : event.type}
        </Badge>
        {event.category && (
          <Badge variant="secondary" className="text-xs">
            {event.category}
          </Badge>
        )}
        {event.status && (
          <Badge variant="outline" className={`text-xs ${getStatusColor(event.status)}`}>
            {event.status === 'confirmed' ? 'Confirmé' :
             event.status === 'tentative' ? 'Provisoire' :
             event.status === 'cancelled' ? 'Annulé' :
             event.status === 'completed' ? 'Terminé' :
             event.status === 'pending' ? 'En attente' : event.status}
          </Badge>
        )}
        {event.priority && (
          <Badge variant="outline" className={`text-xs ${getPriorityColor(event.priority)}`}>
            {event.priority === 'urgent' ? 'Urgent' :
             event.priority === 'high' ? 'Haute' :
             event.priority === 'medium' ? 'Moyenne' :
             event.priority === 'low' ? 'Basse' : event.priority}
          </Badge>
        )}
      </div>

      {/* Date et heure */}
      <div className="flex items-center space-x-2 text-xs text-white text-opacity-90 mb-2">
        <Clock className="h-3 w-3" />
        <span className="truncate">
          {formatDateTime(event.startDate, event.endDate)}
        </span>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-xs text-white text-opacity-80 mb-2 line-clamp-2">
          {event.description}
        </p>
      )}

      {/* Location */}
      {event.location && (
        <div className="flex items-center space-x-2 text-xs text-white text-opacity-80 mb-2">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{event.location}</span>
        </div>
      )}

      {/* Participants */}
      {event.attendees && event.attendees.length > 0 && (
        <div className="flex items-center space-x-2 text-xs text-white text-opacity-80 mb-2">
          <Users className="h-3 w-3" />
          <span>{event.attendees.length} participant{event.attendees.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="flex items-center space-x-2 text-xs text-white text-opacity-80">
          <Tag className="h-3 w-3" />
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-white bg-opacity-20 border-white border-opacity-30 text-white">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 2 && (
              <Badge variant="outline" className="text-xs bg-white bg-opacity-20 border-white border-opacity-30 text-white">
                +{event.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Tooltip détaillé */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold truncate flex-1">
              {event.title}
            </h3>
            <div className="flex items-center space-x-1">
              {getTypeIcon(event.type)}
              {getStatusIcon(event.status)}
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>{formatDateTime(event.startDate, event.endDate)}</span>
            </div>

            {event.description && (
              <div className="flex items-start space-x-2">
                <Info className="h-3 w-3 mt-0.5" />
                <span className="line-clamp-3">{event.description}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3" />
                <span>{event.attendees.length} participant{event.attendees.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="h-3 w-3" />
                <span>{event.tags.join(', ')}</span>
              </div>
            )}

            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs font-medium text-gray-700 mb-1">Métadonnées:</div>
                {Object.entries(event.metadata).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
                {Object.keys(event.metadata).length > 3 && (
                  <div className="text-xs text-gray-500 mt-1">
                    +{Object.keys(event.metadata).length - 3} métadonnée{Object.keys(event.metadata).length - 3 !== 1 ? 's' : ''} supplémentaire{Object.keys(event.metadata).length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions rapides */}
          {(isHovered || isSelected) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  // Action d'édition
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Éditer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  // Action de duplication
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Dupliquer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6 text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  // Action de suppression
                }}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Supprimer
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Menu contextuel */}
      {showContextMenu && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-40">
          <div className="p-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setShowContextMenu(false);
                // Action d'édition
              }}
            >
              <Edit className="h-3 w-3 mr-2" />
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setShowContextMenu(false);
                // Action de duplication
              }}
            >
              <Copy className="h-3 w-3 mr-2" />
              Dupliquer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setShowContextMenu(false);
                // Action de partage
              }}
            >
              <Share className="h-3 w-3 mr-2" />
              Partager
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setShowContextMenu(false);
                // Action de rappel
              }}
            >
              <Bell className="h-3 w-3 mr-2" />
              Rappel
            </Button>
            <div className="border-t my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-red-600 hover:text-red-700"
              onClick={() => {
                setShowContextMenu(false);
                // Action de suppression
              }}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return renderEvent();
};

export default CalendarViewEvent;
