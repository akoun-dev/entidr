import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TimelineViewHeader } from './TimelineViewHeader';
import { TimelineViewToolbar } from './TimelineViewToolbar';
import { TimelineViewAxis } from './TimelineViewAxis';
import { TimelineViewItem } from './TimelineViewItem';
import { TimelineViewZoom } from './TimelineViewZoom';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  type: 'event' | 'milestone' | 'period' | 'task';
  category?: string;
  color?: string;
  icon?: React.ReactNode;
  progress?: number; // 0-100 pour les tâches
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  tags?: string[];
  metadata?: Record<string, any>;
  selected?: boolean;
}

export interface TimelineViewProps {
  events: TimelineEvent[];
  className?: string;
  multiSelect?: boolean;
  selectable?: boolean;
  showToolbar?: boolean;
  showHeader?: boolean;
  showAxis?: boolean;
  showZoom?: boolean;
  initialStartDate?: Date;
  initialEndDate?: Date;
  initialZoomLevel?: number;
  timeScale?: 'days' | 'weeks' | 'months' | 'years';
  orientation?: 'horizontal' | 'vertical';
  onEventSelect?: (event: TimelineEvent) => void;
  onEventDoubleClick?: (event: TimelineEvent) => void;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  onZoomChange?: (zoomLevel: number) => void;
  onEventCreate?: (date: Date) => void;
  onEventUpdate?: (event: TimelineEvent) => void;
  onEventDelete?: (events: TimelineEvent[]) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  className = '',
  multiSelect = false,
  selectable = true,
  showToolbar = true,
  showHeader = true,
  showAxis = true,
  showZoom = true,
  initialStartDate,
  initialEndDate,
  initialZoomLevel = 1,
  timeScale = 'months',
  orientation = 'horizontal',
  onEventSelect,
  onEventDoubleClick,
  onDateRangeChange,
  onZoomChange,
  onEventCreate,
  onEventUpdate,
  onEventDelete
}) => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(events);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(initialZoomLevel);
  const [timeScaleState, setTimeScaleState] = useState(timeScale);
  const [orientationState, setOrientationState] = useState(orientation);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    // Calculer la plage de dates initiale
    const now = new Date();
    const start = initialStartDate || new Date(now.getFullYear(), 0, 1);
    const end = initialEndDate || new Date(now.getFullYear(), 11, 31);
    return { start, end };
  });
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const timelineRef = useRef<HTMLDivElement>(null);

  // Mettre à jour les événements quand ils changent
  useEffect(() => {
    setTimelineEvents(events);
  }, [events]);

  // Calculer la viewport
  useEffect(() => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      setViewport({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    }
  }, [timelineEvents, zoomLevel, timeScaleState]);

  // Filtrer et traiter les événements pour la plage de dates visible
  const visibleEvents = useMemo(() => {
    return timelineEvents.filter(event => {
      const eventStart = event.startDate;
      const eventEnd = event.endDate || event.startDate;

      return eventStart <= dateRange.end && eventEnd >= dateRange.start;
    }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [timelineEvents, dateRange]);

  const handleEventSelect = useCallback((event: TimelineEvent) => {
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

  const handleEventDoubleClick = useCallback((event: TimelineEvent) => {
    onEventDoubleClick?.(event);
  }, [onEventDoubleClick]);

  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
    onDateRangeChange?.(start, end);
  }, [onDateRangeChange]);

  const handleZoomChange = useCallback((newZoomLevel: number) => {
    setZoomLevel(newZoomLevel);
    onZoomChange?.(newZoomLevel);
  }, [onZoomChange]);

  const handleTimeScaleChange = useCallback((scale: 'days' | 'weeks' | 'months' | 'years') => {
    setTimeScaleState(scale);
  }, []);

  const handleOrientationChange = useCallback((newOrientation: 'horizontal' | 'vertical') => {
    setOrientationState(newOrientation);
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

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (e.target === timelineRef.current && onEventCreate) {
      // Calculer la date correspondant à la position du clic
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convertir la position en date (simplifié)
      const timeRatio = clickX / rect.width;
      const timeDiff = dateRange.end.getTime() - dateRange.start.getTime();
      const clickedDate = new Date(dateRange.start.getTime() + timeDiff * timeRatio);

      onEventCreate(clickedDate);
    }
  }, [dateRange, onEventCreate]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (e.target === timelineRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Calculer le déplacement en temps
    const timePerPixel = (dateRange.end.getTime() - dateRange.start.getTime()) / viewport.width;
    const timeDelta = deltaX * timePerPixel;

    const newStart = new Date(dateRange.start.getTime() - timeDelta);
    const newEnd = new Date(dateRange.end.getTime() - timeDelta);

    handleDateRangeChange(newStart, newEnd);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, dateRange, viewport.width, handleDateRangeChange]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Gestion du drag de la timeline
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const getSelectedEvents = useCallback(() => {
    return visibleEvents.filter(event => selectedEvents.has(event.id));
  }, [selectedEvents, visibleEvents]);

  const calculateEventPosition = useCallback((event: TimelineEvent) => {
    const totalTime = dateRange.end.getTime() - dateRange.start.getTime();
    const eventTime = event.startDate.getTime() - dateRange.start.getTime();

    if (orientationState === 'horizontal') {
      const left = (eventTime / totalTime) * 100;
      const width = event.endDate
        ? ((event.endDate.getTime() - event.startDate.getTime()) / totalTime) * 100
        : 2; // Largeur minimale pour les événements ponctuels

      return { left, width, top: 0, height: 100 };
    } else {
      const top = (eventTime / totalTime) * 100;
      const height = event.endDate
        ? ((event.endDate.getTime() - event.startDate.getTime()) / totalTime) * 100
        : 2;

      return { left: 0, width: 100, top, height };
    }
  }, [dateRange, orientationState]);

  return (
    <div className={`timeline-view ${className}`}>
      {showHeader && (
        <TimelineViewHeader
          title="Timeline"
          eventCount={visibleEvents.length}
          selectedCount={selectedEvents.size}
          dateRange={dateRange}
          timeScale={timeScaleState}
          orientation={orientationState}
          onTimeScaleChange={handleTimeScaleChange}
          onOrientationChange={handleOrientationChange}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          multiSelect={multiSelect}
          selectable={selectable}
        />
      )}

      {showToolbar && (
        <TimelineViewToolbar
          dateRange={dateRange}
          zoomLevel={zoomLevel}
          timeScale={timeScaleState}
          orientation={orientationState}
          onDateRangeChange={handleDateRangeChange}
          onZoomChange={handleZoomChange}
          onTimeScaleChange={handleTimeScaleChange}
          onOrientationChange={handleOrientationChange}
          selectedEvents={getSelectedEvents()}
          onDeleteSelected={handleDeleteSelected}
          multiSelect={multiSelect}
          selectable={selectable}
        />
      )}

      <div
        ref={timelineRef}
        className="timeline-container relative overflow-hidden bg-gray-50 border rounded-lg"
        style={{
          height: orientationState === 'horizontal' ? '400px' : '600px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onClick={handleTimelineClick}
        onMouseDown={handleDragStart}
      >
        {showAxis && (
          <TimelineViewAxis
            dateRange={dateRange}
            timeScale={timeScaleState}
            orientation={orientationState}
            zoomLevel={zoomLevel}
            viewport={viewport}
          />
        )}

        {/* Événements */}
        <div className="timeline-events absolute inset-0">
          {visibleEvents.map((event) => {
            const position = calculateEventPosition(event);
            const isSelected = selectedEvents.has(event.id);

            return (
              <TimelineViewItem
                key={event.id}
                event={event}
                position={position}
                isSelected={isSelected}
                orientation={orientationState}
                selectable={selectable}
                onSelect={() => handleEventSelect(event)}
                onDoubleClick={() => handleEventDoubleClick(event)}
              />
            );
          })}
        </div>

        {showZoom && (
          <TimelineViewZoom
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
            orientation={orientationState}
          />
        )}
      </div>
    </div>
  );
};

export default TimelineView;
