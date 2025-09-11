import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Layers,
  Filter,
  Search,
  Plus,
  Settings,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Users,
  Navigation,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Archive,
  Tag,
  Map,
  Satellite,
  Mountain,
  Moon,
  Sun,
  Cloud,
  Activity,
  Gauge,
  Zap,
  Pin,
  MapPinned,
  Route,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Diamond,
  Bell,
  Download,
  Upload,
  Lock,
  Unlock
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
  visible: boolean;
  selected: boolean;
  favorite: boolean;
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
  locked: boolean;
  favorite: boolean;
}

export interface MapViewSidebarProps {
  locations: MapLocation[];
  layers: MapLayer[];
  selectedLocationId: string | null;
  activeLayerId: string | null;
  searchTerm: string;
  showFilters: boolean;
  showCategories: boolean;
  showTags: boolean;
  sortBy: 'name' | 'date' | 'type' | 'distance' | 'priority';
  sortOrder: 'asc' | 'desc';
  onLocationSelect: (locationId: string) => void;
  onLocationToggle: (locationId: string) => void;
  onLocationEdit: (locationId: string) => void;
  onLocationDelete: (locationId: string) => void;
  onLocationFavorite: (locationId: string) => void;
  onLocationArchive: (locationId: string) => void;
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onLayerSelect: (layerId: string) => void;
  onLayerFavorite: (layerId: string) => void;
  onLayerLock: (layerId: string, locked: boolean) => void;
  onSearch: (term: string) => void;
  onFilterToggle: () => void;
  onSortChange: (sortBy: 'name' | 'date' | 'type' | 'distance' | 'priority') => void;
  onSortOrderToggle: () => void;
  onLocationAdd: () => void;
  onLayerAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  className?: string;
}

export const MapViewSidebar: React.FC<MapViewSidebarProps> = ({
  locations,
  layers,
  selectedLocationId,
  activeLayerId,
  searchTerm,
  showFilters,
  showCategories,
  showTags,
  sortBy,
  sortOrder,
  onLocationSelect,
  onLocationToggle,
  onLocationEdit,
  onLocationDelete,
  onLocationFavorite,
  onLocationArchive,
  onLayerToggle,
  onLayerSelect,
  onLayerFavorite,
  onLayerLock,
  onSearch,
  onFilterToggle,
  onSortChange,
  onSortOrderToggle,
  onLocationAdd,
  onLayerAdd,
  onExport,
  onImport,
  className = ''
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(() => new Set());
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showLocationPanel, setShowLocationPanel] = useState(true);

  // Filtrer les locations visibles
  const visibleLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = !searchTerm ||
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch && location.visible;
    });
  }, [locations, searchTerm]);

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

  // Trier les locations
  const sortedLocations = useMemo(() => {
    const sorted = [...visibleLocations];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'distance':
          // Simuler une distance par rapport à un point central
          const distanceA = Math.sqrt(a.latitude * a.latitude + a.longitude * a.longitude);
          const distanceB = Math.sqrt(b.latitude * b.latitude + b.longitude * b.longitude);
          comparison = distanceA - distanceB;
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const priorityA = a.priority ? priorityOrder[a.priority] : 0;
          const priorityB = b.priority ? priorityOrder[b.priority] : 0;
          comparison = priorityA - priorityB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [visibleLocations, sortBy, sortOrder]);

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

  const getLayerIcon = (type: MapLayer['type']) => {
    switch (type) {
      case 'marker':
        return <MapPin className="h-4 w-4" />;
      case 'heatmap':
        return <Activity className="h-4 w-4" />;
      case 'polygon':
        return <Square className="h-4 w-4" />;
      case 'polyline':
        return <Route className="h-4 w-4" />;
      case 'circle':
        return <Circle className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const toggleCategory = useCallback((category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  }, [expandedCategories]);

  const toggleLayer = useCallback((layerId: string) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayers(newExpanded);
  }, [expandedLayers]);

  const renderLocationCard = (location: MapLocation) => {
    const isSelected = selectedLocationId === location.id;
    const isHovered = false; // TODO: Add hover state

    return (
      <Card
        key={location.id}
        className={`location-card cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        } ${isHovered ? 'shadow-md' : ''}`}
        onClick={() => onLocationSelect(location.id)}
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
                  onLocationFavorite(location.id);
                }}
              >
                <Star className={`h-3 w-3 ${location.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onLocationEdit(location.id);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
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

  const renderLayerCard = (layer: MapLayer) => {
    const isSelected = activeLayerId === layer.id;
    const isExpanded = expandedLayers.has(layer.id);

    return (
      <Card
        key={layer.id}
        className={`layer-card cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggle(layer.id, !layer.visible);
                  }}
                >
                  {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                {getLayerIcon(layer.type)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">
                  {layer.name}
                </CardTitle>
                <div className="flex items-center space-x-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {layer.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {Array.isArray(layer.data) ? layer.data.length : 'N/A'}
                  </Badge>
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
                  onLayerFavorite(layer.id);
                }}
              >
                <Star className={`h-3 w-3 ${layer.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerLock(layer.id, !layer.locked);
                }}
              >
                {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayer(layer.id);
                }}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Opacité</span>
                <span>{Math.round(layer.opacity * 100)}%</span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layer.opacity}
                  onChange={(e) => {
                    // TODO: Handle opacity change
                  }}
                  className="flex-1"
                />
              </div>

              {Array.isArray(layer.data) && layer.data.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Éléments ({layer.data.length})
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {layer.data.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="text-xs text-gray-600 p-1 bg-gray-50 rounded">
                        {item.name || `Élément ${index + 1}`}
                      </div>
                    ))}
                    {layer.data.length > 5 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{layer.data.length - 5} autres
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className={`map-view-sidebar ${className}`}>
      {/* En-tête de la sidebar */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Carte Interactive</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLocationPanel(!showLocationPanel)}
              title={showLocationPanel ? "Masquer les emplacements" : "Afficher les emplacements"}
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLayerPanel(!showLayerPanel)}
              title={showLayerPanel ? "Masquer les couches" : "Afficher les couches"}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un emplacement..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filtres et tri */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={onFilterToggle}
              title="Filtres"
            >
              <Filter className="h-4 w-4" />
            </Button>

            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="name">Nom</option>
              <option value="date">Date</option>
              <option value="type">Type</option>
              <option value="distance">Distance</option>
              <option value="priority">Priorité</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={onSortOrderToggle}
              title={sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
            >
              {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLocationAdd}
              title="Ajouter un emplacement"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLayerAdd}
              title="Ajouter une couche"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu de la sidebar */}
      <div className="flex-1 overflow-y-auto">
        {/* Panneau des couches */}
        {showLayerPanel && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Couches</h3>
              <Badge variant="secondary" className="text-xs">
                {layers.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {layers.map(renderLayerCard)}
            </div>
          </div>
        )}

        {/* Panneau des emplacements */}
        {showLocationPanel && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Emplacements</h3>
              <Badge variant="secondary" className="text-xs">
                {visibleLocations.length}
              </Badge>
            </div>

            {/* Filtres par type */}
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2">Par type</h4>
              <div className="flex flex-wrap gap-2">
                {[...locationsByType.entries()].map(([type, count]) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-gray-100"
                    onClick={() => onSearch(type)}
                  >
                    {getTypeLabel(type as MapLocation['type'])} ({count.length})
                  </Badge>
                ))}
              </div>
            </div>

            {/* Filtres par catégorie */}
            {locationsByCategory.size > 1 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium mb-2">Par catégorie</h4>
                <div className="flex flex-wrap gap-2">
                  {[...locationsByCategory.entries()].map(([category, count]) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-gray-100"
                      onClick={() => onSearch(category)}
                    >
                      {category} ({count.length})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des emplacements */}
            <div className="space-y-3">
              {sortedLocations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Aucun emplacement trouvé</p>
                  <p className="text-sm">Essayez de modifier vos filtres ou d'ajouter un nouvel emplacement.</p>
                </div>
              ) : (
                sortedLocations.map(renderLocationCard)
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pied de page de la sidebar */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              title="Exporter"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              title="Importer"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            {locations.length} emplacement{locations.length !== 1 ? 's' : ''} • {layers.length} couche{layers.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewSidebar;
