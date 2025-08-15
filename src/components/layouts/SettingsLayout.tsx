import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DynamicSidebar } from './DynamicSidebar';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Menu, X } from 'lucide-react';

const SettingsLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Gérer l'ouverture/fermeture de la sidebar principale
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar principale */}
      <DynamicSidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />

      {/* Contenu principal */}
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
