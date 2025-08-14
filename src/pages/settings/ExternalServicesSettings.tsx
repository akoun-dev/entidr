import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Globe, Plus, Settings, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface ExternalService {
  id: string;
  name: string;
  type: string;
  apiKey?: string;
  isActive: boolean;
  mode?: string;
  lastSyncStatus?: string;
  lastSyncDate?: string;
  lastModified?: string;
}

const ExternalServicesSettings: React.FC = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ExternalService | null>(null);
  const [deletingService, setDeletingService] = useState<string | null>(null);
  const [togglingService, setTogglingService] = useState<string | null>(null);
  const [syncingService, setSyncingService] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Charger les services externes depuis l'API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/externalservices');
        setServices(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des services externes:', err);
        setError('Impossible de charger les services externes. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const [newService, setNewService] = useState({
    name: '',
    type: '',
    apiKey: ''
  });

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (service: ExternalService) => {
    setServiceToDelete(service);
    setShowDeleteDialog(true);
  };

  // Ajouter un nouveau service externe
  const handleAddService = async () => {
    if (!newService.name || !newService.type || !newService.apiKey) return;

    setSubmitting(true);

    try {
      const response = await api.post('/externalservices', {
        name: newService.name,
        type: newService.type,
        apiKey: newService.apiKey,
        isActive: true,
        mode: 'test'
      });

      // Mettre à jour l'état local
      setServices([...services, response.data]);

      // Réinitialiser le formulaire
      setNewService({
        name: '',
        type: '',
        apiKey: ''
      });

      toast({
        title: "Service ajouté",
        description: "Le service externe a été ajouté avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout du service externe:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le service externe.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Activer/désactiver un service externe
  const handleToggleService = async (id: string) => {
    setTogglingService(id);

    try {
      const response = await api.patch(`/externalservices/${id}/toggle`);

      // Mettre à jour l'état local
      setServices(services.map(service =>
        service.id === id ? { ...service, isActive: response.data.isActive } : service
      ));

      toast({
        title: response.data.isActive ? "Service activé" : "Service désactivé",
        description: `Le service "${response.data.name}" a été ${response.data.isActive ? 'activé' : 'désactivé'}.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la modification du statut du service:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du service externe.",
        variant: "destructive",
      });
    } finally {
      setTogglingService(null);
    }
  };

  // Synchroniser un service externe
  const handleSyncService = async (id: string) => {
    setSyncingService(id);

    try {
      const response = await api.post(`/externalservices/${id}/sync`);

      // Mettre à jour l'état local
      setServices(services.map(service =>
        service.id === id ? {
          ...service,
          lastSyncStatus: response.data.lastSyncStatus,
          lastSyncDate: response.data.lastSyncDate
        } : service
      ));

      toast({
        title: "Synchronisation réussie",
        description: `Le service "${response.data.name}" a été synchronisé avec succès.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la synchronisation du service:', err);
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser le service externe.",
        variant: "destructive",
      });
    } finally {
      setSyncingService(null);
    }
  };

  // Supprimer un service externe
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    setDeletingService(serviceToDelete.id);

    try {
      await api.delete(`/externalservices/${serviceToDelete.id}`);

      // Mettre à jour l'état local
      setServices(services.filter(service => service.id !== serviceToDelete.id));

      // Fermer la boîte de dialogue
      setShowDeleteDialog(false);
      setServiceToDelete(null);

      toast({
        title: "Service supprimé",
        description: "Le service externe a été supprimé avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du service:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service externe.",
        variant: "destructive",
      });
    } finally {
      setDeletingService(null);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services externes</h1>
          <p className="text-muted-foreground mt-1">Configurez les intégrations avec des services tiers</p>
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

      {/* Formulaire d'ajout */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ajouter un service</CardTitle>
          <CardDescription>Configurez une nouvelle intégration de service externe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                className="col-span-3"
                placeholder="Ex: Google Maps"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Input
                id="type"
                value={newService.type}
                onChange={(e) => setNewService({...newService, type: e.target.value})}
                className="col-span-3"
                placeholder="Ex: Cartographie"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                Clé API
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={newService.apiKey}
                onChange={(e) => setNewService({...newService, apiKey: e.target.value})}
                className="col-span-3"
                placeholder="Saisissez la clé API"
              />
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={handleAddService}
                disabled={submitting || !newService.name || !newService.type || !newService.apiKey}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le service
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des services */}
      <Card>
        <CardHeader>
          <CardTitle>Services configurés</CardTitle>
          <CardDescription>Liste des intégrations avec des services externes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des services externes...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucun service externe configuré</div>
              <div className="text-sm">Ajoutez un service pour commencer</div>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <Badge variant="outline">{service.type}</Badge>
                      {service.mode && (
                        <Badge variant={service.mode === 'production' ? 'default' : 'secondary'} className="ml-2">
                          {service.mode === 'production' ? 'Production' : 'Test'}
                        </Badge>
                      )}
                    </div>
                    {service.lastSyncDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Dernière synchronisation: {new Date(service.lastSyncDate).toLocaleString()}
                        {service.lastSyncStatus && (
                          <Badge variant={service.lastSyncStatus === 'success' ? 'outline' : 'destructive'} className="ml-2">
                            {service.lastSyncStatus === 'success' ? 'Réussie' : 'Échec'}
                          </Badge>
                        )}
                      </div>
                    )}
                    {service.lastModified && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Dernière modification: {service.lastModified}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={service.isActive}
                        onCheckedChange={() => handleToggleService(service.id)}
                        disabled={togglingService === service.id}
                      />
                      <Badge variant={service.isActive ? 'default' : 'outline'}>
                        {togglingService === service.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          service.isActive ? 'Actif' : 'Inactif'
                        )}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncService(service.id)}
                      disabled={syncingService === service.id || !service.isActive}
                      title="Synchroniser"
                    >
                      {syncingService === service.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Sync
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Configurer"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(service)}
                      disabled={deletingService === service.id}
                      title="Supprimer"
                    >
                      {deletingService === service.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le service externe</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce service externe ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {serviceToDelete && (
            <div className="py-4">
              <p className="font-medium">{serviceToDelete.name}</p>
              <p className="text-sm text-muted-foreground">Type: {serviceToDelete.type}</p>
              {serviceToDelete.mode && (
                <p className="text-sm text-muted-foreground">Mode: {serviceToDelete.mode}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              disabled={deletingService !== null}
            >
              {deletingService !== null ? (
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

export default ExternalServicesSettings;
