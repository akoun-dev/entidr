import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import type { ThemeType, ThemeSelectorProps } from './types';

/**
 * Sélecteur de thème avec menu déroulant
 */
export function ThemeSelector({
  currentTheme,
  onThemeChange,
  showLabels = true,
  showIcons = true,
  size = 'md',
  className = ''
}: ThemeSelectorProps) {
  // Options de thème
  const themeOptions = [
    {
      value: 'light' as ThemeType,
      label: 'Clair',
      icon: Sun,
      description: 'Thème clair pour une meilleure visibilité en journée'
    },
    {
      value: 'dark' as ThemeType,
      label: 'Sombre',
      icon: Moon,
      description: 'Thème sombre pour un confort visuel en environnement faible lumière'
    },
    {
      value: 'auto' as ThemeType,
      label: 'Automatique',
      icon: Monitor,
      description: 'S\'adapte automatiquement aux préférences système'
    }
  ];

  // Tailles des boutons
  const sizeClasses = {
    sm: 'h-8 w-8 p-0',
    md: 'h-9 w-9 p-0',
    lg: 'h-10 w-10 p-0'
  };

  // Tailles des icônes
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  // Obtenir l'option actuelle
  const currentOption = themeOptions.find(option => option.value === currentTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`${sizeClasses[size]} ${className}`}
          title="Changer le thème"
        >
          {showIcons && currentOption && (
            <currentOption.icon
              size={iconSizes[size]}
              className="text-muted-foreground"
            />
          )}
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Thème
        </div>

        <DropdownMenuSeparator />

        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === currentTheme;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onThemeChange(option.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {showIcons && (
                <Icon size={16} className="text-muted-foreground" />
              )}

              <div className="flex flex-col flex-1">
                <span className="font-medium">{option.label}</span>
                {showLabels && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>

              {isSelected && (
                <Check size={16} className="text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Le thème sera sauvegardé automatiquement
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Sélecteur de thème simple avec boutons
 */
export function SimpleThemeSelector({
  currentTheme,
  onThemeChange,
  showLabels = true,
  showIcons = true,
  size = 'md',
  className = ''
}: ThemeSelectorProps) {
  // Options de thème
  const themeOptions = [
    {
      value: 'light' as ThemeType,
      label: 'Clair',
      icon: Sun
    },
    {
      value: 'dark' as ThemeType,
      label: 'Sombre',
      icon: Moon
    },
    {
      value: 'auto' as ThemeType,
      label: 'Auto',
      icon: Monitor
    }
  ];

  // Tailles des boutons
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };

  // Tailles des icônes
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = option.value === currentTheme;

        return (
          <Button
            key={option.value}
            variant={isSelected ? 'default' : 'outline'}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
            onClick={() => onThemeChange(option.value)}
            className={`${sizeClasses[size]} ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
            title={option.label}
          >
            {showIcons && (
              <Icon
                size={iconSizes[size]}
                className={showLabels ? 'mr-1' : ''}
              />
            )}
            {showLabels && option.label}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Sélecteur de thème compact pour les barres d'outils
 */
export function CompactThemeSelector({
  currentTheme,
  onThemeChange,
  className = ''
}: Omit<ThemeSelectorProps, 'showLabels' | 'showIcons' | 'size'>) {
  // Options de thème
  const themeOptions = [
    { value: 'light' as ThemeType, icon: Sun },
    { value: 'dark' as ThemeType, icon: Moon },
    { value: 'auto' as ThemeType, icon: Monitor }
  ];

  return (
    <div className={`flex items-center rounded-md border ${className}`}>
      {themeOptions.map((option, index) => {
        const Icon = option.icon;
        const isSelected = option.value === currentTheme;
        const isLast = index === themeOptions.length - 1;

        return (
          <button
            key={option.value}
            onClick={() => onThemeChange(option.value)}
            className={`
              p-2 transition-colors
              ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
              ${!isLast ? 'border-r' : ''}
              ${index === 0 ? 'rounded-l-md' : ''}
              ${isLast ? 'rounded-r-md' : ''}
            `}
            title={`Thème ${option.value}`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}

export default ThemeSelector;
