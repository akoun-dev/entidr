import React, { useMemo } from 'react';

export interface TimelineViewAxisProps {
  dateRange: { start: Date; end: Date };
  timeScale: 'days' | 'weeks' | 'months' | 'years';
  orientation: 'horizontal' | 'vertical';
  zoomLevel: number;
  viewport: { x: number; y: number; width: number; height: number };
  className?: string;
}

export const TimelineViewAxis: React.FC<TimelineViewAxisProps> = ({
  dateRange,
  timeScale,
  orientation,
  zoomLevel,
  viewport,
  className = ''
}) => {
  const formatDate = (date: Date, format: 'short' | 'medium' | 'long' = 'short'): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: format === 'short' ? 'numeric' : '2-digit',
      month: format === 'short' ? 'numeric' : 'short',
      year: format === 'long' ? 'numeric' : undefined
    };

    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  };

  const generateTimeMarks = useMemo(() => {
    const marks: Array<{
      date: Date;
      position: number;
      label: string;
      isMajor: boolean;
    }> = [];

    const startTime = dateRange.start.getTime();
    const endTime = dateRange.end.getTime();
    const totalTime = endTime - startTime;

    // Déterminer l'intervalle en fonction de l'échelle et du zoom
    const getInterval = () => {
      const baseIntervals = {
        days: 24 * 60 * 60 * 1000,      // 1 jour
        weeks: 7 * 24 * 60 * 60 * 1000,   // 1 semaine
        months: 30 * 24 * 60 * 60 * 1000,  // ~1 mois
        years: 365 * 24 * 60 * 60 * 1000  // ~1 an
      };

      const adjustedInterval = baseIntervals[timeScale] / zoomLevel;

      // Ajuster l'intervalle pour avoir un nombre raisonnable de marques
      const targetMarks = Math.max(5, Math.min(20, 10 * zoomLevel));
      const interval = Math.max(adjustedInterval, totalTime / targetMarks);

      // Normaliser l'intervalle
      const day = 24 * 60 * 60 * 1000;
      const week = 7 * day;
      const month = 30 * day;
      const year = 365 * day;

      if (interval < day) {
        return { interval: day / 2, majorInterval: day, labelFormat: 'short' };
      } else if (interval < week) {
        return { interval: day, majorInterval: week, labelFormat: 'short' };
      } else if (interval < month) {
        return { interval: week, majorInterval: month, labelFormat: 'medium' };
      } else if (interval < year) {
        return { interval: month, majorInterval: year, labelFormat: 'medium' };
      } else {
        return { interval: year, majorInterval: year * 5, labelFormat: 'long' };
      }
    };

    const { interval, majorInterval, labelFormat } = getInterval();

    // Générer les marques
    let currentTime = new Date(Math.floor(startTime / interval) * interval);

    while (currentTime <= dateRange.end) {
      const position = ((currentTime.getTime() - startTime) / totalTime) * 100;

      // Déterminer si c'est une marque majeure
      const isMajor = currentTime.getTime() % majorInterval === 0;

      // Générer le label
      let label: string;
      if (isMajor) {
        label = formatDate(currentTime, labelFormat as 'short' | 'medium' | 'long');
      } else {
        // Pour les marques mineures, utiliser un format plus court
        if (timeScale === 'days') {
          label = currentTime.getDate().toString();
        } else if (timeScale === 'weeks') {
          label = `S${Math.ceil((currentTime.getTime() - new Date(currentTime.getFullYear(), 0, 1).getTime()) / week)}`;
        } else if (timeScale === 'months') {
          label = (currentTime.getMonth() + 1).toString();
        } else {
          label = currentTime.getFullYear().toString();
        }
      }

      marks.push({
        date: new Date(currentTime),
        position,
        label,
        isMajor
      });

      currentTime = new Date(currentTime.getTime() + interval);
    }

    return marks;
  }, [dateRange, timeScale, zoomLevel]);

  const renderHorizontalAxis = () => (
    <div className={`timeline-axis-horizontal absolute bottom-0 left-0 right-0 h-8 ${className}`}>
      {/* Ligne principale */}
      <div className="absolute bottom-4 left-0 right-0 h-px bg-gray-400"></div>

      {/* Marques */}
      {generateTimeMarks.map((mark, index) => (
        <div
          key={index}
          className="absolute transform -translate-x-1/2"
          style={{ left: `${mark.position}%` }}
        >
          {/* Marque */}
          <div
            className={`absolute bottom-4 w-px ${
              mark.isMajor ? 'h-3 bg-gray-600' : 'h-2 bg-gray-400'
            }`}
          ></div>

          {/* Label */}
          {mark.isMajor && (
            <div className="absolute bottom-0 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
              {mark.label}
            </div>
          )}
        </div>
      ))}

      {/* Labels de début et de fin */}
      <div className="absolute bottom-0 left-0 text-xs text-gray-500">
        {formatDate(dateRange.start)}
      </div>
      <div className="absolute bottom-0 right-0 transform translate-x-1/2 text-xs text-gray-500">
        {formatDate(dateRange.end)}
      </div>
    </div>
  );

  const renderVerticalAxis = () => (
    <div className={`timeline-axis-vertical absolute top-0 left-0 bottom-0 w-12 ${className}`}>
      {/* Ligne principale */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-400"></div>

      {/* Marques */}
      {generateTimeMarks.map((mark, index) => (
        <div
          key={index}
          className="absolute transform -translate-y-1/2"
          style={{ top: `${mark.position}%` }}
        >
          {/* Marque */}
          <div
            className={`absolute left-4 h-px ${
              mark.isMajor ? 'w-3 bg-gray-600' : 'w-2 bg-gray-400'
            }`}
          ></div>

          {/* Label */}
          {mark.isMajor && (
            <div className="absolute left-0 transform -translate-y-1/2 text-xs text-gray-600 whitespace-nowrap">
              {mark.label}
            </div>
          )}
        </div>
      ))}

      {/* Labels de début et de fin */}
      <div className="absolute top-0 left-0 text-xs text-gray-500">
        {formatDate(dateRange.start)}
      </div>
      <div className="absolute bottom-0 left-0 transform -translate-y-1/2 text-xs text-gray-500">
        {formatDate(dateRange.end)}
      </div>
    </div>
  );

  const renderGridLines = () => {
    if (orientation === 'horizontal') {
      return (
        <div className="timeline-grid-lines absolute inset-0 pointer-events-none">
          {generateTimeMarks.filter(mark => mark.isMajor).map((mark, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 w-px bg-gray-200"
              style={{ left: `${mark.position}%` }}
            ></div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="timeline-grid-lines absolute inset-0 pointer-events-none">
          {generateTimeMarks.filter(mark => mark.isMajor).map((mark, index) => (
            <div
              key={index}
              className="absolute left-0 right-0 h-px bg-gray-200"
              style={{ top: `${mark.position}%` }}
            ></div>
          ))}
        </div>
      );
    }
  };

  return (
    <>
      {renderGridLines()}
      {orientation === 'horizontal' ? renderHorizontalAxis() : renderVerticalAxis()}
    </>
  );
};

export default TimelineViewAxis;
