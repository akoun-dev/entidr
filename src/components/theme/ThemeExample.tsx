import React, { useState } from 'react';
import { useTheme } from './useTheme';
import { ThemeSelector, SimpleThemeSelector, CompactThemeSelector } from './ThemeSelector';
import { ColorCustomizationPanel } from './ColorCustomizationPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Palette, Type, Layout, Square, Settings, Paintbrush } from 'lucide-react';

/**
 * Exemple d'utilisation du système de thème
 */
export function ThemeExample() {
  const { theme, setTheme, getColor, getFont, getSpacing, getBorder, getShadow } = useTheme();
  const [showColorCustomization, setShowColorCustomization] = useState(false);

  // Configuration de démonstration pour la personnalisation des couleurs
  const demoConfig = {
    id: 'demo-theme',
    name: 'Thème de Démonstration',
    version: '1.0.0',
    type: 'light' as const,
    detectionMode: 'system' as const,
    customization: {
      enabled: {
        colors: true,
        fonts: false,
        spacing: false,
        borders: false,
        shadows: false
      },
      constraints: {
        minFontSize: 12,
        maxFontSize: 24,
        minSpacing: 1,
        maxSpacing: 16,
        maxBorderRadius: 16
      }
    },
    performance: {
      lazyLoadFonts: false,
      optimizeAnimations: true,
      enableCache: true
    },
    colors: {
      light: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        neutral: '#6b7280',
        background: '#ffffff',
        surface: '#f8fafc',
        card: '#ffffff',
        dialog: '#ffffff',
        text: '#1f2937',
        textSecondary: '#6b7280',
        textDisabled: '#9ca3af',
        textInverse: '#ffffff',
        border: '#e5e7eb',
        borderLight: '#f3f4f6',
        borderStrong: '#d1d5db',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        hover: '#f3f4f6',
        active: '#e5e7eb',
        focus: '#3b82f6',
        selected: '#eff6ff',
        shadow: '#000000',
        shadowLight: '#00000020',
        shadowStrong: '#00000040'
      },
      dark: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        accent: '#22d3ee',
        neutral: '#9ca3af',
        background: '#0f172a',
        surface: '#1e293b',
        card: '#1e293b',
        dialog: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        textDisabled: '#64748b',
        textInverse: '#0f172a',
        border: '#334155',
        borderLight: '#475569',
        borderStrong: '#1e293b',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa',
        hover: '#334155',
        active: '#475569',
        focus: '#60a5fa',
        selected: '#1e3a8a',
        shadow: '#000000',
        shadowLight: '#00000030',
        shadowStrong: '#00000060'
      }
    },
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'monospace'],
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      lineHeightTight: 1.25,
      lineHeightNormal: 1.5,
      lineHeightRelaxed: 1.625,
      lineHeightLoose: 2,
      letterSpacingTight: '-0.025em',
      letterSpacingNormal: '0',
      letterSpacingWide: '0.025em'
    },
    spacing: {
      px: '1px',
      '0.5': '0.125rem',
      '1': '0.25rem',
      '1.5': '0.375rem',
      '2': '0.5rem',
      '2.5': '0.625rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '7': '1.75rem',
      '8': '2rem',
      '9': '2.25rem',
      '10': '2.5rem',
      '11': '2.75rem',
      '12': '3rem',
      '14': '3.5rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
      '28': '7rem',
      '32': '8rem',
      '36': '9rem',
      '40': '10rem',
      '44': '11rem',
      '48': '12rem',
      '52': '13rem',
      '56': '14rem',
      '60': '15rem',
      '64': '16rem',
      '72': '18rem',
      '80': '20rem',
      '96': '24rem'
    },
    borders: {
      widthNone: '0',
      widthSm: '1px',
      widthMd: '2px',
      widthLg: '4px',
      widthXl: '8px',
      width2xl: '12px',
      width3xl: '16px',
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
      double: 'double',
      groove: 'groove',
      ridge: 'ridge',
      inset: 'inset',
      outset: 'outset',
      radiusNone: '0',
      radiusSm: '0.25rem',
      radiusMd: '0.375rem',
      radiusLg: '0.5rem',
      radiusXl: '0.75rem',
      radius2xl: '1rem',
      radius3xl: '1.5rem',
      radiusFull: '9999px'
    },
    shadows: {
      none: '0 0 #0000',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      colored: {
        success: '0 0 0 2px #10b981',
        warning: '0 0 0 2px #f59e0b',
        error: '0 0 0 2px #ef4444',
        info: '0 0 0 2px #3b82f6'
      },
      inner: {
        sm: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: 'inset 0 4px 6px -1px rgb(0 0 0 / 0.1), inset 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: 'inset 0 10px 15px -3px rgb(0 0 0 / 0.1), inset 0 4px 6px -4px rgb(0 0 0 / 0.1)'
      }
    },
    animations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      short: '100ms',
      medium: '200ms',
      long: '300ms'
    },
    breakpoints: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    accessibility: {
      minContrastRatio: 4.5,
      minFontSize: 16,
      reduceMotion: false,
      highContrast: false
    }
  };

  // Fonction pour démontrer l'accès aux valeurs du thème
  const handleShowThemeValues = () => {
    console.log('Valeurs du thème actuel:', {
      primary: getColor('primary'),
      background: getColor('background'),
      text: getColor('text'),
      border: getColor('border'),
      success: getColor('success'),
      fontBase: getFont('base'),
      spacing4: getSpacing('4'),
      borderMd: getBorder('widthMd'),
      shadowLg: getShadow('lg')
    });
  };

  // Fonction pour gérer les changements de configuration
  const handleConfigChange = (newConfig: any) => {
    console.log('Configuration mise à jour:', newConfig);
    // Dans une vraie application, vous mettriez à jour le thème ici
  };

  return (
    <div className="min-h-screen p-6" style={{
      backgroundColor: getColor('background'),
      color: getColor('text')
    }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête avec sélecteur de thème */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: getColor('text') }}>
              Exemple du Système de Thème
            </h1>
            <p className="text-lg" style={{ color: getColor('textSecondary') }}>
              Thème actuel: {theme.currentTheme} (appliqué: {theme.appliedTheme})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSelector
              currentTheme={theme.currentTheme}
              onThemeChange={setTheme}
              showLabels={true}
              showIcons={true}
              size="md"
            />

            <Button
              variant="outline"
              onClick={() => setShowColorCustomization(!showColorCustomization)}
              className="flex items-center gap-2"
            >
              <Paintbrush size={16} />
              Personnaliser les couleurs
            </Button>
          </div>
        </div>

        {/* Panneau de personnalisation des couleurs */}
        {showColorCustomization && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Personnalisation des Couleurs
              </CardTitle>
              <CardDescription>
                Modifiez les couleurs de votre thème et voyez les changements en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColorCustomizationPanel
                config={demoConfig}
                onConfigChange={handleConfigChange}
                sections={['colors', 'presets', 'accessibility']}
              />
            </CardContent>
          </Card>
        )}

        {/* Cartes de démonstration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carte des couleurs */}
          <Card style={{
            backgroundColor: getColor('card'),
            borderColor: getColor('border'),
            borderWidth: getBorder('widthSm'),
            boxShadow: getShadow('md')
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette size={20} />
                Couleurs du Thème
              </CardTitle>
              <CardDescription>
                Palette de couleurs pour le thème {theme.appliedTheme}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-3 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: getColor('primary') }}
                >
                  Primary
                </div>
                <div
                  className="p-3 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: getColor('secondary') }}
                >
                  Secondary
                </div>
                <div
                  className="p-3 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: getColor('success') }}
                >
                  Success
                </div>
                <div
                  className="p-3 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: getColor('warning') }}
                >
                  Warning
                </div>
                <div
                  className="p-3 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: getColor('error') }}
                >
                  Error
                </div>
                <div
                  className="p-3 rounded text-white text-sm font-medium"
                  style={{ backgroundColor: getColor('info') }}
                >
                  Info
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte des polices */}
          <Card style={{
            backgroundColor: getColor('card'),
            borderColor: getColor('border'),
            borderWidth: getBorder('widthSm'),
            boxShadow: getShadow('md')
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type size={20} />
                Polices du Thème
              </CardTitle>
              <CardDescription>
                Système de typographie et tailles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs" style={{ fontFamily: getFont('sans') }}>
                  Texte extra small (xs) - {getFont('xs')}
                </p>
                <p className="text-sm" style={{ fontFamily: getFont('sans') }}>
                  Texte small (sm) - {getFont('sm')}
                </p>
                <p className="text-base" style={{ fontFamily: getFont('sans') }}>
                  Texte base - {getFont('base')}
                </p>
                <p className="text-lg" style={{ fontFamily: getFont('sans') }}>
                  Texte large (lg) - {getFont('lg')}
                </p>
                <p className="text-xl" style={{ fontFamily: getFont('sans') }}>
                  Texte extra large (xl) - {getFont('xl')}
                </p>
              </div>

              <div className="space-y-2">
                <p style={{ fontWeight: 300 }}>Light (300)</p>
                <p style={{ fontWeight: 400 }}>Normal (400)</p>
                <p style={{ fontWeight: 600 }}>Semibold (600)</p>
                <p style={{ fontWeight: 700 }}>Bold (700)</p>
              </div>
            </CardContent>
          </Card>

          {/* Carte de l'espacement */}
          <Card style={{
            backgroundColor: getColor('card'),
            borderColor: getColor('border'),
            borderWidth: getBorder('widthSm'),
            boxShadow: getShadow('md')
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout size={20} />
                Espacement du Thème
              </CardTitle>
              <CardDescription>
                Système d'espacement et mise en page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[1, 2, 3, 4, 6, 8].map((size) => (
                  <div
                    key={size}
                    className="bg-primary/20 rounded flex items-center justify-center text-xs"
                    style={{
                      height: getSpacing(String(size) as any),
                      backgroundColor: getColor('primary') + '20'
                    }}
                  >
                    spacing-{size} ({getSpacing(String(size) as any)})
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div
                  className="rounded p-2 text-xs"
                  style={{
                    backgroundColor: getColor('border'),
                    borderRadius: getBorder('radiusSm')
                  }}
                >
                  Border radius sm ({getBorder('radiusSm')})
                </div>
                <div
                  className="rounded p-2 text-xs"
                  style={{
                    backgroundColor: getColor('border'),
                    borderRadius: getBorder('radiusMd')
                  }}
                >
                  Border radius md ({getBorder('radiusMd')})
                </div>
                <div
                  className="rounded p-2 text-xs"
                  style={{
                    backgroundColor: getColor('border'),
                    borderRadius: getBorder('radiusLg')
                  }}
                >
                  Border radius lg ({getBorder('radiusLg')})
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte des ombres */}
          <Card style={{
            backgroundColor: getColor('card'),
            borderColor: getColor('border'),
            borderWidth: getBorder('widthSm'),
            boxShadow: getShadow('md')
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Square size={20} />
                Ombres du Thème
              </CardTitle>
              <CardDescription>
                Système d'ombres et effets visuels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ boxShadow: getShadow('sm') }}
                >
                  <p className="text-sm font-medium">Shadow sm</p>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ boxShadow: getShadow('md') }}
                >
                  <p className="text-sm font-medium">Shadow md</p>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ boxShadow: getShadow('lg') }}
                >
                  <p className="text-sm font-medium">Shadow lg</p>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ boxShadow: getShadow('xl') }}
                >
                  <p className="text-sm font-medium">Shadow xl</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg border-2"
                  style={{
                    boxShadow: getShadow('colored'),
                    borderColor: getColor('success')
                  }}
                >
                  <p className="text-sm font-medium">Success shadow</p>
                </div>
                <div
                  className="p-4 rounded-lg border-2"
                  style={{
                    boxShadow: getShadow('colored'),
                    borderColor: getColor('error')
                  }}
                >
                  <p className="text-sm font-medium">Error shadow</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte des sélecteurs */}
          <Card style={{
            backgroundColor: getColor('card'),
            borderColor: getColor('border'),
            borderWidth: getBorder('widthSm'),
            boxShadow: getShadow('md')
          }}>
            <CardHeader>
              <CardTitle>Sélecteurs de Thème</CardTitle>
              <CardDescription>
                Différentes variantes de sélecteurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Sélecteur simple</h4>
                <SimpleThemeSelector
                  currentTheme={theme.currentTheme}
                  onThemeChange={setTheme}
                  showLabels={true}
                  showIcons={true}
                  size="sm"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Sélecteur compact</h4>
                <CompactThemeSelector
                  currentTheme={theme.currentTheme}
                  onThemeChange={setTheme}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Actions</h4>
                <Button onClick={handleShowThemeValues} variant="outline" className="w-full">
                  Afficher les valeurs du thème dans la console
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte d'information */}
          <Card style={{
            backgroundColor: getColor('card'),
            borderColor: getColor('border'),
            borderWidth: getBorder('widthSm'),
            boxShadow: getShadow('md')
          }}>
            <CardHeader>
              <CardTitle>Informations du Thème</CardTitle>
              <CardDescription>
                Détails sur la configuration actuelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-mono">{theme.config.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nom:</span>
                  <span>{theme.config.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span>{theme.config.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{theme.config.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Détection:</span>
                  <span>{theme.config.detectionMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière mise à jour:</span>
                  <span>{theme.lastUpdated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chargement:</span>
                  <span>{theme.isLoading ? 'Oui' : 'Non'}</span>
                </div>
                {theme.error && (
                  <div className="flex justify-between text-red-500">
                    <span>Erreur:</span>
                    <span>{theme.error}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t" style={{ borderColor: getColor('border') }}>
          <p className="text-sm" style={{ color: getColor('textSecondary') }}>
            Système de thème complet avec persistance, détection automatique et personnalisation avancée
          </p>
        </div>
      </div>
    </div>
  );
}

export default ThemeExample;
