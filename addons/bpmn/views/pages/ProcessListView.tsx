import React from 'react';

/**
 * Liste des processus BPMN
 */
const ProcessListView: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Processus BPMN</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4">Nom</th>
              <th className="text-left py-2 px-4">Version</th>
              <th className="text-left py-2 px-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4">Processus exemple</td>
              <td className="py-2 px-4">1.0.0</td>
              <td className="py-2 px-4">Brouillon</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessListView;
