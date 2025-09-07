
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DynamicSidebar } from './DynamicSidebar';
import { Header } from './Header';
import { Toaster } from '../ui/toaster';
import { Toaster as Sonner } from '../ui/sonner';
import { TooltipProvider } from '../ui/tooltip';

/**
 * Layout principal de l'application avec sidebar dynamique
 */
const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <TooltipProvider>
      <div className="relative flex min-h-screen bg-background">
        <Toaster />
        <Sonner />
        <DynamicSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
        />
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <main className={`flex-1 transition-all duration-300 overflow-x-hidden ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
          <Header toggleSidebar={() => setSidebarOpen(prev => !prev)} isSidebarOpen={sidebarOpen} />
          <div className="w-full transition-all px-3 sm:px-4 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default MainLayout;
