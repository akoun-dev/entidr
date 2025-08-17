import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { auditService } from '@/services/auditService';
import type { AuditConfig } from '@/types/audit';

const AuditSettings: React.FC = () => {
  const [config, setConfig] = useState<AuditConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await auditService.getConfig();
        setConfig(data);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la configuration',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (field: keyof AuditConfig, value: any) => {
    setConfig(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const updatedConfig = await auditService.updateConfig(config);
      setConfig(updatedConfig);
      toast({
        title: 'Succès',
        description: 'Configuration sauvegardée',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de la sauvegarde',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration d'audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section Générale */}
          <div className="space-y-4">
            <h3 className="font-medium">Paramètres généraux</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jours de rétention</Label>
                <Input
                  type="number"
                  value={config.retentionDays}
                  onChange={(e) => handleChange('retentionDays', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Niveau de log</Label>
                <select
                  className="border rounded-md p-2 w-full"
                  value={config.logLevel}
                  onChange={(e) => handleChange('logLevel', e.target.value)}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section Alertes */}
          <div className="space-y-4">
            <h3 className="font-medium">Alertes</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="alert-enabled"
                checked={config.alertEnabled}
                onCheckedChange={(checked) => handleChange('alertEnabled', checked)}
              />
              <Label htmlFor="alert-enabled">Activer les alertes</Label>
            </div>
            {config.alertEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seuil d'alerte</Label>
                  <Input
                    type="number"
                    value={config.alertThreshold || ''}
                    onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emails pour alertes</Label>
                  <Textarea
                    value={config.alertEmails?.join(', ') || ''}
                    onChange={(e) => handleChange('alertEmails', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Événements */}
          <div className="space-y-4">
            <h3 className="font-medium">Événements à auditer</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="log-sensitive"
                  checked={config.logSensitiveDataAccess}
                  onCheckedChange={(checked) => handleChange('logSensitiveDataAccess', checked)}
                />
                <Label htmlFor="log-sensitive">Accès aux données sensibles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="log-changes"
                  checked={config.logDataChanges}
                  onCheckedChange={(checked) => handleChange('logDataChanges', checked)}
                />
                <Label htmlFor="log-changes">Modifications de données</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="log-auth"
                  checked={config.logAuthentication}
                  onCheckedChange={(checked) => handleChange('logAuthentication', checked)}
                />
                <Label htmlFor="log-auth">Authentifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="log-permissions"
                  checked={config.logPermissionChanges}
                  onCheckedChange={(checked) => handleChange('logPermissionChanges', checked)}
                />
                <Label htmlFor="log-permissions">Changements de permissions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="log-admin"
                  checked={config.logAdminActions}
                  onCheckedChange={(checked) => handleChange('logAdminActions', checked)}
                />
                <Label htmlFor="log-admin">Actions administrateur</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditSettings;
