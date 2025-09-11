import React, { useState, useCallback } from 'react';
import { Settings, Download, Upload, RefreshCw, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { ThemeConfig } from './types';
import type { BorderOptions, BorderPreset } from './borderUtils';
import { BorderSelector, BorderSelectorProps } from './BorderSelector';
import {
  BORDER_WIDTH_SCALE,
  BORDER_STYLES,
  BORDER_RADIUS_SCALE,
  BORDER_PRESETS,
  generateBorderWidths,
  generateBorderVariables,
  generateBorderUtilities,
  parseBorderValue,
  validateBorderValue,
  getBorderRecommendations,
  createBorderConfig
} from './borderUtils';

/**
 * Interface pour les props du BorderCustomizationPanel
 */
export interface BorderCustomizationPanelProps {
  // Configuration actuelle
  config: ThemeConfig;

  // Callback de changement
  onConfigChange: (config: ThemeConfig) => void;

  // Classes CSS
  className?: string;
}

/**
 * Interface pour la configuration de bordure personnalisée
 */
interface CustomBorderConfig {
  widths: Record<string, string>;
  styles: Record<string, string>;
  radii: Record<string, string>;
  options: BorderOptions;
}

/**
 * Composant pour afficher les statistiques de bordure
 */
function BorderStats({ config }: { config: CustomBorderConfig }) {
  const totalWidthValues = Object.keys(config.widths).length;
  const totalStyleValues = Object.keys(config.styles).length;
  const totalRadiusValues = Object.keys(config.radii).length;
  const animationsEnabled = config.options.animations || false;
  const unit = config.options.unit || 'px';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{totalWidthValues}</div>
          <div className="text-sm text-muted-foreground">Largeurs</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{totalStyleValues}</div>
          <div className="text-sm text-muted-foreground">Styles</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{totalRadiusValues}</div>
          <div className="text-sm text-muted-foreground">Rayons</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{animationsEnabled ? 'Oui' : 'Non'}</div>
          <div className="text-sm text-muted-foreground">Animations</div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Panneau de personnalisation des bordures
 */
export function BorderCustomizationPanel({
  config,
  onConfigChange,
  className = ''
}: BorderCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedPreset, setSelectedPreset] = useState<string>('standard');
  const [animationSpeed, setAnimationSpeed] = useState<number>(2);

  // Convertir la configuration en format personnalisé
  const customConfig: CustomBorderConfig = React.useMemo(() => {
    return {
      widths: config.borders ? {
        none: config.borders.widthNone ?? '0',
        sm: config.borders.widthSm ?? '0.5px',
        md: config.borders.widthMd ?? '1px',
        lg: config.borders.widthLg ?? '2px',
        xl: config.borders.widthXl ?? '3px',
        '2xl': config.borders.width2xl ?? '4px',
        '3xl': config.borders.width3xl ?? '6px',
      } : BORDER_WIDTH_SCALE,
      styles: config.borders ? {
        solid: config.borders.solid ?? 'solid',
        dashed: config.borders.dashed ?? 'dashed',
        dotted: config.borders.dotted ?? 'dotted',
        double: config.borders.double ?? 'double',
        groove: config.borders.groove ?? 'groove',
        ridge: config.borders.ridge ?? 'ridge',
        inset: config.borders.inset ?? 'inset',
        outset: config.borders.outset ?? 'outset',
      } : BORDER_STYLES,
      radii: config.borders ? {
        none: config.borders.radiusNone ?? '0',
        sm: config.borders.radiusSm ?? '0.125rem',
        md: config.borders.radiusMd ?? '0.25rem',
        lg: config.borders.radiusLg ?? '0.5rem',
        xl: config.borders.radiusXl ?? '0.75rem',
        '2xl': config.borders.radius2xl ?? '1rem',
        '3xl': config.borders.radius3xl ?? '1.5rem',
        full: config.borders.radiusFull ?? '9999px',
      } : BORDER_RADIUS_SCALE,
      options: {
        unit: 'px',
        scale: 1,
        base: 16,
        animations: true,
        customRadii: true
      }
    };
  }, [config]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((newConfig: Partial<CustomBorderConfig>) => {
    const updatedCustomConfig = { ...customConfig, ...newConfig };

    // Convertir en ThemeConfig
    const updatedThemeConfig: ThemeConfig = {
      ...config,
      borders: {
        widthNone: updatedCustomConfig.widths.none,
        widthSm: updatedCustomConfig.widths.sm,
        widthMd: updatedCustomConfig.widths.md,
        widthLg: updatedCustomConfig.widths.lg,
        widthXl: updatedCustomConfig.widths.xl,
        width2xl: updatedCustomConfig.widths['2xl'],
        width3xl: updatedCustomConfig.widths['3xl'],
        solid: updatedCustomConfig.styles.solid,
        dashed: updatedCustomConfig.styles.dashed,
        dotted: updatedCustomConfig.styles.dotted,
        double: updatedCustomConfig.styles.double,
        groove: updatedCustomConfig.styles.groove,
        ridge: updatedCustomConfig.styles.ridge,
        inset: updatedCustomConfig.styles.inset,
        outset: updatedCustomConfig.styles.outset,
        radiusNone: updatedCustomConfig.radii.none,
        radiusSm: updatedCustomConfig.radii.sm,
        radiusMd: updatedCustomConfig.radii.md,
        radiusLg: updatedCustomConfig.radii.lg,
        radiusXl: updatedCustomConfig.radii.xl,
        radius2xl: updatedCustomConfig.radii['2xl'],
        radius3xl: updatedCustomConfig.radii['3xl'],
        radiusFull: updatedCustomConfig.radii.full,
      }
    };

    onConfigChange(updatedThemeConfig);
  }, [config, customConfig, onConfigChange]);

  // Mettre à jour les largeurs
  const updateWidths = useCallback((newWidths: Record<string, string>) => {
    updateConfig({ widths: newWidths });
  }, [updateConfig]);

  // Mettre à jour les styles
  const updateStyles = useCallback((newStyles: Record<string, string>) => {
    updateConfig({ styles: newStyles });
  }, [updateConfig]);

  // Mettre à jour les rayons
  const updateRadii = useCallback((newRadii: Record<string, string>) => {
    updateConfig({ radii: newRadii });
  }, [updateConfig]);

  // Appliquer un preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = BORDER_PRESETS[presetName];
    if (!preset) return;

    setSelectedPreset(presetName);
    updateConfig({
      widths: preset.widths,
      styles: preset.styles,
      radii: preset.radii,
      options: preset.options
    });
  }, [updateConfig]);

  // Réinitialiser la configuration
  const resetConfig = useCallback(() => {
    const defaultPreset = BORDER_PRESETS.standard;
    updateConfig({
      widths: defaultPreset.widths,
      styles: defaultPreset.styles,
      radii: defaultPreset.radii,
      options: defaultPreset.options
    });
  }, [updateConfig]);

  // Exporter la configuration
  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(customConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'border-config.json';
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

  // Générer le CSS personnalisé
  const customCSS = React.useMemo(() => {
    const variables = generateBorderVariables(
      customConfig.widths,
      customConfig.styles,
      customConfig.radii
    );
    const utilities = generateBorderUtilities(
      customConfig.widths,
      customConfig.styles,
      customConfig.radii,
      customConfig.options.animations
    );
    return `/* Variables CSS personnalisées */\n${variables}\n\n/* Utilitaires CSS */\n${utilities}`;
  }, [customConfig]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Personnalisation des bordures
          </h2>
          <p className="text-muted-foreground">
            Configurez le système de bordures pour votre thème
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

          <Label htmlFor="import-border-config" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload size={16} className="mr-2" />
                Importer
              </span>
            </Button>
          </Label>
          <Input
            id="import-border-config"
            type="file"
            accept=".json"
            className="hidden"
            onChange={importConfig}
          />
        </div>
      </div>

      {/* Statistiques */}
      <BorderStats config={customConfig} />

      {/* Présélections */}
      <Card>
        <CardHeader>
          <CardTitle>Présélections de bordures</CardTitle>
          <CardDescription>
            Choisissez un système de bordures prédéfini pour démarrer rapidement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(BORDER_PRESETS).map(([key, preset]) => (
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

                  <div className="space-y-1">
                    <div className="text-xs">Unité: {preset.options.unit}</div>
                    <div className="text-xs">Échelle: {preset.options.scale}</div>
                    <div className="text-xs">
                      Animations: {preset.options.animations ? 'Oui' : 'Non'}
                    </div>
                  </div>

                  <div className="mt-3 p-2 border rounded text-xs text-center"
                    style={{
                      borderWidth: preset.widths['1'] || '1px',
                      borderStyle: preset.styles.solid || 'solid',
                      borderRadius: preset.radii.md || '0.25rem'
                    }}>
                    Aperçu
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onglets de personnalisation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Bordures de base</TabsTrigger>
          <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
          <TabsTrigger value="animations">Animations</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Sélecteur de bordures */}
          <BorderSelector
            value={config}
            onChange={(newConfig) => onConfigChange(newConfig as ThemeConfig)}
            label="Système de bordures"
            description="Personnalisez les valeurs de bordures pour votre thème"
            showAdvanced={true}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Options de génération */}
          <Card>
            <CardHeader>
              <CardTitle>Options de génération CSS</CardTitle>
              <CardDescription>
                Configurez comment les variables CSS et utilitaires sont générés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Préfixe des variables de largeur</Label>
                    <Input
                      defaultValue="--border-width-"
                      placeholder="--border-width-"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Préfixe des variables de style</Label>
                    <Input
                      defaultValue="--border-style-"
                      placeholder="--border-style-"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Préfixe des variables de rayon</Label>
                    <Input
                      defaultValue="--border-radius-"
                      placeholder="--border-radius-"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Générer les classes négatives</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Oui</SelectItem>
                        <SelectItem value="no">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Générer les classes responsives</Label>
                    <Select defaultValue="no">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Oui</SelectItem>
                        <SelectItem value="no">Non</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Unité principale</Label>
                    <Select defaultValue="px" value={customConfig.options.unit}
                      onValueChange={(value) => updateConfig({
                        options: { ...customConfig.options, unit: value as 'px' | 'rem' | 'em' }
                      })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommandations de bordures</CardTitle>
              <CardDescription>
                Suggestions basées sur votre configuration actuelle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Pour Mobile</h4>
                    <div className="space-y-1 text-sm">
                      {getBorderRecommendations(customConfig.widths, customConfig.styles, customConfig.radii, 'mobile').map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Pour Desktop</h4>
                    <div className="space-y-1 text-sm">
                      {getBorderRecommendations(customConfig.widths, customConfig.styles, customConfig.radii, 'desktop').map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Animations de bordure</CardTitle>
              <CardDescription>
                Configurez les animations et effets pour les bordures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Activation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Activer les animations</h4>
                    <p className="text-sm text-muted-foreground">
                      Les bordures auront des animations interactives
                    </p>
                  </div>
                  <Button
                    variant={customConfig.options.animations ? "default" : "outline"}
                    onClick={() => updateConfig({
                      options: { ...customConfig.options, animations: !customConfig.options.animations }
                    })}
                  >
                    {customConfig.options.animations ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>

                {customConfig.options.animations && (
                  <>
                    {/* Vitesse d'animation */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Vitesse d'animation</h4>
                      <div className="space-y-2">
                        <Label>Vitesse: {animationSpeed}s</Label>
                        <Input
                          type="range"
                          min="0.5"
                          max="5"
                          step="0.5"
                          value={animationSpeed}
                          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Aperçu des animations */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Aperçu des animations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border-2 border-solid rounded-lg"
                          style={{
                            borderWidth: customConfig.widths['2'] || '2px',
                            borderStyle: customConfig.styles.solid || 'solid',
                            borderRadius: customConfig.radii.md || '0.25rem',
                            animation: `border-pulse ${animationSpeed}s ease-in-out infinite`
                          }}>
                          <div className="text-center text-sm">Pulse</div>
                        </div>

                        <div className="p-4 border-2 border-dashed rounded-lg"
                          style={{
                            borderWidth: customConfig.widths['2'] || '2px',
                            borderStyle: customConfig.styles.dashed || 'dashed',
                            borderRadius: customConfig.radii.md || '0.25rem',
                            animation: `border-glow ${animationSpeed}s ease-in-out infinite`
                          }}>
                          <div className="text-center text-sm">Glow</div>
                        </div>

                        <div className="p-4 border-2 border-dotted rounded-lg"
                          style={{
                            borderWidth: customConfig.widths['2'] || '2px',
                            borderStyle: customConfig.styles.dotted || 'dotted',
                            borderRadius: customConfig.radii.md || '0.25rem',
                            background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
                            backgroundSize: '200% 100%',
                            animation: `border-slide ${animationSpeed * 1.5}s linear infinite`
                          }}>
                          <div className="text-center text-sm">Slide</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
                État et informations sur le système de bordures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Le système de bordures est basé sur une échelle modulaire qui garantit
                    la cohérence visuelle et l'harmonie dans votre design.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Configuration actuelle</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Type d'animations:</span>
                        <Badge>{customConfig.options.animations ? 'Activées' : 'Désactivées'}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Unité principale:</span>
                        <Badge>{customConfig.options.unit}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Échelle de base:</span>
                        <Badge>{customConfig.options.scale}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Rayons personnalisés:</span>
                        <Badge>{customConfig.options.customRadii ? 'Oui' : 'Non'}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div>• Variables CSS optimisées</div>
                      <div>• Utilitaires générés à la demande</div>
                      <div>• Cache des configurations activé</div>
                      <div>• Compression CSS activée</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variables CSS générées */}
          <Card>
            <CardHeader>
              <CardTitle>Variables CSS générées</CardTitle>
              <CardDescription>
                Aperçu des variables CSS qui seront générées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md font-mono text-xs overflow-x-auto">
                <pre>{customCSS}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BorderCustomizationPanel;
