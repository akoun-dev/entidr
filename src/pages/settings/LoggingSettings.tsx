import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { FileText, Filter, HardDrive, Clock, Loader2, AlertCircle, FolderOpen, FileType, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface LoggingSetting {
  id: string;
  key: string;
  value: any;
  description: string;
  valueType: 'string' | 'boolean' | 'number' | 'json';
  category: string;
}

const LoggingSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logSettings, setLogSettings] = useState<LoggingSetting[]>([]);

  // État pour les valeurs des paramètres
  const [logConfig, setLogConfig] = useState({
    level: 'info',
    retentionDays: 30,
    maxSize: 100,
    compress: true,
    consoleOutput: false,
    logDirectory: './logs',
    filePattern: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: 14
  });

  // Charger les paramètres de journalisation depuis l'API
  useEffect(() => {
    const fetchLogSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/loggingsettings');
        setLogSettings(response.data);

        // Mettre à jour l'état avec les valeurs de l'API
        const configFromApi: Record<string, any> = {};
        response.data.forEach((setting: LoggingSetting) => {
          configFromApi[setting.key] = setting.value;
        });

        setLogConfig(prev => ({
          ...prev,
          ...configFromApi
        }));
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres de journalisation:', err);
        setError('Impossible de charger les paramètres de journalisation. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogSettings();
  }, []);

  // Gérer les changements de valeurs pour les inputs numériques
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLogConfig(prev => ({
      ...prev,
      [name]: name === 'retentionDays' || name === 'maxSize' || name === 'maxFiles' ? Number(value) : value
    }));
  };

  // Gérer les changements de valeurs pour les selects
  const handleSelectChange = (name: string, value: string) => {
    setLogConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer les changements de valeurs pour les switches (booléens)
  const handleToggle = (name: string) => {
    setLogConfig(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof logConfig]
    }));
  };

  // Sauvegarder les paramètres de journalisation
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Préparer les données à envoyer
      const settingsToUpdate = Object.entries(logConfig).map(([key, value]) => ({
        key,
        value
      }));

      // Envoyer les données à l'API
      await api.put('/loggingsettings/batch', { settings: settingsToUpdate });

      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres de journalisation ont été mis à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des paramètres de journalisation:', err);
      setError('Impossible de sauvegarder les paramètres. Veuillez réessayer plus tard.');

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des paramètres.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journalisation</h1>
          <p className="text-muted-foreground mt-1">Configurez les paramètres de journalisation de l'application</p>
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

      {/* Carte principale */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration des logs</CardTitle>
          <CardDescription>Personnalisez le comportement de la journalisation</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des paramètres de journalisation...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {/* Section Niveau de log */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-4">Paramètres généraux</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="level" className="text-right">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Niveau de log
                        </div>
                      </Label>
                      <Select
                        value={logConfig.level}
                        onValueChange={(value) => handleSelectChange('level', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionnez un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="warn">Warn</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="debug">Debug</SelectItem>
                          <SelectItem value="trace">Trace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="consoleOutput">Sortie console</Label>
                        <p className="text-xs text-muted-foreground">
                          Afficher les logs dans la console en plus des fichiers
                        </p>
                      </div>
                      <Switch
                        id="consoleOutput"
                        checked={logConfig.consoleOutput}
                        onCheckedChange={() => handleToggle('consoleOutput')}
                      />
                    </div>
                  </div>
                </div>

                {/* Section Fichiers */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-4">Fichiers de log</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="logDirectory" className="text-right">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          Répertoire
                        </div>
                      </Label>
                      <Input
                        id="logDirectory"
                        name="logDirectory"
                        value={logConfig.logDirectory}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="filePattern" className="text-right">
                        <div className="flex items-center gap-2">
                          <FileType className="h-4 w-4" />
                          Format de fichier
                        </div>
                      </Label>
                      <Input
                        id="filePattern"
                        name="filePattern"
                        value={logConfig.filePattern}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="datePattern" className="text-right">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Format de date
                        </div>
                      </Label>
                      <Input
                        id="datePattern"
                        name="datePattern"
                        value={logConfig.datePattern}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Rétention */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Rétention et taille</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="retentionDays" className="text-right">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Rétention (jours)
                        </div>
                      </Label>
                      <Input
                        id="retentionDays"
                        name="retentionDays"
                        type="number"
                        min="1"
                        max="365"
                        value={logConfig.retentionDays}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maxSize" className="text-right">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          Taille max (MB)
                        </div>
                      </Label>
                      <Input
                        id="maxSize"
                        name="maxSize"
                        type="number"
                        min="10"
                        max="1000"
                        value={logConfig.maxSize}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maxFiles" className="text-right">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Nombre max de fichiers
                        </div>
                      </Label>
                      <Input
                        id="maxFiles"
                        name="maxFiles"
                        type="number"
                        min="1"
                        max="100"
                        value={logConfig.maxFiles}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="compress">Compression des logs</Label>
                        <p className="text-xs text-muted-foreground">
                          Compresser les fichiers de log archivés
                        </p>
                      </div>
                      <Switch
                        id="compress"
                        checked={logConfig.compress}
                        onCheckedChange={() => handleToggle('compress')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  className="bg-ivory-orange hover:bg-ivory-orange/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoggingSettings;
