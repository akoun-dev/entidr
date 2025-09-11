import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Move,
  Search
} from 'lucide-react';

export interface TimelineViewZoomProps {
  zoomLevel: number;
  onZoomChange: (zoomLevel: number) => void;
  orientation: 'horizontal' | 'vertical';
  className?: string;
}

export const TimelineViewZoom: React.FC<TimelineViewZoomProps> = ({
  zoomLevel,
  onZoomChange,
  orientation,
  className = ''
}) => {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomLevel + 0.25, 3);
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomLevel - 0.25, 0.25);
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    onZoomChange(1);
  }, [onZoomChange]);

  const handleZoomFit = useCallback(() => {
    // Zoom pour ajuster tout le contenu visible
    onZoomChange(1);
  }, [onZoomChange]);

  const handleSliderChange = useCallback((values: number[]) => {
    onZoomChange(values[0]);
  }, [onZoomChange]);

  const getZoomLabel = (level: number): string => {
    if (level <= 0.5) return 'Vue éloignée';
    if (level <= 1) return 'Vue normale';
    if (level <= 1.5) return 'Vue rapprochée';
    if (level <= 2) return 'Vue très rapprochée';
    return 'Vue ultra rapprochée';
  };

  const getZoomPercentage = (level: number): string => {
    return `${Math.round(level * 100)}%`;
  };

  const renderHorizontalZoom = () => (
    <div className={`timeline-zoom-horizontal absolute bottom-12 right-4 bg-white border rounded-lg shadow-lg p-3 ${className}`}>
      {/* Contrôles de base */}
      <div className="flex items-center space-x-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.25}
          title="Zoom arrière"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-xs font-medium text-gray-700">
            {getZoomPercentage(zoomLevel)}
          </span>
          <span className="text-xs text-gray-500">
            {getZoomLabel(zoomLevel)}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          title="Zoom avant"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-gray-200"></div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomReset}
          title="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomFit}
          title="Ajuster à la vue"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          title="Plus d'options"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Slider de zoom */}
      <div className="mb-3">
        <Slider
          value={[zoomLevel]}
          onValueChange={handleSliderChange}
          min={0.25}
          max={3}
          step={0.25}
          className="w-48"
        />
      </div>

      {/* Contrôles avancés */}
      {showAdvancedControls && (
        <div className="border-t pt-3 space-y-2">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Options de zoom avancées
          </div>

          {/* Préréglages de zoom */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(0.5)}
              className="text-xs justify-start"
            >
              <ZoomOut className="h-3 w-3 mr-1" />
              50% - Vue éloignée
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(0.75)}
              className="text-xs justify-start"
            >
              <ZoomOut className="h-3 w-3 mr-1" />
              75% - Vue large
            </Button>
            <Button
              variant={zoomLevel === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => onZoomChange(1)}
              className="text-xs justify-start"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              100% - Vue normale
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(1.5)}
              className="text-xs justify-start"
            >
              <ZoomIn className="h-3 w-3 mr-1" />
              150% - Vue détaillée
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(2)}
              className="text-xs justify-start"
            >
              <ZoomIn className="h-3 w-3 mr-1" />
              200% - Vue très détaillée
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(3)}
              className="text-xs justify-start"
            >
              <ZoomIn className="h-3 w-3 mr-1" />
              300% - Vue maximale
            </Button>
          </div>

          {/* Mode panoramique */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Move className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600">Mode panoramique</span>
            </div>
            <Button
              variant={isPanning ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPanning(!isPanning)}
              className="text-xs"
            >
              {isPanning ? "Actif" : "Inactif"}
            </Button>
          </div>

          {/* Informations */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            <div className="flex justify-between">
              <span>Niveau de zoom actuel:</span>
              <span className="font-medium">{getZoomPercentage(zoomLevel)}</span>
            </div>
            <div className="flex justify-between">
              <span>Plage de zoom:</span>
              <span className="font-medium">25% - 300%</span>
            </div>
            <div className="flex justify-between">
              <span>Incrément:</span>
              <span className="font-medium">25%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVerticalZoom = () => (
    <div className={`timeline-zoom-vertical absolute top-4 right-12 bg-white border rounded-lg shadow-lg p-3 ${className}`}>
      {/* Contrôles de base */}
      <div className="flex flex-col items-center space-y-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          title="Zoom avant"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-xs font-medium text-gray-700">
            {getZoomPercentage(zoomLevel)}
          </span>
          <span className="text-xs text-gray-500">
            {getZoomLabel(zoomLevel)}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.25}
          title="Zoom arrière"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="h-px w-8 bg-gray-200 my-1"></div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomReset}
          title="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomFit}
          title="Ajuster à la vue"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          title="Plus d'options"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Slider de zoom vertical */}
      <div className="mb-3">
        <Slider
          value={[zoomLevel]}
          onValueChange={handleSliderChange}
          min={0.25}
          max={3}
          step={0.25}
          className="h-48"
          orientation="vertical"
        />
      </div>

      {/* Contrôles avancés */}
      {showAdvancedControls && (
        <div className="border-t pt-3 space-y-2 min-w-[200px]">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Options de zoom avancées
          </div>

          {/* Préréglages de zoom */}
          <div className="grid grid-cols-1 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(0.5)}
              className="text-xs justify-start"
            >
              <ZoomOut className="h-3 w-3 mr-1" />
              50% - Vue éloignée
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(0.75)}
              className="text-xs justify-start"
            >
              <ZoomOut className="h-3 w-3 mr-1" />
              75% - Vue large
            </Button>
            <Button
              variant={zoomLevel === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => onZoomChange(1)}
              className="text-xs justify-start"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              100% - Vue normale
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(1.5)}
              className="text-xs justify-start"
            >
              <ZoomIn className="h-3 w-3 mr-1" />
              150% - Vue détaillée
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(2)}
              className="text-xs justify-start"
            >
              <ZoomIn className="h-3 w-3 mr-1" />
              200% - Vue très détaillée
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(3)}
              className="text-xs justify-start"
            >
              <ZoomIn className="h-3 w-3 mr-1" />
              300% - Vue maximale
            </Button>
          </div>

          {/* Mode panoramique */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Move className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600">Mode panoramique</span>
            </div>
            <Button
              variant={isPanning ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPanning(!isPanning)}
              className="text-xs"
            >
              {isPanning ? "Actif" : "Inactif"}
            </Button>
          </div>

          {/* Informations */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            <div className="flex justify-between">
              <span>Niveau de zoom actuel:</span>
              <span className="font-medium">{getZoomPercentage(zoomLevel)}</span>
            </div>
            <div className="flex justify-between">
              <span>Plage de zoom:</span>
              <span className="font-medium">25% - 300%</span>
            </div>
            <div className="flex justify-between">
              <span>Incrément:</span>
              <span className="font-medium">25%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return orientation === 'horizontal' ? renderHorizontalZoom() : renderVerticalZoom();
};

export default TimelineViewZoom;
