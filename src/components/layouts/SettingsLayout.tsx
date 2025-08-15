import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';

const SettingsLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Contenu principal - utilise la sidebar du MainLayout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
