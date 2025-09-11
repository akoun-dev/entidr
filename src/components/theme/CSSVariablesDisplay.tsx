import React, { useState, useCallback, useMemo } from 'react';
import {
  Copy,
  Download,
  Eye,
  Code,
  Palette,
  Check,
  RefreshCw,
  FileText,
  Braces
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import type { ThemeConfig } from './types';
import {
  generateCSSVariables,
  getCSSVariableValue,
  type CSSVariablesOptions
} from './cssVariablesGenerator';

/**
 * Interface pour les props du CSSVariablesDisplay
 */
export interface CSSVariablesDisplayProps {
  // Configuration du thème
  config: ThemeConfig;

  // Options de génération
  options?: CSSVariablesOptions;

  // Classes CSS
  className?: string;

  // Callback de changement d'options
  onOptionsChange?: (options: CSSVariablesOptions) => void;
}

/**
 * Composant pour afficher une variable CSS avec sa valeur
 */
function VariableItem({
  name,
  value,
  onCopy,
  showPreview = true
}: {
  name: string;
  value: string;
  onCopy: (name: string, value: string) => void;
  showPreview?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy(name, value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [name, value, onCopy]);

  const isColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ||
                /^rgb(a)?\(/.test(value) ||
                /^hsl(a)?\(/.test(value);

  return (
    <div className="flex items-center justify-between p-3 rounded border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Aperçu de la couleur si applicable */}
        {showPreview && isColor && (
          <div
            className="w-6 h-6 rounded border border-gray-200 flex-shrink-0"
            style={{ backgroundColor: value }}
          />
        )}

        {/* Nom et valeur de la variable */}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm font-medium text-primary truncate">
            {name}
          </div>
          <div className="font-mono text-xs text-muted-foreground truncate">
            {value}
          </div>
        </div>
      </div>

      {/* Bouton de copie */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copier la variable</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

/**
 * Composant pour afficher les variables CSS générées
 */
export function CSSVariablesDisplay({
  config,
  options = {},
  className = '',
  onOptionsChange
}: CSSVariablesDisplayProps) {
  const [activeTab, setActiveTab] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [localOptions, setLocalOptions] = useState<CSSVariablesOptions>(options);

  // Générer les variables CSS
  const cssVariables = useMemo(() => {
    return generateCSSVariables(config, localOptions);
  }, [config, localOptions]);

  // Filtrer les variables selon le terme de recherche
  const filteredVariables = useMemo(() => {
    const variables = activeTab === 'light'
      ? (typeof cssVariables.light === 'string' ? {} : cssVariables.light)
      : (typeof cssVariables.dark === 'string' ? {} : cssVariables.dark);

    if (!searchTerm) {
      return Object.entries(variables);
    }

    return Object.entries(variables).filter(([name, value]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cssVariables, activeTab, searchTerm]);

  // Copier une variable dans le presse-papiers
  const handleCopyVariable = useCallback(async (name: string, value: string) => {
    try {
      await navigator.clipboard.writeText(`${name}: ${value};`);
    } catch (err) {
      console.error('Failed to copy variable:', err);
    }
  }, []);

  // Copier toutes les variables
  const handleCopyAll = useCallback(async () => {
    try {
      const variables = activeTab === 'light' ? cssVariables.light : cssVariables.dark;
      const content = typeof variables === 'string' ? variables :
        Object.entries(variables)
          .map(([name, value]) => `  ${name}: ${value};`)
          .join('\n');

      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy all variables:', err);
    }
  }, [cssVariables, activeTab]);

  // Télécharger les variables
  const handleDownload = useCallback(() => {
    const variables = activeTab === 'light' ? cssVariables.light : cssVariables.dark;
    const content = typeof variables === 'string' ? variables :
      Object.entries(variables)
        .map(([name, value]) => `  ${name}: ${value};`)
        .join('\n');

    const cssContent = activeTab === 'light'
      ? `:root {\n${content}\n}`
      : `[data-theme="dark"] {\n${content}\n}`;

    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `css-variables-${activeTab}-${Date.now()}.css`;
    link.click();
    URL.revokeObjectURL(url);
  }, [cssVariables, activeTab]);

  // Mettre à jour les options
  const updateOptions = useCallback((newOptions: Partial<CSSVariablesOptions>) => {
    const updated = { ...localOptions, ...newOptions };
    setLocalOptions(updated);
    onOptionsChange?.(updated);
  }, [localOptions, onOptionsChange]);

  // Obtenir la valeur actuelle d'une variable depuis le DOM
  const getLiveValue = useCallback((variableName: string) => {
    return getCSSVariableValue(variableName);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code size={20} />
            Variables CSS
          </h2>
          <p className="text-muted-foreground">
            Variables CSS générées à partir de la configuration du thème
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredVariables.length} variables
          </Badge>

          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            <Copy size={16} className="mr-2" />
            Copier tout
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download size={16} className="mr-2" />
            Télécharger
          </Button>

          <Dialog open={showOptions} onOpenChange={setShowOptions}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Braces size={16} className="mr-2" />
                Options
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Options de génération</DialogTitle>
                <DialogDescription>
                  Personnalisez la génération des variables CSS
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prefix">Préfixe</Label>
                  <Input
                    id="prefix"
                    value={localOptions.prefix || ''}
                    onChange={(e) => updateOptions({ prefix: e.target.value })}
                    placeholder="--color"
                  />
                </div>

                <div>
                  <Label htmlFor="separator">Séparateur</Label>
                  <Input
                    id="separator"
                    value={localOptions.separator || ''}
                    onChange={(e) => updateOptions({ separator: e.target.value })}
                    placeholder="-"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeVariations"
                    checked={localOptions.includeVariations ?? true}
                    onChange={(e) => updateOptions({ includeVariations: e.target.checked })}
                  />
                  <Label htmlFor="includeVariations">Inclure les variations</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeThemeVariables"
                    checked={localOptions.includeThemeVariables ?? true}
                    onChange={(e) => updateOptions({ includeThemeVariables: e.target.checked })}
                  />
                  <Label htmlFor="includeThemeVariables">Inclure les variables de thème</Label>
                </div>

                <div>
                  <Label htmlFor="format">Format de sortie</Label>
                  <select
                    id="format"
                    value={localOptions.format || 'css'}
                    onChange={(e) => updateOptions({ format: e.target.value as 'css' | 'json' | 'object' })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="css">CSS</option>
                    <option value="json">JSON</option>
                    <option value="object">Object</option>
                  </select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher des variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-mono"
          />
        </div>
        <Badge variant="outline">
          {filteredVariables.length} / {Object.keys(typeof cssVariables.light === 'string' ? {} : cssVariables.light).length}
        </Badge>
      </div>

      {/* Onglets pour les thèmes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="light" className="flex items-center gap-2">
            <Palette size={16} />
            Thème Clair
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex items-center gap-2">
            <Palette size={16} />
            Thème Sombre
          </TabsTrigger>
          <TabsTrigger value="combined">CSS Combiné</TabsTrigger>
          <TabsTrigger value="live">Valeurs Live</TabsTrigger>
        </TabsList>

        {/* Variables du thème light */}
        <TabsContent value="light" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variables du thème clair</CardTitle>
              <CardDescription>
                Variables CSS générées pour le thème clair
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredVariables.map(([name, value]) => (
                  <VariableItem
                    key={name}
                    name={name}
                    value={value}
                    onCopy={handleCopyVariable}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variables du thème dark */}
        <TabsContent value="dark" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variables du thème sombre</CardTitle>
              <CardDescription>
                Variables CSS générées pour le thème sombre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredVariables.map(([name, value]) => (
                  <VariableItem
                    key={name}
                    name={name}
                    value={value}
                    onCopy={handleCopyVariable}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSS combiné */}
        <TabsContent value="combined" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSS combiné</CardTitle>
              <CardDescription>
                Code CSS complet avec les deux thèmes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={cssVariables.combined}
                readOnly
                className="font-mono text-sm min-h-96"
                spellCheck={false}
              />
              <div className="flex justify-end mt-4">
                <Button onClick={() => navigator.clipboard.writeText(cssVariables.combined)}>
                  <Copy size={16} className="mr-2" />
                  Copier le CSS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Valeurs live */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valeurs live depuis le DOM</CardTitle>
              <CardDescription>
                Valeurs actuelles des variables CSS dans le DOM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredVariables.map(([name, value]) => {
                  const liveValue = getLiveValue(name);
                  return (
                    <div key={name} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm font-medium text-primary truncate">
                            {name}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground truncate">
                            Généré: {value}
                          </div>
                          <div className="font-mono text-xs text-green-600 truncate">
                            Live: {liveValue || 'Non défini'}
                          </div>
                        </div>
                      </div>
                      <Badge variant={liveValue === value ? 'default' : 'outline'}>
                        {liveValue === value ? 'Sync' : 'Diff'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informations supplémentaires */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Ces variables CSS sont automatiquement générées à partir de votre configuration de thème.
          Vous pouvez les utiliser dans votre CSS en utilisant la fonction var() :
          <code className="mx-1 px-1 py-0.5 bg-muted rounded text-sm">
            color: var(--color-primary);
          </code>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default CSSVariablesDisplay;
