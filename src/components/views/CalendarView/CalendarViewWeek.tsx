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

export interface CalendarViewWeekProps {
  events: CalendarEvent[];
  currentDate: Date;
  selectedEvents: Set<string>;
  selectable: boolean;
  showWeekends: boolean;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1;
  onEventSelect: (event: CalendarEvent) => void;
  onEventDoubleClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onDateDoubleClick: (date: Date) => void;
  className?: string;
}

export const CalendarViewWeek: React.FC<CalendarViewWeekProps> = ({
  events,
  currentDate,
  selectedEvents,
  selectable,
  showWeekends,
  timeFormat,
  firstDayOfWeek,
  onEventSelect,
  onEventDoubleClick,
  onDateClick,
  onDateDoubleClick,
  className = ''
}) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);

  // Générer le calendrier hebdomadaire
  const weekCalendar = useMemo(() => {
    // Calculer le début de la semaine
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (firstDayOfWeek === 1 ? 1 : 0);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculer la fin de la semaine
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Générer les jours de la semaine
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);

      const dayEvents = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const dayStart = new Date(dayDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayDate);
        dayEnd.setHours(23, 59, 59, 999);

        return (eventStart >= dayStart && eventStart <= dayEnd) ||
               (eventEnd >= dayStart && eventEnd <= dayEnd) ||
               (eventStart <= dayStart && eventEnd >= dayEnd);
      });

      days.push({
        date: dayDate,
        isToday: new Date().toDateString() === dayDate.toDateString(),
        isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
        events: dayEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      });
    }

    // Générer les créneaux horaires
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeSlots.push({
          time,
          hour,
          minute,
          label: formatTime(hour, minute)
        });
      }
    }

    return {
      startOfWeek,
      endOfWeek,
      days,
      timeSlots
    };
  }, [currentDate, events, firstDayOfWeek]);

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
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  const getEventPosition = (event: CalendarEvent, dayDate: Date) => {
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);

    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    // Calculer la position de début (en minutes depuis minuit)
    const startMinutes = Math.max(0, (eventStart.getTime() - dayStart.getTime()) / (1000 * 60));

    // Calculer la durée (en minutes)
    const endMinutes = Math.min(24 * 60, (eventEnd.getTime() - dayStart.getTime()) / (1000 * 60));
    const duration = Math.max(30, endMinutes - startMinutes);

    // Calculer la position en pixels (1 minute = 1 pixel)
    const top = startMinutes;
    const height = duration;

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

  const handleTimeSlotClick = useCallback((date: Date, time: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    onDateClick(newDate);
  }, [onDateClick]);

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    onEventSelect(event);
  }, [onEventSelect]);

  const handleEventDoubleClick = useCallback((event: CalendarEvent) => {
    onEventDoubleClick(event);
  }, [onEventDoubleClick]);

  const renderDayHeader = (day: any) => {
    const isHovered = hoveredDate && day.date.toDateString() === hoveredDate.toDateString();

    return (
      <div
        key={day.date.toISOString()}
        className={`
          day-header relative p-2 border-b border-gray-200 text-center cursor-pointer
          ${day.isToday ? 'bg-blue-50' : 'bg-white'}
          ${isHovered ? 'bg-gray-50' : ''}
          ${day.isWeekend && !showWeekends ? 'bg-gray-100' : ''}
          transition-colors duration-200
        `}
        onClick={(e) => handleDateClick(day.date, e)}
        onDoubleClick={(e) => handleDateDoubleClick(day.date, e)}
        onMouseEnter={() => setHoveredDate(day.date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        <div className="text-sm font-medium">
          {formatDate(day.date)}
        </div>
        {day.isToday && (
          <Badge variant="outline" className="text-xs mt-1">
            Aujourd'hui
          </Badge>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {day.events.length} événement{day.events.length !== 1 ? 's' : ''}
        </div>

        {/* Bouton d'ajout rapide au survol */}
        {isHovered && selectable && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-0 h-5 w-5 text-gray-400 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onDateClick(day.date);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const renderTimeSlot = (timeSlot: any, day: any) => {
    const isHovered = hoveredDate && day.date.toDateString() === hoveredDate.toDateString() &&
                     hoveredTime === timeSlot.time;

    return (
      <div
        key={`${day.date.toISOString()}-${timeSlot.time}`}
        className={`
          time-slot relative border-t border-gray-100 h-8 cursor-pointer
          ${isHovered ? 'bg-blue-50' : 'hover:bg-gray-50'}
          ${timeSlot.minute === 0 ? 'border-t-gray-300' : ''}
          transition-colors duration-200
        `}
        onClick={(e) => handleTimeSlotClick(day.date, timeSlot.time, e)}
        onMouseEnter={() => {
          setHoveredDate(day.date);
          setHoveredTime(timeSlot.time);
        }}
        onMouseLeave={() => {
          setHoveredDate(null);
          setHoveredTime(null);
        }}
      >
        <div className="text-xs text-gray-400 absolute left-1 top-1">
          {timeSlot.minute === 0 ? timeSlot.label : ''}
        </div>

        {/* Bouton d'ajout rapide au survol */}
        {isHovered && selectable && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 p-0 h-4 w-4 text-gray-400 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              const [hours, minutes] = timeSlot.time.split(':').map(Number);
              const newDate = new Date(day.date);
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

  const renderEvent = (event: CalendarEvent, day: any) => {
    const position = getEventPosition(event, day.date);
    const isSelected = selectedEvents.has(event.id);

    return (
      <div
        key={event.id}
        className={`
          absolute left-8 right-1 rounded p-1 text-xs cursor-pointer shadow-sm
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
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-current opacity-70"></div>
          <span className="font-medium truncate">
            {event.title}
          </span>
        </div>
        {!event.allDay && position.height > 30 && (
          <div className="text-xs opacity-70 mt-1">
            {formatTime(event.startDate.getHours(), event.startDate.getMinutes())} -
            {formatTime(event.endDate.getHours(), event.endDate.getMinutes())}
          </div>
        )}
        {event.location && position.height > 50 && (
          <div className="flex items-center space-x-1 text-xs opacity-70 mt-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`calendar-view-week ${className}`}>
      {/* En-tête avec la semaine et l'année */}
      <div className="calendar-title flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Semaine du {new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(weekCalendar.startOfWeek)} au {new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(weekCalendar.endOfWeek)}
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

      {/* Grille du calendrier hebdomadaire */}
      <div className="calendar-grid border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-8">
          {/* Colonne des heures */}
          <div className="time-column bg-gray-50 border-r border-gray-200">
            <div className="h-16 border-b border-gray-200"></div>
            {weekCalendar.timeSlots
              .filter(slot => slot.minute === 0)
              .map(slot => (
                <div key={slot.time} className="h-16 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {slot.label}
                </div>
              ))}
          </div>

          {/* Colonnes des jours */}
          {weekCalendar.days
            .filter(day => showWeekends || !day.isWeekend)
            .map(day => (
              <div key={day.date.toISOString()} className="day-column flex-1 min-w-0">
                {/* En-tête du jour */}
                {renderDayHeader(day)}

                {/* Contenu du jour */}
                <div className="day-content relative" style={{ minHeight: '1200px' }}>
                  {/* Créneaux horaires */}
                  {weekCalendar.timeSlots.map(slot => renderTimeSlot(slot, day))}

                  {/* Événements */}
                  {day.events.map(event => renderEvent(event, day))}
                </div>
              </div>
            ))}
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

export default CalendarViewWeek;
