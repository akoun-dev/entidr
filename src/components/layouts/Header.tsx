
import React, { useEffect, useState } from 'react';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTheme } from '../providers/theme-provider';
import GlobalSearch from '@/components/GlobalSearch';

export interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { theme, setTheme } = useTheme();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setInitialQuery('');
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-10 sticky top-0 transition-all w-full">
      <div className="h-full w-full px-3 sm:px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative max-w-md hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Rechercher"
              placeholder="Rechercher..."
              className="pl-10 h-9 focus-visible:ring-ivory-orange bg-background border-border/60 w-[200px] lg:w-[320px]"
              onFocus={(e) => { setInitialQuery(''); setCommandOpen(true); e.currentTarget.blur(); }}
              onKeyDown={(e) => {
                const target = e.currentTarget as HTMLInputElement;
                if (e.key === 'Enter') {
                  setInitialQuery(target.value || '');
                  setCommandOpen(true);
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile search trigger */}
          <Button
            aria-label="Rechercher"
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => { setInitialQuery(''); setCommandOpen(true); }}
          >
            <Search className="h-5 w-5" />
          </Button>

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

      {/* Mobile search overlay */}
      <GlobalSearch open={commandOpen} onOpenChange={setCommandOpen} initialQuery={initialQuery} />
    </header>
  );
};
