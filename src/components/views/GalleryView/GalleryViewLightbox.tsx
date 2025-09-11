import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Info,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FileVideo,
  FileText
} from 'lucide-react';
import { GalleryItem } from './GalleryView';

export interface GalleryViewLightboxProps {
  item: GalleryItem;
  items: GalleryItem[];
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalItems: number;
  className?: string;
}

export const GalleryViewLightbox: React.FC<GalleryViewLightboxProps> = ({
  item,
  items,
  onClose,
  onNext,
  onPrevious,
  currentIndex,
  totalItems,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(true);
  const [imageError, setImageError] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Gestion du fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case ' ':
          e.preventDefault();
          // Toggle info panel
          setShowInfo(prev => !prev);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'r':
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      lightboxRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const resetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = item.src;
    link.download = item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: item.src
        });
      } catch (error) {
        console.log(' partage annulé:', error);
      }
    } else {
      // Fallback: copier dans le presse-papiers
      navigator.clipboard.writeText(item.src);
      alert('Lien copié dans le presse-papiers!');
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

  const getItemIcon = () => {
    switch (item.type) {
      case 'video':
        return <FileVideo className="h-8 w-8 text-green-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-gray-500" />;
      default:
        return null;
    }
  };

  const renderMediaContent = () => {
    if (item.type === 'image' && !imageError) {
      return (
        <div className="media-container flex items-center justify-center bg-black">
          <img
            ref={imageRef}
            src={item.src}
            alt={item.title}
            className="max-w-full max-h-full object-contain transition-transform duration-300"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`
            }}
            onError={() => setImageError(true)}
            draggable="false"
          />
        </div>
      );
    }

    // Fallback pour les vidéos, documents ou images en erreur
    return (
      <div className="media-container flex items-center justify-center bg-black min-h-[400px]">
        <div className="text-center text-white">
          <div className="mb-4">
            {getItemIcon()}
          </div>
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-300 mb-4">
            {item.type === 'video' ? 'Aperçu vidéo non disponible' :
             item.type === 'document' ? 'Aperçu document non disponible' :
             'Image non disponible'}
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Taille: {formatFileSize(item.size)}</p>
            <p>Type: {item.metadata?.mimeType || item.type}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={lightboxRef}
      className={`gallery-view-lightbox fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col ${className}`}
      onClick={(e) => {
        if (e.target === lightboxRef.current) {
          onClose();
        }
      }}
    >
      {/* En-tête */}
      <div className="lightbox-header flex items-center justify-between p-4 bg-black bg-opacity-50">
        <div className="flex items-center space-x-4">
          <h2 className="text-white text-lg font-medium truncate max-w-md">
            {item.title}
          </h2>
          <Badge variant="outline" className="text-white border-white">
            {currentIndex + 1} / {totalItems}
          </Badge>
          <Badge variant="outline" className={
            item.type === 'image' ? 'border-blue-400 text-blue-400' :
            item.type === 'video' ? 'border-green-400 text-green-400' :
            'border-gray-400 text-gray-400'
          }>
            {item.type === 'image' ? 'Image' :
             item.type === 'video' ? 'Vidéo' : 'Document'}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
            title="Télécharger"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
            title="Partager"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
            title="Informations"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
            title="Fermer (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lightbox-content flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Navigation précédente */}
        {totalItems > 1 && (
          <Button
            variant="ghost"
            size="lg"
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white hover:bg-white hover:bg-opacity-20 z-10"
            title="Précédent (←)"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Média */}
        <div className="media-wrapper flex items-center justify-center w-full h-full">
          {renderMediaContent()}
        </div>

        {/* Navigation suivante */}
        {totalItems > 1 && (
          <Button
            variant="ghost"
            size="lg"
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-white hover:bg-white hover:bg-opacity-20 z-10"
            title="Suivant (→)"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Contrôles de zoom et rotation (pour images) */}
        {item.type === 'image' && !imageError && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
              title="Zoom out (-)"
              disabled={zoom <= 0.25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white text-sm min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
              title="Zoom in (+)"
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-white bg-opacity-30" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
              title="Rotation (R)"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
              title="Reset (0)"
            >
              1:1
            </Button>
          </div>
        )}
      </div>

      {/* Panneau d'informations */}
      {showInfo && (
        <div className="lightbox-info-panel bg-black bg-opacity-50 p-4 border-t border-white border-opacity-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white">
            <div>
              <h3 className="font-medium mb-2">Informations générales</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-400">Nom:</span> {item.title}</p>
                {item.description && (
                  <p><span className="text-gray-400">Description:</span> {item.description}</p>
                )}
                <p><span className="text-gray-400">Type:</span> {item.type}</p>
                <p><span className="text-gray-400">Taille:</span> {formatFileSize(item.size)}</p>
                <p><span className="text-gray-400">Créé le:</span> {formatDate(item.createdAt)}</p>
                <p><span className="text-gray-400">Modifié le:</span> {formatDate(item.updatedAt)}</p>
              </div>
            </div>

            {item.metadata && (
              <div>
                <h3 className="font-medium mb-2">Métadonnées</h3>
                <div className="space-y-1 text-sm">
                  {Object.entries(item.metadata).map(([key, value]) => (
                    <p key={key}>
                      <span className="text-gray-400">{key}:</span> {String(value)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raccourcis clavier */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
        Esc: Fermer | ←→: Navigation | Espace: Info | F: Plein écran
      </div>
    </div>
  );
};

export default GalleryViewLightbox;
