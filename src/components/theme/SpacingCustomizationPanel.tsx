import React, { useState, useCallback } from 'react';
import { Settings, Download, Upload, RefreshCw, Check, AlertCircle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { ThemeConfig } from './types';
import type { SpacingOptions } from './spacingUtils';
import { SpacingSelector, SpacingSelectorProps } from './SpacingSelector';
import {
  SPACING_SCALE,
  SPACING_PRESETS,
  BREAKPOINTS,
  generateSpacingScale,
  calculateFluidSpacing,
  generateSpacingVariables,
  generateSpacingUtilities,
  parseSpacingValue,
  validateSpacingValue,
  getSpacingRecommendations,
  createSpacingConfig
} from './spacingUtils';

/**
 * Interface pour les props du SpacingCustomizationPanel
 */
export interface SpacingCustomizationPanelProps {
  // Configuration actuelle
  config: ThemeConfig;

  // Callback de changement
  onConfigChange: (config: ThemeConfig) => void;

  // Classes CSS
  className?: string;
}

/**
 * Interface pour la configuration d'espacement personnalisée
 */
interface CustomSpacingConfig {
  scale: Record<string, string>;
  options: SpacingOptions;
  breakpoints: typeof BREAKPOINTS;
}

/**
 * Composant pour afficher les statistiques d'espacement
 */
function SpacingStats({ config }: { config: CustomSpacingConfig }) {
  const totalSpacingValues = Object.keys(config.scale).length;
  const fluidEnabled = config.options.fluid;
  const unit = config.options.unit || 'rem';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{totalSpacingValues}</div>
          <div className="text-sm text-muted-foreground">Valeurs d'espacement</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{unit}</div>
          <div className="text-sm text-muted-foreground">Unité principale</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{config.options.scale || 4}</div>
          <div className="text-sm text-muted-foreground">Échelle de base</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{fluidEnabled ? 'Oui' : 'Non'}</div>
          <div className="text-sm text-muted-foreground">Espacement fluide</div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Panneau de personnalisation de l'espacement
 */
export function SpacingCustomizationPanel({
  config,
  onConfigChange,
  className = ''
}: SpacingCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedPreset, setSelectedPreset] = useState<string>('comfortable');
  const [viewportWidth, setViewportWidth] = useState<number>(1024);

  // Convertir la configuration en format personnalisé
  const customConfig: CustomSpacingConfig = React.useMemo(() => {
    return {
      scale: config.spacing as unknown as Record<string, string>,
      options: {
        unit: 'rem',
        scale: 4,
        base: 16,
        fluid: false,
        breakpoints: BREAKPOINTS
      },
      breakpoints: BREAKPOINTS
    };
  }, [config]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((newConfig: Partial<CustomSpacingConfig>) => {
    const updatedCustomConfig = { ...customConfig, ...newConfig };

    // Convertir en ThemeConfig en utilisant createSpacingConfig
    const spacingConfig = createSpacingConfig('comfortable');
    const updatedSpacing = { ...spacingConfig, ...updatedCustomConfig.scale };

    const updatedThemeConfig: ThemeConfig = {
      ...config,
      spacing: updatedSpacing
    };

    onConfigChange(updatedThemeConfig);
  }, [config, customConfig, onConfigChange]);

  // Mettre à jour l'échelle d'espacement
  const updateSpacingScale = useCallback((newScale: Record<string, string>) => {
    updateConfig({ scale: newScale });
  }, [updateConfig]);

  // Appliquer un preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = SPACING_PRESETS[presetName];
    if (!preset) return;

    setSelectedPreset(presetName);
    updateConfig({
      scale: preset.scale,
      options: preset.options
    });
  }, [updateConfig]);

  // Réinitialiser la configuration
  const resetConfig = useCallback(() => {
    const defaultPreset = SPACING_PRESETS.comfortable;
    updateConfig({
      scale: defaultPreset.scale,
      options: defaultPreset.options,
      breakpoints: BREAKPOINTS
    });
  }, [updateConfig]);

  // Exporter la configuration
  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(customConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spacing-config.json';
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

  // Calculer l'espacement fluide pour l'aperçu
  const fluidSpacingExample = React.useMemo(() => {
    if (!customConfig.options.fluid) return null;

    return calculateFluidSpacing(
      16, // minSize
      32, // maxSize
      640, // minBreakpoint
      1536, // maxBreakpoint
      viewportWidth
    );
  }, [customConfig.options.fluid, viewportWidth]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Personnalisation de l'espacement
          </h2>
          <p className="text-muted-foreground">
            Configurez le système d'espacement pour votre thème
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

          <Label htmlFor="import-spacing-config" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload size={16} className="mr-2" />
                Importer
              </span>
            </Button>
          </Label>
          <Input
            id="import-spacing-config"
            type="file"
            accept=".json"
            className="hidden"
            onChange={importConfig}
          />
        </div>
      </div>

      {/* Statistiques */}
      <SpacingStats config={customConfig} />

      {/* Présélections */}
      <Card>
        <CardHeader>
          <CardTitle>Présélections d'espacement</CardTitle>
          <CardDescription>
            Choisissez un système d'espacement prédéfini pour démarrer rapidement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SPACING_PRESETS).map(([key, preset]) => (
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
                    <div className="text-xs">Échelle: {preset.options.scale}px</div>
                    <div className="text-xs">
                      Fluid: {preset.options.fluid ? 'Oui' : 'Non'}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 text-center p-2 bg-muted rounded text-xs">
                      {preset.scale['4'] || '1rem'}
                    </div>
                    <div className="flex-1 text-center p-2 bg-muted rounded text-xs">
                      {preset.scale['8'] || '2rem'}
                    </div>
                    <div className="flex-1 text-center p-2 bg-muted rounded text-xs">
                      {preset.scale['16'] || '4rem'}
                    </div>
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
          <TabsTrigger value="basic">Espacement de base</TabsTrigger>
          <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
          <TabsTrigger value="fluid">Espacement fluide</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Sélecteur d'espacement */}
          <SpacingSelector
            value={config.spacing}
            onChange={(spacing) => {
              const updatedConfig = { ...config, spacing };
              onConfigChange(updatedConfig);
            }}
            label="Système d'espacement"
            description="Personnalisez les valeurs d'espacement pour votre thème"
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
                    <Label>Préfixe des variables CSS</Label>
                    <Input
                      defaultValue="--spacing-"
                      placeholder="--spacing-"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Propriétés à générer</Label>
                    <Select defaultValue="margin,padding,gap">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="margin,padding,gap">Margin, Padding, Gap</SelectItem>
                        <SelectItem value="margin,padding">Margin, Padding</SelectItem>
                        <SelectItem value="margin">Margin seulement</SelectItem>
                        <SelectItem value="padding">Padding seulement</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommandations d'espacement</CardTitle>
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
                      {getSpacingRecommendations(config.spacing as unknown as Record<string, string>, 'mobile').map((rec, index) => (
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
                      {getSpacingRecommendations(config.spacing as unknown as Record<string, string>, 'desktop').map((rec, index) => (
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

        <TabsContent value="fluid" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Espacement fluide</CardTitle>
              <CardDescription>
                L'espacement fluide s'adapte automatiquement à la taille de l'écran
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Activation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Activer l'espacement fluide</h4>
                    <p className="text-sm text-muted-foreground">
                      Les valeurs d'espacement s'adapteront dynamiquement
                    </p>
                  </div>
                  <Button
                    variant={customConfig.options.fluid ? "default" : "outline"}
                    onClick={() => updateConfig({
                      options: { ...customConfig.options, fluid: !customConfig.options.fluid }
                    })}
                  >
                    {customConfig.options.fluid ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>

                {customConfig.options.fluid && (
                  <>
                    {/* Configuration des breakpoints */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Breakpoints</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(customConfig.breakpoints).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label>{key}</Label>
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) => {
                                const newBreakpoints = { ...customConfig.breakpoints };
                                newBreakpoints[key as keyof typeof BREAKPOINTS] = parseInt(e.target.value);
                                updateConfig({ breakpoints: newBreakpoints });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aperçu */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Aperçu en temps réel</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Largeur de la fenêtre: {viewportWidth}px</Label>
                          <Input
                            type="range"
                            min="320"
                            max="2000"
                            value={viewportWidth}
                            onChange={(e) => setViewportWidth(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {fluidSpacingExample && (
                          <div className="p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground mb-2">
                              Espacement fluide calculé:
                            </div>
                            <div className="text-lg font-semibold">
                              {fluidSpacingExample}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground">Mobile</div>
                            <div className="text-lg font-semibold">
                              {calculateFluidSpacing(16, 24, 320, 768, 480)}
                            </div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground">Tablette</div>
                            <div className="text-lg font-semibold">
                              {calculateFluidSpacing(20, 28, 768, 1024, 896)}
                            </div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-sm text-muted-foreground">Desktop</div>
                            <div className="text-lg font-semibold">
                              {calculateFluidSpacing(24, 32, 1024, 1536, 1280)}
                            </div>
                          </div>
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
                État et informations sur le système d'espacement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Le système d'espacement est basé sur une échelle modulaire qui garantit
                    la cohérence visuelle et l'harmonie dans votre design.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Configuration actuelle</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Type d'espacement:</span>
                        <Badge>{customConfig.options.fluid ? 'Fluide' : 'Fixe'}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Unité principale:</span>
                        <Badge>{customConfig.options.unit}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Échelle de base:</span>
                        <Badge>{customConfig.options.scale}px</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Nombre de valeurs:</span>
                        <Badge>{Object.keys(customConfig.scale).length}</Badge>
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
                <pre>{generateSpacingVariables(customConfig.scale)}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SpacingCustomizationPanel;
