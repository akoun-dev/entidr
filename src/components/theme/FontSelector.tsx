import React, { useState, useCallback } from 'react';
import { Type, Download, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import type { FontInfo } from './fontUtils';
import {
  FONT_PRESETS,
  FONT_SIZE_SCALE,
  LINE_HEIGHT_SCALE,
  FONT_WEIGHTS,
  LETTER_SPACING_SCALE,
  normalizeFontInfo,
  fontInfoToCSS,
  calculateFontReadability,
  listFontPresets
} from './fontUtils';

/**
 * Interface pour les props du FontSelector
 */
export interface FontSelectorProps {
  // Valeur actuelle
  value: FontInfo;

  // Callback de changement
  onChange: (font: FontInfo) => void;

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
 * Interface pour les options de police
 */
export interface FontOptions {
  family: string;
  weight: string | number;
  style: string;
  size: string;
  lineHeight: string | number;
  letterSpacing: string;
}

/**
 * Composant pour afficher un aperçu de police
 */
function FontPreview({ font, text = 'Aa Bb Cc' }: { font: FontInfo; text?: string }) {
  const css = fontInfoToCSS(font);

  return (
    <div
      className="p-4 rounded border bg-background text-foreground"
      style={{
        font: css,
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {text}
    </div>
  );
}

/**
 * Sélecteur de police complet
 */
export function FontSelector({
  value,
  onChange,
  label = 'Police',
  description = 'Sélectionnez et personnalisez la police',
  showAdvanced = false,
  className = ''
}: FontSelectorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Polices web courantes
  const commonFonts = [
    'Inter, system-ui, -apple-system, sans-serif',
    'Roboto, system-ui, sans-serif',
    'Helvetica, Arial, sans-serif',
    'Georgia, Times New Roman, serif',
    'Playfair Display, Georgia, serif',
    'JetBrains Mono, Consolas, Monaco, monospace',
    'Fira Code, Consolas, Monaco, monospace',
    'Courier New, monospace',
    'Lato, system-ui, sans-serif',
    'Open Sans, system-ui, sans-serif',
    'Merriweather, Georgia, serif',
    'Source Code Pro, Consolas, Monaco, monospace',
    'Crimson Text, Georgia, serif'
  ];

  // Mettre à jour une propriété de la police
  const updateFontProperty = useCallback((property: keyof FontInfo, newValue: any) => {
    const updatedFont = normalizeFontInfo({
      ...value,
      [property]: newValue
    });
    onChange(updatedFont);
  }, [value, onChange]);

  // Copier le CSS de la police
  const copyCSS = useCallback(() => {
    const css = fontInfoToCSS(value);
    navigator.clipboard.writeText(`font: ${css};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  // Calculer la lisibilité
  const readability = calculateFontReadability(
    value.size || '16px',
    value.weight || 400,
    value.lineHeight || 1.5
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{label}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={readability.score >= 70 ? 'default' : 'outline'}>
            Lisibilité: {readability.score}/100
          </Badge>

          <Button variant="outline" size="sm" onClick={copyCSS}>
            {copied ? (
              <>
                <Check size={16} className="mr-2" />
                Copié
              </>
            ) : (
              <>
                <Copy size={16} className="mr-2" />
                Copier CSS
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Basique</TabsTrigger>
          {showAdvanced && <TabsTrigger value="advanced">Avancé</TabsTrigger>}
          <TabsTrigger value="presets">Présélections</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* Famille de police */}
          <div className="space-y-2">
            <Label>Famille de police</Label>
            <Select
              value={value.family}
              onValueChange={(newValue) => updateFontProperty('family', newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une police" />
              </SelectTrigger>
              <SelectContent>
                {commonFonts.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>
                      {font.split(',')[0]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Taille et poids */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Taille</Label>
              <Select
                value={value.size || '16px'}
                onValueChange={(newValue) => updateFontProperty('size', newValue)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FONT_SIZE_SCALE).map(([key, size]) => (
                    <SelectItem key={key} value={size}>
                      {key} ({size})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Poids</Label>
              <Select
                value={value.weight?.toString() || '400'}
                onValueChange={(newValue) => updateFontProperty('weight', parseInt(newValue))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FONT_WEIGHTS).map(([key, weight]) => (
                    <SelectItem key={key} value={weight.toString()}>
                      {key} ({weight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label>Style</Label>
            <Select
              value={value.style || 'normal'}
              onValueChange={(newValue) => updateFontProperty('style', newValue)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="italic">Italique</SelectItem>
                <SelectItem value="oblique">Oblique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {showAdvanced && (
          <TabsContent value="advanced" className="space-y-4">
            {/* Hauteur de ligne */}
            <div className="space-y-2">
              <Label>Hauteur de ligne</Label>
              <Select
                value={value.lineHeight?.toString() || '1.5'}
                onValueChange={(newValue) => updateFontProperty('lineHeight', newValue.includes('.') ? parseFloat(newValue) : parseInt(newValue))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LINE_HEIGHT_SCALE).map(([key, height]) => (
                    <SelectItem key={key} value={height.toString()}>
                      {key} ({height})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Espacement des lettres */}
            <div className="space-y-2">
              <Label>Espacement des lettres</Label>
              <Select
                value={value.letterSpacing || 'normal'}
                onValueChange={(newValue) => updateFontProperty('letterSpacing', newValue)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LETTER_SPACING_SCALE).map(([key, spacing]) => (
                    <SelectItem key={key} value={spacing}>
                      {key} ({spacing})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Personnalisation avancée */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taille personnalisée (px)</Label>
                <Input
                  type="number"
                  min="8"
                  max="96"
                  value={parseInt(value.size?.toString() || '16')}
                  onChange={(e) => updateFontProperty('size', `${e.target.value}px`)}
                />
              </div>

              <div className="space-y-2">
                <Label>Poids personnalisé</Label>
                <Input
                  type="number"
                  min="100"
                  max="900"
                  step="100"
                  value={parseInt(value.weight?.toString() || '400')}
                  onChange={(e) => updateFontProperty('weight', parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listFontPresets().map(({ key, preset }) => (
              <Card
                key={key}
                className="cursor-pointer transition-all hover:scale-105 hover:shadow-md"
                onClick={() => {
                  const updatedFont = normalizeFontInfo(preset.sans);
                  onChange(updatedFont);
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type size={20} />
                    {preset.name}
                  </CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <FontPreview font={preset.sans} text={preset.name} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Aperçu */}
      <div className="space-y-2">
        <Label>Aperçu</Label>
        <FontPreview font={value} />
      </div>

      {/* Recommandations de lisibilité */}
      {readability.recommendations.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <strong>Recommandations pour améliorer la lisibilité:</strong>
              {readability.recommendations.map((rec, index) => (
                <div key={index}>• {rec}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* CSS généré */}
      <div className="space-y-2">
        <Label>CSS généré</Label>
        <div className="bg-muted p-4 rounded-md font-mono text-sm">
          font: {fontInfoToCSS(value)};
        </div>
      </div>
    </div>
  );
}

export default FontSelector;
