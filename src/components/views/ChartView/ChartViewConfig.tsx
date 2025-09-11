import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { X, Save, RotateCcw } from 'lucide-react';
import { ChartData } from './ChartView';

export interface ChartViewConfigProps {
  chart: ChartData;
  onClose: () => void;
  onSave: (chart: ChartData) => void;
}

export interface ChartOptions {
  title: string;
  type: ChartData['type'];
  showGrid: boolean;
  showLegend: boolean;
  showValues: boolean;
  animation: boolean;
  colorScheme: 'default' | 'vibrant' | 'pastel' | 'monochrome';
  fontSize: number;
  lineWidth: number;
  pointSize: number;
  backgroundColor: string;
  gridColor: string;
  axisColor: string;
}

export const ChartViewConfig: React.FC<ChartViewConfigProps> = ({
  chart,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState<ChartOptions & { chart: ChartData }>({
    chart,
    title: chart.title,
    type: chart.type,
    showGrid: true,
    showLegend: true,
    showValues: false,
    animation: true,
    colorScheme: 'default',
    fontSize: 14,
    lineWidth: 2,
    pointSize: 4,
    backgroundColor: '#ffffff',
    gridColor: '#e5e7eb',
    axisColor: '#374151'
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasUnsavedChanges =
      config.title !== chart.title ||
      config.type !== chart.type ||
      config.showGrid !== (chart.options?.showGrid ?? true) ||
      config.showLegend !== (chart.options?.showLegend ?? true) ||
      config.showValues !== (chart.options?.showValues ?? false) ||
      config.animation !== (chart.options?.animation ?? true) ||
      config.colorScheme !== (chart.options?.colorScheme ?? 'default') ||
      config.fontSize !== (chart.options?.fontSize ?? 14) ||
      config.lineWidth !== (chart.options?.lineWidth ?? 2) ||
      config.pointSize !== (chart.options?.pointSize ?? 4) ||
      config.backgroundColor !== (chart.options?.backgroundColor ?? '#ffffff') ||
      config.gridColor !== (chart.options?.gridColor ?? '#e5e7eb') ||
      config.axisColor !== (chart.options?.axisColor ?? '#374151');

    setHasChanges(hasUnsavedChanges);
  }, [config, chart]);

  const handleSave = () => {
    const updatedChart: ChartData = {
      ...chart,
      title: config.title,
      type: config.type,
      options: {
        ...chart.options,
        showGrid: config.showGrid,
        showLegend: config.showLegend,
        showValues: config.showValues,
        animation: config.animation,
        colorScheme: config.colorScheme,
        fontSize: config.fontSize,
        lineWidth: config.lineWidth,
        pointSize: config.pointSize,
        backgroundColor: config.backgroundColor,
        gridColor: config.gridColor,
        axisColor: config.axisColor
      }
    };
    onSave(updatedChart);
    onClose();
  };

  const handleReset = () => {
    setConfig({
      chart,
      title: chart.title,
      type: chart.type,
      showGrid: true,
      showLegend: true,
      showValues: false,
      animation: true,
      colorScheme: 'default',
      fontSize: 14,
      lineWidth: 2,
      pointSize: 4,
      backgroundColor: '#ffffff',
      gridColor: '#e5e7eb',
      axisColor: '#374151'
    });
  };

  const chartTypes = [
    { value: 'line', label: 'Ligne' },
    { value: 'bar', label: 'Barre' },
    { value: 'pie', label: 'Camembert' },
    { value: 'area', label: 'Aire' },
    { value: 'scatter', label: 'Nuage de points' }
  ];

  const colorSchemes = [
    { value: 'default', label: 'Défaut' },
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'pastel', label: 'Pastel' },
    { value: 'monochrome', label: 'Monochrome' }
  ];

  return (
    <div className="chart-view-config fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Configuration du graphique</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Section Informations de base */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Informations de base</h4>

              <div className="space-y-2">
                <Label htmlFor="title">Titre du graphique</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="Entrez le titre du graphique"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de graphique</Label>
                <Select value={config.type} onValueChange={(value: ChartData['type']) => setConfig({ ...config, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Section Affichage */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Options d'affichage</h4>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showGrid"
                    checked={config.showGrid}
                    onCheckedChange={(checked) => setConfig({ ...config, showGrid: checked as boolean })}
                  />
                  <Label htmlFor="showGrid">Afficher la grille</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showLegend"
                    checked={config.showLegend}
                    onCheckedChange={(checked) => setConfig({ ...config, showLegend: checked as boolean })}
                  />
                  <Label htmlFor="showLegend">Afficher la légende</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showValues"
                    checked={config.showValues}
                    onCheckedChange={(checked) => setConfig({ ...config, showValues: checked as boolean })}
                  />
                  <Label htmlFor="showValues">Afficher les valeurs</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="animation"
                    checked={config.animation}
                    onCheckedChange={(checked) => setConfig({ ...config, animation: checked as boolean })}
                  />
                  <Label htmlFor="animation">Activer les animations</Label>
                </div>
              </div>
            </div>

            {/* Section Style */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Style et couleurs</h4>

              <div className="space-y-2">
                <Label htmlFor="colorScheme">Schéma de couleurs</Label>
                <Select value={config.colorScheme} onValueChange={(value: any) => setConfig({ ...config, colorScheme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((scheme) => (
                      <SelectItem key={scheme.value} value={scheme.value}>
                        {scheme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Taille de la police: {config.fontSize}px</Label>
                <Slider
                  value={[config.fontSize]}
                  onValueChange={(value) => setConfig({ ...config, fontSize: value[0] })}
                  min={8}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineWidth">Épaisseur de ligne: {config.lineWidth}px</Label>
                <Slider
                  value={[config.lineWidth]}
                  onValueChange={(value) => setConfig({ ...config, lineWidth: value[0] })}
                  min={1}
                  max={10}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointSize">Taille des points: {config.pointSize}px</Label>
                <Slider
                  value={[config.pointSize]}
                  onValueChange={(value) => setConfig({ ...config, pointSize: value[0] })}
                  min={2}
                  max={12}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Section Couleurs personnalisées */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Couleurs personnalisées</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Arrière-plan</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="h-10 w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gridColor">Grille</Label>
                  <Input
                    id="gridColor"
                    type="color"
                    value={config.gridColor}
                    onChange={(e) => setConfig({ ...config, gridColor: e.target.value })}
                    className="h-10 w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="axisColor">Axes</Label>
                  <Input
                    id="axisColor"
                    type="color"
                    value={config.axisColor}
                    onChange={(e) => setConfig({ ...config, axisColor: e.target.value })}
                    className="h-10 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Réinitialiser</span>
            </Button>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-1" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartViewConfig;
