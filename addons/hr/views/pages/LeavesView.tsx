import React from 'react';
import { HrLayout } from '../components';

/**
 * Page de liste des congés
 */
const LeavesView: React.FC = () => {
  return (
    <HrLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Congés</h1>
        <div className="mt-8 p-8 text-center bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">
            Cette fonctionnalité est en cours de développement.
          </p>
        </div>
      </div>
    </HrLayout>
  );
};

export default LeavesView;
