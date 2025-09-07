
import React from 'react';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTheme } from '../providers/theme-provider';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border/40 bg-background z-10 sticky top-0 transition-all">
      <div className="h-full mx-auto px-10 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative max-w-md hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 h-9 focus-visible:ring-ivory-orange bg-background border-border/60 w-[200px] lg:w-[300px]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ivory-orange"></span>
          </Button>

          <div className="h-9 w-9 rounded-full bg-ivory-orange/20 flex items-center justify-center text-ivory-orange md:hidden">
            <span className="text-sm font-medium">U</span>
          </div>
        </div>
      </div>
    </header>
  );
};
