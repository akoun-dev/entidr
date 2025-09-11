import React, { useState, useCallback } from 'react';
import { Type, Download, Upload, RefreshCw, Check, AlertCircle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { ThemeConfig } from './types';
import type { FontInfo } from './fontUtils';
import { FontSelector, FontSelectorProps } from './FontSelector';
import {
  FONT_PRESETS,
  FONT_SIZE_SCALE,
  LINE_HEIGHT_SCALE,
  FONT_WEIGHTS,
  LETTER_SPACING_SCALE,
  listFontPresets,
  getFontPreset,
  applyFontPreset,
  createSemanticFontConfig,
  adaptFontsForDarkMode
} from './fontUtils';
import { AsyncFontLoader, useFontLoader } from './fontLoader';

/**
 * Interface pour les props du FontCustomizationPanel
 */
export interface FontCustomizationPanelProps {
  // Configuration actuelle
  config: ThemeConfig;

  // Callback de changement
  onConfigChange: (config: ThemeConfig) => void;

  // Classes CSS
  className?: string;
}

/**
 * Interface pour la configuration de polices personnalisée
 */
interface CustomFontConfig {
  sans: FontInfo;
  serif: FontInfo;
  mono: FontInfo;
  display?: FontInfo;
  body?: FontInfo;
  heading?: FontInfo;
  sizes: Record<string, string>;
  weights: Record<string, number>;
  lineHeights: Record<string, number>;
  letterSpacings: Record<string, string>;
}

/**
 * Composant pour afficher les statistiques de police
 */
function FontStats({ config }: { config: CustomFontConfig }) {
  const totalFonts = Object.keys(config).filter(key =>
    ['sans', 'serif', 'mono', 'display', 'body', 'heading'].includes(key)
  ).length;

  const loadedFonts = 0; // À implémenter avec le service de chargement

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{totalFonts}</div>
          <div className="text-sm text-muted-foreground">Polices configurées</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{loadedFonts}</div>
          <div className="text-sm text-muted-foreground">Polices chargées</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{Object.keys(config.weights).length}</div>
          <div className="text-sm text-muted-foreground">Poids disponibles</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{Object.keys(config.sizes).length}</div>
          <div className="text-sm text-muted-foreground">Tailles disponibles</div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Panneau de personnalisation des polices
 */
export function FontCustomizationPanel({
  config,
  onConfigChange,
  className = ''
}: FontCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  const { isFontLoaded, loadFont } = useFontLoader();

  // Convertir la configuration en format personnalisé
  const customConfig: CustomFontConfig = React.useMemo(() => {
    return {
      sans: {
        family: config.fonts.sans[0],
        weight: config.fonts.normal,
        size: config.fonts.base,
        lineHeight: config.fonts.lineHeightNormal
      },
      serif: {
        family: config.fonts.serif[0],
        weight: config.fonts.normal,
        size: config.fonts.base,
        lineHeight: config.fonts.lineHeightNormal
      },
      mono: {
        family: config.fonts.mono[0],
        weight: config.fonts.normal,
        size: config.fonts.sm,
        lineHeight: config.fonts.lineHeightNormal
      },
      sizes: {
        xs: config.fonts.xs,
        sm: config.fonts.sm,
        base: config.fonts.base,
        lg: config.fonts.lg,
        xl: config.fonts.xl,
        '2xl': config.fonts['2xl'],
        '3xl': config.fonts['3xl'],
        '4xl': config.fonts['4xl'],
        '5xl': config.fonts['5xl'],
        '6xl': config.fonts['6xl']
      },
      weights: {
        light: config.fonts.light,
        normal: config.fonts.normal,
        medium: config.fonts.medium,
        semibold: config.fonts.semibold,
        bold: config.fonts.bold,
        extrabold: config.fonts.extrabold
      },
      lineHeights: {
        tight: config.fonts.lineHeightTight,
        normal: config.fonts.lineHeightNormal,
        relaxed: config.fonts.lineHeightRelaxed,
        loose: config.fonts.lineHeightLoose
      },
      letterSpacings: {
        tight: config.fonts.letterSpacingTight,
        normal: config.fonts.letterSpacingNormal,
        wide: config.fonts.letterSpacingWide
      }
    };
  }, [config]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((newConfig: Partial<CustomFontConfig>) => {
    const updatedCustomConfig = { ...customConfig, ...newConfig };

    // Convertir en ThemeConfig
    const updatedThemeConfig: ThemeConfig = {
      ...config,
      fonts: {
        sans: [updatedCustomConfig.sans.family],
        serif: [updatedCustomConfig.serif.family],
        mono: [updatedCustomConfig.mono.family],
        xs: updatedCustomConfig.sizes.xs,
        sm: updatedCustomConfig.sizes.sm,
        base: updatedCustomConfig.sizes.base,
        lg: updatedCustomConfig.sizes.lg,
        xl: updatedCustomConfig.sizes.xl,
        '2xl': updatedCustomConfig.sizes['2xl'],
        '3xl': updatedCustomConfig.sizes['3xl'],
        '4xl': updatedCustomConfig.sizes['4xl'],
        '5xl': updatedCustomConfig.sizes['5xl'],
        '6xl': updatedCustomConfig.sizes['6xl'],
        light: updatedCustomConfig.weights.light,
        normal: updatedCustomConfig.weights.normal,
        medium: updatedCustomConfig.weights.medium,
        semibold: updatedCustomConfig.weights.semibold,
        bold: updatedCustomConfig.weights.bold,
        extrabold: updatedCustomConfig.weights.extrabold,
        lineHeightTight: updatedCustomConfig.lineHeights.tight,
        lineHeightNormal: updatedCustomConfig.lineHeights.normal,
        lineHeightRelaxed: updatedCustomConfig.lineHeights.relaxed,
        lineHeightLoose: updatedCustomConfig.lineHeights.loose,
        letterSpacingTight: updatedCustomConfig.letterSpacings.tight,
        letterSpacingNormal: updatedCustomConfig.letterSpacings.normal,
        letterSpacingWide: updatedCustomConfig.letterSpacings.wide
      }
    };

    onConfigChange(updatedThemeConfig);
  }, [config, customConfig, onConfigChange]);

  // Mettre à jour une police spécifique
  const updateFont = useCallback((type: keyof CustomFontConfig, font: FontInfo) => {
    updateConfig({ [type]: font });
  }, [updateConfig]);

  // Appliquer un preset
  const applyPreset = useCallback(async (presetName: string) => {
    setIsApplyingPreset(true);
    try {
      const preset = getFontPreset(presetName);
      if (!preset) return;

      // Charger les polices du preset
      await Promise.all([
        loadFont(preset.sans.family, preset.sans.weight),
        loadFont(preset.serif.family, preset.serif.weight),
        loadFont(preset.mono.family, preset.mono.weight)
      ]);

      // Appliquer le preset à la configuration
      const newConfig = applyFontPreset(config, presetName);
      onConfigChange(newConfig);
      setSelectedPreset(presetName);
    } catch (error) {
      console.error('Erreur lors de l\'application du preset:', error);
    } finally {
      setIsApplyingPreset(false);
    }
  }, [config, onConfigChange, loadFont]);

  // Réinitialiser la configuration
  const resetConfig = useCallback(() => {
    const defaultConfig = createSemanticFontConfig({
      family: 'Inter, system-ui, -apple-system, sans-serif',
      weight: 400,
      size: '16px',
      lineHeight: 1.5
    });

    updateConfig({
      sans: defaultConfig.sans,
      serif: defaultConfig.serif,
      mono: defaultConfig.mono,
      sizes: FONT_SIZE_SCALE,
      weights: FONT_WEIGHTS,
      lineHeights: LINE_HEIGHT_SCALE,
      letterSpacings: LETTER_SPACING_SCALE
    });
  }, [updateConfig]);

  // Exporter la configuration
  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(customConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'font-config.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [customConfig]);

  // Importer une configuration
  const importConfig = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        updateConfig(importedConfig);
      } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
      }
    };
    reader.readAsText(file);
  }, [updateConfig]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Type size={24} />
            Personnalisation des polices
          </h2>
          <p className="text-muted-foreground">
            Configurez les polices, tailles et poids pour votre thème
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetConfig}>
            <RefreshCw size={16} className="mr-2" />
            Réinitialiser
          </Button>

          <Button variant="outline" onClick={exportConfig}>
            <Download size={16} className="mr-2" />
            Exporter
          </Button>

          <Label htmlFor="import-config" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload size={16} className="mr-2" />
                Importer
              </span>
            </Button>
          </Label>
          <Input
            id="import-config"
            type="file"
            accept=".json"
            className="hidden"
            onChange={importConfig}
          />
        </div>
      </div>

      {/* Statistiques */}
      <FontStats config={customConfig} />

      {/* Présélections */}
      <Card>
        <CardHeader>
          <CardTitle>Présélections de polices</CardTitle>
          <CardDescription>
            Choisissez un ensemble de polices prédéfini pour démarrer rapidement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {listFontPresets().map(({ key, preset }) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:scale-105 hover:shadow-md ${
                  selectedPreset === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => applyPreset(key)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {preset.description}
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs" style={{ fontFamily: preset.sans.family }}>
                      Sans: {preset.sans.family.split(',')[0]}
                    </div>
                    <div className="text-xs" style={{ fontFamily: preset.serif.family }}>
                      Serif: {preset.serif.family.split(',')[0]}
                    </div>
                    <div className="text-xs" style={{ fontFamily: preset.mono.family }}>
                      Mono: {preset.mono.family.split(',')[0]}
                    </div>
                  </div>

                  {isFontLoaded(preset.sans.family) && (
                    <Badge variant="outline" className="mt-2">
                      <Check size={12} className="mr-1" />
                      Chargée
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onglets de personnalisation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Polices de base</TabsTrigger>
          <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Police Sans */}
          <FontSelector
            value={customConfig.sans}
            onChange={(font) => updateFont('sans', font)}
            label="Police Sans"
            description="Police principale pour les éléments d'interface"
            showAdvanced={true}
          />

          {/* Police Serif */}
          <FontSelector
            value={customConfig.serif}
            onChange={(font) => updateFont('serif', font)}
            label="Police Serif"
            description="Police pour les titres et textes longs"
            showAdvanced={true}
          />

          {/* Police Mono */}
          <FontSelector
            value={customConfig.mono}
            onChange={(font) => updateFont('mono', font)}
            label="Police Mono"
            description="Police pour le code et les textes techniques"
            showAdvanced={true}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Tailles de police */}
          <Card>
            <CardHeader>
              <CardTitle>Tailles de police</CardTitle>
              <CardDescription>
                Configurez les différentes tailles de police disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(customConfig.sizes).map(([key, size]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key}</Label>
                    <Select
                      value={size}
                      onValueChange={(newValue) => {
                        updateConfig({
                          sizes: { ...customConfig.sizes, [key]: newValue }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FONT_SIZE_SCALE).map((sizeOption) => (
                          <SelectItem key={sizeOption} value={sizeOption}>
                            {sizeOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Poids de police */}
          <Card>
            <CardHeader>
              <CardTitle>Poids de police</CardTitle>
              <CardDescription>
                Configurez les différents poids de police disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(customConfig.weights).map(([key, weight]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key}</Label>
                    <Select
                      value={weight.toString()}
                      onValueChange={(newValue) => {
                        updateConfig({
                          weights: { ...customConfig.weights, [key]: parseInt(newValue) }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(FONT_WEIGHTS).map((weightOption) => (
                          <SelectItem key={weightOption} value={weightOption.toString()}>
                            {weightOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hauteurs de ligne */}
          <Card>
            <CardHeader>
              <CardTitle>Hauteurs de ligne</CardTitle>
              <CardDescription>
                Configurez les différentes hauteurs de ligne disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(customConfig.lineHeights).map(([key, lineHeight]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key}</Label>
                    <Select
                      value={lineHeight.toString()}
                      onValueChange={(newValue) => {
                        updateConfig({
                          lineHeights: { ...customConfig.lineHeights, [key]: parseFloat(newValue) }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(LINE_HEIGHT_SCALE).map((lineHeightOption) => (
                          <SelectItem key={lineHeightOption} value={lineHeightOption.toString()}>
                            {lineHeightOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Espacement des lettres */}
          <Card>
            <CardHeader>
              <CardTitle>Espacement des lettres</CardTitle>
              <CardDescription>
                Configurez les différents espacements de lettres disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(customConfig.letterSpacings).map(([key, letterSpacing]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key}</Label>
                    <Select
                      value={letterSpacing}
                      onValueChange={(newValue) => {
                        updateConfig({
                          letterSpacings: { ...customConfig.letterSpacings, [key]: newValue }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(LETTER_SPACING_SCALE).map((spacingOption) => (
                          <SelectItem key={spacingOption} value={spacingOption}>
                            {spacingOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* Informations système */}
          <Card>
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
              <CardDescription>
                État du chargement et informations sur les polices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Les polices sont chargées de manière asynchrone pour optimiser les performances.
                    Les polices non chargées utiliseront les polices système par défaut.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Polices chargées</h4>
                    <div className="space-y-1">
                      {Object.entries(customConfig).filter(([key]) =>
                        ['sans', 'serif', 'mono'].includes(key)
                      ).map(([key, font]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm">{key}</span>
                          {isFontLoaded((font as FontInfo).family) ? (
                            <Badge variant="outline">
                              <Check size={12} className="mr-1" />
                              Chargée
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Non chargée</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div>• Chargement asynchrone activé</div>
                      <div>• Cache des polices activé</div>
                      <div>• Optimisation des poids activée</div>
                      <div>• Préchargement des polices activé</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options de chargement */}
          <Card>
            <CardHeader>
              <CardTitle>Options de chargement</CardTitle>
              <CardDescription>
                Configurez le comportement de chargement des polices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les options de chargement avancées seront disponibles dans une future version.
                  Pour l'instant, le chargement automatique est optimisé pour la meilleure performance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Aperçu global */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu global</CardTitle>
          <CardDescription>
            Prévisualisation de l'apparence avec les polices configurées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Titres */}
            <div>
              <h1
                className="text-4xl font-bold mb-2"
                style={{ fontFamily: customConfig.sans.family }}
              >
                Titre de niveau 1
              </h1>
              <h2
                className="text-3xl font-semibold mb-2"
                style={{ fontFamily: customConfig.sans.family }}
              >
                Titre de niveau 2
              </h2>
              <h3
                className="text-2xl font-medium mb-2"
                style={{ fontFamily: customConfig.sans.family }}
              >
                Titre de niveau 3
              </h3>
            </div>

            {/* Textes */}
            <div className="space-y-4">
              <p
                className="text-lg"
                style={{ fontFamily: customConfig.sans.family }}
              >
                Ceci est un paragraphe en police Sans. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>

              <p
                className="text-lg italic"
                style={{ fontFamily: customConfig.serif.family }}
              >
                Ceci est un paragraphe en police Serif. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>

              <p
                className="text-lg font-mono"
                style={{ fontFamily: customConfig.mono.family }}
              >
                Ceci est un paragraphe en police Mono. Duis aute irure dolor in reprehenderit in voluptate
                velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>

            {/* Code */}
            <div className="bg-muted p-4 rounded-md">
              <code
                className="text-sm"
                style={{ fontFamily: customConfig.mono.family }}
              >
                function example() {'{'}{'\n'}
                {'  '}console.log("Code en police monospace");{'\n'}
                {'}'}{'\n'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FontCustomizationPanel;
