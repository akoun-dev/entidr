import React, { useState, useCallback } from 'react';
import { Settings, Copy, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import type { ThemeConfig } from './types';
import type {
  SpacingOptions,
  SpacingPreset,
  SpacingInfo
} from './spacingUtils';
import {
  SPACING_SCALE,
  SPACING_PRESETS,
  BREAKPOINTS,
  generateSpacingScale,
  generateSpacingVariables,
  generateSpacingUtilities,
  parseSpacingValue,
  validateSpacingValue,
  getSpacingRecommendations,
  createSpacingConfig
} from './spacingUtils';

/**
 * Interface pour les props du SpacingSelector
 */
export interface SpacingSelectorProps {
  // Configuration actuelle
  value: ThemeConfig['spacing'];

  // Callback de changement
  onChange: (spacing: ThemeConfig['spacing']) => void;

  // Label du sélecteur
  label?: string;

  // Description
  description?: string;

  // Afficher les options avancées
  showAdvanced?: boolean;

  // Classes CSS
  className?: string;
}

/**
 * Composant pour afficher un aperçu d'espacement
 */
function SpacingPreview({
  spacing,
  property = 'padding',
  label
}: {
  spacing: string;
  property?: string;
  label?: string;
}) {
  const style: React.CSSProperties = {
    [property]: spacing,
    border: '1px solid hsl(var(--border))',
    borderRadius: '4px',
    backgroundColor: 'hsl(var(--muted))',
    transition: 'all 0.2s ease'
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}
      <div style={style} className="p-2 text-center text-xs">
        {spacing}
      </div>
    </div>
  );
}

/**
 * Composant pour afficher les recommandations
 */
function SpacingRecommendations({
  spacing,
  context = 'desktop'
}: {
  spacing: ThemeConfig['spacing'];
  context?: 'mobile' | 'desktop' | 'tablet';
}) {
  const recommendations = getSpacingRecommendations(spacing, context);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <strong>Recommandations :</strong>
          {recommendations.map((rec, index) => (
            <div key={index} className="text-sm">• {rec}</div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Sélecteur d'espacement
 */
export function SpacingSelector({
  value,
  onChange,
  label = "Configuration de l'espacement",
  description = "Personnalisez le système d'espacement pour votre thème",
  showAdvanced = false,
  className = ''
}: SpacingSelectorProps) {
  const [activeTab, setActiveTab] = useState('presets');
  const [selectedPreset, setSelectedPreset] = useState<string>('comfortable');
  const [customScale, setCustomScale] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Convertir la configuration en échelle personnalisée
  const currentScale = React.useMemo(() => {
    return value as unknown as Record<string, string>;
  }, [value]);

  // Mettre à jour l'espacement
  const updateSpacing = useCallback((newScale: Record<string, string>) => {
    // Convertir en SpacingConfig
    const spacingConfig = createSpacingConfig('comfortable');
    const updatedConfig = { ...spacingConfig, ...newScale };
    onChange(updatedConfig);
  }, [onChange]);

  // Appliquer un preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = SPACING_PRESETS[presetName];
    if (!preset) return;

    setSelectedPreset(presetName);
    updateSpacing(preset.scale);
  }, [updateSpacing]);

  // Générer le CSS
  const generatedCSS = React.useMemo(() => {
    const variables = generateSpacingVariables(currentScale);
    const utilities = generateSpacingUtilities(currentScale);
    return `/* Variables CSS */\n${variables}\n\n/* Utilitaires */\n${utilities}`;
  }, [currentScale]);

  // Copier le CSS
  const copyCSS = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie du CSS:', error);
    }
  }, [generatedCSS]);

  // Mettre à jour une valeur d'espacement spécifique
  const updateSpacingValue = useCallback((key: string, newValue: string) => {
    if (!validateSpacingValue(newValue)) {
      return;
    }
    updateSpacing({ ...currentScale, [key]: newValue });
  }, [currentScale, updateSpacing]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings size={20} />
          {label}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="presets">Présélections</TabsTrigger>
          <TabsTrigger value="custom">Personnaliser</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          {showAdvanced && <TabsTrigger value="advanced">Avancé</TabsTrigger>}
        </TabsList>

        {/* Onglet Présélections */}
        <TabsContent value="presets" className="space-y-4">
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
                  <h4 className="font-semibold mb-2">{preset.name}</h4>
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

                  <div className="mt-3 grid grid-cols-3 gap-1">
                    <SpacingPreview
                      spacing={preset.scale['4'] || '1rem'}
                      label="Petit"
                    />
                    <SpacingPreview
                      spacing={preset.scale['8'] || '2rem'}
                      label="Moyen"
                    />
                    <SpacingPreview
                      spacing={preset.scale['16'] || '4rem'}
                      label="Grand"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Personnaliser */}
        <TabsContent value="custom" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(currentScale).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => updateSpacingValue(key, e.target.value)}
                  placeholder={key}
                  className={validateSpacingValue(value) ? '' : 'border-red-500'}
                />
                <SpacingPreview spacing={value} />
              </div>
            ))}
          </div>

          {showRecommendations && (
            <SpacingRecommendations spacing={value} context="desktop" />
          )}
        </TabsContent>

        {/* Onglet Aperçu */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aperçu des composants */}
            <div className="space-y-4">
              <h4 className="font-semibold">Aperçu des composants</h4>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Carte avec espacement</Label>
                  <Card className="mt-2">
                    <CardContent className={currentScale['4']}>
                      Contenu de la carte avec espacement {currentScale['4']}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label className="text-sm">Boutons avec espacement</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" className={currentScale['2']}>
                      Petit
                    </Button>
                    <Button variant="outline" className={currentScale['4']}>
                      Moyen
                    </Button>
                    <Button variant="outline" className={currentScale['6']}>
                      Grand
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Grille avec espacement</Label>
                  <div
                    className="grid grid-cols-3 gap-2 mt-2"
                    style={{ gap: currentScale['2'] }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="p-2 bg-muted rounded text-center text-xs"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Aperçu des espacements */}
            <div className="space-y-4">
              <h4 className="font-semibold">Échelle d'espacement</h4>

              <div className="space-y-2">
                {Object.entries(currentScale)
                  .filter(([key]) => !['px'].includes(key))
                  .map(([key, value]) => {
                    const info = parseSpacingValue(value);
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs"
                            style={{ padding: value }}
                          >
                            {key}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{value}</div>
                            <div className="text-xs text-muted-foreground">
                              {info.semantic} • {info.numericValue}{info.unit}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{key}</Badge>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Avancé */}
        {showAdvanced && (
          <TabsContent value="advanced" className="space-y-6">
            {/* Génération CSS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  CSS généré
                  <Button variant="outline" size="sm" onClick={copyCSS}>
                    {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                    {copied ? 'Copié !' : 'Copier'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Variables CSS et utilitaires générés à partir de votre configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedCSS}
                  readOnly
                  className="font-mono text-xs min-h-[400px]"
                />
              </CardContent>
            </Card>

            {/* Options de génération */}
            <Card>
              <CardHeader>
                <CardTitle>Options de génération</CardTitle>
                <CardDescription>
                  Personnalisez la génération du CSS et des utilitaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Préfixe des variables</Label>
                    <Input defaultValue="--spacing-" placeholder="--spacing-" />
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
              </CardContent>
            </Card>

            {/* Informations système */}
            <Card>
              <CardHeader>
                <CardTitle>Informations système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Nombre d'espacements définis</span>
                    <Badge>{Object.keys(currentScale).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Unité principale</span>
                    <Badge>{parseSpacingValue(Object.values(currentScale)[0]).unit}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Plage d'espacement</span>
                    <Badge>
                      {Math.min(...Object.values(currentScale).map(v => parseSpacingValue(v).numericValue))} -
                      {Math.max(...Object.values(currentScale).map(v => parseSpacingValue(v).numericValue))}
                      {parseSpacingValue(Object.values(currentScale)[0]).unit}
                    </Badge>
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

export default SpacingSelector;
