import React, { useState, useEffect } from 'react';
import { ChartViewHeader } from './ChartViewHeader';
import { ChartViewToolbar } from './ChartViewToolbar';
import { ChartViewCanvas } from './ChartViewCanvas';
import { ChartViewLegend } from './ChartViewLegend';
import { ChartViewConfig } from './ChartViewConfig';

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: any[];
  options?: any;
}

export interface ChartViewProps {
  initialData?: ChartData[];
  className?: string;
  onChartChange?: (chart: ChartData) => void;
}

export const ChartView: React.FC<ChartViewProps> = ({
  initialData = [],
  className = '',
  onChartChange
}) => {
  const [charts, setCharts] = useState<ChartData[]>(initialData);
  const [selectedChart, setSelectedChart] = useState<ChartData | null>(
    initialData.length > 0 ? initialData[0] : null
  );
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    if (initialData.length > 0) {
      setCharts(initialData);
      setSelectedChart(initialData[0]);
    }
  }, [initialData]);

  const handleChartSelect = (chart: ChartData) => {
    setSelectedChart(chart);
    onChartChange?.(chart);
  };

  const handleChartUpdate = (updatedChart: ChartData) => {
    const newCharts = charts.map(chart =>
      chart.id === updatedChart.id ? updatedChart : chart
    );
    setCharts(newCharts);
    setSelectedChart(updatedChart);
    onChartChange?.(updatedChart);
  };

  const handleChartAdd = (newChart: ChartData) => {
    const newCharts = [...charts, newChart];
    setCharts(newCharts);
    setSelectedChart(newChart);
    onChartChange?.(newChart);
  };

  const handleChartRemove = (chartId: string) => {
    const newCharts = charts.filter(chart => chart.id !== chartId);
    setCharts(newCharts);
    setSelectedChart(newCharts.length > 0 ? newCharts[0] : null);
  };

  return (
    <div className={`chart-view ${className}`}>
      <ChartViewHeader
        charts={charts}
        selectedChart={selectedChart}
        onChartSelect={handleChartSelect}
        onChartAdd={handleChartAdd}
        onChartRemove={handleChartRemove}
      />

      <ChartViewToolbar
        selectedChart={selectedChart}
        onConfigOpen={() => setIsConfigOpen(true)}
        onChartUpdate={handleChartUpdate}
      />

      <div className="chart-view-content">
        <ChartViewCanvas
          chart={selectedChart}
          onChartUpdate={handleChartUpdate}
        />

        {selectedChart && (
          <ChartViewLegend
            chart={selectedChart}
            onLegendItemClick={(item) => {
              // Handle legend item click
              console.log('Legend item clicked:', item);
            }}
          />
        )}
      </div>

      {isConfigOpen && selectedChart && (
        <ChartViewConfig
          chart={selectedChart}
          onClose={() => setIsConfigOpen(false)}
          onSave={handleChartUpdate}
        />
      )}
    </div>
  );
};

export default ChartView;
