import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Layers,
  Settings,
  MapPin,
  Navigation,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Download,
  Share,
  Fullscreen,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';

export interface MapViewHeaderProps {
  title: string;
  subtitle?: string;
  locationCount: number;
  selectedCount: number;
  center: { latitude: number; longitude: number };
  zoom: number;
  mapStyle: 'street' | 'satellite' | 'terrain' | 'dark';
  showSearch: boolean;
  showFilters: boolean;
  showLayers: boolean;
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
  onLayerToggle: () => void;
  onStyleChange: (style: 'street' | 'satellite' | 'terrain' | 'dark') => void;
  onNavigate: (direction: 'north' | 'south' | 'east' | 'west' | 'in' | 'out') => void;
  onLocationAdd: () => void;
  onExport: () => void;
  onShare: () => void;
  onFullscreen: () => void;
  className?: string;
}

export const MapViewHeader: React.FC<MapViewHeaderProps> = ({
  title,
  subtitle,
  locationCount,
  selectedCount,
  center,
  zoom,
  mapStyle,
  showSearch,
  showFilters,
  showLayers,
  onSearch,
  onFilterToggle,
  onLayerToggle,
  onStyleChange,
  onNavigate,
  onLocationAdd,
  onExport,
  onShare,
  onFullscreen,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  const handleNavigate = useCallback((direction: 'north' | 'south' | 'east' | 'west' | 'in' | 'out') => {
    onNavigate(direction);
    setShowNavigationMenu(false);
  }, [onNavigate]);

  const getStyleLabel = (style: string) => {
    switch (style) {
      case 'street':
        return 'Rue';
      case 'satellite':
        return 'Satellite';
      case 'terrain':
        return 'Terrain';
      case 'dark':
        return 'Sombre';
      default:
        return style;
    }
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'street':
        return <MapPin className="h-4 w-4" />;
      case 'satellite':
        return <Navigation className="h-4 w-4" />;
      case 'terrain':
        return <Grid3X3 className="h-4 w-4" />;
      case 'dark':
        return <List className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className={`map-view-header ${className}`}>
      <div className="flex items-center justify-between p-4 bg-white border-b">
        {/* Section gauche - Titre et navigation */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-800">
              {title}
            </h1>
            {subtitle && (
              <span className="text-sm text-gray-500">
                {subtitle}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              {locationCount} emplacement{locationCount !== 1 ? 's' : ''}
            </Badge>
            {selectedCount > 0 && (
              <Badge variant="outline" className="text-sm text-blue-600">
                {selectedCount} sélectionné{selectedCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Section centre - Recherche et filtres */}
        <div className="flex items-center space-x-2">
          {showSearch && (
            <>
              {showSearchInput ? (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher un emplacement..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                    autoFocus
                    onBlur={() => setShowSearchInput(false)}
                  />
                </form>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearchInput(true)}
                  title="Rechercher"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterToggle}
              title="Filtres"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}

          {showLayers && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLayerToggle}
              title="Couches"
            >
              <Layers className="h-4 w-4" />
            </Button>
          )}

          {/* Menu de style de carte */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              title="Style de carte"
            >
              {getStyleIcon(mapStyle)}
              <span className="ml-1">{getStyleLabel(mapStyle)}</span>
            </Button>

            {showStyleMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-50">
                {(['street', 'satellite', 'terrain', 'dark'] as const).map(style => (
                  <Button
                    key={style}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      onStyleChange(style);
                      setShowStyleMenu(false);
                    }}
                  >
                    {getStyleIcon(style)}
                    <span className="ml-2">{getStyleLabel(style)}</span>
                    {mapStyle === style && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Menu de navigation */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNavigationMenu(!showNavigationMenu)}
              title="Navigation"
            >
              <Navigation className="h-4 w-4" />
            </Button>

            {showNavigationMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
                <div className="grid grid-cols-3 gap-1 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleNavigate('north')}
                    title="Nord"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div></div>
                  <div></div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleNavigate('west')}
                    title="Ouest"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleNavigate('in')}
                    title="Zoomer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleNavigate('east')}
                    title="Est"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleNavigate('south')}
                    title="Sud"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <div></div>

                  <div></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleNavigate('out')}
                    title="Dézoomer"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div></div>
                </div>

                <div className="border-t px-3 py-2 text-xs text-gray-500">
                  Zoom: {zoom}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section droite - Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLocationAdd}
            title="Ajouter un emplacement"
          >
            <Plus className="h-4 w-4" />
            <span className="ml-1">Ajouter</span>
          </Button>

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
            onClick={onShare}
            title="Partager"
          >
            <Share className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onFullscreen}
            title="Plein écran"
          >
            <Fullscreen className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            title="Plus d'options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Barre d'information */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>
              Centre: {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Navigation className="h-3 w-3" />
            <span>Style: {getStyleLabel(mapStyle)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            Utilisez les flèches pour naviguer et +/- pour zoomer
          </div>
          <div>
            Ctrl + Clic pour ajouter un emplacement
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewHeader;
