import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Flag,
  Navigation,
  CheckCircle,
  AlertCircle,
  XCircle,
  Target,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Info
} from 'lucide-react';
import { MapLocation } from './MapView';

export interface MapViewMarkerProps {
  location: MapLocation;
  isSelected: boolean;
  selectable: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  className?: string;
}

export const MapViewMarker: React.FC<MapViewMarkerProps> = ({
  location,
  isSelected,
  selectable,
  onSelect,
  onDoubleClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getMarkerIcon = () => {
    switch (location.type) {
      case 'poi':
        return <MapPin className="h-4 w-4" />;
      case 'route':
        return <Navigation className="h-4 w-4" />;
      case 'area':
        return <Flag className="h-4 w-4" />;
      case 'marker':
        return <Target className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getMarkerColor = () => {
    if (location.color) {
      return location.color;
    }

    switch (location.type) {
      case 'poi':
        return 'bg-red-500 border-red-600';
      case 'route':
        return 'bg-blue-500 border-blue-600';
      case 'area':
        return 'bg-purple-500 border-purple-600';
      case 'marker':
        return 'bg-green-500 border-green-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (location.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (location.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCoordinates = (lat: number, lng: number): string => {
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick();
  };

  const renderMarker = () => (
    <div
      className={`map-marker absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${
        isSelected ? 'z-20' : 'z-10'
      } ${selectable ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
    >
      {/* Marqueur principal */}
      <div className={`relative ${getMarkerColor()} border-2 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 ${
        isSelected ? 'ring-4 ring-blue-400 ring-opacity-50 scale-125' : ''
      } ${isHovered ? 'scale-110' : ''}`}>
        <div className="text-white">
          {getMarkerIcon()}
        </div>

        {/* Pointe du marqueur */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-3 h-3 ${
          location.color ? location.color.replace('bg-', 'bg-').split('-')[0] + '-500' :
          location.type === 'poi' ? 'bg-red-500' :
          location.type === 'route' ? 'bg-blue-500' :
          location.type === 'area' ? 'bg-purple-500' : 'bg-green-500'
        } rotate-45`}></div>
      </div>

      {/* Indicateur de statut */}
      {location.status && (
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
          location.status === 'active' ? 'bg-green-500' :
          location.status === 'inactive' ? 'bg-red-500' :
          location.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
        }`}>
          {getStatusIcon()}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white border rounded-lg shadow-lg p-3 z-30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold truncate flex-1">
              {location.title}
            </h3>
            {location.category && (
              <Badge variant="secondary" className="text-xs ml-2">
                {location.category}
              </Badge>
            )}
          </div>

          {location.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {location.description}
            </p>
          )}

          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{formatCoordinates(location.latitude, location.longitude)}</span>
            </div>

            {location.status && (
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                <span className="capitalize">
                  {location.status === 'active' ? 'Actif' :
                   location.status === 'inactive' ? 'Inactif' :
                   location.status === 'pending' ? 'En attente' : location.status}
                </span>
              </div>
            )}

            {location.tags && location.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <Info className="h-3 w-3" />
                <span>{location.tags.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Actions rapides */}
          {(isHovered || isSelected) && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  // Action d'édition
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Éditer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6 text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  // Action de suppression
                }}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Supprimer
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Menu contextuel */}
      {showContextMenu && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-40">
          <div className="p-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setShowContextMenu(false);
                // Action d'édition
              }}
            >
              <Edit className="h-3 w-3 mr-2" />
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setShowContextMenu(false);
                // Action de duplication
              }}
            >
              <Calendar className="h-3 w-3 mr-2" />
              Dupliquer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-red-600 hover:text-red-700"
              onClick={() => {
                setShowContextMenu(false);
                // Action de suppression
              }}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return renderMarker();
};

export default MapViewMarker;
