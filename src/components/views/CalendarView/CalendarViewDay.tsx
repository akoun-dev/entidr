import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarViewEvent } from './CalendarViewEvent';
import { CalendarEvent } from './CalendarView';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock
} from 'lucide-react';

export interface CalendarViewDayProps {
  events: CalendarEvent[];
  currentDate: Date;
  selectedEvents: Set<string>;
  selectable: boolean;
  timeFormat: '12h' | '24h';
  onEventSelect: (event: CalendarEvent) => void;
  onEventDoubleClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onDateDoubleClick: (date: Date) => void;
  className?: string;
}

export const CalendarViewDay: React.FC<CalendarViewDayProps> = ({
  events,
  currentDate,
  selectedEvents,
  selectable,
  timeFormat,
  onEventSelect,
  onEventDoubleClick,
  onDateClick,
  onDateDoubleClick,
  className = ''
}) => {
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);

  // Générer le calendrier journalier
  const dayCalendar = useMemo(() => {
    // Début et fin de la journée
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Filtrer les événements de la journée
    const dayEvents = events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      return (eventStart >= dayStart && eventStart <= dayEnd) ||
             (eventEnd >= dayStart && eventEnd <= dayEnd) ||
             (eventStart <= dayStart && eventEnd >= dayEnd);
    }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Générer les créneaux horaires
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push({
          time,
          hour,
          minute,
          label: formatTime(hour, minute)
        });
      }
    }

    // Événements toute la journée
    const allDayEvents = dayEvents.filter(event => event.allDay);

    // Événements horaires
    const hourlyEvents = dayEvents.filter(event => !event.allDay);

    return {
      dayStart,
      dayEnd,
      dayEvents,
      allDayEvents,
      hourlyEvents,
      timeSlots
    };
  }, [currentDate, events]);

  const formatTime = (hour: number, minute: number): string => {
    if (timeFormat === '12h') {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getEventPosition = (event: CalendarEvent) => {
    const dayStart = new Date(dayCalendar.dayStart);

    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    // Calculer la position de début (en minutes depuis minuit)
    const startMinutes = Math.max(0, (eventStart.getTime() - dayStart.getTime()) / (1000 * 60));

    // Calculer la durée (en minutes)
    const endMinutes = Math.min(24 * 60, (eventEnd.getTime() - dayStart.getTime()) / (1000 * 60));
    const duration = Math.max(15, endMinutes - startMinutes);

    // Calculer la position en pixels (1 minute = 2 pixels pour plus de précision)
    const top = startMinutes * 2;
    const height = duration * 2;

    return { top, height };
  };

  const handleDateClick = useCallback((date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onDateClick(date);
  }, [onDateClick]);

  const handleDateDoubleClick = useCallback((date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onDateDoubleClick(date);
  }, [onDateDoubleClick]);

  const handleTimeSlotClick = useCallback((time: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);
    onDateClick(newDate);
  }, [currentDate, onDateClick]);

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    onEventSelect(event);
  }, [onEventSelect]);

  const handleEventDoubleClick = useCallback((event: CalendarEvent) => {
    onEventDoubleClick(event);
  }, [onEventDoubleClick]);

  const renderAllDaySection = () => {
    return (
      <div className="all-day-section border-b border-gray-200 p-2 bg-gray-50">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Toute la journée
        </div>
        <div className="flex flex-wrap gap-2">
          {dayCalendar.allDayEvents.length === 0 ? (
            <div className="text-sm text-gray-500 italic">
              Aucun événement toute la journée
            </div>
          ) : (
            dayCalendar.allDayEvents.map(event => (
              <div
                key={event.id}
                className={`
                  all-day-event px-3 py-1 rounded text-sm cursor-pointer
                  ${selectedEvents.has(event.id) ? 'ring-2 ring-blue-400' : ''}
                  hover:shadow-md transition-all duration-200
                `}
                style={{
                  backgroundColor: event.color ||
                    (event.type === 'event' ? '#dbeafe' :
                     event.type === 'task' ? '#dcfce7' :
                     event.type === 'reminder' ? '#fef3c7' :
                     event.type === 'meeting' ? '#e9d5ff' :
                     event.type === 'holiday' ? '#fecaca' : '#f3f4f6'),
                  borderLeft: `3px solid ${event.color ||
                    (event.type === 'event' ? '#3b82f6' :
                     event.type === 'task' ? '#22c55e' :
                     event.type === 'reminder' ? '#f59e0b' :
                     event.type === 'meeting' ? '#a855f7' :
                     event.type === 'holiday' ? '#ef4444' : '#6b7280')}`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventSelect(event);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleEventDoubleClick(event);
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-current opacity-70"></div>
                  <span className="font-medium truncate">
                    {event.title}
                  </span>
                  {event.category && (
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderTimeSlot = (timeSlot: any) => {
    const isHovered = hoveredTime === timeSlot.time;

    return (
      <div
        key={timeSlot.time}
        className={`
          time-slot relative border-t border-gray-100 h-8 cursor-pointer
          ${isHovered ? 'bg-blue-50' : 'hover:bg-gray-50'}
          ${timeSlot.minute === 0 ? 'border-t-gray-300' : ''}
          transition-colors duration-200
        `}
        onClick={(e) => handleTimeSlotClick(timeSlot.time, e)}
        onMouseEnter={() => setHoveredTime(timeSlot.time)}
        onMouseLeave={() => setHoveredTime(null)}
      >
        <div className="text-xs text-gray-400 absolute left-2 top-1">
          {timeSlot.minute === 0 ? timeSlot.label : ''}
        </div>

        {/* Bouton d'ajout rapide au survol */}
        {isHovered && selectable && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-2 p-0 h-4 w-4 text-gray-400 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              const [hours, minutes] = timeSlot.time.split(':').map(Number);
              const newDate = new Date(currentDate);
              newDate.setHours(hours, minutes, 0, 0);
              onDateClick(newDate);
            }}
          >
            <Plus className="h-2 w-2" />
          </Button>
        )}
      </div>
    );
  };

  const renderEvent = (event: CalendarEvent) => {
    const position = getEventPosition(event);
    const isSelected = selectedEvents.has(event.id);

    return (
      <div
        key={event.id}
        className={`
          absolute left-20 right-2 rounded p-2 text-xs cursor-pointer shadow-sm
          ${isSelected ? 'ring-2 ring-blue-400' : ''}
          hover:shadow-md transition-all duration-200
        `}
        style={{
          top: `${position.top}px`,
          height: `${position.height}px`,
          backgroundColor: event.color ||
            (event.type === 'event' ? '#dbeafe' :
             event.type === 'task' ? '#dcfce7' :
             event.type === 'reminder' ? '#fef3c7' :
             event.type === 'meeting' ? '#e9d5ff' :
             event.type === 'holiday' ? '#fecaca' : '#f3f4f6'),
          borderLeft: `3px solid ${event.color ||
            (event.type === 'event' ? '#3b82f6' :
             event.type === 'task' ? '#22c55e' :
             event.type === 'reminder' ? '#f59e0b' :
             event.type === 'meeting' ? '#a855f7' :
             event.type === 'holiday' ? '#ef4444' : '#6b7280')}`
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleEventSelect(event);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          handleEventDoubleClick(event);
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-current opacity-70"></div>
            <span className="font-medium truncate">
              {event.title}
            </span>
          </div>
          <div className="text-xs opacity-70">
            {formatTime(event.startDate.getHours(), event.startDate.getMinutes())} -
            {formatTime(event.endDate.getHours(), event.endDate.getMinutes())}
          </div>
        </div>

        {event.description && position.height > 60 && (
          <p className="text-xs opacity-80 mb-1 line-clamp-2">
            {event.description}
          </p>
        )}

        {event.location && position.height > 80 && (
          <div className="flex items-center space-x-1 text-xs opacity-70">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && position.height > 100 && (
          <div className="flex items-center space-x-1 text-xs opacity-70">
            <Users className="h-3 w-3" />
            <span>{event.attendees.length} participant{event.attendees.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {event.category && (
          <div className="mt-1">
            <Badge variant="outline" className="text-xs">
              {event.category}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`calendar-view-day ${className}`}>
      {/* En-tête avec le jour */}
      <div className="calendar-title flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {formatDate(currentDate)}
          {dayCalendar.dayStart.toDateString() === new Date().toDateString() && (
            <Badge variant="outline" className="ml-2">
              Aujourd'hui
            </Badge>
          )}
        </h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {events.length} événement{events.length !== 1 ? 's' : ''}
          </Badge>
          {selectedEvents.size > 0 && (
            <Badge variant="outline" className="text-sm text-blue-600">
              {selectedEvents.size} sélectionné{selectedEvents.size !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Grille du calendrier journalier */}
      <div className="calendar-grid border border-gray-200 rounded-lg overflow-hidden">
        {/* Section toute la journée */}
        {renderAllDaySection()}

        {/* Section horaire */}
        <div className="time-section relative" style={{ minHeight: '2880px' }}>
          {/* Créneaux horaires */}
          {dayCalendar.timeSlots.map(slot => renderTimeSlot(slot))}

          {/* Événements horaires */}
          {dayCalendar.hourlyEvents.map(event => renderEvent(event))}

          {/* Ligne de l'heure actuelle */}
          {dayCalendar.dayStart.toDateString() === new Date().toDateString() && (
            <div className="current-time-line absolute left-0 right-0 z-10">
              <div className="flex items-center">
                <div className="w-16 text-xs text-red-600 font-medium text-center">
                  {formatTime(new Date().getHours(), new Date().getMinutes())}
                </div>
                <div className="flex-1 h-0.5 bg-red-600 relative">
                  <div className="absolute -top-1 left-0 w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Résumé de la journée */}
      <div className="day-summary mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Résumé de la journée</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Total événements</div>
            <div className="font-medium">{dayCalendar.dayEvents.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Toute la journée</div>
            <div className="font-medium">{dayCalendar.allDayEvents.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Horaires</div>
            <div className="font-medium">{dayCalendar.hourlyEvents.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Heures occupées</div>
            <div className="font-medium">
              {Math.round(dayCalendar.hourlyEvents.reduce((total, event) => {
                const duration = (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60);
                return total + duration;
              }, 0) * 10) / 10}h
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="calendar-legend mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-blue-200"></div>
          <span>Événement</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-green-200"></div>
          <span>Tâche</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-yellow-200"></div>
          <span>Rappel</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-purple-200"></div>
          <span>Réunion</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded bg-red-200"></div>
          <span>Jour férié</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarViewDay;
