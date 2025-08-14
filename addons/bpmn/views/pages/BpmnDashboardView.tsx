import React from 'react';

/**
 * Tableau de bord du module BPMN
 */
const BpmnDashboardView: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord BPMN</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Processus</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500 mt-2">Processus définis</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Instances actives</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500 mt-2">En cours d'exécution</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Tâches en attente</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500 mt-2">À traiter</p>
        </div>
      </div>
    </div>
  );
};

export default BpmnDashboardView;
