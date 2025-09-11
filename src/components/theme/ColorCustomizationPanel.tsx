import React, { useState, useCallback, useMemo } from 'react';
import {
  Palette,
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { ColorSelector } from './ColorSelector';
import { CSSVariablesDisplay } from './CSSVariablesDisplay';
import type { ColorPalette, ThemeConfig } from './types';
import {
  createSemanticPalette,
  adaptPaletteForDarkMode,
  COLOR_PRESETS,
  listColorPresets,
  checkWCAGContrast,
  getOptimalTextColor,
  generateColorVariations
} from './colorUtils';

/**
 * Interface pour les props du ColorCustomizationPanel
 */
export interface ColorCustomizationPanelProps {
  // Configuration actuelle
  config: ThemeConfig;

  // Callback de changement de configuration
  onConfigChange: (config: ThemeConfig) => void;

  // Sections à afficher
  sections?: ('colors' | 'presets' | 'accessibility' | 'css-variables' | 'advanced')[];

  // Classes CSS
  className?: string;
}

/**
 * Composant pour afficher un aperçu de la palette de couleurs
 */
function PalettePreview({
  palette,
  title,
  isDark = false
}: {
  palette: Partial<ColorPalette>;
  title: string;
  isDark?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.primary }} />
          {title}
        </CardTitle>
        <CardDescription>
          Aperçu de la palette de couleurs {isDark ? 'sombre' : 'claire'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Couleurs principales */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Couleurs principales</h4>
            <div className="grid grid-cols-2 gap-2">
              {palette.primary && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.primary,
                  color: getOptimalTextColor(palette.primary)
                }}>
                  Primary
                </div>
              )}
              {palette.secondary && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.secondary,
                  color: getOptimalTextColor(palette.secondary)
                }}>
                  Secondary
                </div>
              )}
              {palette.accent && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.accent,
                  color: getOptimalTextColor(palette.accent)
                }}>
                  Accent
                </div>
              )}
              {palette.neutral && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.neutral,
                  color: getOptimalTextColor(palette.neutral)
                }}>
                  Neutral
                </div>
              )}
            </div>
          </div>

          {/* Couleurs d'état */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Couleurs d'état</h4>
            <div className="grid grid-cols-2 gap-2">
              {palette.success && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.success,
                  color: getOptimalTextColor(palette.success)
                }}>
                  Success
                </div>
              )}
              {palette.warning && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.warning,
                  color: getOptimalTextColor(palette.warning)
                }}>
                  Warning
                </div>
              )}
              {palette.error && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.error,
                  color: getOptimalTextColor(palette.error)
                }}>
                  Error
                </div>
              )}
              {palette.info && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.info,
                  color: getOptimalTextColor(palette.info)
                }}>
                  Info
                </div>
              )}
            </div>
          </div>

          {/* Couleurs de fond */}
          <div className="space-y-2 col-span-2">
            <h4 className="text-sm font-medium">Fonds et surfaces</h4>
            <div className="grid grid-cols-4 gap-2">
              {palette.background && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.background,
                  color: getOptimalTextColor(palette.background),
                  border: `1px solid ${palette.border || '#e5e7eb'}`
                }}>
                  Background
                </div>
              )}
              {palette.surface && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.surface,
                  color: getOptimalTextColor(palette.surface),
                  border: `1px solid ${palette.border || '#e5e7eb'}`
                }}>
                  Surface
                </div>
              )}
              {palette.card && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.card,
                  color: getOptimalTextColor(palette.card),
                  border: `1px solid ${palette.border || '#e5e7eb'}`
                }}>
                  Card
                </div>
              )}
              {palette.dialog && (
                <div className="p-3 rounded border text-center text-xs" style={{
                  backgroundColor: palette.dialog,
                  color: getOptimalTextColor(palette.dialog),
                  border: `1px solid ${palette.border || '#e5e7eb'}`
                }}>
                  Dialog
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Panneau de personnalisation des couleurs complet
 */
export function ColorCustomizationPanel({
  config,
  onConfigChange,
  sections = ['colors', 'presets', 'accessibility', 'advanced'],
  className = ''
}: ColorCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState('colors');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [accessibilityResults, setAccessibilityResults] = useState<Record<string, boolean>>({});

  // Couleurs actuelles
  const currentColors = useMemo(() => config.colors.light, [config.colors.light]);

  // Mettre à jour une couleur spécifique
  const updateColor = useCallback((colorKey: keyof ColorPalette, newColor: string) => {
    const newConfig = { ...config };

    // Mettre à jour la couleur dans les deux thèmes
    newConfig.colors.light[colorKey] = newColor;

    // Si c'est la couleur primaire, régénérer la palette sémantique
    if (colorKey === 'primary') {
      const newLightPalette = createSemanticPalette(newColor);
      const newDarkPalette = adaptPaletteForDarkMode(newLightPalette);

      newConfig.colors.light = { ...newConfig.colors.light, ...newLightPalette };
      newConfig.colors.dark = { ...newConfig.colors.dark, ...newDarkPalette };
    } else {
      // Sinon, adapter la couleur pour le mode sombre
      if (colorKey !== 'background' && colorKey !== 'surface' && colorKey !== 'card' && colorKey !== 'dialog') {
        const colorInfo = { hex: newColor };
        const adaptedForDark = newColor; // Simplification - pourrait être plus sophistiqué
        newConfig.colors.dark[colorKey] = adaptedForDark;
      }
    }

    onConfigChange(newConfig);
    setHasUnsavedChanges(true);
  }, [config, onConfigChange]);

  // Appliquer un preset de couleur
  const applyPreset = useCallback((presetName: keyof typeof COLOR_PRESETS) => {
    const preset = COLOR_PRESETS[presetName];
    const newLightPalette = createSemanticPalette(preset.primary);
    const newDarkPalette = adaptPaletteForDarkMode(newLightPalette);

    const newConfig = { ...config };
    newConfig.colors.light = { ...newConfig.colors.light, ...newLightPalette };
    newConfig.colors.dark = { ...newConfig.colors.dark, ...newDarkPalette };

    onConfigChange(newConfig);
    setHasUnsavedChanges(true);
  }, [config, onConfigChange]);

  // Réinitialiser les couleurs
  const resetColors = useCallback(() => {
    const defaultLightPalette = createSemanticPalette('#3b82f6');
    const defaultDarkPalette = adaptPaletteForDarkMode(defaultLightPalette);

    const newConfig = { ...config };
    newConfig.colors.light = { ...newConfig.colors.light, ...defaultLightPalette };
    newConfig.colors.dark = { ...newConfig.colors.dark, ...defaultDarkPalette };

    onConfigChange(newConfig);
    setHasUnsavedChanges(false);
  }, [config, onConfigChange]);

  // Sauvegarder les changements
  const saveChanges = useCallback(() => {
    setHasUnsavedChanges(false);
    // Ici, vous pourriez ajouter une logique pour sauvegarder dans un backend
    console.log('Configuration sauvegardée:', config);
  }, [config]);

  // Exporter la configuration
  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [config]);

  // Importer une configuration
  const importConfig = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        onConfigChange({ ...config, ...importedConfig });
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Failed to import config:', error);
      }
    };
    reader.readAsText(file);
  }, [config, onConfigChange]);

  // Vérifier l'accessibilité des couleurs
  const checkAccessibility = useCallback(() => {
    const results: Record<string, boolean> = {};

    // Vérifier les contrastes clés
    const checks = [
      { bg: currentColors.background, fg: currentColors.text, name: 'text_on_background' },
      { bg: currentColors.primary, fg: '#ffffff', name: 'white_text_on_primary' },
      { bg: currentColors.success, fg: '#ffffff', name: 'white_text_on_success' },
      { bg: currentColors.error, fg: '#ffffff', name: 'white_text_on_error' },
      { bg: currentColors.card, fg: currentColors.text, name: 'text_on_card' }
    ];

    checks.forEach(check => {
      const contrast = checkWCAGContrast(check.bg, check.fg);
      results[check.name] = contrast.passes;
    });

    setAccessibilityResults(results);
  }, [currentColors]);

  // Générer les variations de la couleur primaire
  const primaryVariations = useMemo(() => {
    return currentColors.primary ? generateColorVariations(currentColors.primary) : {};
  }, [currentColors.primary]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personnalisation des Couleurs</h2>
          <p className="text-muted-foreground">
            Personnalisez la palette de couleurs de votre thème
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Modifications non sauvegardées
            </Badge>
          )}

          <Button variant="outline" size="sm" onClick={resetColors}>
            <RotateCcw size={16} className="mr-2" />
            Réinitialiser
          </Button>

          <Button variant="outline" size="sm" onClick={exportConfig}>
            <Download size={16} className="mr-2" />
            Exporter
          </Button>

          <label htmlFor="import-config">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload size={16} className="mr-2" />
                Importer
              </span>
            </Button>
          </label>
          <input
            id="import-config"
            type="file"
            accept=".json"
            className="hidden"
            onChange={importConfig}
          />

          <Button size="sm" onClick={saveChanges} disabled={!hasUnsavedChanges}>
            <Save size={16} className="mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {sections.includes('colors') && (
            <TabsTrigger value="colors">Couleurs</TabsTrigger>
          )}
          {sections.includes('presets') && (
            <TabsTrigger value="presets">Présets</TabsTrigger>
          )}
          {sections.includes('accessibility') && (
            <TabsTrigger value="accessibility">Accessibilité</TabsTrigger>
          )}
          {sections.includes('css-variables') && (
            <TabsTrigger value="css-variables">Variables CSS</TabsTrigger>
          )}
          {sections.includes('advanced') && (
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
          )}
        </TabsList>

        {/* Onglet Couleurs */}
        {sections.includes('colors') && (
          <TabsContent value="colors" className="space-y-6">
            {/* Couleur primaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: currentColors.primary }} />
                  Couleur Primaire
                </CardTitle>
                <CardDescription>
                  La couleur principale définit l'identité visuelle de votre thème et génère automatiquement les autres couleurs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColorSelector
                  value={currentColors.primary || '#3b82f6'}
                  onChange={(color) => updateColor('primary', color)}
                  label="Couleur primaire"
                  description="Cette couleur influencera toute la palette"
                  showVariations={true}
                  showContrast={true}
                />

                {/* Variations rapides */}
                <div className="mt-4">
                  <Label className="text-sm font-medium">Variations générées</Label>
                  <div className="flex gap-2 mt-2">
                    {Object.entries(primaryVariations).slice(0, 8).map(([key, color]) => {
                      if (typeof color === 'string') {
                        return (
                          <button
                            key={key}
                            onClick={() => updateColor('primary', color)}
                            className="w-8 h-8 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                            style={{ backgroundColor: color }}
                            title={`${key}: ${color}`}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Autres couleurs personnalisables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'secondary' as keyof ColorPalette, label: 'Couleur secondaire', description: 'Couleur complémentaire' },
                { key: 'accent' as keyof ColorPalette, label: 'Couleur d\'accent', description: 'Couleur pour les éléments importants' },
                { key: 'success' as keyof ColorPalette, label: 'Couleur de succès', description: 'Pour les actions réussies' },
                { key: 'warning' as keyof ColorPalette, label: 'Couleur d\'avertissement', description: 'Pour les alertes' },
                { key: 'error' as keyof ColorPalette, label: 'Couleur d\'erreur', description: 'Pour les erreurs' },
                { key: 'info' as keyof ColorPalette, label: 'Couleur d\'information', description: 'Pour les informations' }
              ].map(({ key, label, description }) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: currentColors[key] }} />
                      {label}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ColorSelector
                      value={currentColors[key] || '#6b7280'}
                      onChange={(color) => updateColor(key, color)}
                      showVariations={false}
                      showContrast={false}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Aperçu des palettes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PalettePreview
                palette={config.colors.light}
                title="Palette Claire"
                isDark={false}
              />
              <PalettePreview
                palette={config.colors.dark}
                title="Palette Sombre"
                isDark={true}
              />
            </div>
          </TabsContent>
        )}

        {/* Onglet Présets */}
        {sections.includes('presets') && (
          <TabsContent value="presets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                <Card
                  key={key}
                  className="cursor-pointer transition-all hover:scale-105 hover:shadow-md"
                  onClick={() => applyPreset(key as keyof typeof COLOR_PRESETS)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-md"
                        style={{ backgroundColor: preset.primary }}
                      />
                      {preset.name}
                    </CardTitle>
                    <CardDescription>{preset.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-1">
                      <div
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: generateColorVariations(preset.primary)['50'] }}
                      />
                      <div
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: generateColorVariations(preset.primary)['200'] }}
                      />
                      <div
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: generateColorVariations(preset.primary)['400'] }}
                      />
                      <div
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: generateColorVariations(preset.primary)['600'] }}
                      />
                      <div
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: generateColorVariations(preset.primary)['800'] }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {/* Onglet Accessibilité */}
        {sections.includes('accessibility') && (
          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle size={20} />
                  Vérification de l'accessibilité
                </CardTitle>
                <CardDescription>
                  Vérifiez que vos couleurs respectent les normes WCAG pour l'accessibilité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={checkAccessibility}>
                  <Eye size={16} className="mr-2" />
                  Vérifier l'accessibilité
                </Button>

                {Object.keys(accessibilityResults).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Résultats des tests</h4>
                    {Object.entries(accessibilityResults).map(([test, passes]) => (
                      <div key={test} className="flex items-center justify-between p-3 rounded border">
                        <span className="font-medium capitalize">
                          {test.replace(/_/g, ' ')}
                        </span>
                        <Badge variant={passes ? 'default' : 'outline'}>
                          {passes ? (
                            <>
                              <Check size={14} className="mr-1" />
                              Conforme
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} className="mr-1" />
                              Non conforme
                            </>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Les normes WCAG 2.1 AA exigent un ratio de contraste minimum de 4.5:1 pour le texte normal
                    et 3:1 pour le texte de grande taille (18px ou 14px en gras).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Onglet Variables CSS */}
        {sections.includes('css-variables') && (
          <TabsContent value="css-variables" className="space-y-6">
            <CSSVariablesDisplay
              config={config}
              onOptionsChange={(options) => {
                // Les options de génération peuvent être sauvegardées si nécessaire
                console.log('CSS Variables options changed:', options);
              }}
            />
          </TabsContent>
        )}

        {/* Onglet Avancé */}
        {sections.includes('advanced') && (
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Options avancées</CardTitle>
                <CardDescription>
                  Configuration avancée des couleurs et comportements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-contrast">Ratio de contraste minimum</Label>
                    <Input
                      id="min-contrast"
                      type="number"
                      min="1"
                      max="21"
                      step="0.1"
                      value={config.accessibility.minContrastRatio}
                      onChange={(e) => {
                        const newConfig = { ...config };
                        newConfig.accessibility.minContrastRatio = parseFloat(e.target.value);
                        onConfigChange(newConfig);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="min-font-size">Taille de police minimum (px)</Label>
                    <Input
                      id="min-font-size"
                      type="number"
                      min="12"
                      max="24"
                      value={config.accessibility.minFontSize}
                      onChange={(e) => {
                        const newConfig = { ...config };
                        newConfig.accessibility.minFontSize = parseInt(e.target.value);
                        onConfigChange(newConfig);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Variables CSS générées</h4>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm max-h-60 overflow-y-auto">
                    {Object.entries(config.colors.light).map(([key, value]) => (
                      <div key={key}>
                        --color-{key}: {value};
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default ColorCustomizationPanel;
