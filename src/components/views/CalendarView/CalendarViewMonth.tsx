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

export interface CalendarViewMonthProps {
  events: CalendarEvent[];
  currentDate: Date;
  selectedEvents: Set<string>;
  selectable: boolean;
  showWeekends: boolean;
  showWeekNumbers: boolean;
  firstDayOfWeek: 0 | 1;
  onEventSelect: (event: CalendarEvent) => void;
  onEventDoubleClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onDateDoubleClick: (date: Date) => void;
  className?: string;
}

export const CalendarViewMonth: React.FC<CalendarViewMonthProps> = ({
  events,
  currentDate,
  selectedEvents,
  selectable,
  showWeekends,
  showWeekNumbers,
  firstDayOfWeek,
  onEventSelect,
  onEventDoubleClick,
  onDateClick,
  onDateDoubleClick,
  className = ''
}) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Générer le calendrier mensuel
  const monthCalendar = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);

    // Calculer le début du calendrier (peut inclure la fin du mois précédent)
    const startDay = new Date(firstDay);
    const dayOfWeek = startDay.getDay();
    const diff = startDay.getDate() - dayOfWeek + (firstDayOfWeek === 1 ? 1 : 0);
    startDay.setDate(diff);

    // Calculer la fin du calendrier (peut inclure le début du mois suivant)
    const endDay = new Date(lastDay);
    const endDayOfWeek = endDay.getDay();
    const endDiff = endDay.getDate() + (6 - endDayOfWeek + (firstDayOfWeek === 1 ? 1 : 0));
    endDay.setDate(endDiff);

    const calendar = [];
    const currentWeek = [];
    let currentDateIter = new Date(startDay);

    // Jours de la semaine
    const weekDays = firstDayOfWeek === 1
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    // En-tête avec les jours de la semaine
    calendar.push({
      type: 'header',
      days: weekDays.map((day, index) => ({
        name: day,
        isWeekend: (firstDayOfWeek === 1 && index >= 5) || (firstDayOfWeek === 0 && (index === 0 || index === 6))
      }))
    });

    // Générer les semaines
    while (currentDateIter <= endDay) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return (
          eventDate.getDate() === currentDateIter.getDate() &&
          eventDate.getMonth() === currentDateIter.getMonth() &&
          eventDate.getFullYear() === currentDateIter.getFullYear()
        );
      });

      currentWeek.push({
        date: new Date(currentDateIter),
        isCurrentMonth: currentDateIter.getMonth() === month,
        isToday: new Date().toDateString() === currentDateIter.toDateString(),
        isWeekend: currentDateIter.getDay() === 0 || currentDateIter.getDay() === 6,
        events: dayEvents,
        weekNumber: getWeekNumber(currentDateIter)
      });

      if (currentWeek.length === 7) {
        calendar.push({
          type: 'week',
          days: [...currentWeek],
          weekNumber: getWeekNumber(currentWeek[0].date)
        });
        currentWeek.length = 0;
      }

      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    // Ajouter la dernière semaine si elle n'est pas complète
    if (currentWeek.length > 0) {
      calendar.push({
        type: 'week',
        days: [...currentWeek],
        weekNumber: getWeekNumber(currentWeek[0].date)
      });
    }

    return calendar;
  }, [currentDate, events, firstDayOfWeek]);

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  const handleDateClick = useCallback((date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onDateClick(date);
  }, [onDateClick]);

  const handleDateDoubleClick = useCallback((date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onDateDoubleClick(date);
  }, [onDateDoubleClick]);

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    onEventSelect(event);
  }, [onEventSelect]);

  const handleEventDoubleClick = useCallback((event: CalendarEvent) => {
    onEventDoubleClick(event);
  }, [onEventDoubleClick]);

  const renderDay = (day: any) => {
    const isHovered = hoveredDate && day.date.toDateString() === hoveredDate.toDateString();
    const isSelected = selectedEvents.size > 0 && day.events.some(event => selectedEvents.has(event.id));

    return (
      <div
        key={day.date.toISOString()}
        className={`
          calendar-day relative h-24 border border-gray-200 p-1 cursor-pointer
          ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
          ${day.isToday ? 'bg-blue-50' : ''}
          ${isHovered ? 'bg-gray-100' : ''}
          ${isSelected ? 'ring-2 ring-blue-300' : ''}
          ${day.isWeekend && !showWeekends ? 'bg-gray-100' : ''}
          transition-colors duration-200
        `}
        onClick={(e) => handleDateClick(day.date, e)}
        onDoubleClick={(e) => handleDateDoubleClick(day.date, e)}
        onMouseEnter={() => setHoveredDate(day.date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {/* Numéro du jour et numéro de semaine */}
        <div className="flex items-center justify-between mb-1">
          <span className={`
            text-sm font-medium
            ${day.isToday ? 'text-blue-600 font-bold' : ''}
            ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
          `}>
            {day.date.getDate()}
          </span>
          {showWeekNumbers && day.date.getDay() === firstDayOfWeek && (
            <span className="text-xs text-gray-500">
              {day.weekNumber}
            </span>
          )}
        </div>

        {/* Événements du jour */}
        <div className="space-y-1 overflow-y-auto max-h-16">
          {day.events.slice(0, 3).map((event: CalendarEvent) => (
            <div
              key={event.id}
              className="event-item text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: event.color ||
                  (event.type === 'event' ? '#dbeafe' :
                   event.type === 'task' ? '#dcfce7' :
                   event.type === 'reminder' ? '#fef3c7' :
                   event.type === 'meeting' ? '#e9d5ff' :
                   event.type === 'holiday' ? '#fecaca' : '#f3f4f6')
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
                <span className="truncate font-medium">
                  {event.title}
                </span>
              </div>
              {!event.allDay && (
                <div className="flex items-center space-x-1 text-xs opacity-70">
                  <Clock className="h-3 w-3" />
                  <span>
                    {event.startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Indicateur d'événements supplémentaires */}
          {day.events.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{day.events.length - 3} autre{day.events.length - 3 > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Bouton d'ajout rapide au survol */}
        {isHovered && selectable && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-1 right-1 p-0 h-5 w-5 text-gray-400 hover:text-blue-600"
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

  const renderHeader = () => {
    const header = monthCalendar[0];
    if (header.type !== 'header') return null;

    return (
      <div className="calendar-header grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {header.days.map((day: any, index: number) => (
          <div
            key={index}
            className={`
              text-center py-2 text-sm font-medium
              ${day.isWeekend && !showWeekends ? 'text-gray-400' : 'text-gray-700'}
            `}
          >
            {day.name}
          </div>
        ))}
      </div>
    );
  };

  const renderWeek = (week: any) => {
    if (week.type !== 'week') return null;

    return (
      <div key={week.weekNumber} className="calendar-week grid grid-cols-7">
        {week.days
          .filter(day => showWeekends || !day.isWeekend)
          .map(day => renderDay(day))}
      </div>
    );
  };

  return (
    <div className={`calendar-view-month ${className}`}>
      {/* En-tête avec le mois et l'année */}
      <div className="calendar-title flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDate)}
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

      {/* Grille du calendrier */}
      <div className="calendar-grid border border-gray-200 rounded-lg overflow-hidden">
        {renderHeader()}
        {monthCalendar
          .filter(week => week.type === 'week')
          .map(week => renderWeek(week))}
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

export default CalendarViewMonth;
