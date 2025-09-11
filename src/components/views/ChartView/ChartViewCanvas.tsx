import React, { useEffect, useRef } from 'react';
import { ChartData } from './ChartView';

export interface ChartViewCanvasProps {
  chart: ChartData | null;
  onChartUpdate: (chart: ChartData) => void;
  width?: number;
  height?: number;
}

export const ChartViewCanvas: React.FC<ChartViewCanvasProps> = ({
  chart,
  onChartUpdate,
  width = 800,
  height = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chart || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner le graphique en fonction du type
    switch (chart.type) {
      case 'line':
        drawLineChart(ctx, chart, width, height);
        break;
      case 'bar':
        drawBarChart(ctx, chart, width, height);
        break;
      case 'pie':
        drawPieChart(ctx, chart, width, height);
        break;
      case 'area':
        drawAreaChart(ctx, chart, width, height);
        break;
      case 'scatter':
        drawScatterChart(ctx, chart, width, height);
        break;
      default:
        drawPlaceholder(ctx, width, height);
    }
  }, [chart, width, height]);

  const drawLineChart = (ctx: CanvasRenderingContext2D, chart: ChartData, width: number, height: number) => {
    if (!chart.data || chart.data.length === 0) {
      drawPlaceholder(ctx, width, height);
      return;
    }

    // Configuration du style
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';

    // Calculer les dimensions
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Trouver les valeurs min/max
    const values = chart.data.map(d => d.value || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue || 1;

    // Dessiner les axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Dessiner la ligne
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    chart.data.forEach((point, index) => {
      const x = padding + (index / (chart.data.length - 1)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Dessiner les points
    ctx.fillStyle = '#3b82f6';
    chart.data.forEach((point, index) => {
      const x = padding + (index / (chart.data.length - 1)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Dessiner le titre
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(chart.title, width / 2, 25);
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D, chart: ChartData, width: number, height: number) => {
    if (!chart.data || chart.data.length === 0) {
      drawPlaceholder(ctx, width, height);
      return;
    }

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const values = chart.data.map(d => d.value || 0);
    const maxValue = Math.max(...values);

    const barWidth = chartWidth / chart.data.length * 0.8;
    const barSpacing = chartWidth / chart.data.length * 0.2;

    // Dessiner les axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Dessiner les barres
    chart.data.forEach((point, index) => {
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = (point.value / maxValue) * chartHeight;
      const y = height - padding - barHeight;

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Dessiner le titre
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(chart.title, width / 2, 25);
  };

  const drawPieChart = (ctx: CanvasRenderingContext2D, chart: ChartData, width: number, height: number) => {
    if (!chart.data || chart.data.length === 0) {
      drawPlaceholder(ctx, width, height);
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    const total = chart.data.reduce((sum, item) => sum + (item.value || 0), 0);
    let currentAngle = -Math.PI / 2;

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    chart.data.forEach((point, index) => {
      const sliceAngle = (point.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Dessiner le titre
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(chart.title, width / 2, 25);
  };

  const drawAreaChart = (ctx: CanvasRenderingContext2D, chart: ChartData, width: number, height: number) => {
    if (!chart.data || chart.data.length === 0) {
      drawPlaceholder(ctx, width, height);
      return;
    }

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const values = chart.data.map(d => d.value || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue || 1;

    // Dessiner les axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Dessiner l'aire
    ctx.beginPath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';

    chart.data.forEach((point, index) => {
      const x = padding + (index / (chart.data.length - 1)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, height - padding);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(width - padding, height - padding);
    ctx.closePath();
    ctx.fill();

    // Dessiner la ligne
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    chart.data.forEach((point, index) => {
      const x = padding + (index / (chart.data.length - 1)) * chartWidth;
      const y = height - padding - ((point.value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Dessiner le titre
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(chart.title, width / 2, 25);
  };

  const drawScatterChart = (ctx: CanvasRenderingContext2D, chart: ChartData, width: number, height: number) => {
    if (!chart.data || chart.data.length === 0) {
      drawPlaceholder(ctx, width, height);
      return;
    }

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const xValues = chart.data.map(d => d.x || 0);
    const yValues = chart.data.map(d => d.y || 0);
    const maxX = Math.max(...xValues);
    const minX = Math.min(...xValues);
    const maxY = Math.max(...yValues);
    const minY = Math.min(...yValues);

    const xRange = maxX - minX || 1;
    const yRange = maxY - minY || 1;

    // Dessiner les axes
    ctx.beginPath();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Dessiner les points
    ctx.fillStyle = '#3b82f6';
    chart.data.forEach((point) => {
      const x = padding + ((point.x - minX) / xRange) * chartWidth;
      const y = height - padding - ((point.y - minY) / yRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Dessiner le titre
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(chart.title, width / 2, 25);
  };

  const drawPlaceholder = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Aucune donnée à afficher', width / 2, height / 2);
  };

  return (
    <div className="chart-view-canvas flex items-center justify-center p-4">
      {chart ? (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border rounded-lg shadow-sm"
        />
      ) : (
        <div className="text-gray-500 text-center">
          <p>Sélectionnez un graphique à afficher</p>
        </div>
      )}
    </div>
  );
};

export default ChartViewCanvas;
