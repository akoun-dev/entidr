import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  List
} from 'lucide-react';
import { CalendarEvent } from './CalendarView';

export interface CalendarViewGridProps {
  events: CalendarEvent[];
  currentDate: Date;
  selectable: boolean;
  onEventSelect: (event: CalendarEvent) => void;
  onEventDoubleClick: (event: CalendarEvent) => void;
  className?: string;
}

export const CalendarViewGrid: React.FC<CalendarViewGridProps> = ({
  events,
  currentDate,
  selectable,
  onEventSelect,
  onEventDoubleClick,
  className = ''
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showEventMenu, setShowEventMenu] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleEventClick = useCallback((event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEventId(event.id);
    onEventSelect(event);
  }, [onEventSelect]);

  const handleEventDoubleClick = useCallback((event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventDoubleClick(event);
  }, [onEventDoubleClick]);

  const handleEventMenu = useCallback((eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEventMenu(showEventMenu === eventId ? null : eventId);
  }, [showEventMenu]);

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

  const getEventColor = (event: CalendarEvent): string => {
    if (event.color) {
      return event.color;
    }

    switch (event.type) {
      case 'event':
        return 'border-blue-500';
      case 'task':
        return 'border-green-500';
      case 'reminder':
        return 'border-yellow-500';
      case 'meeting':
        return 'border-purple-500';
      case 'holiday':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  };

  // Trier les événements
  const sortedEvents = [...events].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = a.startDate.getTime() - b.startDate.getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (newSortBy: 'date' | 'title' | 'category') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const renderEventCard = (event: CalendarEvent) => {
    const isSelected = selectedEventId === event.id;
    const isMenuOpen = showEventMenu === event.id;

    return (
      <Card
        key={event.id}
        className={`event-card cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${getEventColor(event)} border-l-4`}
        onClick={(e) => handleEventClick(event, e)}
        onDoubleClick={(e) => handleEventDoubleClick(event, e)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                {getTypeIcon(event.type)}
                <span className="truncate">{event.title}</span>
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
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
            </div>
            <div className="flex items-center space-x-1">
              {getStatusIcon(event.status)}
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => handleEventMenu(event.id, e)}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* Date et heure */}
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{formatDateTime(event.startDate, event.endDate)}</span>
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {/* Participants */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Users className="h-3 w-3" />
                <span>{event.attendees.length} participant{event.attendees.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Tag className="h-3 w-3" />
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {event.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Menu contextuel */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
                      // Action de duplication
                    }}
                  >
                    <List className="h-3 w-3 mr-2" />
                    Dupliquer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`calendar-view-grid ${className}`}>
      {/* En-tête avec contrôles de tri */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">
            Événements de {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDate)}
          </h3>
          <Badge variant="secondary" className="text-sm">
            {events.length} événement{events.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Trier par:</span>
          <div className="flex space-x-1">
            <Button
              variant={sortBy === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('date')}
              className="text-xs"
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant={sortBy === 'title' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('title')}
              className="text-xs"
            >
              Titre {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
            <Button
              variant={sortBy === 'category' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('category')}
              className="text-xs"
            >
              Catégorie {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
        </div>
      </div>

      {/* Grille d'événements */}
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aucun événement trouvé</p>
          <p className="text-sm">Essayez de modifier vos filtres ou d'ajouter un nouvel événement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEvents.map(renderEventCard)}
        </div>
      )}
    </div>
  );
};

export default CalendarViewGrid;
