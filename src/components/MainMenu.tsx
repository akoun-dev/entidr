import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AddonManager from '../core/AddonManager';
import { MenuDefinition } from '../types/addon';
import * as LucideIcons from 'lucide-react';

/**
 * Composant qui affiche le menu principal de l'application
 * basé sur les menus définis dans les addons
 */
const MainMenu: React.FC = () => {
  const addonManager = AddonManager.getInstance();
  const [allMenus, setAllMenus] = useState<MenuDefinition[]>(addonManager.getAllMenus());
  const location = useLocation();

  // Keep menus in sync with dynamic addon loading
  useEffect(() => {
    // Initial load (in case addons register after first render)
    setAllMenus(addonManager.getAllMenus());

    // Update when modules finish loading
    const onPostLoad = () => setAllMenus(addonManager.getAllMenus());
    try {
      addonManager.registerHook('postModuleLoad', onPostLoad);
    } catch {}
  }, [addonManager]);

  // Filtrer les menus racines (sans parent)
  const rootMenus = allMenus.filter(menu => !menu.parent);

  // Trier les menus par séquence
  rootMenus.sort((a, b) => a.sequence - b.sequence);

  // Fonction pour obtenir les sous-menus d'un menu
  const getChildMenus = (parentId: string): MenuDefinition[] => {
    const children = allMenus.filter(menu => menu.parent === parentId);
    children.sort((a, b) => a.sequence - b.sequence);
    return children;
  };

  // Fonction pour rendre une icône Lucide
  const renderIcon = (iconName: string | undefined) => {
    if (!iconName) return null;

    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5 mr-2" /> : null;
  };

  // Fonction pour vérifier si un menu est actif
  const isActive = (route: string | undefined) => {
    if (!route) return false;
    return location.pathname.startsWith(route);
  };

  return (
    <nav className="space-y-1">
      {rootMenus.map(menu => (
        <div key={menu.id} className="space-y-1">
          {menu.route ? (
            <Link
              to={menu.route}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive(menu.route)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {menu.icon && renderIcon(menu.icon)}
              {menu.name}
            </Link>
          ) : (
            <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
              {menu.icon && renderIcon(menu.icon)}
              {menu.name}
            </div>
          )}

          {/* Nous ne montrons plus les sous-menus dans la sidebar */}
        </div>
      ))}
    </nav>
  );
};

export default MainMenu;
