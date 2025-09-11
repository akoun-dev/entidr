import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Image,
  FileVideo,
  FileText,
  Download,
  Eye,
  MoreVertical,
  Check,
  Calendar,
  HardDrive,
  Tag
} from 'lucide-react';
import { GalleryItem } from './GalleryView';

export interface GalleryViewItemProps {
  item: GalleryItem;
  isSelected: boolean;
  isHovered: boolean;
  viewMode: 'grid' | 'list' | 'masonry';
  selectable: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

export const GalleryViewItem: React.FC<GalleryViewItemProps> = ({
  item,
  isSelected,
  isHovered,
  viewMode,
  selectable,
  onClick,
  onDoubleClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const getItemIcon = () => {
    switch (item.type) {
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <FileVideo className="h-4 w-4 text-green-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getItemTypeColor = () => {
    switch (item.type) {
      case 'image':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-green-100 text-green-800';
      case 'document':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';

    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    if (bytes === 0) return '0 Octets';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick();
  };

  const renderMediaContent = () => {
    const thumbnailSrc = item.thumbnail || item.src;

    if (item.type === 'image' && thumbnailSrc && !imageError) {
      return (
        <div className="media-container relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={thumbnailSrc}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDoubleClick}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>Agrandir</span>
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Fallback pour les vidéos, documents ou images en erreur
    return (
      <div className="media-container relative aspect-square overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-2">
            {getItemIcon()}
          </div>
          <span className="text-xs text-gray-600">
            {item.type === 'video' ? 'Vidéo' :
             item.type === 'document' ? 'Document' : 'Image'}
          </span>
        </div>
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDoubleClick}
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>Aperçu</span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderGridItem = () => (
    <div
      ref={itemRef}
      className={`gallery-item-grid cursor-pointer group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Checkbox de sélection */}
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-white bg-black bg-opacity-50'
          }`}>
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
      )}

      {/* Contenu média */}
      {renderMediaContent()}

      {/* Informations de l'élément */}
      <div className="item-info p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 mr-2">
            {item.title}
          </h3>
          {isHovered && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto opacity-70 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setShowContextMenu(!showContextMenu);
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getItemTypeColor()}>
            {item.type === 'image' ? 'Image' :
             item.type === 'video' ? 'Vidéo' : 'Document'}
          </Badge>

          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(item.createdAt).split(' ')[0]}</span>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <Tag className="h-3 w-3 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{item.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderListItem = () => (
    <div
      ref={itemRef}
      className={`gallery-item-list flex items-center space-x-4 p-3 rounded-lg border cursor-pointer group ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Checkbox de sélection */}
      {selectable && (
        <Checkbox
          checked={isSelected}
          onChange={() => {}}
          className="flex-shrink-0"
        />
      )}

      {/* Miniature */}
      <div className="flex-shrink-0 w-16 h-16">
        {renderMediaContent()}
      </div>

      {/* Informations principales */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {item.title}
          </h3>
          <Badge variant="outline" className={getItemTypeColor()}>
            {item.type === 'image' ? 'Image' :
             item.type === 'video' ? 'Vidéo' : 'Document'}
          </Badge>
        </div>

        {item.description && (
          <p className="text-xs text-gray-600 line-clamp-1 mb-1">
            {item.description}
          </p>
        )}

        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatFileSize(item.size)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(item.createdAt)}</span>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            <Tag className="h-3 w-3 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {isHovered && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDoubleClick}
            className="flex items-center space-x-1"
          >
            <Eye className="h-3 w-3" />
            <span>Aperçu</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Download className="h-3 w-3" />
            <span>Télécharger</span>
          </Button>
        </div>
      )}
    </div>
  );

  const renderMasonryItem = () => (
    <div
      ref={itemRef}
      className={`gallery-item-masonry cursor-pointer group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Checkbox de sélection */}
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-white bg-black bg-opacity-50'
          }`}>
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
      )}

      {/* Contenu média */}
      <div className="media-container mb-3 overflow-hidden rounded-lg bg-gray-100">
        {renderMediaContent()}
      </div>

      {/* Informations de l'élément */}
      <div className="item-info space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 mr-2">
            {item.title}
          </h3>
          <Badge variant="outline" className={getItemTypeColor()}>
            {item.type === 'image' ? 'Image' :
             item.type === 'video' ? 'Vidéo' : 'Document'}
          </Badge>
        </div>

        {item.description && (
          <p className="text-xs text-gray-600 line-clamp-3">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatFileSize(item.size)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(item.createdAt).split(' ')[0]}</span>
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <Tag className="h-3 w-3 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  switch (viewMode) {
    case 'grid':
      return renderGridItem();
    case 'list':
      return renderListItem();
    case 'masonry':
      return renderMasonryItem();
    default:
      return renderGridItem();
  }
};

export default GalleryViewItem;
