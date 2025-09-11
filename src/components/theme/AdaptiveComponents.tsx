import React from 'react';
import { useTheme } from './useTheme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import type { ThemeState } from './types';

/**
 * Composant Card adaptatif qui s'ajuste automatiquement au thème
 */
export function AdaptiveCard({
  title,
  description,
  children,
  className = '',
  ...props
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const { theme } = useTheme();
  const { appliedTheme } = theme;

  // Classes spécifiques au thème
  const themeClasses = {
    light: 'bg-white border-gray-200 text-gray-900',
    dark: 'bg-gray-800 border-gray-700 text-gray-100'
  };

  return (
    <Card
      className={`${themeClasses[appliedTheme]} ${className}`}
      {...props}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * Composant Badge adaptatif avec contraste optimisé
 */
export function AdaptiveBadge({
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  [key: string]: any;
}) {
  const { theme, getColor } = useTheme();
  const { appliedTheme } = theme;

  // Variantes adaptatives avec contraste optimisé
  const variants = {
    light: {
      default: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      success: 'bg-green-100 text-green-800 hover:bg-green-200',
      warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      error: 'bg-red-100 text-red-800 hover:bg-red-200',
      info: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
    },
    dark: {
      default: 'bg-blue-900 text-blue-100 hover:bg-blue-800',
      secondary: 'bg-gray-700 text-gray-100 hover:bg-gray-600',
      success: 'bg-green-900 text-green-100 hover:bg-green-800',
      warning: 'bg-yellow-900 text-yellow-100 hover:bg-yellow-800',
      error: 'bg-red-900 text-red-100 hover:bg-red-800',
      info: 'bg-cyan-900 text-cyan-100 hover:bg-cyan-800'
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${variants[appliedTheme][variant]} ${className}`}
      style={{
        borderColor: getColor('border'),
        transition: 'all 300ms ease-in-out'
      }}
      {...props}
    >
      {children}
    </Badge>
  );
}

/**
 * Composant Button adaptatif avec états visuels améliorés
 */
export function AdaptiveButton({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  [key: string]: any;
}) {
  const { theme, getColor } = useTheme();
  const { appliedTheme } = theme;

  // Variantes adaptatives avec meilleur contraste
  const variants = {
    light: {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border-gray-300 bg-white hover:bg-gray-50',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'hover:bg-gray-100',
      link: 'text-blue-600 underline-offset-4 hover:underline'
    },
    dark: {
      default: 'bg-blue-600 text-white hover:bg-blue-500',
      destructive: 'bg-red-600 text-white hover:bg-red-500',
      outline: 'border-gray-600 bg-gray-800 hover:bg-gray-700',
      secondary: 'bg-gray-700 text-gray-100 hover:bg-gray-600',
      ghost: 'hover:bg-gray-700',
      link: 'text-blue-400 underline-offset-4 hover:underline'
    }
  };

  return (
    <Button
      variant={variant === 'default' ? 'default' : variant}
      size={size}
      className={`${variants[appliedTheme][variant]} ${className}`}
      style={{
        transition: 'all 300ms ease-in-out',
        borderColor: variant === 'outline' ? getColor('border') : undefined
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Composant Alert adaptatif avec accessibilité améliorée
 */
export function AdaptiveAlert({
  title,
  children,
  variant = 'default',
  className = '',
  ...props
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  className?: string;
  [key: string]: any;
}) {
  const { theme, getColor } = useTheme();
  const { appliedTheme } = theme;

  // Variantes adaptatives avec contraste WCAG AA
  const variants = {
    light: {
      default: 'bg-gray-50 border-gray-200 text-gray-800',
      destructive: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800'
    },
    dark: {
      default: 'bg-gray-800 border-gray-700 text-gray-100',
      destructive: 'bg-red-900/20 border-red-800 text-red-100',
      warning: 'bg-yellow-900/20 border-yellow-800 text-yellow-100',
      info: 'bg-blue-900/20 border-blue-800 text-blue-100',
      success: 'bg-green-900/20 border-green-800 text-green-100'
    }
  };

  // Icônes adaptatives
  const icons = {
    default: 'ℹ️',
    destructive: '⚠️',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  return (
    <Alert
      className={`${variants[appliedTheme][variant]} ${className}`}
      style={{
        borderColor: getColor('border'),
        transition: 'all 300ms ease-in-out'
      }}
      {...props}
    >
      {title && (
        <div className="flex items-center gap-2 font-medium mb-1">
          <span role="img" aria-label={variant}>{icons[variant]}</span>
          {title}
        </div>
      )}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

/**
 * Composant de texte adaptatif avec lisibilité optimisée
 */
export function AdaptiveText({
  children,
  variant = 'body',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'muted';
  className?: string;
  [key: string]: any;
}) {
  const { theme, getColor, getFont } = useTheme();
  const { appliedTheme } = theme;

  // Variantes de texte avec lisibilité optimisée
  const variants = {
    light: {
      heading: 'text-gray-900 font-bold',
      subheading: 'text-gray-800 font-semibold',
      body: 'text-gray-700',
      caption: 'text-gray-600',
      muted: 'text-gray-500'
    },
    dark: {
      heading: 'text-gray-100 font-bold',
      subheading: 'text-gray-200 font-semibold',
      body: 'text-gray-300',
      caption: 'text-gray-400',
      muted: 'text-gray-500'
    }
  };

  // Éléments HTML et tailles
  const elements = {
    heading: 'h1',
    subheading: 'h2',
    body: 'p',
    caption: 'span',
    muted: 'span'
  };

  const sizes = {
    heading: 'text-2xl',
    subheading: 'text-xl',
    body: 'text-base',
    caption: 'text-sm',
    muted: 'text-sm'
  };

  const Element = elements[variant] as keyof JSX.IntrinsicElements;

  return (
    <Element
      className={`${variants[appliedTheme][variant]} ${sizes[variant]} ${className}`}
      style={{
        fontFamily: getFont('sans'),
        lineHeight: getFont('lineHeightNormal'),
        letterSpacing: getFont('letterSpacingNormal'),
        color: getColor('text'),
        transition: 'color 300ms ease-in-out'
      }}
      {...props}
    >
      {children}
    </Element>
  );
}

/**
 * Composant de conteneur adaptatif avec espacement optimisé
 */
export function AdaptiveContainer({
  children,
  maxWidth = 'lg',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  [key: string]: any;
}) {
  const { theme, getColor, getSpacing } = useTheme();
  const { appliedTheme } = theme;

  // Classes de largeur maximale
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  // Padding adaptatif
  const paddingClasses = {
    light: 'p-6',
    dark: 'p-6'
  };

  return (
    <div
      className={`${maxWidthClasses[maxWidth]} ${paddingClasses[appliedTheme]} mx-auto ${className}`}
      style={{
        backgroundColor: getColor('background'),
        color: getColor('text'),
        transition: 'all 300ms ease-in-out'
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Hook utilitaire pour les composants adaptatifs
 */
export function useAdaptiveTheme() {
  const { theme } = useTheme();

  return {
    ...theme,
    // Classes utilitaires adaptatives
    classes: {
      background: theme.appliedTheme === 'light' ? 'bg-white' : 'bg-gray-900',
      surface: theme.appliedTheme === 'light' ? 'bg-gray-50' : 'bg-gray-800',
      card: theme.appliedTheme === 'light' ? 'bg-white' : 'bg-gray-800',
      text: theme.appliedTheme === 'light' ? 'text-gray-900' : 'text-gray-100',
      textSecondary: theme.appliedTheme === 'light' ? 'text-gray-600' : 'text-gray-400',
      border: theme.appliedTheme === 'light' ? 'border-gray-200' : 'border-gray-700',
      input: theme.appliedTheme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-600',
      button: theme.appliedTheme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-500'
    },
    // Vérifier si le mode sombre est actif
    isDarkMode: theme.appliedTheme === 'dark',
    // Vérifier si le mode clair est actif
    isLightMode: theme.appliedTheme === 'light'
  };
}

export default AdaptiveCard;
