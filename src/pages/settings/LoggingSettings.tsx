import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { loggingService } from '@/services/loggingService';
import type { LoggingConfig } from '@/types/logging';

export const LoggingSettings = () => {
  const [config, setConfig] = useState<LoggingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const config = await loggingService.getConfig();
      setConfig(config);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger la configuration', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updatedConfig = await loggingService.updateConfig(config);
      setConfig(updatedConfig);
      toast({ title: 'Succès', description: 'Configuration sauvegardée' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration des logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Niveau de log</Label>
            <Select
              value={config.level}
              onValueChange={(value) => setConfig({...config, level: value as LoggingConfig['level']})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rétention (jours)</Label>
            <Input
              type="number"
              value={config.retentionDays}
              onChange={(e) => setConfig({...config, retentionDays: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="console-output"
            checked={config.consoleOutput}
            onCheckedChange={(checked) => setConfig({...config, consoleOutput: checked})}
          />
          <Label htmlFor="console-output">Sortie console</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="file-output"
            checked={config.fileOutput}
            onCheckedChange={(checked) => setConfig({...config, fileOutput: checked})}
          />
          <Label htmlFor="file-output">Sortie fichier</Label>
        </div>

        {config.fileOutput && (
          <div className="space-y-2">
            <Label>Chemin du fichier</Label>
            <Input
              value={config.filePath || ''}
              onChange={(e) => setConfig({...config, filePath: e.target.value})}
            />
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </CardContent>
    </Card>
  );
};
