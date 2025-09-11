import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Eye,
  EyeOff,
  Settings,
  Plus,
  Trash2,
  MoreVertical,
  Map,
  Satellite,
  Navigation,
  Thermometer,
  MapPin
} from 'lucide-react';
import { MapLayer } from './MapView';

export interface MapViewLayersProps {
  layers: MapLayer[];
  onLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  className?: string;
}

export const MapViewLayers: React.FC<MapViewLayersProps> = ({
  layers,
  onLayerVisibilityChange,
  onLayerOpacityChange,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showLayerSettings, setShowLayerSettings] = useState<string | null>(null);

  const getLayerIcon = (type: MapLayer['type']) => {
    switch (type) {
      case 'tile':
        return <Map className="h-4 w-4" />;
      case 'vector':
        return <Navigation className="h-4 w-4" />;
      case 'heatmap':
        return <Thermometer className="h-4 w-4" />;
      case 'marker':
        return <MapPin className="h-4 w-4" />;
      case 'route':
        return <Satellite className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const getLayerTypeLabel = (type: MapLayer['type']) => {
    switch (type) {
      case 'tile': return 'Tuiles';
      case 'vector': return 'Vecteur';
      case 'heatmap': return 'Carte de chaleur';
      case 'marker': return 'Marqueurs';
      case 'route': return 'Itinéraires';
      default: return 'Autre';
    }
  };

  const getLayerTypeColor = (type: MapLayer['type']) => {
    switch (type) {
      case 'tile': return 'bg-blue-100 text-blue-800';
      case 'vector': return 'bg-green-100 text-green-800';
      case 'heatmap': return 'bg-red-100 text-red-800';
      case 'marker': return 'bg-purple-100 text-purple-800';
      case 'route': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVisibilityToggle = (layerId: string, currentVisible: boolean) => {
    onLayerVisibilityChange(layerId, !currentVisible);
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    onLayerOpacityChange(layerId, opacity);
  };

  const toggleLayerSettings = (layerId: string) => {
    setShowLayerSettings(showLayerSettings === layerId ? null : layerId);
  };

  const renderLayerItem = (layer: MapLayer) => {
    const isSettingsOpen = showLayerSettings === layer.id;

    return (
      <div key={layer.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Icône de visibilité */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVisibilityToggle(layer.id, layer.visible)}
              className="p-1 h-auto"
              title={layer.visible ? 'Masquer la couche' : 'Afficher la couche'}
            >
              {layer.visible ? (
                <Eye className="h-4 w-4 text-blue-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
            </Button>

            {/* Icône et nom de la couche */}
            <div className="flex items-center space-x-2 flex-1">
              <div className="text-gray-600">
                {getLayerIcon(layer.type)}
              </div>
              <div>
                <h4 className="text-sm font-medium">{layer.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${getLayerTypeColor(layer.type)}`}>
                    {getLayerTypeLabel(layer.type)}
                  </Badge>
                  {layer.url && (
                    <Badge variant="secondary" className="text-xs">
                      URL
                    </Badge>
                  )}
                  {layer.data && (
                    <Badge variant="secondary" className="text-xs">
                      {layer.data.length} éléments
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleLayerSettings(layer.id)}
              className="p-1 h-auto"
              title="Paramètres de la couche"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-red-600 hover:text-red-700"
              title="Supprimer la couche"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contrôles d'opacité */}
        <div className="mt-3 flex items-center space-x-3">
          <span className="text-xs text-gray-600 w-16">Opacité:</span>
          <div className="flex-1">
            <Slider
              value={[layer.opacity]}
              onValueChange={(values) => handleOpacityChange(layer.id, values[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
          <span className="text-xs text-gray-600 w-10 text-right">
            {Math.round(layer.opacity * 100)}%
          </span>
        </div>

        {/* Paramètres avancés */}
        {isSettingsOpen && (
          <div className="mt-3 pt-3 border-t space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Paramètres de la couche
            </div>

            {/* URL de la couche */}
            {layer.url && (
              <div>
                <label className="text-xs text-gray-600">URL de la couche:</label>
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono break-all">
                  {layer.url}
                </div>
              </div>
            )}

            {/* Style personnalisé */}
            {layer.style && Object.keys(layer.style).length > 0 && (
              <div>
                <label className="text-xs text-gray-600">Style personnalisé:</label>
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(layer.style, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Métadonnées */}
            {layer.metadata && Object.keys(layer.metadata).length > 0 && (
              <div>
                <label className="text-xs text-gray-600">Métadonnées:</label>
                <div className="mt-1 space-y-1">
                  {Object.entries(layer.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500">{key}:</span>
                      <span className="font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions supplémentaires */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Dupliquer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Map className="h-3 w-3 mr-1" />
                Exporter
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`map-view-layers absolute top-4 right-4 bg-white border rounded-lg shadow-lg z-30 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between p-3 border-b cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-semibold">Couches</h3>
          <Badge variant="secondary" className="text-xs">
            {layers.filter(l => l.visible).length}/{layers.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          {expanded ? (
            <MoreVertical className="h-4 w-4 transform rotate-90" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Contenu */}
      {expanded && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Bouton d'ajout */}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une couche
          </Button>

          {/* Liste des couches */}
          {layers.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              Aucune couche disponible
            </div>
          ) : (
            <div className="space-y-2">
              {layers.map(renderLayerItem)}
            </div>
          )}

          {/* Statistiques */}
          {layers.length > 0 && (
            <div className="pt-3 border-t text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Couches visibles:</span>
                <span className="font-medium">{layers.filter(l => l.visible).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Couches totales:</span>
                <span className="font-medium">{layers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Types de couches:</span>
                <span className="font-medium">
                  {new Set(layers.map(l => l.type)).size}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapViewLayers;
