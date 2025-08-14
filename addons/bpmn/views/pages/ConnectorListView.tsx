import React from 'react';

/**
 * Liste des connecteurs BPMN
 */
const ConnectorListView: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Connecteurs</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4">Nom</th>
              <th className="text-left py-2 px-4">Type</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-4">HTTP</td>
              <td className="py-2 px-4">REST</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConnectorListView;
