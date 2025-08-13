import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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
import { Database, HardDrive, Cloud, Lock, Clock, Calendar, RefreshCw, Loader2, AlertCircle, Download, RotateCw, Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

interface BackupConfig {
  id?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupTime?: string;
  weeklyDay?: number;
  monthlyDay?: number;
  retention: number;
  storageType: 'local' | 'cloud' | 'both';
  localPath?: string;
  cloudConfig?: any;
  encryption: boolean;
  encryptionKey?: string;
  lastBackup?: string;
  nextBackup?: string;
  lastBackupStatus?: 'success' | 'failure' | 'in_progress';
  lastFailureDetails?: string;
  emailNotifications?: boolean;
  notificationEmails?: string[];
}

interface Backup {
  id: string;
  name: string;
  timestamp: string;
  type: 'auto' | 'manual';
  size: string;
  storageLocation: 'local' | 'cloud' | 'both';
  status: 'success' | 'failure' | 'in_progress';
  user: string;
  encrypted: boolean;
  expiresAt?: string;
  restored: boolean;
  restoredAt?: string;
}

const BackupSettings: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<BackupConfig>({
    frequency: 'daily',
    retention: 30,
    storageType: 'both',
    encryption: true
  });
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState<Backup | null>(null);
  const [showBackupsDialog, setShowBackupsDialog] = useState(false);

  // Charger la configuration de sauvegarde
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true);
      setError(null);

      try {
        const response = await api.get('/backupconfig');
        setConfig(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration de sauvegarde:', err);
        setError('Impossible de charger la configuration de sauvegarde. Veuillez réessayer plus tard.');
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  // Charger les sauvegardes
  useEffect(() => {
    const fetchBackups = async () => {
      setLoadingBackups(true);
      setError(null);

      try {
        const response = await api.get('/backups');
        setBackups(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des sauvegardes:', err);
        setError('Impossible de charger les sauvegardes. Veuillez réessayer plus tard.');
      } finally {
        setLoadingBackups(false);
      }
    };

    fetchBackups();
  }, []);

  // Sauvegarder la configuration
  const saveConfig = async () => {
    setSaving(true);

    try {
      const response = await api.put('/backupconfig', config);
      setConfig(response.data);

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration de sauvegarde a été mise à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la configuration de sauvegarde:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration de sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Créer une sauvegarde manuelle
  const createBackup = async () => {
    setCreating(true);

    try {
      const response = await api.post('/backups/create');
      setBackups([response.data, ...backups]);

      toast({
        title: "Sauvegarde créée",
        description: "La sauvegarde a été créée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la création de la sauvegarde:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Restaurer une sauvegarde
  const restoreBackup = async () => {
    if (!backupToRestore) return;

    setRestoring(backupToRestore.id);

    try {
      await api.post(`/backups/${backupToRestore.id}/restore`);

      // Mettre à jour l'état local
      setBackups(backups.map(backup =>
        backup.id === backupToRestore.id ? { ...backup, restored: true, restoredAt: new Date().toISOString() } : backup
      ));

      // Fermer la boîte de dialogue
      setShowRestoreDialog(false);
      setBackupToRestore(null);

      toast({
        title: "Sauvegarde restaurée",
        description: "La sauvegarde a été restaurée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la restauration de la sauvegarde:', err);
      toast({
        title: "Erreur",
        description: "Impossible de restaurer la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  // Ouvrir la boîte de dialogue de restauration
  const openRestoreDialog = (backup: Backup) => {
    setBackupToRestore(backup);
    setShowRestoreDialog(true);
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFrequencyChange = (value: 'daily' | 'weekly' | 'monthly') => {
    setConfig({...config, frequency: value});
  };

  const handleStorageChange = (value: 'local' | 'cloud' | 'both') => {
    setConfig({...config, storageType: value});
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sauvegarde & Restauration</h1>
          <p className="text-muted-foreground mt-1">Configuration des sauvegardes et restauration des données</p>
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
        {/* Configuration des sauvegardes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configuration des sauvegardes</CardTitle>
              <CardDescription>Planification et paramètres des sauvegardes automatiques</CardDescription>
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
                    <Label htmlFor="backup-frequency">Fréquence</Label>
                    <Select
                      value={config.frequency}
                      onValueChange={handleFrequencyChange}
                    >
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="Sélectionnez une fréquence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backup-time">Heure de sauvegarde</Label>
                    <Input
                      id="backup-time"
                      type="time"
                      value={config.backupTime || '02:00'}
                      onChange={(e) => setConfig({...config, backupTime: e.target.value})}
                    />
                  </div>
                </div>

                {config.frequency === 'weekly' && (
                  <div>
                    <Label htmlFor="weekly-day">Jour de la semaine</Label>
                    <Select
                      value={String(config.weeklyDay !== undefined ? config.weeklyDay : 0)}
                      onValueChange={(value) => setConfig({...config, weeklyDay: parseInt(value)})}
                    >
                      <SelectTrigger id="weekly-day">
                        <SelectValue placeholder="Sélectionnez un jour" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Dimanche</SelectItem>
                        <SelectItem value="1">Lundi</SelectItem>
                        <SelectItem value="2">Mardi</SelectItem>
                        <SelectItem value="3">Mercredi</SelectItem>
                        <SelectItem value="4">Jeudi</SelectItem>
                        <SelectItem value="5">Vendredi</SelectItem>
                        <SelectItem value="6">Samedi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {config.frequency === 'monthly' && (
                  <div>
                    <Label htmlFor="monthly-day">Jour du mois</Label>
                    <Input
                      id="monthly-day"
                      type="number"
                      min="1"
                      max="31"
                      value={config.monthlyDay !== undefined ? config.monthlyDay : 1}
                      onChange={(e) => setConfig({...config, monthlyDay: parseInt(e.target.value)})}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retention-days">Rétention (jours)</Label>
                    <Input
                      id="retention-days"
                      type="number"
                      value={config.retention}
                      onChange={(e) => setConfig({...config, retention: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storage-type">Type de stockage</Label>
                    <Select
                      value={config.storageType}
                      onValueChange={handleStorageChange}
                    >
                      <SelectTrigger id="storage-type">
                        <SelectValue placeholder="Sélectionnez un type de stockage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Local
                          </div>
                        </SelectItem>
                        <SelectItem value="cloud">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4" />
                            Cloud
                          </div>
                        </SelectItem>
                        <SelectItem value="both">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            <Cloud className="h-4 w-4" />
                            Les deux
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(config.storageType === 'local' || config.storageType === 'both') && (
                  <div>
                    <Label htmlFor="local-path">Chemin local</Label>
                    <Input
                      id="local-path"
                      type="text"
                      value={config.localPath || '/var/backups/app'}
                      onChange={(e) => setConfig({...config, localPath: e.target.value})}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encryption"
                      checked={config.encryption}
                      onCheckedChange={(checked) => setConfig({...config, encryption: checked})}
                    />
                    <Label htmlFor="encryption">Chiffrement des sauvegardes</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email-notifications"
                      checked={config.emailNotifications !== undefined ? config.emailNotifications : true}
                      onCheckedChange={(checked) => setConfig({...config, emailNotifications: checked})}
                    />
                    <Label htmlFor="email-notifications">Notifications par email</Label>
                  </div>

                  {config.emailNotifications && (
                    <div>
                      <Label htmlFor="notification-emails">Emails de notification (séparés par des virgules)</Label>
                      <Input
                        id="notification-emails"
                        type="text"
                        value={config.notificationEmails ? (Array.isArray(config.notificationEmails) ? config.notificationEmails.join(', ') : config.notificationEmails) : ''}
                        onChange={(e) => setConfig({...config, notificationEmails: e.target.value.split(',').map(email => email.trim())})}
                        placeholder="admin@example.com, backup@example.com"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Statut des sauvegardes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Statut des sauvegardes</CardTitle>
              <CardDescription>Informations sur les dernières sauvegardes</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBackupsDialog(true)}
              >
                Voir toutes les sauvegardes
              </Button>
              <Button
                onClick={createBackup}
                disabled={creating}
                className="bg-ivory-orange hover:bg-ivory-orange/90"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Sauvegarder maintenant
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingConfig || loadingBackups ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement des informations de sauvegarde...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Dernière sauvegarde</span>
                    </div>
                    <div className="mt-2 font-medium">
                      {config.lastBackup ? formatDate(config.lastBackup) : 'Jamais effectuée'}
                    </div>
                    {config.lastBackupStatus && (
                      <div className="mt-1">
                        <Badge
                          variant={
                            config.lastBackupStatus === 'success' ? 'outline' :
                            config.lastBackupStatus === 'in_progress' ? 'secondary' : 'destructive'
                          }
                        >
                          {config.lastBackupStatus === 'success' ? 'Succès' :
                           config.lastBackupStatus === 'in_progress' ? 'En cours' : 'Échec'}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Prochaine sauvegarde</span>
                    </div>
                    <div className="mt-2 font-medium">
                      {config.nextBackup ? formatDate(config.nextBackup) : 'Non planifiée'}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <RefreshCw className="h-4 w-4" />
                      <span className="text-sm">Fréquence</span>
                    </div>
                    <div className="mt-2 font-medium">
                      {config.frequency === 'daily' ? 'Quotidienne' :
                       config.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
                    </div>
                  </div>
                </div>

                {backups.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Dernières sauvegardes</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Taille</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {backups.slice(0, 5).map((backup) => (
                            <TableRow key={backup.id}>
                              <TableCell>{formatDate(backup.timestamp)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {backup.type === 'auto' ? 'Auto' : 'Manuel'}
                                </Badge>
                              </TableCell>
                              <TableCell>{backup.size}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    backup.status === 'success' ? 'outline' :
                                    backup.status === 'in_progress' ? 'secondary' : 'destructive'
                                  }
                                >
                                  {backup.status === 'success' ? 'Succès' :
                                   backup.status === 'in_progress' ? 'En cours' : 'Échec'}
                                </Badge>
                              </TableCell>
                              <TableCell>{backup.user}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openRestoreDialog(backup)}
                                  disabled={backup.status !== 'success' || restoring === backup.id}
                                >
                                  {restoring === backup.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Boîte de dialogue de restauration */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer la sauvegarde</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cette action remplacera toutes les données actuelles.
            </DialogDescription>
          </DialogHeader>
          {backupToRestore && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Date :</div>
                <div>{formatDate(backupToRestore.timestamp)}</div>
                <div className="font-medium">Type :</div>
                <div>{backupToRestore.type === 'auto' ? 'Automatique' : 'Manuelle'}</div>
                <div className="font-medium">Taille :</div>
                <div>{backupToRestore.size}</div>
                <div className="font-medium">Créée par :</div>
                <div>{backupToRestore.user}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={restoreBackup}
              disabled={restoring !== null}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              {restoring !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restauration...
                </>
              ) : (
                "Restaurer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de toutes les sauvegardes */}
      <Dialog open={showBackupsDialog} onOpenChange={setShowBackupsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Toutes les sauvegardes</DialogTitle>
            <DialogDescription>
              Historique complet des sauvegardes
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingBackups ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement des sauvegardes...</span>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune sauvegarde disponible
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Stockage</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Restaurée</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>{formatDate(backup.timestamp)}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={backup.name}>
                          {backup.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {backup.type === 'auto' ? 'Auto' : 'Manuel'}
                          </Badge>
                        </TableCell>
                        <TableCell>{backup.size}</TableCell>
                        <TableCell>
                          {backup.storageLocation === 'local' ? (
                            <HardDrive className="h-4 w-4" />
                          ) : backup.storageLocation === 'cloud' ? (
                            <Cloud className="h-4 w-4" />
                          ) : (
                            <div className="flex">
                              <HardDrive className="h-4 w-4" />
                              <Cloud className="h-4 w-4 ml-1" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              backup.status === 'success' ? 'outline' :
                              backup.status === 'in_progress' ? 'secondary' : 'destructive'
                            }
                          >
                            {backup.status === 'success' ? 'Succès' :
                             backup.status === 'in_progress' ? 'En cours' : 'Échec'}
                          </Badge>
                        </TableCell>
                        <TableCell>{backup.user}</TableCell>
                        <TableCell>
                          {backup.restored ? (
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="ml-1 text-xs">{backup.restoredAt ? formatDate(backup.restoredAt) : ''}</span>
                            </div>
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowBackupsDialog(false);
                              openRestoreDialog(backup);
                            }}
                            disabled={backup.status !== 'success' || restoring === backup.id}
                          >
                            {restoring === backup.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupSettings;