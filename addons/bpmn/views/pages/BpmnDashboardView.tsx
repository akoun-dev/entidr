import React, { useEffect, useState } from 'react';
import { analyticsService, BpmnMetrics } from '../../analytics';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Progress } from '../../../../src/components/ui/progress';
import { AlertCircle } from 'lucide-react';

/**
 * Tableau de bord du module BPMN
 */
const BpmnDashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<BpmnMetrics>({
    activeInstances: 0,
    averageDuration: 0,
    slaCompliance: 100
  });
  const [history, setHistory] = useState<{ time: number; duration: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const initial = await analyticsService.fetchMetrics();
      setMetrics(initial);
      setHistory(h => [...h, { time: Date.now(), duration: initial.averageDuration }]);
    };
    load();
    const unsub = analyticsService.subscribe(data => {
      setMetrics(data);
      setHistory(h => [...h, { time: Date.now(), duration: data.averageDuration }].slice(-20));
    });
    return () => unsub();
  }, []);

  const slaAlert = metrics.slaCompliance < 80;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord BPMN</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Instances actives</h3>
          <p className="text-3xl font-bold">{metrics.activeInstances}</p>
          <p className="text-sm text-gray-500 mt-2">En cours d'exécution</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Durée moyenne (s)</h3>
          <p className="text-3xl font-bold">{metrics.averageDuration}</p>
          <p className="text-sm text-gray-500 mt-2">Temps par processus</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Conformité SLA</h3>
          <Progress value={metrics.slaCompliance} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">{metrics.slaCompliance}%</p>
          {slaAlert && (
            <div className="flex items-center text-red-600 mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Non conforme</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Durées moyennes</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="duration" stroke="#8884d8" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BpmnDashboardView;
