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
  BorderOptions,
  BorderPreset,
  BorderInfo
} from './borderUtils';
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
 * Interface pour les props du BorderSelector
 */
export interface BorderSelectorProps {
  // Configuration actuelle
  value: Partial<ThemeConfig>;

  // Callback de changement
  onChange: (config: Partial<ThemeConfig>) => void;

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
 * Composant pour afficher un aperçu de bordure
 */
function BorderPreview({
  width,
  style,
  radius,
  color = 'hsl(var(--border))',
  label,
  animate = false
}: {
  width: string;
  style: string;
  radius: string;
  color?: string;
  label?: string;
  animate?: boolean;
}) {
  const previewStyle: React.CSSProperties = {
    borderWidth: width,
    borderStyle: style,
    borderColor: color,
    borderRadius: radius,
    padding: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: 'hsl(var(--muted))'
  };

  if (animate) {
    previewStyle.animation = 'border-pulse 2s ease-in-out infinite';
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}
      <div style={previewStyle} className="text-center text-xs">
        {width} {style} {radius}
      </div>
    </div>
  );
}

/**
 * Composant pour afficher les recommandations
 */
function BorderRecommendations({
  widths,
  styles,
  radii,
  context = 'desktop'
}: {
  widths: Record<string, string>;
  styles: Record<string, string>;
  radii: Record<string, string>;
  context?: 'mobile' | 'desktop' | 'tablet';
}) {
  const recommendations = getBorderRecommendations(widths, styles, radii, context);

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
 * Sélecteur de bordure
 */
export function BorderSelector({
  value,
  onChange,
  label = "Configuration des bordures",
  description = "Personnalisez le système de bordures pour votre thème",
  showAdvanced = false,
  className = ''
}: BorderSelectorProps) {
  const [activeTab, setActiveTab] = useState('presets');
  const [selectedPreset, setSelectedPreset] = useState<string>('standard');
  const [customWidths, setCustomWidths] = useState<Record<string, string>>({});
  const [customStyles, setCustomStyles] = useState<Record<string, string>>({});
  const [customRadii, setCustomRadii] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Obtenir les configurations actuelles
  const currentConfig = React.useMemo(() => {
    return {
      widths: value.borders ? {
        none: value.borders.widthNone ?? '0',
        sm: value.borders.widthSm ?? '0.5px',
        md: value.borders.widthMd ?? '1px',
        lg: value.borders.widthLg ?? '2px',
        xl: value.borders.widthXl ?? '3px',
        '2xl': value.borders.width2xl ?? '4px',
        '3xl': value.borders.width3xl ?? '6px',
      } : BORDER_WIDTH_SCALE,
      styles: value.borders ? {
        solid: value.borders.solid ?? 'solid',
        dashed: value.borders.dashed ?? 'dashed',
        dotted: value.borders.dotted ?? 'dotted',
        double: value.borders.double ?? 'double',
        groove: value.borders.groove ?? 'groove',
        ridge: value.borders.ridge ?? 'ridge',
        inset: value.borders.inset ?? 'inset',
        outset: value.borders.outset ?? 'outset',
      } : BORDER_STYLES,
      radii: value.borders ? {
        none: value.borders.radiusNone ?? '0',
        sm: value.borders.radiusSm ?? '0.125rem',
        md: value.borders.radiusMd ?? '0.25rem',
        lg: value.borders.radiusLg ?? '0.5rem',
        xl: value.borders.radiusXl ?? '0.75rem',
        '2xl': value.borders.radius2xl ?? '1rem',
        '3xl': value.borders.radius3xl ?? '1.5rem',
        full: value.borders.radiusFull ?? '9999px',
      } : BORDER_RADIUS_SCALE
    };
  }, [value]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((newConfig: Partial<ThemeConfig>) => {
    onChange({ ...value, ...newConfig });
  }, [value, onChange]);

  // Appliquer un preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = BORDER_PRESETS[presetName];
    if (!preset) return;

    setSelectedPreset(presetName);
    const borderConfig = createBorderConfig(presetName);
    updateConfig(borderConfig);
  }, [updateConfig]);

  // Générer le CSS
  const generatedCSS = React.useMemo(() => {
    const variables = generateBorderVariables(
      currentConfig.widths,
      currentConfig.styles,
      currentConfig.radii
    );
    const utilities = generateBorderUtilities(
      currentConfig.widths,
      currentConfig.styles,
      currentConfig.radii,
      true
    );
    return `/* Variables CSS */\n${variables}\n\n/* Utilitaires */\n${utilities}`;
  }, [currentConfig]);

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

  // Mettre à jour une valeur de largeur
  const updateWidthValue = useCallback((key: string, newValue: string) => {
    if (!validateBorderValue(newValue, 'width')) {
      return;
    }
    const newWidths = { ...currentConfig.widths, [key]: newValue };
    const borderConfig = createBorderConfig('standard');
    updateConfig({
      borders: {
        ...borderConfig.borders,
        ...Object.fromEntries(Object.entries(newWidths).map(([k, v]) => [`width${k.charAt(0).toUpperCase() + k.slice(1)}`, v]))
      }
    });
  }, [currentConfig, updateConfig]);

  // Mettre à jour une valeur de style
  const updateStyleValue = useCallback((key: string, newValue: string) => {
    if (!validateBorderValue(newValue, 'style')) {
      return;
    }
    const newStyles = { ...currentConfig.styles, [key]: newValue };
    const borderConfig = createBorderConfig('standard');
    updateConfig({
      borders: {
        ...borderConfig.borders,
        ...Object.fromEntries(Object.entries(newStyles).map(([k, v]) => [k, v]))
      }
    });
  }, [currentConfig, updateConfig]);

  // Mettre à jour une valeur de rayon
  const updateRadiusValue = useCallback((key: string, newValue: string) => {
    if (!validateBorderValue(newValue, 'radius')) {
      return;
    }
    const newRadii = { ...currentConfig.radii, [key]: newValue };
    const borderConfig = createBorderConfig('standard');
    updateConfig({
      borders: {
        ...borderConfig.borders,
        ...Object.fromEntries(Object.entries(newRadii).map(([k, v]) => [`radius${k.charAt(0).toUpperCase() + k.slice(1)}`, v]))
      }
    });
  }, [currentConfig, updateConfig]);

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
          <TabsTrigger value="widths">Largeurs</TabsTrigger>
          <TabsTrigger value="styles">Styles</TabsTrigger>
          <TabsTrigger value="radii">Rayons</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          {showAdvanced && <TabsTrigger value="advanced">Avancé</TabsTrigger>}
        </TabsList>

        {/* Onglet Présélections */}
        <TabsContent value="presets" className="space-y-4">
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
                  <h4 className="font-semibold mb-2">{preset.name}</h4>
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

                  <div className="mt-3 grid grid-cols-2 gap-1">
                    <BorderPreview
                      width={preset.widths['1'] || '1px'}
                      style={preset.styles.solid || 'solid'}
                      radius={preset.radii.md || '0.25rem'}
                      label="Simple"
                    />
                    <BorderPreview
                      width={preset.widths['2'] || '2px'}
                      style={preset.styles.dashed || 'dashed'}
                      radius={preset.radii.lg || '0.5rem'}
                      label="Complex"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Largeurs */}
        <TabsContent value="widths" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(currentConfig.widths).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => updateWidthValue(key, e.target.value)}
                  placeholder={key}
                  className={validateBorderValue(value, 'width') ? '' : 'border-red-500'}
                />
                <BorderPreview
                  width={value}
                  style="solid"
                  radius="0.25rem"
                />
              </div>
            ))}
          </div>

          {showRecommendations && (
            <BorderRecommendations
              widths={currentConfig.widths}
              styles={currentConfig.styles}
              radii={currentConfig.radii}
              context="desktop"
            />
          )}
        </TabsContent>

        {/* Onglet Styles */}
        <TabsContent value="styles" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(currentConfig.styles).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Select
                  value={value}
                  onValueChange={(newValue) => updateStyleValue(key, newValue)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BORDER_STYLES).map(([styleKey, styleValue]) => (
                      <SelectItem key={styleKey} value={styleValue}>
                        {styleKey}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <BorderPreview
                  width="2px"
                  style={value}
                  radius="0.25rem"
                  label={key}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Rayons */}
        <TabsContent value="radii" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(currentConfig.radii).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => updateRadiusValue(key, e.target.value)}
                  placeholder={key}
                  className={validateBorderValue(value, 'radius') ? '' : 'border-red-500'}
                />
                <BorderPreview
                  width="2px"
                  style="solid"
                  radius={value}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Aperçu */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aperçu des composants */}
            <div className="space-y-4">
              <h4 className="font-semibold">Aperçu des composants</h4>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Carte avec bordures</Label>
                  <Card className="mt-2" style={{
                    borderWidth: (currentConfig.widths as any)['2'],
                    borderStyle: currentConfig.styles.solid,
                    borderRadius: currentConfig.radii.md
                  }}>
                    <CardContent className="p-4">
                      Contenu de la carte avec bordures personnalisées
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label className="text-sm">Boutons avec bordures</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" style={{
                      borderWidth: (currentConfig.widths as any)['1'],
                      borderStyle: currentConfig.styles.solid,
                      borderRadius: currentConfig.radii.sm
                    }}>
                      Fin
                    </Button>
                    <Button variant="outline" style={{
                      borderWidth: (currentConfig.widths as any)['2'],
                      borderStyle: currentConfig.styles.dashed,
                      borderRadius: currentConfig.radii.md
                    }}>
                      Moyen
                    </Button>
                    <Button variant="outline" style={{
                      borderWidth: (currentConfig.widths as any)['3'],
                      borderStyle: currentConfig.styles.double,
                      borderRadius: currentConfig.radii.lg
                    }}>
                      Épais
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Input avec bordures</Label>
                  <Input
                    className="mt-2"
                    placeholder="Input avec bordures personnalisées"
                    style={{
                      borderWidth: (currentConfig.widths as any)['1'],
                      borderStyle: currentConfig.styles.solid,
                      borderRadius: currentConfig.radii.md
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Aperçu des animations */}
            <div className="space-y-4">
              <h4 className="font-semibold">Animations de bordure</h4>

              <div className="space-y-3">
                <BorderPreview
                  width={currentConfig.widths.lg}
                  style={currentConfig.styles.solid}
                  radius={currentConfig.radii.md}
                  label="Pulse"
                  animate={true}
                />

                <BorderPreview
                  width={currentConfig.widths.xl}
                  style={currentConfig.styles.dashed}
                  radius={currentConfig.radii.lg}
                  label="Normal"
                  animate={false}
                />

                <div className="p-4 border-2 border-dashed rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    Animation de dégradé
                  </div>
                  <div
                    className="p-4 text-center text-xs border-animate-slide"
                    style={{
                      borderWidth: currentConfig.widths.md,
                      borderStyle: currentConfig.styles.solid,
                      borderRadius: currentConfig.radii.md
                    }}
                  >
                    Effet de dégradé animé
                  </div>
                </div>
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
                    <Label>Préfixe des variables de largeur</Label>
                    <Input defaultValue="--border-width-" placeholder="--border-width-" />
                  </div>
                  <div className="space-y-2">
                    <Label>Préfixe des variables de style</Label>
                    <Input defaultValue="--border-style-" placeholder="--border-style-" />
                  </div>
                  <div className="space-y-2">
                    <Label>Préfixe des variables de rayon</Label>
                    <Input defaultValue="--border-radius-" placeholder="--border-radius-" />
                  </div>
                  <div className="space-y-2">
                    <Label>Inclure les animations</Label>
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
                    <span>Nombre de largeurs définies</span>
                    <Badge>{Object.keys(currentConfig.widths).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Nombre de styles définis</span>
                    <Badge>{Object.keys(currentConfig.styles).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Nombre de rayons définis</span>
                    <Badge>{Object.keys(currentConfig.radii).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Unité principale</span>
                    <Badge>{parseBorderValue(Object.values(currentConfig.widths)[0], 'width').unit}</Badge>
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

export default BorderSelector;
