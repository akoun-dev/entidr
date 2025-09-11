import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapLayer } from './MapView';

export interface MapViewCanvasProps {
  center: { lat: number; lng: number };
  zoom: number;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  viewport: { width: number; height: number };
  layers: MapLayer[];
  onCenterChange: (center: { lat: number; lng: number }) => void;
  onZoomChange: (zoom: number) => void;
  onMapClick: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export const MapViewCanvas: React.FC<MapViewCanvasProps> = ({
  center,
  zoom,
  mapType,
  viewport,
  layers,
  onCenterChange,
  onZoomChange,
  onMapClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tileCache, setTileCache] = useState<Map<string, HTMLImageElement>>(new Map());

  // Conversion de coordonnées géographiques en pixels
  const latLngToPixel = useCallback((lat: number, lng: number, zoomLevel: number) => {
    const tileSize = 256;
    const scale = Math.pow(2, zoomLevel);

    const x = (lng + 180) * (tileSize * scale) / 360;
    const latRad = lat * Math.PI / 180;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (tileSize * scale / 2) - (tileSize * scale * mercN / (2 * Math.PI));

    return { x, y };
  }, []);

  // Conversion de pixels en coordonnées géographiques
  const pixelToLatLng = useCallback((x: number, y: number, zoomLevel: number) => {
    const tileSize = 256;
    const scale = Math.pow(2, zoomLevel);

    const lng = (x / (tileSize * scale)) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI - (2 * Math.PI * y) / (tileSize * scale)));
    const lat = latRad * 180 / Math.PI;

    return { lat, lng };
  }, []);

  // Obtenir l'URL de tuile pour OpenStreetMap
  const getTileUrl = useCallback((x: number, y: number, z: number, type: 'roadmap' | 'satellite' | 'hybrid' | 'terrain') => {
    const tileSize = 256;
    const maxZoom = 19;

    // S'assurer que les coordonnées sont valides
    const tileX = ((x % (1 << z)) + (1 << z)) % (1 << z);
    const tileY = Math.max(0, Math.min((1 << z) - 1, y));

    switch (type) {
      case 'roadmap':
        return `https://tile.openstreetmap.org/${z}/${tileX}/${tileY}.png`;
      case 'satellite':
        return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${tileY}/${tileX}`;
      case 'terrain':
        return `https://stamen-tiles.a.ssl.fastly.net/terrain/${z}/${tileX}/${tileY}.png`;
      case 'hybrid':
        return `https://mt1.google.com/vt/lyrs=y&x=${tileX}&y=${tileY}&z=${z}`;
      default:
        return `https://tile.openstreetmap.org/${z}/${tileX}/${tileY}.png`;
    }
  }, []);

  // Charger une tuile
  const loadTile = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      if (tileCache.has(url)) {
        resolve(tileCache.get(url)!);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const newCache = new Map(tileCache);
        newCache.set(url, img);
        setTileCache(newCache);
        resolve(img);
      };

      img.onerror = reject;
      img.src = url;
    });
  }, [tileCache]);

  // Dessiner la carte
  const drawMap = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || viewport.width === 0 || viewport.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    // Définir la couleur de fond en fonction du type de carte
    switch (mapType) {
      case 'satellite':
        ctx.fillStyle = '#1a1a1a';
        break;
      case 'terrain':
        ctx.fillStyle = '#f0f0f0';
        break;
      default:
        ctx.fillStyle = '#e0e0e0';
    }
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    const tileSize = 256;
    const scale = Math.pow(2, zoom);
    const centerPixel = latLngToPixel(center.lat, center.lng, zoom);

    // Calculer les tuiles visibles
    const startX = Math.floor((centerPixel.x - viewport.width / 2 - dragOffset.x) / tileSize);
    const endX = Math.ceil((centerPixel.x + viewport.width / 2 - dragOffset.x) / tileSize);
    const startY = Math.floor((centerPixel.y - viewport.height / 2 - dragOffset.y) / tileSize);
    const endY = Math.ceil((centerPixel.y + viewport.height / 2 - dragOffset.y) / tileSize);

    // Dessiner les tuiles
    const tilePromises: Promise<void>[] = [];

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tileUrl = getTileUrl(x, y, zoom, mapType);

        const tilePromise = loadTile(tileUrl).then(img => {
          const pixelX = x * tileSize - centerPixel.x + viewport.width / 2 + dragOffset.x;
          const pixelY = y * tileSize - centerPixel.y + viewport.height / 2 + dragOffset.y;

          ctx.drawImage(img, pixelX, pixelY, tileSize, tileSize);
        }).catch(() => {
          // En cas d'erreur, dessiner un placeholder
          const pixelX = x * tileSize - centerPixel.x + viewport.width / 2 + dragOffset.x;
          const pixelY = y * tileSize - centerPixel.y + viewport.height / 2 + dragOffset.y;

          ctx.fillStyle = '#ccc';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          ctx.strokeStyle = '#999';
          ctx.strokeRect(pixelX, pixelY, tileSize, tileSize);

          ctx.fillStyle = '#666';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${x},${y}`, pixelX + tileSize / 2, pixelY + tileSize / 2);
        });

        tilePromises.push(tilePromise);
      }
    }

    // Attendre que toutes les tuiles soient chargées
    await Promise.all(tilePromises);

    // Dessiner les couches supplémentaires
    layers.filter(layer => layer.visible && layer.type === 'marker').forEach(layer => {
      if (layer.data) {
        layer.data.forEach(location => {
          const pixel = latLngToPixel(location.latitude, location.longitude, zoom);
          const screenX = pixel.x - centerPixel.x + viewport.width / 2 + dragOffset.x;
          const screenY = pixel.y - centerPixel.y + viewport.height / 2 + dragOffset.y;

          // Dessiner un marqueur simple
          ctx.fillStyle = location.color || '#ff0000';
          ctx.beginPath();
          ctx.arc(screenX, screenY, 8, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    });

  }, [center, zoom, mapType, viewport, layers, dragOffset, latLngToPixel, getTileUrl, loadTile]);

  // Gérer le clic sur la carte
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerPixel = latLngToPixel(center.lat, center.lng, zoom);
    const worldX = x - viewport.width / 2 - dragOffset.x + centerPixel.x;
    const worldY = y - viewport.height / 2 - dragOffset.y + centerPixel.y;

    const coords = pixelToLatLng(worldX, worldY, zoom);
    onMapClick(coords);
  }, [center, zoom, viewport, dragOffset, latLngToPixel, pixelToLatLng, onMapClick]);

  // Gérer le drag
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setDragOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // Mettre à jour le centre en fonction du décalage
    const centerPixel = latLngToPixel(center.lat, center.lng, zoom);
    const newCenterPixel = {
      x: centerPixel.x - dragOffset.x,
      y: centerPixel.y - dragOffset.y
    };

    const newCenter = pixelToLatLng(newCenterPixel.x, newCenterPixel.y, zoom);
    onCenterChange(newCenter);

    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, dragOffset, center, zoom, latLngToPixel, pixelToLatLng, onCenterChange]);

  // Gérer le zoom avec la molette
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(1, Math.min(20, zoom + delta));

    if (newZoom !== zoom) {
      onZoomChange(newZoom);
    }
  }, [zoom, onZoomChange]);

  // Redessiner quand les paramètres changent
  useEffect(() => {
    drawMap();
  }, [center, zoom, mapType, viewport, layers, dragOffset, drawMap]);

  // Gérer le redimensionnement
  useEffect(() => {
    const handleResize = () => {
      drawMap();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawMap]);

  return (
    <canvas
      ref={canvasRef}
      width={viewport.width}
      height={viewport.height}
      className={`map-canvas absolute inset-0 cursor-grab ${isDragging ? 'cursor-grabbing' : ''} ${className}`}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    />
  );
};

export default MapViewCanvas;
