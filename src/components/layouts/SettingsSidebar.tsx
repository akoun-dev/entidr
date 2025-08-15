import React, { useState, FC } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ChevronRight, ChevronDown, Settings, ArrowLeft } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { settingsCategories } from '../../core/types/settingsCategories';
import { Button } from '../../components/ui/button';

const SettingsSidebar: FC = () => {
  const location = useLocation();
  const [openCategories, setOpenCategories] = useState<string[]>(['general']);

  // Vérifier si un item est actif
  const isActive = (route: string) => location.pathname === route;

  // Vérifier si une catégorie est active (au moins un de ses items est actif)
  const isCategoryActive = (items: typeof settingsCategories[number]['items']) => 
    items.some(item => isActive(item.route) || location.pathname.startsWith(item.route));

  // Gérer l'ouverture/fermeture des catégories
  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Ouvrir automatiquement la catégorie active
  React.useEffect(() => {
    settingsCategories.forEach(category => {
      if (isCategoryActive(category.items) && !openCategories.includes(category.id)) {
        setOpenCategories(prev => [...prev, category.id]);
      }
    });
  }, [location.pathname]);

  const navigate = useNavigate();
  const currentCategory = settingsCategories.find(cat =>
    cat.items.some(item => location.pathname.includes(item.route))
  )?.name || 'Paramètres';

  return (
    <aside className="w-72 bg-sidebar h-full overflow-y-auto">
      {/* En-tête */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-sidebar-foreground/70 hover:text-ivory-orange"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
          <h2 className="text-xl font-semibold flex items-center text-sidebar-foreground">
            <Settings className="w-5 h-5 mr-2 text-ivory-orange" />
            {currentCategory as React.ReactNode}
          </h2>
        </div>
        <p className="text-sm text-sidebar-foreground/70 mt-1">
          {settingsCategories.find(cat => cat.name === (currentCategory as string))?.description ||
           'Configuration globale de l\'application'}
        </p>
      </div>

      {/* Contenu du menu */}
      <div className="py-2">
        {settingsCategories.map(category => (
          <Collapsible
            key={category.id}
            open={openCategories.includes(category.id)}
            onOpenChange={() => toggleCategory(category.id)}
            className="border-b border-sidebar-border/50"
          >
            <CollapsibleTrigger className="w-full">
              <div className={cn(
                "flex items-center justify-between px-4 py-3 hover:bg-sidebar-accent/30 cursor-pointer",
                isCategoryActive(category.items) ? "text-ivory-orange font-medium" : "text-sidebar-foreground"
              )}>
                <div className="flex items-center">
                  <category.icon className={cn(
                    "w-5 h-5 mr-2",
                    isCategoryActive(category.items) ? "text-ivory-orange" : "text-sidebar-foreground/70"
                  )} />
                  <span>{category.name}</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  openCategories.includes(category.id) ? "transform rotate-180" : ""
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="py-1 bg-sidebar-accent/10">
                <p className="text-xs text-sidebar-foreground/60 px-4 py-1">{category.description}</p>
                <ul className="space-y-1 py-2">
                  {category.items.map(item => (
                    <li key={item.id}>
                      <NavLink
                        to={item.route}
                        className={({ isActive }) => cn(
                          "flex items-center justify-between px-6 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="w-4 h-4 mr-2" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-opacity",
                          isActive(item.route) ? "opacity-100" : "opacity-0"
                        )} />
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </aside>
  );
};

export default SettingsSidebar;
