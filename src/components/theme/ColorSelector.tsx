import React, { useState, useCallback, useMemo } from 'react';
import {
  Palette,
  Check,
  Copy,
  RotateCcw,
  Shuffle,
  Contrast,
  Info,
  Droplet
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import type { ColorPalette } from './types';
import {
  isValidHexColor,
  normalizeHexColor,
  getColorInfo,
  generateColorVariations,
  checkWCAGContrast,
  getOptimalTextColor,
  createSemanticPalette,
  adaptPaletteForDarkMode,
  COLOR_PRESETS,
  listColorPresets,
  generateRandomColor,
  adjustSaturation,
  adjustHue,
  lightenColor,
  darkenColor
} from './colorUtils';

/**
 * Interface pour les props du ColorSelector
 */
export interface ColorSelectorProps {
  // Couleur actuelle
  value: string;

  // Callback de changement
  onChange: (color: string) => void;

  // Label du champ
  label?: string;

  // Description
  description?: string;

  // Couleurs prédéfinies
  presets?: string[];

  // Autoriser la transparence
  allowAlpha?: boolean;

  // Afficher les variations
  showVariations?: boolean;

  // Afficher les informations de contraste
  showContrast?: boolean;

  // Taille du sélecteur
  size?: 'sm' | 'md' | 'lg';

  // Classes CSS
  className?: string;
}

/**
 * Composant pour afficher une variation de couleur
 */
function ColorVariationItem({
  color,
  label,
  onClick,
  isSelected
}: {
  color: string;
  label: string;
  onClick: () => void;
  isSelected: boolean;
}) {
  const textColor = getOptimalTextColor(color);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`
              relative rounded-md border-2 transition-all
              ${isSelected ? 'border-primary scale-105' : 'border-gray-200 hover:border-gray-300'}
            `}
            style={{
              backgroundColor: color,
              width: '40px',
              height: '40px'
            }}
          >
            {isSelected && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ color: textColor }}
              >
                <Check size={16} />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}: {color}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Composant pour afficher les informations de contraste
 */
function ContrastInfo({
  backgroundColor,
  textColor,
  label
}: {
  backgroundColor: string;
  textColor: string;
  label: string;
}) {
  const contrast = checkWCAGContrast(backgroundColor, textColor);

  return (
    <div className="flex items-center justify-between p-2 rounded border">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <Badge variant={contrast.passes ? 'default' : 'outline'}>
          {contrast.ratio.toFixed(2)}:1
        </Badge>
        <Badge variant={contrast.passes ? 'default' : 'outline'}>
          {contrast.passes ? '✓ WCAG AA' : '✗ WCAG AA'}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Sélecteur de couleur complet avec fonctionnalités avancées
 */
export function ColorSelector({
  value,
  onChange,
  label,
  description,
  presets = [],
  allowAlpha = false,
  showVariations = true,
  showContrast = true,
  size = 'md',
  className = ''
}: ColorSelectorProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Normaliser la valeur initiale
  const normalizedValue = useMemo(() => normalizeHexColor(value), [value]);

  // Générer les variations de couleur
  const variations = useMemo(() => generateColorVariations(normalizedValue), [normalizedValue]);

  // Obtenir les informations de couleur
  const colorInfo = useMemo(() => getColorInfo(normalizedValue), [normalizedValue]);

  // Présets de couleurs
  const colorPresets = useMemo(() => {
    if (presets.length > 0) {
      return presets;
    }
    return listColorPresets().map(preset => preset.primary);
  }, [presets]);

  // Valider et appliquer la couleur
  const handleColorChange = useCallback((newColor: string) => {
    const normalized = normalizeHexColor(newColor);
    if (isValidHexColor(normalized)) {
      setIsValid(true);
      setInputValue(normalized);
      onChange(normalized);
    } else {
      setIsValid(false);
    }
  }, [onChange]);

  // Appliquer la couleur depuis l'input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (isValidHexColor(newValue)) {
      setIsValid(true);
      onChange(normalizeHexColor(newValue));
    } else {
      setIsValid(false);
    }
  }, [onChange]);

  // Utiliser le color picker natif
  const handleNativePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = normalizedValue;

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleColorChange(target.value);
    };

    input.click();
  }, [normalizedValue, handleColorChange]);

  // Copier la couleur dans le presse-papiers
  const handleCopyColor = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(normalizedValue);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  }, [normalizedValue]);

  // Générer une couleur aléatoire
  const handleRandomColor = useCallback(() => {
    const randomColor = generateRandomColor();
    handleColorChange(randomColor);
  }, [handleColorChange]);

  // Réinitialiser à la couleur par défaut
  const handleResetColor = useCallback(() => {
    handleColorChange('#3b82f6');
  }, [handleColorChange]);

  // Ajuster la saturation
  const handleAdjustSaturation = useCallback((percent: number) => {
    const adjusted = adjustSaturation(normalizedValue, percent);
    handleColorChange(adjusted);
  }, [normalizedValue, handleColorChange]);

  // Ajuster la teinte
  const handleAdjustHue = useCallback((degrees: number) => {
    const adjusted = adjustHue(normalizedValue, degrees);
    handleColorChange(adjusted);
  }, [normalizedValue, handleColorChange]);

  // Classes de taille
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label et description */}
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </Label>
      )}

      {/* Sélecteur principal */}
      <div className="flex items-center gap-3">
        {/* Aperçu de la couleur */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNativePicker}
            className={`
              relative rounded-md border-2 cursor-pointer
              transition-all hover:scale-105
              ${sizeClasses[size]}
            `}
            style={{ backgroundColor: normalizedValue }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Droplet size={16} className="text-white drop-shadow-md" />
            </div>
          </button>

          {/* Actions rapides */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyColor}
                  >
                    <Copy size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copier la couleur</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleRandomColor}
                  >
                    <Shuffle size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Couleur aléatoire</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleResetColor}
                  >
                    <RotateCcw size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Réinitialiser</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Input hexadécimal */}
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="#000000"
            className={`font-mono ${!isValid ? 'border-red-500' : ''}`}
          />
          {!isValid && (
            <p className="text-xs text-red-500 mt-1">
              Couleur hexadécimale invalide
            </p>
          )}
        </div>

        {/* Options avancées */}
        <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Palette size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Éditeur de couleur avancé</DialogTitle>
              <DialogDescription>
                Personnalisez votre couleur avec des outils avancés
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="variations" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="variations">Variations</TabsTrigger>
                <TabsTrigger value="presets">Présets</TabsTrigger>
                <TabsTrigger value="adjustments">Ajustements</TabsTrigger>
                <TabsTrigger value="contrast">Contraste</TabsTrigger>
              </TabsList>

              <TabsContent value="variations" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Variations de couleur</h4>
                  <div className="grid grid-cols-10 gap-2">
                    {Object.entries(variations).map(([key, color]) => (
                      <ColorVariationItem
                        key={key}
                        color={color}
                        label={key}
                        onClick={() => handleColorChange(color)}
                        isSelected={color === normalizedValue}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Informations de couleur</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 rounded border">
                      <span className="font-medium">HEX:</span> {colorInfo.hex}
                    </div>
                    <div className="p-2 rounded border">
                      <span className="font-medium">RGB:</span> {colorInfo.rgb.r}, {colorInfo.rgb.g}, {colorInfo.rgb.b}
                    </div>
                    <div className="p-2 rounded border">
                      <span className="font-medium">HSL:</span> {colorInfo.hsl.h}°, {colorInfo.hsl.s}%, {colorInfo.hsl.l}%
                    </div>
                    <div className="p-2 rounded border">
                      <span className="font-medium">Luminance:</span> {colorInfo.luminance.toFixed(3)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="presets" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Présets de couleurs</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {colorPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorChange(preset)}
                        className={`
                          relative rounded-md border-2 p-3 transition-all
                          ${preset === normalizedValue ? 'border-primary scale-105' : 'border-gray-200 hover:border-gray-300'}
                        `}
                        style={{ backgroundColor: preset }}
                      >
                        {preset === normalizedValue && (
                          <div className="absolute top-1 right-1">
                            <Check size={14} className="text-white drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Présets thématiques</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        onClick={() => handleColorChange(preset.primary)}
                        className={`
                          relative rounded-md border-2 p-3 text-left transition-all
                          ${preset.primary === normalizedValue ? 'border-primary scale-105' : 'border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-md"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div>
                            <div className="font-medium text-sm">{preset.name}</div>
                            <div className="text-xs text-muted-foreground">{preset.description}</div>
                          </div>
                        </div>
                        {preset.primary === normalizedValue && (
                          <Check size={14} className="absolute top-2 right-2 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="adjustments" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Ajustements rapides</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleAdjustSaturation(10)}
                      className="justify-start"
                    >
                      + Saturation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAdjustSaturation(-10)}
                      className="justify-start"
                    >
                      - Saturation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAdjustHue(15)}
                      className="justify-start"
                    >
                      + Teinte (15°)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAdjustHue(-15)}
                      className="justify-start"
                    >
                      - Teinte (15°)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleColorChange(lightenColor(normalizedValue, 10))}
                      className="justify-start"
                    >
                      + Luminosité
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleColorChange(darkenColor(normalizedValue, 10))}
                      className="justify-start"
                    >
                      - Luminosité
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Ces ajustements modifient la couleur actuelle de manière non-destructive.
                    Vous pouvez revenir à la couleur originale à tout moment.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="contrast" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Test de contraste WCAG</h4>
                  <div className="space-y-3">
                    <ContrastInfo
                      backgroundColor="#ffffff"
                      textColor={normalizedValue}
                      label="Texte sur fond blanc"
                    />
                    <ContrastInfo
                      backgroundColor="#000000"
                      textColor={normalizedValue}
                      label="Texte sur fond noir"
                    />
                    <ContrastInfo
                      backgroundColor={normalizedValue}
                      textColor="#ffffff"
                      label="Texte blanc sur fond coloré"
                    />
                    <ContrastInfo
                      backgroundColor={normalizedValue}
                      textColor="#000000"
                      label="Texte noir sur fond coloré"
                    />
                  </div>
                </div>

                <Alert>
                  <Contrast className="h-4 w-4" />
                  <AlertDescription>
                    Le ratio de contraste minimum pour le conformité WCAG AA est de 4.5:1 pour le texte normal
                    et 3:1 pour le texte large (18px ou plus).
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Variations rapides */}
      {showVariations && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Variations:</span>
          <div className="flex gap-1">
            {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((key) => (
              <button
                key={key}
                onClick={() => handleColorChange(variations[key as keyof typeof variations])}
                className="w-6 h-6 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                style={{ backgroundColor: variations[key as keyof typeof variations] }}
                title={`${key}: ${variations[key as keyof typeof variations]}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Présets rapides */}
      {colorPresets.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Présets:</span>
          <div className="flex gap-1">
            {colorPresets.slice(0, 8).map((preset, index) => (
              <button
                key={index}
                onClick={() => handleColorChange(preset)}
                className="w-6 h-6 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                style={{ backgroundColor: preset }}
                title={preset}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorSelector;
