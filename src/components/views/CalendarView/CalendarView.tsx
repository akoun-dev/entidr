import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CalendarViewHeader } from './CalendarViewHeader';
import { CalendarViewToolbar } from './CalendarViewToolbar';
import { CalendarViewGrid } from './CalendarViewGrid';
import { CalendarViewEvent } from './CalendarViewEvent';
import { CalendarViewMonth } from './CalendarViewMonth';
import { CalendarViewWeek } from './CalendarViewWeek';
import { CalendarViewDay } from './CalendarViewDay';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'event' | 'task' | 'reminder' | 'meeting' | 'holiday';
  category?: string;
  color?: string;
  icon?: React.ReactNode;
  status?: 'confirmed' | 'tentative' | 'cancelled' | 'completed' | 'pending';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  attendees?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  selected?: boolean;
  visible?: boolean;
  allDay?: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: Date;
  };
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate?: Date;
  viewMode?: 'month' | 'week' | 'day' | 'list';
  className?: string;
  multiSelect?: boolean;
  selectable?: boolean;
  showToolbar?: boolean;
  showHeader?: boolean;
  showWeekends?: boolean;
  showWeekNumbers?: boolean;
  timeFormat?: '12h' | '24h';
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
  onEventSelect?: (event: CalendarEvent) => void;
  onEventDoubleClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onDateDoubleClick?: (date: Date) => void;
  onCurrentDateChange?: (date: Date) => void;
  onViewModeChange?: (mode: 'month' | 'week' | 'day' | 'list') => void;
  onEventCreate?: (date: Date) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (events: CalendarEvent[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  currentDate = new Date(),
  viewMode = 'month',
  className = '',
  multiSelect = false,
  selectable = true,
  showToolbar = true,
  showHeader = true,
  showWeekends = true,
  showWeekNumbers = false,
  timeFormat = '24h',
  firstDayOfWeek = 1,
  onEventSelect,
  onEventDoubleClick,
  onDateClick,
  onDateDoubleClick,
  onCurrentDateChange,
  onViewModeChange,
  onEventCreate,
  onEventUpdate,
  onEventDelete
}) => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(events);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [currentDateState, setCurrentDateState] = useState(currentDate);
  const [viewModeState, setViewModeState] = useState(viewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const calendarRef = useRef<HTMLDivElement>(null);

  // Mettre à jour les events quand ils changent
  useEffect(() => {
    setCalendarEvents(events);
  }, [events]);

  // Mettre à jour la date courante quand elle change
  useEffect(() => {
    setCurrentDateState(currentDate);
  }, [currentDate]);

  // Mettre à jour le mode d'affichage quand il change
  useEffect(() => {
    setViewModeState(viewMode);
  }, [viewMode]);

  // Filtrer et traiter les events visibles
  const visibleEvents = useMemo(() => {
    return calendarEvents.filter(event => {
      // Filtrer par terme de recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.category?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower) ||
          event.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      return true;
    }).filter(event => {
      // Filtrer par catégories sélectionnées
      if (selectedCategories.size > 0 && event.category) {
        return selectedCategories.has(event.category);
      }
      return true;
    }).filter(event => event.visible !== false);
  }, [calendarEvents, searchTerm, selectedCategories]);

  const handleEventSelect = useCallback((event: CalendarEvent) => {
    if (!selectable) return;

    let newSelectedEvents: Set<string>;

    if (multiSelect) {
      newSelectedEvents = new Set(selectedEvents);
      if (newSelectedEvents.has(event.id)) {
        newSelectedEvents.delete(event.id);
      } else {
        newSelectedEvents.add(event.id);
      }
    } else {
      newSelectedEvents = new Set([event.id]);
    }

    setSelectedEvents(newSelectedEvents);
    onEventSelect?.(event);
  }, [selectable, multiSelect, selectedEvents, onEventSelect]);

  const handleEventDoubleClick = useCallback((event: CalendarEvent) => {
    onEventDoubleClick?.(event);
  }, [onEventDoubleClick]);

  const handleDateClick = useCallback((date: Date) => {
    onDateClick?.(date);

    if (onEventCreate) {
      onEventCreate(date);
    }
  }, [onDateClick, onEventCreate]);

  const handleDateDoubleClick = useCallback((date: Date) => {
    onDateDoubleClick?.(date);
  }, [onDateDoubleClick]);

  const handleCurrentDateChange = useCallback((newDate: Date) => {
    setCurrentDateState(newDate);
    onCurrentDateChange?.(newDate);
  }, [onCurrentDateChange]);

  const handleViewModeChange = useCallback((newMode: 'month' | 'week' | 'day' | 'list') => {
    setViewModeState(newMode);
    onViewModeChange?.(newMode);
  }, [onViewModeChange]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryFilter = useCallback((categories: Set<string>) => {
    setSelectedCategories(categories);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedEvents.size === visibleEvents.length) {
      setSelectedEvents(new Set());
    } else {
      const allIds = visibleEvents.map(event => event.id);
      setSelectedEvents(new Set(allIds));
    }
  }, [selectedEvents, visibleEvents]);

  const handleClearSelection = useCallback(() => {
    setSelectedEvents(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const eventsToDelete = visibleEvents.filter(event => selectedEvents.has(event.id));
    onEventDelete?.(eventsToDelete);
    setSelectedEvents(new Set());
  }, [selectedEvents, visibleEvents, onEventDelete]);

  const getSelectedEvents = useCallback(() => {
    return visibleEvents.filter(event => selectedEvents.has(event.id));
  }, [selectedEvents, visibleEvents]);

  const navigateToToday = useCallback(() => {
    handleCurrentDateChange(new Date());
  }, [handleCurrentDateChange]);

  const navigateToPrevious = useCallback(() => {
    const newDate = new Date(currentDateState);
    switch (viewModeState) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'list':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    handleCurrentDateChange(newDate);
  }, [currentDateState, viewModeState, handleCurrentDateChange]);

  const navigateToNext = useCallback(() => {
    const newDate = new Date(currentDateState);
    switch (viewModeState) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'list':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    handleCurrentDateChange(newDate);
  }, [currentDateState, viewModeState, handleCurrentDateChange]);

  const getCategories = useCallback(() => {
    const categories = new Set<string>();
    calendarEvents.forEach(event => {
      if (event.category) {
        categories.add(event.category);
      }
    });
    return Array.from(categories).sort();
  }, [calendarEvents]);

  const formatDateRange = useCallback(() => {
    switch (viewModeState) {
      case 'month':
        return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDateState);
      case 'week':
        const weekStart = new Date(currentDateState);
        const dayOfWeek = weekStart.getDay();
        const diff = weekStart.getDate() - dayOfWeek + (firstDayOfWeek === 1 ? 1 : 0);
        weekStart.setDate(diff);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.getDate()} - ${weekEnd.getDate()} ${new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(weekStart)}`;
        } else {
          return `${weekStart.getDate()} ${new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(weekStart)} - ${weekEnd.getDate()} ${new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(weekEnd)}`;
        }
      case 'day':
        return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(currentDateState);
      case 'list':
        return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDateState);
      default:
        return '';
    }
  }, [currentDateState, viewModeState, firstDayOfWeek]);

  const renderCalendarView = () => {
    switch (viewModeState) {
      case 'month':
        return (
          <CalendarViewMonth
            events={visibleEvents}
            currentDate={currentDateState}
            selectedEvents={selectedEvents}
            selectable={selectable}
            showWeekends={showWeekends}
            showWeekNumbers={showWeekNumbers}
            firstDayOfWeek={firstDayOfWeek}
            onEventSelect={handleEventSelect}
            onEventDoubleClick={handleEventDoubleClick}
            onDateClick={handleDateClick}
            onDateDoubleClick={handleDateDoubleClick}
          />
        );
      case 'week':
        return (
          <CalendarViewWeek
            events={visibleEvents}
            currentDate={currentDateState}
            selectedEvents={selectedEvents}
            selectable={selectable}
            showWeekends={showWeekends}
            timeFormat={timeFormat}
            firstDayOfWeek={firstDayOfWeek}
            onEventSelect={handleEventSelect}
            onEventDoubleClick={handleEventDoubleClick}
            onDateClick={handleDateClick}
            onDateDoubleClick={handleDateDoubleClick}
          />
        );
      case 'day':
        return (
          <CalendarViewDay
            events={visibleEvents}
            currentDate={currentDateState}
            selectedEvents={selectedEvents}
            selectable={selectable}
            timeFormat={timeFormat}
            onEventSelect={handleEventSelect}
            onEventDoubleClick={handleEventDoubleClick}
            onDateClick={handleDateClick}
            onDateDoubleClick={handleDateDoubleClick}
          />
        );
      case 'list':
        return (
          <CalendarViewGrid
            events={visibleEvents}
            currentDate={currentDateState}
            selectedEvents={selectedEvents}
            selectable={selectable}
            onEventSelect={handleEventSelect}
            onEventDoubleClick={handleEventDoubleClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`calendar-view ${className}`}>
      {showHeader && (
        <CalendarViewHeader
          title="Calendrier"
          eventCount={visibleEvents.length}
          selectedCount={selectedEvents.size}
          currentDate={currentDateState}
          viewMode={viewModeState}
          dateRange={formatDateRange()}
          onViewModeChange={handleViewModeChange}
          onSearch={handleSearch}
          onToday={navigateToToday}
          onPrevious={navigateToPrevious}
          onNext={navigateToNext}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          categories={getCategories()}
          onCategoryFilter={handleCategoryFilter}
          multiSelect={multiSelect}
          selectable={selectable}
        />
      )}

      {showToolbar && (
        <CalendarViewToolbar
          currentDate={currentDateState}
          viewMode={viewModeState}
          dateRange={formatDateRange()}
          onViewModeChange={handleViewModeChange}
          onToday={navigateToToday}
          onPrevious={navigateToPrevious}
          onNext={navigateToNext}
          selectedEvents={getSelectedEvents()}
          onDeleteSelected={handleDeleteSelected}
          categories={getCategories()}
          onCategoryFilter={handleCategoryFilter}
          multiSelect={multiSelect}
          selectable={selectable}
        />
      )}

      <div
        ref={calendarRef}
        className="calendar-container relative w-full h-[600px] bg-white border rounded-lg overflow-hidden"
      >
        {renderCalendarView()}
      </div>
    </div>
  );
};

export default CalendarView;
