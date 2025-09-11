import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ChartData } from './ChartView';

export interface ChartViewHeaderProps {
  charts: ChartData[];
  selectedChart: ChartData | null;
  onChartSelect: (chart: ChartData) => void;
  onChartAdd: () => void;
  onChartRemove: (chartId: string) => void;
}

export const ChartViewHeader: React.FC<ChartViewHeaderProps> = ({
  charts,
  selectedChart,
  onChartSelect,
  onChartAdd,
  onChartRemove
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const periods = [
    { value: '1d', label: '24h' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: '1y', label: '1 an' }
  ];

  const handleAddChart = () => {
    onChartAdd();
  };

  const handleRemoveChart = () => {
    if (selectedChart) {
      onChartRemove(selectedChart.id);
    }
  };

  return (
    <div className="chart-view-header flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">Vue Graphique</h2>

        <Select value={selectedChart?.id || ''} onValueChange={(value) => {
          const chart = charts.find(c => c.id === value);
          if (chart) onChartSelect(chart);
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sélectionner un graphique" />
          </SelectTrigger>
          <SelectContent>
            {charts.map((chart) => (
              <SelectItem key={chart.id} value={chart.id}>
                {chart.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddChart}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveChart}
          disabled={!selectedChart}
          className="flex items-center space-x-1"
        >
          <Trash2 className="h-4 w-4" />
          <span>Supprimer</span>
        </Button>
      </div>
    </div>
  );
};

export default ChartViewHeader;
