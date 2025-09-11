import React from 'react';
import { useTheme } from './useTheme';
import { ThemeSelector, SimpleThemeSelector, CompactThemeSelector } from './ThemeSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Palette, Type, Layout, Square } from 'lucide-react';

/**
 * Exemple d'utilisation du système de thème
 */
export function ThemeExample() {
  const { theme, setTheme, getColor, getFont, getSpacing, getBorder, getShadow } = useTheme();

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
          </div>
        </div>

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
