import React, { useState } from 'react';
import { ChartData } from './ChartView';

export interface LegendItem {
  id: string;
  label: string;
  color: string;
  visible: boolean;
  value?: number;
  percentage?: number;
}

export interface ChartViewLegendProps {
  chart: ChartData;
  onLegendItemClick: (item: LegendItem) => void;
  position?: 'right' | 'bottom' | 'top' | 'left';
  className?: string;
}

export const ChartViewLegend: React.FC<ChartViewLegendProps> = ({
  chart,
  onLegendItemClick,
  position = 'right',
  className = ''
}) => {
  const [legendItems, setLegendItems] = useState<LegendItem[]>(() => {
    if (!chart.data || chart.data.length === 0) return [];

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    if (chart.type === 'pie') {
      const total = chart.data.reduce((sum, item) => sum + (item.value || 0), 0);
      return chart.data.map((item, index) => ({
        id: item.id || `item-${index}`,
        label: item.label || `Série ${index + 1}`,
        color: colors[index % colors.length],
        visible: true,
        value: item.value,
        percentage: total > 0 ? ((item.value || 0) / total) * 100 : 0
      }));
    } else {
      // Pour les autres types de graphiques, créer des éléments de légende basés sur les séries
      return chart.data.map((item, index) => ({
        id: item.id || `item-${index}`,
        label: item.label || `Série ${index + 1}`,
        color: colors[index % colors.length],
        visible: true,
        value: item.value
      }));
    }
  });

  const handleItemClick = (item: LegendItem) => {
    const updatedItems = legendItems.map(legendItem =>
      legendItem.id === item.id
        ? { ...legendItem, visible: !legendItem.visible }
        : legendItem
    );
    setLegendItems(updatedItems);
    onLegendItemClick(item);
  };

  const handleShowAll = () => {
    const updatedItems = legendItems.map(item => ({ ...item, visible: true }));
    setLegendItems(updatedItems);
  };

  const handleHideAll = () => {
    const updatedItems = legendItems.map(item => ({ ...item, visible: false }));
    setLegendItems(updatedItems);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'flex-col items-start border-l pl-4';
      case 'left':
        return 'flex-col items-end border-r pr-4';
      case 'top':
        return 'flex-row items-center border-b pb-4';
      case 'bottom':
        return 'flex-row items-center border-t pt-4';
      default:
        return 'flex-col items-start border-l pl-4';
    }
  };

  const visibleItems = legendItems.filter(item => item.visible);
  const hiddenItems = legendItems.filter(item => !item.visible);

  return (
    <div className={`chart-view-legend flex ${getPositionClasses()} ${className}`}>
      <div className="legend-header mb-2">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Légende</h4>
        <div className="flex space-x-1">
          <button
            onClick={handleShowAll}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Tout afficher
          </button>
          <button
            onClick={handleHideAll}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Tout masquer
          </button>
        </div>
      </div>

      {visibleItems.length > 0 && (
        <div className="legend-items space-y-1">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="legend-item flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              onClick={() => handleItemClick(item)}
            >
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
              {item.value !== undefined && (
                <span className="text-xs text-gray-500">
                  {chart.type === 'pie'
                    ? `${item.percentage?.toFixed(1)}%`
                    : item.value.toLocaleString()
                  }
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {hiddenItems.length > 0 && (
        <div className="hidden-items mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Masqué:</div>
          {hiddenItems.map((item) => (
            <div
              key={item.id}
              className="legend-item flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded opacity-60"
              onClick={() => handleItemClick(item)}
            >
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-500 line-through">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {legendItems.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          Aucune donnée pour la légende
        </div>
      )}
    </div>
  );
};

export default ChartViewLegend;
