import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Truck, Plus, Trash2, Package, Loader2, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services/api';
import { CountrySelector } from '../../components/selectors';
import { useCountries } from '../../hooks/useReferenceData';

interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  deliveryTime: string;
  price: string;
  isActive: boolean;
  displayOrder?: number;
  lastModified?: string;
  supportedCountries?: string[]; // IDs des pays supportés
}

const ShippingMethodsSettings: React.FC = () => {
  const { toast } = useToast();
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<ShippingMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<string | null>(null);
  const [togglingMethod, setTogglingMethod] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Charger les méthodes d'expédition depuis l'API
  useEffect(() => {
    const fetchMethods = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/shippingmethods');
        setMethods(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des méthodes d\'expédition:', err);
        setError('Impossible de charger les méthodes d\'expédition. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, []);

  const [newMethod, setNewMethod] = useState({
    name: '',
    carrier: '',
    deliveryTime: '',
    price: '',
    supportedCountries: [] as string[]
  });

  // Utiliser le hook useCountries pour récupérer les pays
  const { data: countries, loading: loadingCountries } = useCountries();

  // Gérer la sélection des pays supportés
  const handleSupportedCountryChange = (countryId: string) => {
    setNewMethod(prev => {
      const currentCountries = [...prev.supportedCountries];
      if (currentCountries.includes(countryId)) {
        return { ...prev, supportedCountries: currentCountries.filter(id => id !== countryId) };
      } else {
        return { ...prev, supportedCountries: [...currentCountries, countryId] };
      }
    });
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (method: ShippingMethod) => {
    setMethodToDelete(method);
    setShowDeleteDialog(true);
  };

  // Ajouter une nouvelle méthode d'expédition
  const handleAddMethod = async () => {
    if (!newMethod.name || !newMethod.carrier || !newMethod.deliveryTime || !newMethod.price) return;

    setSubmitting(true);

    try {
      const response = await api.post('/shippingmethods', {
        name: newMethod.name,
        carrier: newMethod.carrier,
        deliveryTime: newMethod.deliveryTime,
        price: newMethod.price,
        supportedCountries: newMethod.supportedCountries,
        isActive: true,
        displayOrder: methods.length + 1
      });

      // Mettre à jour l'état local
      setMethods([...methods, response.data]);

      // Réinitialiser le formulaire
      setNewMethod({
        name: '',
        carrier: '',
        deliveryTime: '',
        price: '',
        supportedCountries: []
      });

      toast({
        title: "Méthode ajoutée",
        description: "La méthode d'expédition a été ajoutée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la méthode d\'expédition:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la méthode d'expédition.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Activer/désactiver une méthode d'expédition
  const handleToggleMethod = async (id: string) => {
    setTogglingMethod(id);

    try {
      const response = await api.patch(`/shippingmethods/${id}/toggle`);

      // Mettre à jour l'état local
      setMethods(methods.map(method =>
        method.id === id ? { ...method, isActive: response.data.isActive } : method
      ));

      toast({
        title: response.data.isActive ? "Méthode activée" : "Méthode désactivée",
        description: `La méthode "${response.data.name}" a été ${response.data.isActive ? 'activée' : 'désactivée'}.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la modification du statut de la méthode:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la méthode d'expédition.",
        variant: "destructive",
      });
    } finally {
      setTogglingMethod(null);
    }
  };

  // Supprimer une méthode d'expédition
  const handleDeleteMethod = async () => {
    if (!methodToDelete) return;

    setDeletingMethod(methodToDelete.id);

    try {
      await api.delete(`/shippingmethods/${methodToDelete.id}`);

      // Mettre à jour l'état local
      setMethods(methods.filter(method => method.id !== methodToDelete.id));

      // Fermer la boîte de dialogue
      setShowDeleteDialog(false);
      setMethodToDelete(null);

      toast({
        title: "Méthode supprimée",
        description: "La méthode d'expédition a été supprimée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression de la méthode:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la méthode d'expédition.",
        variant: "destructive",
      });
    } finally {
      setDeletingMethod(null);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Truck className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Méthodes d'expédition</h1>
          <p className="text-muted-foreground mt-1">Configurez les options de livraison disponibles</p>
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
          <CardTitle>Ajouter une méthode</CardTitle>
          <CardDescription>Configurez une nouvelle méthode d'expédition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newMethod.name}
                onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                className="col-span-3"
                placeholder="Ex: Livraison Express"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="carrier" className="text-right">
                Transporteur
              </Label>
              <Input
                id="carrier"
                value={newMethod.carrier}
                onChange={(e) => setNewMethod({...newMethod, carrier: e.target.value})}
                className="col-span-3"
                placeholder="Ex: UPS, La Poste..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deliveryTime" className="text-right">
                Délai
              </Label>
              <Input
                id="deliveryTime"
                value={newMethod.deliveryTime}
                onChange={(e) => setNewMethod({...newMethod, deliveryTime: e.target.value})}
                className="col-span-3"
                placeholder="Ex: 2-5 jours"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Prix
              </Label>
              <Input
                id="price"
                value={newMethod.price}
                onChange={(e) => setNewMethod({...newMethod, price: e.target.value})}
                className="col-span-3"
                placeholder="Ex: 5.99€"
              />
            </div>

            {/* Pays supportés */}
            <div className="grid grid-cols-4 items-start gap-4 pt-2">
              <Label className="text-right pt-2">
                Pays supportés
              </Label>
              <div className="col-span-3 border rounded-md p-3 space-y-2">
                {loadingCountries ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement des pays...</span>
                  </div>
                ) : (
                  <>
                    <CountrySelector
                      id="country-selector"
                      label=""
                      placeholder="Sélectionner un pays à ajouter"
                      onChange={handleSupportedCountryChange}
                    />

                    {/* Afficher les pays sélectionnés */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {newMethod.supportedCountries.length > 0 ? (
                        newMethod.supportedCountries.map(countryId => {
                          const country = countries?.find(c => c.id.toString() === countryId);
                          return (
                            <Badge
                              key={countryId}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {country ? country.name : countryId}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleSupportedCountryChange(countryId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun pays sélectionné</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={handleAddMethod}
                disabled={submitting || !newMethod.name || !newMethod.carrier || !newMethod.deliveryTime || !newMethod.price}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter la méthode
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des méthodes */}
      <Card>
        <CardHeader>
          <CardTitle>Méthodes disponibles</CardTitle>
          <CardDescription>Liste des options d'expédition configurées</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des méthodes d'expédition...</span>
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucune méthode d'expédition configurée</div>
              <div className="text-sm">Ajoutez une méthode pour commencer</div>
            </div>
          ) : (
            <div className="space-y-4">
              {methods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Package className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.carrier} • {method.deliveryTime} • {method.price}
                      </div>
                      {method.supportedCountries && method.supportedCountries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {method.supportedCountries.map(countryId => {
                            const country = countries?.find(c => c.id.toString() === countryId);
                            return (
                              <Badge key={countryId} variant="outline" className="text-xs">
                                {country ? country.name : countryId}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      {method.lastModified && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Dernière modification: {method.lastModified}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={method.isActive}
                        onCheckedChange={() => handleToggleMethod(method.id)}
                        disabled={togglingMethod === method.id}
                      />
                      <Badge variant={method.isActive ? 'default' : 'outline'}>
                        {togglingMethod === method.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          method.isActive ? 'Actif' : 'Inactif'
                        )}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(method)}
                      disabled={deletingMethod === method.id}
                      title="Supprimer"
                    >
                      {deletingMethod === method.id ? (
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
            <DialogTitle>Supprimer la méthode d'expédition</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette méthode d'expédition ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {methodToDelete && (
            <div className="py-4">
              <p className="font-medium">{methodToDelete.name}</p>
              <p className="text-sm text-muted-foreground">Transporteur: {methodToDelete.carrier}</p>
              <p className="text-sm text-muted-foreground">Délai: {methodToDelete.deliveryTime}</p>
              <p className="text-sm text-muted-foreground">Prix: {methodToDelete.price}</p>
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
              onClick={handleDeleteMethod}
              disabled={deletingMethod !== null}
            >
              {deletingMethod !== null ? (
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

export default ShippingMethodsSettings;
