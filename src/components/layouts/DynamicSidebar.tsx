import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { getIconComponent } from '../../lib/iconUtils';
import { ChevronLeft, ChevronRight, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import AddonManager from '../../core/AddonManager';
import { MenuDefinition } from '../../types/addon';

interface DynamicSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Sidebar dynamique qui charge les menus à partir des addons
 */
export const DynamicSidebar: React.FC<DynamicSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [rootMenus, setRootMenus] = useState<MenuDefinition[]>([]);
  const [childMenus, setChildMenus] = useState<Record<string, MenuDefinition[]>>({});

  // Charger les menus au démarrage
  useEffect(() => {
    const allMenus = AddonManager.getAllMenus();

    // Trier les menus par séquence
    const sortedMenus = [...allMenus].sort((a, b) => a.sequence - b.sequence);

    // Séparer les menus racines et les menus enfants
    const roots: MenuDefinition[] = [];
    const children: Record<string, MenuDefinition[]> = {};

    sortedMenus.forEach(menu => {
      if (!menu.parent) {
        roots.push(menu);
      } else {
        if (!children[menu.parent]) {
          children[menu.parent] = [];
        }
        children[menu.parent].push(menu);
      }
    });

    // Trier les menus enfants par séquence
    Object.keys(children).forEach(parentId => {
      children[parentId].sort((a, b) => a.sequence - b.sequence);
    });

    setRootMenus(roots);
    setChildMenus(children);

    // Déterminer quelles sections doivent être ouvertes par défaut
    const initialOpenSections: Record<string, boolean> = {};
    const currentPath = location.pathname;

    // Ouvrir la section si le chemin actuel correspond à un menu enfant
    Object.keys(children).forEach(parentId => {
      const hasActiveChild = children[parentId].some(
        child => child.route && currentPath.startsWith(child.route)
      );
      initialOpenSections[parentId] = hasActiveChild;
    });

    // Ouvrir également la section si le chemin actuel correspond à un menu racine
    roots.forEach(root => {
      if (root.route && currentPath.startsWith(root.route)) {
        initialOpenSections[root.id] = true;
      }
    });

    setOpenSections(initialOpenSections);
  }, [location.pathname]);

  // Vérifier si un menu est actif
  const isMenuActive = (route?: string) => {
    if (!route) return false;
    return location.pathname.startsWith(route);
  };

  // Vérifier si une section a un enfant actif
  const hasSectionActiveChild = (parentId: string) => {
    const children = childMenus[parentId] || [];
    return children.some(child => isMenuActive(child.route));
  };

  // Gérer l'ouverture/fermeture d'une section
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 bg-sidebar transition-all duration-300 shadow-md border-r border-sidebar-border flex flex-col",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo et brand */}
      <div className={cn(
        "h-16 px-4 flex items-center border-b border-sidebar-border",
        isOpen ? "justify-between" : "justify-center"
      )}>
        {isOpen ? (
          <>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-ivory-orange to-ivory-orange/70 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">ERP</span>
              </div>
              <span className="text-xl font-medium text-sidebar-foreground">ENTIDR</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 text-sidebar-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Contenu du menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Menus racines */}
        {rootMenus.map(menu => (
          <div key={menu.id} className="mb-4">
            {isOpen ? (
              // Si le menu a des enfants, afficher un collapsible
              childMenus[menu.id] && childMenus[menu.id].length > 0 ? (
                <Collapsible
                  open={openSections[menu.id]}
                  onOpenChange={() => toggleSection(menu.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm font-medium",
                        hasSectionActiveChild(menu.id) || isMenuActive(menu.route)
                          ? "text-sidebar-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        {getIconComponent(menu.icon, "h-5 w-5 text-ivory-orange")}
                        <span className="ml-3">{menu.name}</span>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        openSections[menu.id] ? "transform rotate-180" : ""
                      )} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 ml-2">
                    <ul className="pl-4 space-y-1">
                      {/* Si le menu racine a une route, l'afficher comme premier élément */}
                      {menu.route && (
                        <li>
                          <NavLink
                            to={menu.route}
                            className={({ isActive }) => cn(
                              "flex items-center px-3 py-2 rounded-md text-sm",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                          >
                            {getIconComponent(menu.icon, "w-4 h-4")}
                            <span className="ml-3">Vue d'ensemble</span>
                          </NavLink>
                        </li>
                      )}

                      {/* Afficher les menus enfants */}
                      {childMenus[menu.id]?.map(childMenu => (
                        <li key={childMenu.id}>
                          <NavLink
                            to={childMenu.route || '#'}
                            className={({ isActive }) => cn(
                              "flex items-center px-3 py-2 rounded-md text-sm",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                          >
                            {getIconComponent(childMenu.icon, "w-4 h-4")}
                            <span className="ml-3">{childMenu.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                // Si le menu n'a pas d'enfants, afficher un lien simple
                <NavLink
                  to={menu.route || '#'}
                  className={({ isActive }) => cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {getIconComponent(menu.icon, "w-5 h-5")}
                  <span className="ml-3">{menu.name}</span>
                </NavLink>
              )
            ) : (
              // Version compacte pour la sidebar fermée
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={menu.route || '#'}
                    className={cn(
                      "flex justify-center items-center p-2 rounded-md",
                      isMenuActive(menu.route) || hasSectionActiveChild(menu.id)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    {getIconComponent(menu.icon, "h-5 w-5")}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{menu.name}</TooltipContent>
              </Tooltip>
            )}
          </div>
        ))}

        {/* Séparateur */}
        <div className="mx-3 h-px bg-sidebar-border my-4" />

        {/* Menu de configuration */}
        {isOpen ? (
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2">
              Configuration
            </p>
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              {getIconComponent("Settings", "h-4 w-4")}
              <span className="ml-3">Paramètres</span>
            </NavLink>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="/settings"
                className={cn(
                  "flex justify-center items-center p-2 rounded-md",
                  location.pathname === '/settings'
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {getIconComponent("Settings", "h-4 w-4")}
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">Paramètres</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Footer avec profil utilisateur */}
      <div className={cn(
        "border-t border-sidebar-border p-4",
        isOpen ? "block" : "hidden"
      )}>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-ivory-orange/20 flex items-center justify-center text-ivory-orange">
            <span className="text-sm font-medium">U</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-sidebar-foreground">Utilisateur</p>
            <p className="text-xs text-sidebar-foreground/60">utilisateur@example.com</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-sidebar-foreground/70">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
