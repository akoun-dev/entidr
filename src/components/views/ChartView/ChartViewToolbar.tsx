import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Palette,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';
import { ChartData } from './ChartView';

export interface ChartViewToolbarProps {
  selectedChart: ChartData | null;
  onConfigOpen: () => void;
  onChartUpdate: (chart: ChartData) => void;
  onChartTypeChange?: (type: ChartData['type']) => void;
}

export const ChartViewToolbar: React.FC<ChartViewToolbarProps> = ({
  selectedChart,
  onConfigOpen,
  onChartUpdate,
  onChartTypeChange
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleRefresh = () => {
    if (selectedChart) {
      // Simuler un rafraîchissement des données
      const updatedChart = {
        ...selectedChart,
        data: [...selectedChart.data] // Créer une nouvelle référence
      };
      onChartUpdate(updatedChart);
    }
  };

  const handleDownload = () => {
    if (selectedChart) {
      // Logique de téléchargement à implémenter
      console.log('Téléchargement du graphique:', selectedChart.title);
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Logique de plein écran à implémenter
  };

  const handleChartTypeChange = (type: ChartData['type']) => {
    if (selectedChart) {
      const updatedChart = {
        ...selectedChart,
        type
      };
      onChartUpdate(updatedChart);
      onChartTypeChange?.(type);
    }
  };

  const chartTypes = [
    { type: 'line' as const, icon: LineChart, label: 'Ligne' },
    { type: 'bar' as const, icon: BarChart3, label: 'Barre' },
    { type: 'pie' as const, icon: PieChart, label: 'Camembert' },
    { type: 'area' as const, icon: BarChart3, label: 'Aire' },
    { type: 'scatter' as const, icon: BarChart3, label: 'Nuage' }
  ];

  return (
    <div className="chart-view-toolbar flex items-center justify-between p-2 border-b bg-gray-50">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Type:</span>
        {chartTypes.map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            variant={selectedChart?.type === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleChartTypeChange(type)}
            disabled={!selectedChart}
            className="flex items-center space-x-1"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={!selectedChart}
          title="Rafraîchir"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!selectedChart}
          title="Télécharger"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleFullscreen}
          disabled={!selectedChart}
          title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onConfigOpen}
          disabled={!selectedChart}
          title="Configuration"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChartViewToolbar;
