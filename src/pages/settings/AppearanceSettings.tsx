import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Palette, Moon, Sun, Eye, TextCursor, LayoutDashboard, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../components/providers/theme-provider';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface ThemeConfig {
  id?: string;
  mode: string;
  primaryColor: string;
  secondaryColor?: string;
  density: string;
  fontSize: string;
  highContrast: boolean;
  reducedMotion: boolean;
  dashboardLayout: string;
  customCSS?: string;
  advancedSettings?: any;
}

const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [config, setConfig] = useState<ThemeConfig>({
    mode: 'light',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    density: 'normal',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    dashboardLayout: 'default'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger la configuration du thème
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/themeconfig');

        // Mettre à jour la configuration avec le thème actuel
        setConfig({
          ...response.data,
          mode: theme // Utiliser le thème actuel du système
        });
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration du thème:', err);
        setError('Impossible de charger la configuration du thème. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [theme]);

  // Sauvegarder la configuration
  const saveConfig = async () => {
    setSaving(true);

    try {
      // Synchroniser le mode avec le thème global
      const updatedConfig = {
        ...config,
        mode: theme
      };

      const response = await api.put('/themeconfig', updatedConfig);
      setConfig(response.data);

      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres d'apparence ont été mis à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la configuration du thème:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres d'apparence.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const colorOptions = [
    { value: '#3b82f6', name: 'Bleu' },
    { value: '#ef4444', name: 'Rouge' },
    { value: '#10b981', name: 'Vert' },
    { value: '#f59e0b', name: 'Jaune' },
    { value: '#8b5cf6', name: 'Violet' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apparence</h1>
          <p className="text-muted-foreground mt-1">Personnalisation de l'interface utilisateur</p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Thème */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Thème</CardTitle>
              <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
            </div>
            <Button
              onClick={saveConfig}
              disabled={saving || loading}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement de la configuration...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <Label>Mode {theme === 'dark' ? 'Sombre' : 'Clair'}</Label>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? 'dark' : 'light');
                    }}
                  />
                </div>

                <div>
                  <Label>Couleur principale</Label>
                  <div className="flex gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        className={`h-8 w-8 rounded-full ${config.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setConfig({...config, primaryColor: color.value})}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Accessibilité */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibilité</CardTitle>
            <CardDescription>Paramètres pour améliorer la lisibilité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement de la configuration...</span>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="density">Densité d'affichage</Label>
                  <Select
                    value={config.density}
                    onValueChange={(value) => setConfig({...config, density: value})}
                  >
                    <SelectTrigger id="density" className="mt-2">
                      <SelectValue placeholder="Sélectionnez une densité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="comfortable">Confortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-size">Taille de police</Label>
                  <Select
                    value={config.fontSize}
                    onValueChange={(value) => setConfig({...config, fontSize: value})}
                  >
                    <SelectTrigger id="font-size" className="mt-2">
                      <SelectValue placeholder="Sélectionnez une taille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petite</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="high-contrast"
                      checked={config.highContrast}
                      onCheckedChange={(checked) => setConfig({...config, highContrast: checked})}
                    />
                    <Label htmlFor="high-contrast">Mode contraste élevé</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reduced-motion"
                      checked={config.reducedMotion}
                      onCheckedChange={(checked) => setConfig({...config, reducedMotion: checked})}
                    />
                    <Label htmlFor="reduced-motion">Réduire les animations</Label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tableau de bord */}
        <Card>
          <CardHeader>
            <CardTitle>Tableau de bord</CardTitle>
            <CardDescription>Personnalisation du tableau de bord par défaut</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement de la configuration...</span>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="layout">Disposition</Label>
                  <Select
                    value={config.dashboardLayout}
                    onValueChange={(value) => setConfig({...config, dashboardLayout: value})}
                  >
                    <SelectTrigger id="layout" className="mt-2">
                      <SelectValue placeholder="Sélectionnez une disposition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Par défaut</SelectItem>
                      <SelectItem value="minimal">Minimaliste</SelectItem>
                      <SelectItem value="detailed">Détaillé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={saveConfig}
                    disabled={saving}
                    className="bg-ivory-orange hover:bg-ivory-orange/90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      "Enregistrer les préférences"
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppearanceSettings;