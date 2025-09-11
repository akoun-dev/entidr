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
  ShadowOptions,
  ShadowPreset,
  ShadowInfo
} from './shadowUtils';
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
 * Interface pour les props du ShadowSelector
 */
export interface ShadowSelectorProps {
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
 * Composant pour afficher un aperçu d'ombre
 */
function ShadowPreview({
  shadow,
  color = 'hsl(var(--primary))',
  label,
  animate = false
}: {
  shadow: string;
  color?: string;
  label?: string;
  animate?: boolean;
}) {
  const previewStyle: React.CSSProperties = {
    boxShadow: shadow,
    padding: '16px',
    transition: 'all 0.3s ease',
    backgroundColor: 'hsl(var(--muted))',
    borderRadius: '8px',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  if (animate) {
    previewStyle.animation = 'shadow-float 3s ease-in-out infinite';
  }

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs">{label}</Label>}
      <div style={previewStyle} className="text-center text-xs">
        {shadow}
      </div>
    </div>
  );
}

/**
 * Composant pour afficher les recommandations
 */
function ShadowRecommendations({
  shadows,
  coloredShadows,
  context = 'desktop'
}: {
  shadows: Record<string, string>;
  coloredShadows: Record<string, string>;
  context?: 'mobile' | 'desktop' | 'tablet';
}) {
  const allShadows = { ...shadows, ...coloredShadows };
  const recommendations = getShadowRecommendations(allShadows, context);

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
 * Sélecteur d'ombres
 */
export function ShadowSelector({
  value,
  onChange,
  label = "Configuration des ombres",
  description = "Personnalisez le système d'ombres pour votre thème",
  showAdvanced = false,
  className = ''
}: ShadowSelectorProps) {
  const [activeTab, setActiveTab] = useState('presets');
  const [selectedPreset, setSelectedPreset] = useState<string>('standard');
  const [customShadows, setCustomShadows] = useState<Record<string, string>>({});
  const [customColoredShadows, setCustomColoredShadows] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Obtenir les configurations actuelles
  const currentConfig = React.useMemo(() => {
    return {
      shadows: value.shadows ? {
        none: value.shadows.none ?? 'none',
        sm: value.shadows.sm ?? '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: value.shadows.DEFAULT ?? '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: value.shadows.md ?? '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: value.shadows.lg ?? '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: value.shadows.xl ?? '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': value.shadows['2xl'] ?? '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '3xl': value.shadows['3xl'] ?? '0 35px 60px -15px rgb(0 0 0 / 0.3)',
        inner: value.shadows.inner ?? 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
      } : SHADOW_SCALE,
      coloredShadows: value.shadows ? {
        primary: value.shadows.coloredPrimary ?? COLORED_SHADOWS.primary,
        secondary: value.shadows.coloredSecondary ?? COLORED_SHADOWS.secondary,
        success: value.shadows.coloredSuccess ?? COLORED_SHADOWS.success,
        warning: value.shadows.coloredWarning ?? COLORED_SHADOWS.warning,
        error: value.shadows.coloredError ?? COLORED_SHADOWS.error,
        info: value.shadows.coloredInfo ?? COLORED_SHADOWS.info,
      } : COLORED_SHADOWS
    };
  }, [value]);

  // Mettre à jour la configuration
  const updateConfig = useCallback((newConfig: Partial<ThemeConfig>) => {
    onChange({ ...value, ...newConfig });
  }, [value, onChange]);

  // Appliquer un preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = SHADOW_PRESETS[presetName];
    if (!preset) return;

    setSelectedPreset(presetName);
    const shadowConfig = createShadowConfig(presetName);
    updateConfig(shadowConfig);
  }, [updateConfig]);

  // Générer le CSS
  const generatedCSS = React.useMemo(() => {
    const variables = generateShadowVariables(
      currentConfig.shadows,
      currentConfig.coloredShadows
    );
    const utilities = generateShadowUtilities(
      currentConfig.shadows,
      currentConfig.coloredShadows,
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

  // Mettre à jour une valeur d'ombre
  const updateShadowValue = useCallback((key: string, newValue: string) => {
    if (!validateShadowValue(newValue)) {
      return;
    }
    const newShadows = { ...currentConfig.shadows, [key]: newValue };
    const shadowConfig = createShadowConfig('standard');
    updateConfig({
      shadows: {
        ...shadowConfig.shadows,
        ...Object.fromEntries(Object.entries(newShadows).map(([k, v]) => {
          const capitalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
          return [capitalizedKey, v];
        }))
      }
    });
  }, [currentConfig, updateConfig]);

  // Mettre à jour une valeur d'ombre colorée
  const updateColoredShadowValue = useCallback((key: string, newValue: string) => {
    if (!validateShadowValue(newValue)) {
      return;
    }
    const newColoredShadows = { ...currentConfig.coloredShadows, [key]: newValue };
    const shadowConfig = createShadowConfig('standard');
    updateConfig({
      shadows: {
        ...shadowConfig.shadows,
        ...Object.fromEntries(Object.entries(newColoredShadows).map(([k, v]) => [`colored${k.charAt(0).toUpperCase() + k.slice(1)}`, v]))
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
          <TabsTrigger value="shadows">Ombres</TabsTrigger>
          <TabsTrigger value="colored">Ombres colorées</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          {showAdvanced && <TabsTrigger value="advanced">Avancé</TabsTrigger>}
        </TabsList>

        {/* Onglet Présélections */}
        <TabsContent value="presets" className="space-y-4">
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
        </TabsContent>

        {/* Onglet Ombres */}
        <TabsContent value="shadows" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(currentConfig.shadows).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => updateShadowValue(key, e.target.value)}
                  placeholder={key}
                  className={validateShadowValue(value) ? '' : 'border-red-500'}
                />
                <ShadowPreview
                  shadow={value}
                  label={key}
                />
              </div>
            ))}
          </div>

          {showRecommendations && (
            <ShadowRecommendations
              shadows={currentConfig.shadows}
              coloredShadows={currentConfig.coloredShadows}
              context="desktop"
            />
          )}
        </TabsContent>

        {/* Onglet Ombres colorées */}
        <TabsContent value="colored" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(currentConfig.coloredShadows).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label>{key}</Label>
                <Input
                  value={value}
                  onChange={(e) => updateColoredShadowValue(key, e.target.value)}
                  placeholder={key}
                  className={validateShadowValue(value) ? '' : 'border-red-500'}
                />
                <ShadowPreview
                  shadow={value}
                  color={`hsl(var(--${key}))`}
                  label={key}
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
                  <Label className="text-sm">Carte avec ombres</Label>
                  <Card className="mt-2" style={{
                    boxShadow: currentConfig.shadows.lg
                  }}>
                    <CardContent className="p-4">
                      Contenu de la carte avec ombres personnalisées
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Label className="text-sm">Boutons avec ombres</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" style={{
                      boxShadow: currentConfig.shadows.sm
                    }}>
                      Fin
                    </Button>
                    <Button variant="outline" style={{
                      boxShadow: currentConfig.shadows.md
                    }}>
                      Moyen
                    </Button>
                    <Button variant="outline" style={{
                      boxShadow: currentConfig.shadows.lg
                    }}>
                      Épais
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Input avec ombres</Label>
                  <Input
                    className="mt-2"
                    placeholder="Input avec ombres personnalisées"
                    style={{
                      boxShadow: currentConfig.shadows.md
                    }}
                  />
                </div>

                <div>
                  <Label className="text-sm">Ombres colorées</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="default" style={{
                      boxShadow: currentConfig.coloredShadows.primary
                    }}>
                      Primaire
                    </Button>
                    <Button variant="secondary" style={{
                      boxShadow: currentConfig.coloredShadows.secondary
                    }}>
                      Secondaire
                    </Button>
                    <Button variant="destructive" style={{
                      boxShadow: currentConfig.coloredShadows.error
                    }}>
                      Erreur
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Aperçu des animations */}
            <div className="space-y-4">
              <h4 className="font-semibold">Animations d'ombres</h4>

              <div className="space-y-3">
                <ShadowPreview
                  shadow={currentConfig.shadows.md}
                  label="Float"
                  animate={true}
                />

                <ShadowPreview
                  shadow={currentConfig.shadows.lg}
                  label="Normal"
                  animate={false}
                />

                <div className="p-4 border-2 border-dashed rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    Animation de glow
                  </div>
                  <div
                    className="p-4 text-center text-xs shadow-animate-glow rounded-lg"
                    style={{
                      backgroundColor: 'hsl(var(--muted))'
                    }}
                  >
                    Effet de lueur animé
                  </div>
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    Animation de pulse
                  </div>
                  <div
                    className="p-4 text-center text-xs shadow-animate-pulse rounded-lg"
                    style={{
                      backgroundColor: 'hsl(var(--muted))'
                    }}
                  >
                    Effet de pulsation animé
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
                    <Label>Préfixe des variables d'ombre</Label>
                    <Input defaultValue="--shadow-" placeholder="--shadow-" />
                  </div>
                  <div className="space-y-2">
                    <Label>Préfixe des variables colorées</Label>
                    <Input defaultValue="--shadow-colored-" placeholder="--shadow-colored-" />
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
                  <div className="space-y-2">
                    <Label>Inclure les ombres colorées</Label>
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
                    <span>Nombre d'ombres définies</span>
                    <Badge>{Object.keys(currentConfig.shadows).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Nombre d'ombres colorées</span>
                    <Badge>{Object.keys(currentConfig.coloredShadows).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ombre la plus profonde</span>
                    <Badge>{Object.keys(currentConfig.shadows).pop()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Support des animations</span>
                    <Badge>Oui</Badge>
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

export default ShadowSelector;
