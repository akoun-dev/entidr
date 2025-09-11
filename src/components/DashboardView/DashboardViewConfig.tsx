import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Palette,
  Layout,
  Settings,
  Save,
  RotateCcw,
  Eye,
  Download,
  Upload,
} from 'lucide-react';

import type { DashboardConfig, DashboardWidget } from './DashboardView';

interface DashboardViewConfigProps {
  config: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
  onClose: () => void;
}

const DEFAULT_THEMES = {
  light: {
    background: '#f8fafc',
    widgetBackground: '#ffffff',
    textColor: '#1e293b',
    borderColor: '#e2e8f0',
  },
  dark: {
    background: '#0f172a',
    widgetBackground: '#1e293b',
    textColor: '#f1f5f9',
    borderColor: '#334155',
  },
  blue: {
    background: '#eff6ff',
    widgetBackground: '#dbeafe',
    textColor: '#1e3a8a',
    borderColor: '#93c5fd',
  },
  green: {
    background: '#f0fdf4',
    widgetBackground: '#dcfce7',
    textColor: '#14532d',
    borderColor: '#86efac',
  },
};

export const DashboardViewConfig: React.FC<DashboardViewConfigProps> = ({
  config,
  onConfigChange,
  onClose,
}) => {
  const [localConfig, setLocalConfig] = useState<DashboardConfig>(config);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleConfigUpdate = useCallback((updates: Partial<DashboardConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    setHasUnsavedChanges(true);
  }, [localConfig]);

  const handleThemeChange = useCallback((themeName: string) => {
    const theme = DEFAULT_THEMES[themeName as keyof typeof DEFAULT_THEMES];
    if (theme) {
      handleConfigUpdate({ theme });
    }
  }, [handleConfigUpdate]);

  const handleCustomThemeChange = useCallback((key: keyof DashboardConfig['theme'], value: string) => {
    handleConfigUpdate({
      theme: {
        ...localConfig.theme,
        [key]: value,
      },
    });
  }, [localConfig.theme, handleConfigUpdate]);

  const handleSave = useCallback(() => {
    onConfigChange(localConfig);
    setHasUnsavedChanges(false);
  }, [localConfig, onConfigChange]);

  const handleReset = useCallback(() => {
    setLocalConfig(config);
    setHasUnsavedChanges(false);
  }, [config]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(localConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [localConfig]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setLocalConfig(importedConfig);
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Configuration du tableau de bord</h2>
            <p className="text-sm text-muted-foreground">
              Personnalisez l'apparence et le comportement de votre tableau de bord
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary">Modifications non sauvegardées</Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <div className="relative">
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="import-config" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </label>
              </Button>
              <input
                id="import-config"
                type="file"
                accept=".json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImport}
              />
            </div>
            <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4 mr-2" />
                Général
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout className="h-4 w-4 mr-2" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="theme">
                <Palette className="h-4 w-4 mr-2" />
                Thème
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>
                    Configurez le titre et la description de votre tableau de bord
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dashboard-title">Titre</Label>
                    <Input
                      id="dashboard-title"
                      value={localConfig.title}
                      onChange={(e) => handleConfigUpdate({ title: e.target.value })}
                      placeholder="Titre du tableau de bord"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dashboard-description">Description</Label>
                    <Textarea
                      id="dashboard-description"
                      value={localConfig.description || ''}
                      onChange={(e) => handleConfigUpdate({ description: e.target.value })}
                      placeholder="Description du tableau de bord (optionnel)"
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                  <CardDescription>
                    Informations sur votre tableau de bord
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Nombre de widgets</Label>
                      <div className="text-2xl font-bold">{localConfig.widgets.length}</div>
                    </div>
                    <div>
                      <Label>Type de layout</Label>
                      <div className="text-2xl font-bold capitalize">{localConfig.layout}</div>
                    </div>
                    <div>
                      <Label>Dernière modification</Label>
                      <div className="text-sm text-muted-foreground">Maintenant</div>
                    </div>
                    <div>
                      <Label>Mode</Label>
                      <div className="text-sm text-muted-foreground">Configuration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Type de layout</CardTitle>
                  <CardDescription>
                    Choisissez comment les widgets sont organisés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mode d'organisation</Label>
                    <Select
                      value={localConfig.layout}
                      onValueChange={(value: 'grid' | 'free') => handleConfigUpdate({ layout: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">
                          <div className="flex items-center gap-2">
                            <Layout className="h-4 w-4" />
                            Grille (aligné)
                          </div>
                        </SelectItem>
                        <SelectItem value="free">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Libre (position absolue)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Aperçu du layout</h4>
                    <div className="text-sm text-muted-foreground">
                      {localConfig.layout === 'grid' ? (
                        <p>Les widgets sont alignés sur une grille de 12 colonnes. Ils s'adaptent automatiquement à la taille de l'écran.</p>
                      ) : (
                        <p>Les widgets peuvent être positionnés librement n'importe où sur le tableau de bord avec un positionnement absolu.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thème prédéfini</CardTitle>
                  <CardDescription>
                    Choisissez un thème prédéfini ou personnalisez les couleurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(DEFAULT_THEMES).map(([name, theme]) => (
                      <div
                        key={name}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary ${
                          JSON.stringify(localConfig.theme) === JSON.stringify(theme)
                            ? 'border-primary bg-primary/5'
                            : ''
                        }`}
                        onClick={() => handleThemeChange(name)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: theme.background }}
                          />
                          <div className="font-medium capitalize">{name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Arrière-plan</div>
                          <div className="font-mono">{theme.background}</div>
                          <div>Widget</div>
                          <div className="font-mono">{theme.widgetBackground}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personnalisation avancée</CardTitle>
                  <CardDescription>
                    Ajustez les couleurs individuellement pour un thème personnalisé
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bg-color">Arrière-plan</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bg-color"
                          value={localConfig.theme.background || ''}
                          onChange={(e) => handleCustomThemeChange('background', e.target.value)}
                          placeholder="#ffffff"
                        />
                        <input
                          type="color"
                          value={localConfig.theme.background || '#ffffff'}
                          onChange={(e) => handleCustomThemeChange('background', e.target.value)}
                          className="w-10 h-10 p-1 border rounded"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="widget-bg-color">Arrière-plan des widgets</Label>
                      <div className="flex gap-2">
                        <Input
                          id="widget-bg-color"
                          value={localConfig.theme.widgetBackground || ''}
                          onChange={(e) => handleCustomThemeChange('widgetBackground', e.target.value)}
                          placeholder="#ffffff"
                        />
                        <input
                          type="color"
                          value={localConfig.theme.widgetBackground || '#ffffff'}
                          onChange={(e) => handleCustomThemeChange('widgetBackground', e.target.value)}
                          className="w-10 h-10 p-1 border rounded"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="text-color">Texte</Label>
                      <div className="flex gap-2">
                        <Input
                          id="text-color"
                          value={localConfig.theme.textColor || ''}
                          onChange={(e) => handleCustomThemeChange('textColor', e.target.value)}
                          placeholder="#000000"
                        />
                        <input
                          type="color"
                          value={localConfig.theme.textColor || '#000000'}
                          onChange={(e) => handleCustomThemeChange('textColor', e.target.value)}
                          className="w-10 h-10 p-1 border rounded"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="border-color">Bordures</Label>
                      <div className="flex gap-2">
                        <Input
                          id="border-color"
                          value={localConfig.theme.borderColor || ''}
                          onChange={(e) => handleCustomThemeChange('borderColor', e.target.value)}
                          placeholder="#e2e8f0"
                        />
                        <input
                          type="color"
                          value={localConfig.theme.borderColor || '#e2e8f0'}
                          onChange={(e) => handleCustomThemeChange('borderColor', e.target.value)}
                          className="w-10 h-10 p-1 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DashboardViewConfig;
