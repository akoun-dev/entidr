import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Search,
  MoreVertical,
  Plus,
  Settings,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Users,
  Navigation,
  Bell,
  Trash2,
  Tag
} from 'lucide-react';

export interface MapLocation {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  type: 'event' | 'task' | 'reminder' | 'meeting' | 'holiday' | 'custom';
  status?: 'active' | 'inactive' | 'pending' | 'completed';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  category?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'marker' | 'heatmap' | 'polygon' | 'polyline' | 'circle';
  visible: boolean;
  opacity: number;
  data: MapLocation[] | any;
  style?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface MapViewProps {
  locations: MapLocation[];
  layers: MapLayer[];
  selectedLocations: Set<string>;
  center: { latitude: number; longitude: number };
  zoom: number;
  bearing: number;
  pitch: number;
  selectable: boolean;
  showControls: boolean;
  showLayers: boolean;
  showSearch: boolean;
  mapStyle: 'street' | 'satellite' | 'terrain' | 'dark';
  onLocationSelect: (location: MapLocation) => void;
  onLocationDoubleClick: (location: MapLocation) => void;
  onMapClick: (coordinates: { latitude: number; longitude: number }) => void;
  onMapMove: (center: { latitude: number; longitude: number }, zoom: number) => void;
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onLocationAdd: (coordinates: { latitude: number; longitude: number }) => void;
  onLocationDelete: (locationId: string) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  locations,
  layers,
  selectedLocations,
  center,
  zoom,
  bearing,
  pitch,
  selectable,
  showControls,
  showLayers,
  showSearch,
  mapStyle,
  onLocationSelect,
  onLocationDoubleClick,
  onMapClick,
  onMapMove,
  onLayerToggle,
  onLocationAdd,
  onLocationDelete,
  className = ''
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Filtrer les locations visibles
  const visibleLocations = useMemo(() => {
    const visibleLayerIds = layers.filter(layer => layer.visible).map(layer => layer.id);
    return locations.filter(location => {
      const matchesSearch = !searchTerm ||
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const isInVisibleLayer = visibleLayerIds.some(layerId => {
        const layer = layers.find(l => l.id === layerId);
        return layer && layer.data.some((data: MapLocation) => data.id === location.id);
      });

      return matchesSearch && isInVisibleLayer;
    });
  }, [locations, layers, searchTerm]);

  // Grouper les locations par catégorie
  const locationsByCategory = useMemo(() => {
    const groups = new Map<string, MapLocation[]>();

    visibleLocations.forEach(location => {
      const category = location.category || 'Non classé';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(location);
    });

    return groups;
  }, [visibleLocations]);

  // Grouper les locations par type
  const locationsByType = useMemo(() => {
    const groups = new Map<string, MapLocation[]>();

    visibleLocations.forEach(location => {
      const type = location.type;
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)!.push(location);
    });

    return groups;
  }, [visibleLocations]);

  const getLocationColor = (location: MapLocation): string => {
    if (location.color) {
      return location.color;
    }

    switch (location.type) {
      case 'event':
        return '#3b82f6';
      case 'task':
        return '#22c55e';
      case 'reminder':
        return '#f59e0b';
      case 'meeting':
        return '#a855f7';
      case 'holiday':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getLocationIcon = (type: MapLocation['type']) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'task':
        return <Clock className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'holiday':
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: MapLocation['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: MapLocation['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: MapLocation['type']) => {
    switch (type) {
      case 'event':
        return 'Événement';
      case 'task':
        return 'Tâche';
      case 'reminder':
        return 'Rappel';
      case 'meeting':
        return 'Réunion';
      case 'holiday':
        return 'Jour férié';
      default:
        return 'Autre';
    }
  };

  const handleLocationClick = useCallback((location: MapLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    onLocationSelect(location);
  }, [onLocationSelect]);

  const handleLocationDoubleClick = useCallback((location: MapLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    onLocationDoubleClick(location);
  }, [onLocationDoubleClick]);

  const handleMapClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Simuler des coordonnées pour le clic
    const coordinates = {
      latitude: center.latitude + (Math.random() - 0.5) * 0.01,
      longitude: center.longitude + (Math.random() - 0.5) * 0.01
    };
    onMapClick(coordinates);
  }, [center, onMapClick]);

  const handleZoomIn = useCallback(() => {
    onMapMove(center, Math.min(zoom + 1, 20));
  }, [center, zoom, onMapMove]);

  const handleZoomOut = useCallback(() => {
    onMapMove(center, Math.max(zoom - 1, 1));
  }, [center, zoom, onMapMove]);

  const handleResetView = useCallback(() => {
    onMapMove({ latitude: 0, longitude: 0 }, 10);
  }, [onMapMove]);

  const handleLayerToggle = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      onLayerToggle(layerId, !layer.visible);
    }
  }, [layers, onLayerToggle]);

  // Simuler le chargement de la carte
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderLocationCard = (location: MapLocation) => {
    const isSelected = selectedLocations.has(location.id);
    const isHovered = hoveredLocation === location.id;

    return (
      <Card
        key={location.id}
        className={`location-card cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${isHovered ? 'shadow-md' : ''}`}
        onClick={(e) => handleLocationClick(location, e)}
        onDoubleClick={(e) => handleLocationDoubleClick(location, e)}
        onMouseEnter={() => setHoveredLocation(location.id)}
        onMouseLeave={() => setHoveredLocation(null)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: getLocationColor(location) }}
              >
                {getLocationIcon(location.type)}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate">
                  {location.name}
                </CardTitle>
                <div className="flex items-center space-x-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(location.type)}
                  </Badge>
                  {location.category && (
                    <Badge variant="secondary" className="text-xs">
                      {location.category}
                    </Badge>
                  )}
                  {location.status && (
                    <Badge variant="outline" className={`text-xs ${getStatusColor(location.status)}`}>
                      {location.status === 'active' ? 'Actif' :
                       location.status === 'inactive' ? 'Inactif' :
                       location.status === 'pending' ? 'En attente' :
                       location.status === 'completed' ? 'Terminé' : location.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onLocationDelete(location.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {location.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {location.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
            {location.priority && (
              <Badge variant="outline" className={`text-xs ${getPriorityColor(location.priority)}`}>
                {location.priority === 'urgent' ? 'Urgent' :
                 location.priority === 'high' ? 'Haute' :
                 location.priority === 'medium' ? 'Moyenne' :
                 location.priority === 'low' ? 'Basse' : location.priority}
              </Badge>
            )}
          </div>

          {location.tags && location.tags.length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              <Tag className="h-3 w-3 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {location.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {location.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{location.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`map-view relative h-full ${className}`}>
      {/* Carte simulée */}
      <div
        className="map-canvas absolute inset-0 bg-gray-100 border rounded-lg overflow-hidden"
        onClick={handleMapClick}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        )}

        {mapLoaded && (
          <>
            {/* Simuler des marqueurs sur la carte */}
            <div className="absolute inset-0">
              {visibleLocations.slice(0, 10).map((location, index) => {
                const isSelected = selectedLocations.has(location.id);
                const isHovered = hoveredLocation === location.id;

                // Position aléatoire pour la simulation
                const top = 20 + (index * 7) % 60;
                const left = 20 + (index * 13) % 70;

                return (
                  <div
                    key={location.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                      isSelected ? 'scale-125 z-20' : ''
                    } ${isHovered ? 'scale-110 z-10' : ''}`}
                    style={{ top: `${top}%`, left: `${left}%` }}
                    onClick={(e) => handleLocationClick(location, e)}
                    onDoubleClick={(e) => handleLocationDoubleClick(location, e)}
                    onMouseEnter={() => setHoveredLocation(location.id)}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white ${
                        isSelected ? 'ring-4 ring-blue-300' : ''
                      }`}
                      style={{ backgroundColor: getLocationColor(location) }}
                    >
                      {getLocationIcon(location.type)}
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
                        {location.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Contrôles de la carte */}
            {showControls && (
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-md"
                  onClick={handleZoomIn}
                  title="Zoomer"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-md"
                  onClick={handleZoomOut}
                  title="Dézoomer"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-md"
                  onClick={handleResetView}
                  title="Réinitialiser la vue"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Bouton des couches */}
            {showLayers && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 left-4 bg-white shadow-md"
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                title="Couches"
              >
                <Layers className="h-4 w-4" />
              </Button>
            )}

            {/* Bouton de recherche */}
            {showSearch && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 left-20 bg-white shadow-md"
                onClick={() => setShowSearchPanel(!showSearchPanel)}
                title="Rechercher"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* Bouton d'ajout */}
            {selectable && (
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-4 right-4 bg-white shadow-md"
                onClick={() => onLocationAdd({
                  latitude: center.latitude,
                  longitude: center.longitude
                })}
                title="Ajouter un emplacement"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>

      {/* Panneau des couches */}
      {showLayerPanel && mapLoaded && (
        <div className="absolute top-16 left-4 w-64 bg-white border rounded-lg shadow-lg p-4 z-30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Couches</h3>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={() => setShowLayerPanel(false)}
            >
              ×
            </Button>
          </div>

          <div className="space-y-2">
            {layers.map(layer => (
              <div key={layer.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`layer-${layer.id}`}
                  checked={layer.visible}
                  onChange={() => handleLayerToggle(layer.id)}
                  className="rounded"
                />
                <label
                  htmlFor={`layer-${layer.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {layer.name}
                </label>
                <Badge variant="outline" className="text-xs">
                  {layer.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panneau de recherche */}
      {showSearchPanel && mapLoaded && (
        <div className="absolute top-16 left-20 w-80 bg-white border rounded-lg shadow-lg p-4 z-30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Rechercher</h3>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={() => setShowSearchPanel(false)}
            >
              ×
            </Button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un emplacement..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="text-xs text-gray-500 mb-2">
            {visibleLocations.length} emplacement{visibleLocations.length !== 1 ? 's' : ''} trouvé{visibleLocations.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Panneau latéral avec la liste des emplacements */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l shadow-lg overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Emplacements</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                {visibleLocations.length}
              </Badge>
              {selectedLocations.size > 0 && (
                <Badge variant="outline" className="text-sm text-blue-600">
                  {selectedLocations.size}
                </Badge>
              )}
            </div>
          </div>

          {/* Filtres par type */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Par type</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(locationsByType.entries()).map(([type, count]) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-gray-100"
                  onClick={() => setSearchTerm(type)}
                >
                  {getTypeLabel(type as MapLocation['type'])} ({count.length})
                </Badge>
              ))}
            </div>
          </div>

          {/* Filtres par catégorie */}
          {locationsByCategory.size > 1 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Par catégorie</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(locationsByCategory.entries()).map(([category, count]) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-gray-100"
                    onClick={() => setSearchTerm(category)}
                  >
                    {category} ({count.length})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Liste des emplacements */}
          <div className="space-y-3">
            {visibleLocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucun emplacement trouvé</p>
                <p className="text-sm">Essayez de modifier vos filtres ou d'ajouter un nouvel emplacement.</p>
              </div>
            ) : (
              visibleLocations.map(renderLocationCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
