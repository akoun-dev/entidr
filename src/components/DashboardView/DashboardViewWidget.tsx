import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  MoreHorizontal,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trash2,
  GripVertical,
} from 'lucide-react';

import type { DashboardWidget, DashboardConfig } from './DashboardView';

interface DashboardViewWidgetProps {
  widget: DashboardWidget;
  theme: DashboardConfig['theme'];
  editable: boolean;
  onResize: (newSize: { width: number; height: number }) => void;
  onRemove: () => void;
  isDragging?: boolean;
}

const MIN_SIZE = { width: 2, height: 2 };
const MAX_SIZE = { width: 12, height: 10 };

export const DashboardViewWidget: React.FC<DashboardViewWidgetProps> = ({
  widget,
  theme,
  editable,
  onResize,
  onRemove,
  isDragging = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback((direction: 'width' | 'height', delta: number) => {
    if (!editable) return;

    const currentWidth = widget.position.width;
    const currentHeight = widget.position.height;

    let newWidth = currentWidth;
    let newHeight = currentHeight;

    if (direction === 'width') {
      newWidth = Math.max(MIN_SIZE.width, Math.min(MAX_SIZE.width, currentWidth + delta));
    } else {
      newHeight = Math.max(MIN_SIZE.height, Math.min(MAX_SIZE.height, currentHeight + delta));
    }

    onResize({ width: newWidth, height: newHeight });
  }, [widget.position.width, widget.position.height, editable, onResize]);

  const getWidgetStyle = () => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: theme.widgetBackground || '#ffffff',
      border: `1px solid ${theme.borderColor || '#e2e8f0'}`,
      color: theme.textColor || '#1e293b',
      transition: isDragging ? 'none' : 'all 0.2s ease',
      opacity: isDragging ? 0.5 : 1,
      cursor: isDragging ? 'grabbing' : 'default',
    };

    if (isExpanded) {
      return {
        ...baseStyle,
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        height: '90vh',
        maxWidth: '1200px',
        maxHeight: '800px',
        zIndex: 1000,
      };
    }

    return baseStyle;
  };

  const getWidgetTypeIcon = (type: string) => {
    switch (type) {
      case 'stats':
        return '📊';
      case 'chart':
        return '📈';
      case 'table':
        return '📋';
      case 'text':
        return '📝';
      case 'metric':
        return '🎯';
      default:
        return '📦';
    }
  };

  const getWidgetTypeLabel = (type: string) => {
    switch (type) {
      case 'stats':
        return 'Statistiques';
      case 'chart':
        return 'Graphique';
      case 'table':
        return 'Tableau';
      case 'text':
        return 'Texte';
      case 'metric':
        return 'Métrique';
      default:
        return 'Inconnu';
    }
  };

  return (
    <>
      <Card
        ref={widgetRef}
        className={`h-full shadow-sm hover:shadow-md transition-shadow ${
          isDragging ? 'shadow-lg' : ''
        }`}
        style={getWidgetStyle()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {editable && (
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              )}
              <div className="flex items-center gap-2">
                <span className="text-lg">{getWidgetTypeIcon(widget.type)}</span>
                <CardTitle className="text-sm font-semibold">
                  {widget.title}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {getWidgetTypeLabel(widget.type)}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {editable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsConfigOpen(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configurer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleResize('width', 1)}
                      disabled={widget.position.width >= MAX_SIZE.width}
                    >
                      <RotateCcw className="h-4 w-4 mr-2 rotate-90" />
                      Élargir
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleResize('height', 1)}
                      disabled={widget.position.height >= MAX_SIZE.height}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Agrandir
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleResize('width', -1)}
                      disabled={widget.position.width <= MIN_SIZE.width}
                    >
                      <RotateCcw className="h-4 w-4 mr-2 -rotate-90" />
                      Rétrécir
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleResize('height', -1)}
                      disabled={widget.position.height <= MIN_SIZE.height}
                    >
                      <RotateCcw className="h-4 w-4 mr-2 rotate-180" />
                      Réduire
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onRemove}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {widget.config?.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {widget.config.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="p-0 pt-0">
          <div className="h-full min-h-[200px] overflow-auto">
            {widget.content}
          </div>
        </CardContent>

        {/* Resize handles */}
        {editable && !isExpanded && (
          <>
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = widget.position.width;
                const startHeight = widget.position.height;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaY = moveEvent.clientY - startY;

                  // Calculate grid units (assuming ~100px per unit)
                  const widthDelta = Math.round(deltaX / 100);
                  const heightDelta = Math.round(deltaY / 80);

                  if (widthDelta !== 0) {
                    handleResize('width', widthDelta);
                  }
                  if (heightDelta !== 0) {
                    handleResize('height', heightDelta);
                  }
                };

                const handleMouseUp = () => {
                  setIsResizing(false);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="w-full h-full border-r-2 border-b-2 border-primary rounded-br" />
            </div>
          </>
        )}
      </Card>

      {/* Overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-999"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default DashboardViewWidget;
