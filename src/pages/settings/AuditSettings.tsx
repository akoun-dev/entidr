import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Shield, Clock, AlertTriangle, FileText, Search, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

type LogLevel = 'minimal' | 'normal' | 'verbose';

interface AuditLog {
  id: string;
  date: string;
  user: string;
  action: string;
  target: string;
  targetDescription?: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
}

interface AuditConfig {
  id?: string;
  retentionDays: number;
  logLevel: LogLevel;
  monitoredEvents: string[];
  alertEnabled: boolean;
  alertThreshold: number;
  alertEmails?: string[];
  logSensitiveDataAccess?: boolean;
  logDataChanges?: boolean;
  logAuthentication?: boolean;
  logPermissionChanges?: boolean;
  logAdminActions?: boolean;
}

const AuditSettings: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AuditConfig>({
    retentionDays: 90,
    logLevel: 'normal',
    monitoredEvents: ['login', 'data_change', 'permission_change'],
    alertEnabled: true,
    alertThreshold: 5
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Charger la configuration d'audit
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true);
      setError(null);

      try {
        const response = await api.get('/auditconfig');
        setConfig(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration d\'audit:', err);
        setError('Impossible de charger la configuration d\'audit. Veuillez réessayer plus tard.');
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  // Charger les journaux d'audit
  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      setError(null);

      try {
        const response = await api.get('/auditlogs');
        setLogs(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des journaux d\'audit:', err);
        setError('Impossible de charger les journaux d\'audit. Veuillez réessayer plus tard.');
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLogs();
  }, []);

  // Sauvegarder la configuration d'audit
  const saveConfig = async () => {
    setSaving(true);

    try {
      const response = await api.put('/auditconfig', config);
      setConfig(response.data);

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration d'audit a été mise à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la configuration d\'audit:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration d'audit.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLogLevelChange = (value: LogLevel) => {
    setConfig({...config, logLevel: value});
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Traçabilité</h1>
          <p className="text-muted-foreground mt-1">Configuration du suivi des activités et de la conformité</p>
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
        {/* Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configuration d'audit</CardTitle>
              <CardDescription>Paramètres généraux du système d'audit</CardDescription>
            </div>
            <Button
              onClick={saveConfig}
              disabled={saving || loadingConfig}
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
            {loadingConfig ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement de la configuration...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retention-days">Durée de conservation (jours)</Label>
                    <Input
                      id="retention-days"
                      type="number"
                      value={config.retentionDays}
                      onChange={(e) => setConfig({...config, retentionDays: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="log-level">Niveau de journalisation</Label>
                    <Select
                      value={config.logLevel}
                      onValueChange={handleLogLevelChange}
                    >
                      <SelectTrigger id="log-level">
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="verbose">Verbose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-authentication"
                      checked={config.logAuthentication !== undefined ? config.logAuthentication : true}
                      onCheckedChange={(checked) => setConfig({...config, logAuthentication: checked})}
                    />
                    <Label htmlFor="log-authentication">Journaliser les connexions et déconnexions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-data-changes"
                      checked={config.logDataChanges !== undefined ? config.logDataChanges : true}
                      onCheckedChange={(checked) => setConfig({...config, logDataChanges: checked})}
                    />
                    <Label htmlFor="log-data-changes">Journaliser les modifications de données</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-permission-changes"
                      checked={config.logPermissionChanges !== undefined ? config.logPermissionChanges : true}
                      onCheckedChange={(checked) => setConfig({...config, logPermissionChanges: checked})}
                    />
                    <Label htmlFor="log-permission-changes">Journaliser les modifications de permissions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-sensitive-data-access"
                      checked={config.logSensitiveDataAccess !== undefined ? config.logSensitiveDataAccess : true}
                      onCheckedChange={(checked) => setConfig({...config, logSensitiveDataAccess: checked})}
                    />
                    <Label htmlFor="log-sensitive-data-access">Journaliser les accès aux données sensibles</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="log-admin-actions"
                      checked={config.logAdminActions !== undefined ? config.logAdminActions : true}
                      onCheckedChange={(checked) => setConfig({...config, logAdminActions: checked})}
                    />
                    <Label htmlFor="log-admin-actions">Journaliser les actions administratives</Label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alert-enabled"
                      checked={config.alertEnabled}
                      onCheckedChange={(checked) => setConfig({...config, alertEnabled: checked})}
                    />
                    <Label htmlFor="alert-enabled">Activer les alertes de sécurité</Label>
                  </div>

                  {config.alertEnabled && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="alert-threshold">Seuil d'alerte (événements par heure)</Label>
                        <Input
                          id="alert-threshold"
                          type="number"
                          value={config.alertThreshold}
                          onChange={(e) => setConfig({...config, alertThreshold: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="alert-emails">Emails de notification (séparés par des virgules)</Label>
                        <Input
                          id="alert-emails"
                          type="text"
                          value={config.alertEmails ? (Array.isArray(config.alertEmails) ? config.alertEmails.join(', ') : config.alertEmails) : ''}
                          onChange={(e) => setConfig({...config, alertEmails: e.target.value.split(',').map(email => email.trim())})}
                          placeholder="admin@example.com, security@example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Journaux d'audit */}
        <Card>
          <CardHeader>
            <CardTitle>Journaux d'audit</CardTitle>
            <CardDescription>Historique des activités surveillées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les journaux..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loadingLogs ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement des journaux d'audit...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">Aucun journal d'audit disponible</div>
                <div className="text-sm">Les activités seront enregistrées ici lorsqu'elles se produiront</div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Cible</TableHead>
                      <TableHead>Détails</TableHead>
                      <TableHead>Sévérité</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.date)}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.target}</TableCell>
                        <TableCell className="max-w-xs truncate" title={log.details}>
                          {log.details}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.severity === 'high' ? 'destructive' : log.severity === 'medium' ? 'default' : 'secondary'}
                          >
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.status === 'success' ? 'outline' : 'destructive'}
                          >
                            {log.status === 'success' ? 'Succès' : 'Échec'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditSettings;