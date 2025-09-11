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
import type { ShadowOptions, ShadowPreset } from './shadowUtils';
import { ShadowSelector, ShadowSelectorProps } from './ShadowSelector';
import {
  SHADOW_SCALE,
  COLORED_SHADOWS,
  SHADOW_PRESETS,
  generateShadowScale,
  generateShadowVariables,
  generateShadowUtilities,
  parseShadowValue,
  validateShadowValue,
  getShadowRecommendations,
  createShadowConfig
} from './shadowUtils';

/**
 * Interface pour les props du ShadowCustomizationPanel
 */
export interface ShadowCustomizationPanelProps {
  // Configuration actuelle
  config: ThemeConfig;

  // Callback de changement
  onConfigChange: (config: ThemeConfig) => void;

  // Classes CSS
  className?: string;
}

/**
 * Interface pour la configuration d'ombre personnalisée
 */
interface CustomShadowConfig {
  shadows: Record<string, string>;
  coloredShadows: Record<string, string>;
  options: ShadowOptions;
}

/**
 * Composant pour afficher les statistiques d'ombres
 */
function ShadowStats({ config }: { config: CustomShadowConfig }) {
  const totalShadowValues = Object.keys(config.shadows).length;
  const totalColoredShadowValues = Object.keys(config.coloredShadows).length;
  const animationsEnabled = config.options.animations || false;
  const coloredShadowsEnabled = config.options.coloredShadows || false;
  const unit = config.options.unit || 'px';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{totalShadowValues}</div>
          <div className="text-sm text-muted-foreground">Ombres</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{totalColoredShadowValues}</div>
          <div className="text-sm text-muted-foreground">Colorées</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{animationsEnabled ? 'Oui' : 'Non'}</div>
          <div className="text-sm text-muted-foreground">Animations</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{unit}</div>
          <div className="text-sm text-muted-foreground">Unité</div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Panneau de personnalisation des ombres
 */
export function ShadowCustomizationPanel({
  config,
  onConfigChange,
  className = ''
}: ShadowCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedPreset, setSelectedPreset] = useState<string>('standard');
  const [animationSpeed, setAnimationSpeed] = useState<number>(3);

  // Convertir la configuration en format personnalisé
  const customConfig: CustomShadowConfig = React.useMemo(() => {
    return {
      shadows: config.shadows ? {
        none: config.shadows.none ?? 'none',
        sm: config.shadows.sm ?? '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: config.shadows.DEFAULT ?? '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: config.shadows.md ?? '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: config.shadows.lg ?? '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: config.shadows.xl ?? '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': config.shadows['2xl'] ?? '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '3xl': config.shadows['3xl'] ?? '0 35px 60px -15px rgb(0 0 0 / 0.3)',
        inner: config.shadows.inner ?? 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
      } : SHADOW_SCALE,
      coloredShadows: config.shadows ? {
        primary: config.shadows.coloredPrimary ?? COLORED_SHADOWS.primary,
        secondary: config.shadows.coloredSecondary ?? COLORED_SHADOWS.secondary,
        success: config.shadows.coloredSuccess ?? COLORED_SHADOWS.success,
        warning: config.shadows.coloredWarning ?? COLORED_SHADOWS.warning,
        error: config.shadows.coloredError ?? COLORED_SHADOWS.error,
        info: config.shadows.coloredInfo ?? COLORED_SHADOWS.info,
      } : COLORED_SHADOWS,
      options: {
        unit: 'px',
        scale: 1,
        base: 16,
        animations: true,
        coloredShadows: true
      }
    };
  }, [config]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((newConfig: Partial<CustomShadowConfig>) => {
    const updatedCustomConfig = { ...customConfig, ...newConfig };

    // Convertir en ThemeConfig
    const updatedThemeConfig: ThemeConfig = {
      ...config,
      shadows: {
        none: updatedCustomConfig.shadows.none,
        sm: updatedCustomConfig.shadows.sm,
        DEFAULT: updatedCustomConfig.shadows.DEFAULT,
        md: updatedCustomConfig.shadows.md,
        lg: updatedCustomConfig.shadows.lg,
        xl: updatedCustomConfig.shadows.xl,
        '2xl': updatedCustomConfig.shadows['2xl'],
        '3xl': updatedCustomConfig.shadows['3xl'],
        inner: updatedCustomConfig.shadows.inner,
        coloredPrimary: updatedCustomConfig.coloredShadows.primary,
        coloredSecondary: updatedCustomConfig.coloredShadows.secondary,
        coloredSuccess: updatedCustomConfig.coloredShadows.success,
        coloredWarning: updatedCustomConfig.coloredShadows.warning,
        coloredError: updatedCustomConfig.coloredShadows.error,
        coloredInfo: updatedCustomConfig.coloredShadows.info,
      }
    };

    onConfigChange(updatedThemeConfig);
  }, [config, customConfig, onConfigChange]);

  // Mettre à jour les ombres
  const updateShadows = useCallback((newShadows: Record<string, string>) => {
    updateConfig({ shadows: newShadows });
  }, [updateConfig]);

  // Mettre à jour les ombres colorées
  const updateColoredShadows = useCallback((newColoredShadows: Record<string, string>) => {
    updateConfig({ coloredShadows: newColoredShadows });
  }, [updateConfig]);

  // Appliquer un preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = SHADOW_PRESETS[presetName];
    if (!preset) return;

    setSelectedPreset(presetName);
    updateConfig({
      shadows: preset.shadows,
      coloredShadows: COLORED_SHADOWS,
      options: preset.options
    });
  }, [updateConfig]);

  // Réinitialiser la configuration
  const resetConfig = useCallback(() => {
    const defaultPreset = SHADOW_PRESETS.standard;
    updateConfig({
      shadows: defaultPreset.shadows,
      coloredShadows: COLORED_SHADOWS,
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
    link.download = 'shadow-config.json';
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
    const variables = generateShadowVariables(
      customConfig.shadows,
      customConfig.coloredShadows
    );
    const utilities = generateShadowUtilities(
      customConfig.shadows,
      customConfig.coloredShadows,
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
            Personnalisation des ombres
          </h2>
          <p className="text-muted-foreground">
            Configurez le système d'ombres pour votre thème
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

          <Label htmlFor="import-shadow-config" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload size={16} className="mr-2" />
                Importer
              </span>
            </Button>
          </Label>
          <Input
            id="import-shadow-config"
            type="file"
            accept=".json"
            className="hidden"
            onChange={importConfig}
          />
        </div>
      </div>

      {/* Statistiques */}
      <ShadowStats config={customConfig} />

      {/* Présélections */}
      <Card>
        <CardHeader>
          <CardTitle>Présélections d'ombres</CardTitle>
          <CardDescription>
            Choisissez un système d'ombres prédéfini pour démarrer rapidement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SHADOW_PRESETS).map(([key, preset]) => (
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
                    <div className="text-xs">
                      Colorées: {preset.options.coloredShadows ? 'Oui' : 'Non'}
                    </div>
                  </div>

                  <div className="mt-3 p-2 rounded text-xs text-center"
                    style={{
                      boxShadow: preset.shadows.DEFAULT || '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                      backgroundColor: 'hsl(var(--muted))'
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
          <TabsTrigger value="basic">Ombres de base</TabsTrigger>
          <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
          <TabsTrigger value="animations">Animations</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Sélecteur d'ombres */}
          <ShadowSelector
            value={config}
            onChange={(newConfig) => onConfigChange(newConfig as ThemeConfig)}
            label="Système d'ombres"
            description="Personnalisez les valeurs d'ombres pour votre thème"
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
                    <Label>Préfixe des variables d'ombre</Label>
                    <Input
                      defaultValue="--shadow-"
                      placeholder="--shadow-"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Préfixe des variables colorées</Label>
                    <Input
                      defaultValue="--shadow-colored-"
                      placeholder="--shadow-colored-"
                    />
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Générer les classes négatives</Label>
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
                    <Label>Inclure les ombres colorées</Label>
                    <Select defaultValue="yes" value={customConfig.options.coloredShadows ? 'yes' : 'no'}
                      onValueChange={(value) => updateConfig({
                        options: { ...customConfig.options, coloredShadows: value === 'yes' }
                      })}>
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
              <CardTitle>Recommandations d'ombres</CardTitle>
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
                      {getShadowRecommendations(customConfig.shadows, customConfig.coloredShadows, 'mobile').map((rec, index) => (
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
                      {getShadowRecommendations(customConfig.shadows, customConfig.coloredShadows, 'desktop').map((rec, index) => (
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
              <CardTitle>Animations d'ombres</CardTitle>
              <CardDescription>
                Configurez les animations et effets pour les ombres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Activation */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Activer les animations</h4>
                    <p className="text-sm text-muted-foreground">
                      Les ombres auront des animations interactives
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
                          min="1"
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
                        <div className="p-4 rounded-lg"
                          style={{
                            boxShadow: customConfig.shadows.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            animation: `shadow-float ${animationSpeed}s ease-in-out infinite`,
                            backgroundColor: 'hsl(var(--muted))'
                          }}>
                          <div className="text-center text-sm">Float</div>
                        </div>

                        <div className="p-4 rounded-lg"
                          style={{
                            boxShadow: customConfig.shadows.lg || '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            animation: `shadow-pulse ${animationSpeed}s ease-in-out infinite`,
                            backgroundColor: 'hsl(var(--muted))'
                          }}>
                          <div className="text-center text-sm">Pulse</div>
                        </div>

                        <div className="p-4 rounded-lg"
                          style={{
                            boxShadow: customConfig.coloredShadows.primary || '0 4px 6px -1px hsl(var(--primary) / 0.3)',
                            animation: `shadow-glow ${animationSpeed}s ease-in-out infinite`,
                            backgroundColor: 'hsl(var(--muted))'
                          }}>
                          <div className="text-center text-sm">Glow</div>
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
                État et informations sur le système d'ombres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Le système d'ombres est basé sur une échelle modulaire qui garantit
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
                        <span>Ombres colorées:</span>
                        <Badge>{customConfig.options.coloredShadows ? 'Oui' : 'Non'}</Badge>
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

export default ShadowCustomizationPanel;
