import React, { useState, useCallback, useRef } from 'react';
import { DashboardViewWidget } from './DashboardViewWidget';
import type { DashboardWidget, DashboardConfig } from './DashboardView';
import { useDragDropManager } from '@/hooks/useDragDropManager';

interface DashboardViewGridProps {
  widgets: DashboardWidget[];
  layout: 'grid' | 'free';
  theme: DashboardConfig['theme'];
  editable: boolean;
  onWidgetUpdate: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  onWidgetRemove: (widgetId: string) => void;
  onWidgetReorder: (widgets: DashboardWidget[]) => void;
}

const GRID_COLUMNS = 12;
const GRID_ROW_HEIGHT = 80;
const GRID_GAP = 16;

export const DashboardViewGrid: React.FC<DashboardViewGridProps> = ({
  widgets,
  layout,
  theme,
  editable,
  onWidgetUpdate,
  onWidgetRemove,
  onWidgetReorder,
}) => {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const {
    isDragging,
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  } = useDragDropManager({
    items: widgets,
    onReorder: onWidgetReorder,
    itemType: 'widget',
  });

  const handleWidgetResize = useCallback((widgetId: string, newSize: { width: number; height: number }) => {
    onWidgetUpdate(widgetId, {
      position: {
        ...widgets.find(w => w.id === widgetId)!.position,
        width: newSize.width,
        height: newSize.height
      }
    });
  }, [widgets, onWidgetUpdate]);

  const handleWidgetMove = useCallback((widgetId: string, newPosition: { x: number; y: number }) => {
    onWidgetUpdate(widgetId, {
      position: {
        ...widgets.find(w => w.id === widgetId)!.position,
        x: newPosition.x,
        y: newPosition.y
      }
    });
  }, [widgets, onWidgetUpdate]);

  const getGridStyle = () => {
    if (layout === 'grid') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
        gap: `${GRID_GAP}px`,
        padding: `${GRID_GAP}px`,
        backgroundColor: theme.background || '#f8fafc',
      };
    }
    return {
      position: 'relative' as const,
      backgroundColor: theme.background || '#f8fafc',
      padding: `${GRID_GAP}px`,
    };
  };

  const getWidgetPosition = (widget: DashboardWidget) => {
    if (layout === 'grid') {
      return {
        gridColumn: `${widget.position.x + 1} / span ${widget.position.width}`,
        gridRow: `${widget.position.y + 1} / span ${widget.position.height}`,
      };
    }
    return {
      position: 'absolute' as const,
      left: `${widget.position.x * (GRID_COLUMN_WIDTH + GRID_GAP)}px`,
      top: `${widget.position.y * GRID_ROW_HEIGHT}px`,
      width: `${widget.position.width * GRID_COLUMN_WIDTH - GRID_GAP}px`,
      height: `${widget.position.height * GRID_ROW_HEIGHT - GRID_GAP}px`,
    };
  };

  // Calculate column width for free layout
  const gridWidth = gridRef.current?.clientWidth || 1200;
  const GRID_COLUMN_WIDTH = (gridWidth - (GRID_COLUMNS + 1) * GRID_GAP) / GRID_COLUMNS;

  const handleDragOverGrid = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!editable || !isDragging) return;

    const gridRect = gridRef.current?.getBoundingClientRect();
    if (!gridRect) return;

    const x = Math.floor((e.clientX - gridRect.left - GRID_GAP) / (GRID_COLUMN_WIDTH + GRID_GAP));
    const y = Math.floor((e.clientY - gridRect.top - GRID_GAP) / GRID_ROW_HEIGHT);

    // Constrain to grid bounds
    const constrainedX = Math.max(0, Math.min(x, GRID_COLUMNS - 1));
    const constrainedY = Math.max(0, Math.min(y, 20)); // Max 20 rows

    if (draggedItem && draggedItem.id !== draggedWidget) {
      setDraggedWidget(draggedItem.id);
      handleWidgetMove(draggedItem.id, { x: constrainedX, y: constrainedY });
    }
  }, [editable, isDragging, draggedItem, draggedWidget, handleWidgetMove, GRID_COLUMN_WIDTH]);

  return (
    <div
      ref={gridRef}
      className="w-full h-full overflow-auto"
      style={getGridStyle()}
      onDragOver={handleDragOverGrid}
      onDrop={handleDrop}
    >
      {layout === 'grid' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid lines for visual guidance */}
          <div
            className="grid h-full opacity-20"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
              gap: `${GRID_GAP}px`,
              padding: `${GRID_GAP}px`,
            }}
          >
            {Array.from({ length: GRID_COLUMNS * 20 }).map((_, index) => (
              <div
                key={index}
                className="border border-dashed border-gray-300 rounded"
                style={{ minHeight: `${GRID_ROW_HEIGHT}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {widgets.map((widget) => (
        <div
          key={widget.id}
          style={getWidgetPosition(widget)}
          draggable={editable}
          onDragStart={(e) => editable && handleDragStart(e, widget)}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          className="transition-all duration-200"
        >
          <DashboardViewWidget
            widget={widget}
            theme={theme}
            editable={editable}
            onResize={(newSize) => handleWidgetResize(widget.id, newSize)}
            onRemove={() => onWidgetRemove(widget.id)}
            isDragging={draggedWidget === widget.id}
          />
        </div>
      ))}

      {widgets.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Aucun widget</div>
            <div className="text-sm">
              {editable
                ? 'Cliquez sur "Ajouter un widget" pour commencer'
                : 'Ce tableau de bord ne contient aucun widget'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardViewGrid;
