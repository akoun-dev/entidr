import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Bell, Plus, FileEdit, Trash2, Loader2, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface NotificationSetting {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  channels: string[];
  lastModified: string;
}

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<NotificationSetting | null>(null);
  const [deletingSetting, setDeletingSetting] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/notifications/settings');
        setSettings(response.data?.data ?? []);
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres:', err);
        setError('Impossible de charger les paramètres de notification. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggleStatus = async (id: string) => {
    setTogglingStatus(id);

    try {
      const response = await api.patch(`/notifications/settings/${id}/toggle`);

      setSettings((settings || []).map(setting =>
        setting.id === id ? { ...setting, isActive: (response.data?.data?.isActive ?? setting.isActive) } : setting
      ));

      toast({
        title: "Statut mis à jour",
        description: `Le paramètre a été ${response.data.data.isActive ? 'activé' : 'désactivé'}.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du paramètre.",
        variant: "destructive",
      });
    } finally {
      setTogglingStatus(null);
    }
  };

  const openDeleteDialog = (setting: NotificationSetting) => {
    setSettingToDelete(setting);
    setShowDeleteDialog(true);
  };

  const handleDeleteSetting = async () => {
    if (!settingToDelete) return;

    setDeletingSetting(settingToDelete.id);

    try {
      await api.delete(`/notifications/settings/${settingToDelete.id}`);
      setSettings(settings.filter(setting => setting.id !== settingToDelete.id));
      setShowDeleteDialog(false);
      setSettingToDelete(null);

      toast({
        title: "Paramètre supprimé",
        description: "Le paramètre de notification a été supprimé avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le paramètre de notification.",
        variant: "destructive",
      });
    } finally {
      setDeletingSetting(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres de notification</h1>
          <p className="text-muted-foreground mt-1">Configurez les règles et canaux de notification</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Configurations</CardTitle>
            <CardDescription>Liste des paramètres de notification</CardDescription>
          </div>
          <Button className="bg-ivory-orange hover:bg-ivory-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau paramètre
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des paramètres...</span>
            </div>
          ) : settings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucun paramètre trouvé</div>
              <div className="text-sm">Créez un nouveau paramètre pour commencer</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Canaux</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.name}</TableCell>
                      <TableCell>{setting.type}</TableCell>
                      <TableCell>{setting.channels.join(', ')}</TableCell>
                      <TableCell>
                        <Button
                          variant={setting.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleStatus(setting.id)}
                          disabled={togglingStatus === setting.id}
                        >
                          {togglingStatus === setting.id ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              En cours...
                            </>
                          ) : (
                            <>{setting.isActive ? 'Actif' : 'Inactif'}</>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Modifier">
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(setting)}
                            disabled={deletingSetting === setting.id}
                            title="Supprimer"
                          >
                            {deletingSetting === setting.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le paramètre</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce paramètre de notification ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {settingToDelete && (
            <div className="py-4">
              <p className="font-medium">{settingToDelete.name}</p>
              <p className="text-sm text-muted-foreground">Type: {settingToDelete.type}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSetting}
              disabled={deletingSetting !== null}
            >
              {deletingSetting !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationSettings;
