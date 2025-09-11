import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Layers,
  Filter,
  Settings,
  Download,
  Upload,
  Share,
  Save,
  RotateCcw,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  Minus,
  Move,
  Maximize,
  Minimize,
  Navigation,
  Satellite,
  Map,
  Mountain,
  Moon,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Activity,
  Zap,
  Box
} from 'lucide-react';

export interface MapViewToolbarProps {
  activeTools: Set<string>;
  showWeather: boolean;
  showTraffic: boolean;
  show3D: boolean;
  showMeasurements: boolean;
  showLabels: boolean;
  isLocked: boolean;
  isFullscreen: boolean;
  onToolToggle: (tool: string) => void;
  onWeatherToggle: () => void;
  onTrafficToggle: () => void;
  on3DToggle: () => void;
  onMeasurementsToggle: () => void;
  onLabelsToggle: () => void;
  onLockToggle: () => void;
  onFullscreenToggle: () => void;
  onExport: (format: 'png' | 'jpg' | 'pdf' | 'svg') => void;
  onImport: () => void;
  onSave: () => void;
  onShare: () => void;
  onReset: () => void;
  className?: string;
}

export const MapViewToolbar: React.FC<MapViewToolbarProps> = ({
  activeTools,
  showWeather,
  showTraffic,
  show3D,
  showMeasurements,
  showLabels,
  isLocked,
  isFullscreen,
  onToolToggle,
  onWeatherToggle,
  onTrafficToggle,
  on3DToggle,
  onMeasurementsToggle,
  onLabelsToggle,
  onLockToggle,
  onFullscreenToggle,
  onExport,
  onImport,
  onSave,
  onShare,
  onReset,
  className = ''
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const handleExport = useCallback((format: 'png' | 'jpg' | 'pdf' | 'svg') => {
    onExport(format);
    setShowExportMenu(false);
  }, [onExport]);

  const tools = [
    { id: 'select', name: 'Sélection', icon: <MapPin className="h-4 w-4" /> },
    { id: 'draw', name: 'Dessiner', icon: <Edit className="h-4 w-4" /> },
    { id: 'measure', name: 'Mesurer', icon: <Gauge className="h-4 w-4" /> },
    { id: 'area', name: 'Surface', icon: <Grid3X3 className="h-4 w-4" /> },
    { id: 'route', name: 'Itinéraire', icon: <Navigation className="h-4 w-4" /> },
    { id: 'marker', name: 'Marqueur', icon: <MapPin className="h-4 w-4" /> },
    { id: 'polygon', name: 'Polygone', icon: <Grid3X3 className="h-4 w-4" /> },
    { id: 'polyline', name: 'Ligne', icon: <Activity className="h-4 w-4" /> },
    { id: 'circle', name: 'Cercle', icon: <Gauge className="h-4 w-4" /> },
    { id: 'text', name: 'Texte', icon: <Edit className="h-4 w-4" /> },
    { id: 'eraser', name: 'Gomme', icon: <Trash2 className="h-4 w-4" /> },
    { id: 'move', name: 'Déplacer', icon: <Move className="h-4 w-4" /> },
    { id: 'rotate', name: 'Rotation', icon: <RotateCcw className="h-4 w-4" /> },
    { id: 'scale', name: 'Échelle', icon: <Maximize className="h-4 w-4" /> },
  ];

  const viewOptions = [
    { id: 'street', name: 'Vue Rue', icon: <Map className="h-4 w-4" /> },
    { id: 'satellite', name: 'Vue Satellite', icon: <Satellite className="h-4 w-4" /> },
    { id: 'terrain', name: 'Vue Terrain', icon: <Mountain className="h-4 w-4" /> },
    { id: 'dark', name: 'Vue Sombre', icon: <Moon className="h-4 w-4" /> },
    { id: 'light', name: 'Vue Claire', icon: <Sun className="h-4 w-4" /> },
  ];

  const getToolIcon = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    return tool ? tool.icon : <MapPin className="h-4 w-4" />;
  };

  const getToolName = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    return tool ? tool.name : 'Inconnu';
  };

  return (
    <div className={`map-view-toolbar ${className}`}>
      <div className="flex items-center justify-between p-3 bg-white border-b">
        {/* Section gauche - Outils de dessin et édition */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant={showToolsMenu ? "default" : "outline"}
              size="sm"
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              title="Outils"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {showToolsMenu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Outils de dessin</div>
                  <div className="grid grid-cols-2 gap-1">
                    {tools.slice(0, 8).map(tool => (
                      <Button
                        key={tool.id}
                        variant={activeTools.has(tool.id) ? "default" : "ghost"}
                        size="sm"
                        className="justify-start h-8 px-2"
                        onClick={() => onToolToggle(tool.id)}
                        title={tool.name}
                      >
                        {tool.icon}
                        <span className="ml-2 text-xs">{tool.name}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="text-xs font-medium text-gray-500 mb-2 mt-3">Outils d'édition</div>
                  <div className="grid grid-cols-2 gap-1">
                    {tools.slice(8).map(tool => (
                      <Button
                        key={tool.id}
                        variant={activeTools.has(tool.id) ? "default" : "ghost"}
                        size="sm"
                        className="justify-start h-8 px-2"
                        onClick={() => onToolToggle(tool.id)}
                        title={tool.name}
                      >
                        {tool.icon}
                        <span className="ml-2 text-xs">{tool.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-l pl-2 flex items-center space-x-1">
            {Array.from(activeTools).slice(0, 3).map(toolId => (
              <Badge
                key={toolId}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-gray-200"
                onClick={() => onToolToggle(toolId)}
                title={getToolName(toolId)}
              >
                {getToolIcon(toolId)}
                <span className="ml-1">{getToolName(toolId)}</span>
              </Badge>
            ))}
            {activeTools.size > 3 && (
              <Badge variant="outline" className="text-xs">
                +{activeTools.size - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Section centre - Options de vue et couches */}
        <div className="flex items-center space-x-2">
          {/* Menu de vue */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowViewMenu(!showViewMenu)}
              title="Options de vue"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {showViewMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Style de carte</div>
                  <div className="space-y-1">
                    {viewOptions.map(option => (
                      <Button
                        key={option.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          // onViewChange(option.id);
                          setShowViewMenu(false);
                        }}
                      >
                        {option.icon}
                        <span className="ml-2 text-xs">{option.name}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="text-xs font-medium text-gray-500 mb-2 mt-3">Couches d'information</div>
                  <div className="space-y-1">
                    <Button
                      variant={showWeather ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        onWeatherToggle();
                        setShowViewMenu(false);
                      }}
                    >
                      <Cloud className="h-4 w-4" />
                      <span className="ml-2 text-xs">Météo</span>
                      {showWeather && <Eye className="h-3 w-3 ml-auto" />}
                    </Button>

                    <Button
                      variant={showTraffic ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        onTrafficToggle();
                        setShowViewMenu(false);
                      }}
                    >
                      <Activity className="h-4 w-4" />
                      <span className="ml-2 text-xs">Trafic</span>
                      {showTraffic && <Eye className="h-3 w-3 ml-auto" />}
                    </Button>

                    <Button
                      variant={show3D ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        on3DToggle();
                        setShowViewMenu(false);
                      }}
                    >
                      <Box className="h-4 w-4" />
                      <span className="ml-2 text-xs">Vue 3D</span>
                      {show3D && <Eye className="h-3 w-3 ml-auto" />}
                    </Button>

                    <Button
                      variant={showMeasurements ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        onMeasurementsToggle();
                        setShowViewMenu(false);
                      }}
                    >
                      <Gauge className="h-4 w-4" />
                      <span className="ml-2 text-xs">Mesures</span>
                      {showMeasurements && <Eye className="h-3 w-3 ml-auto" />}
                    </Button>

                    <Button
                      variant={showLabels ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        onLabelsToggle();
                        setShowViewMenu(false);
                      }}
                    >
                      <List className="h-4 w-4" />
                      <span className="ml-2 text-xs">Étiquettes</span>
                      {showLabels && <Eye className="h-3 w-3 ml-auto" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Boutons rapides pour les couches */}
          <Button
            variant={showWeather ? "default" : "outline"}
            size="sm"
            onClick={onWeatherToggle}
            title="Météo"
          >
            <Cloud className="h-4 w-4" />
          </Button>

          <Button
            variant={showTraffic ? "default" : "outline"}
            size="sm"
            onClick={onTrafficToggle}
            title="Trafic"
          >
            <Activity className="h-4 w-4" />
          </Button>

          <Button
            variant={show3D ? "default" : "outline"}
            size="sm"
            onClick={on3DToggle}
            title="Vue 3D"
          >
            <Box className="h-4 w-4" />
          </Button>

          <Button
            variant={showMeasurements ? "default" : "outline"}
            size="sm"
            onClick={onMeasurementsToggle}
            title="Mesures"
          >
            <Gauge className="h-4 w-4" />
          </Button>

          <Button
            variant={showLabels ? "default" : "outline"}
            size="sm"
            onClick={onLabelsToggle}
            title="Étiquettes"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Section droite - Actions système */}
        <div className="flex items-center space-x-2">
          {/* Verrouillage */}
          <Button
            variant={isLocked ? "default" : "outline"}
            size="sm"
            onClick={onLockToggle}
            title={isLocked ? "Déverrouiller" : "Verrouiller"}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>

          {/* Plein écran */}
          <Button
            variant={isFullscreen ? "default" : "outline"}
            size="sm"
            onClick={onFullscreenToggle}
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          {/* Export */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Exporter"
            >
              <Download className="h-4 w-4" />
            </Button>

            {showExportMenu && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('png')}
                  >
                    <span className="text-xs">Exporter en PNG</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('jpg')}
                  >
                    <span className="text-xs">Exporter en JPG</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('pdf')}
                  >
                    <span className="text-xs">Exporter en PDF</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('svg')}
                  >
                    <span className="text-xs">Exporter en SVG</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Import */}
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            title="Importer"
          >
            <Upload className="h-4 w-4" />
          </Button>

          {/* Sauvegarder */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            title="Sauvegarder"
          >
            <Save className="h-4 w-4" />
          </Button>

          {/* Partager */}
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            title="Partager"
          >
            <Share className="h-4 w-4" />
          </Button>

          {/* Réinitialiser */}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            title="Réinitialiser"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Barre d'état */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-50 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Settings className="h-3 w-3" />
            <span>
              {activeTools.size} outil{activeTools.size !== 1 ? 's' : ''} actif{activeTools.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>
              {[
                showWeather && 'Météo',
                showTraffic && 'Trafic',
                show3D && '3D',
                showMeasurements && 'Mesures',
                showLabels && 'Étiquettes'
              ].filter(Boolean).join(', ') || 'Aucune couche active'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            {isLocked ? 'Carte verrouillée' : 'Carte déverrouillée'}
          </div>
          <div>
            {isFullscreen ? 'Mode plein écran' : 'Mode fenêtré'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewToolbar;
