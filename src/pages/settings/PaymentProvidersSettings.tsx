import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { CreditCard, Plus, Settings, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services/api';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CountrySelector, CurrencySelector } from '../../components/selectors';
import { useCountries, useCurrencies } from '../../hooks/useReferenceData';

interface PaymentProvider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  fees: string;
  mode?: string;
  lastModified?: string;
  apiKey?: string;
  apiSecret?: string;
}

interface NewProviderForm {
  name: string;
  type: string;
  fees: string;
  apiKey: string;
  apiSecret: string;
  supportedCountries: string[]; // IDs des pays supportés
  supportedCurrencies: string[]; // IDs des devises supportées
}

const PaymentProvidersSettings: React.FC = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<PaymentProvider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<string | null>(null);
  const [togglingProvider, setTogglingProvider] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newProvider, setNewProvider] = useState<NewProviderForm>({
    name: '',
    type: '',
    fees: '',
    apiKey: '',
    apiSecret: '',
    supportedCountries: [],
    supportedCurrencies: []
  });

  // Utiliser les hooks pour récupérer les pays et devises
  const { data: countries, loading: loadingCountries } = useCountries();
  const { data: currencies, loading: loadingCurrencies } = useCurrencies();

  // Charger les fournisseurs de paiement depuis l'API
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/paymentproviders');
        setProviders(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des fournisseurs de paiement:', err);
        setError('Impossible de charger les fournisseurs de paiement. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (provider: PaymentProvider) => {
    setProviderToDelete(provider);
    setShowDeleteDialog(true);
  };

  // Ouvrir la boîte de dialogue d'ajout
  const openAddDialog = () => {
    setNewProvider({
      name: '',
      type: '',
      fees: '',
      apiKey: '',
      apiSecret: '',
      supportedCountries: [],
      supportedCurrencies: []
    });
    setShowAddDialog(true);
  };

  // Gérer les changements dans le formulaire d'ajout
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProvider(prev => ({ ...prev, [name]: value }));
  };

  // Gérer la sélection du type de fournisseur
  const handleTypeChange = (value: string) => {
    setNewProvider(prev => ({ ...prev, type: value }));
  };

  // Gérer la sélection des pays supportés
  const handleCountryChange = (countryId: string) => {
    setNewProvider(prev => {
      const currentCountries = [...prev.supportedCountries];
      if (currentCountries.includes(countryId)) {
        return { ...prev, supportedCountries: currentCountries.filter(id => id !== countryId) };
      } else {
        return { ...prev, supportedCountries: [...currentCountries, countryId] };
      }
    });
  };

  // Gérer la sélection des devises supportées
  const handleCurrencyChange = (currencyId: string) => {
    setNewProvider(prev => {
      const currentCurrencies = [...prev.supportedCurrencies];
      if (currentCurrencies.includes(currencyId)) {
        return { ...prev, supportedCurrencies: currentCurrencies.filter(id => id !== currencyId) };
      } else {
        return { ...prev, supportedCurrencies: [...currentCurrencies, currencyId] };
      }
    });
  };

  // Ajouter un nouveau fournisseur de paiement
  const handleAddProvider = async () => {
    if (!newProvider.name || !newProvider.type || !newProvider.fees) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/paymentproviders', {
        name: newProvider.name,
        type: newProvider.type,
        fees: newProvider.fees,
        apiKey: newProvider.apiKey,
        apiSecret: newProvider.apiSecret,
        supportedCountries: newProvider.supportedCountries,
        supportedCurrencies: newProvider.supportedCurrencies,
        isActive: false,
        mode: 'test'
      });

      // Mettre à jour l'état local
      setProviders([...providers, response.data]);

      // Fermer la boîte de dialogue
      setShowAddDialog(false);

      toast({
        title: "Fournisseur ajouté",
        description: "Le fournisseur de paiement a été ajouté avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout du fournisseur:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le fournisseur de paiement.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Activer/désactiver un fournisseur de paiement
  const handleToggleProvider = async (id: string) => {
    setTogglingProvider(id);

    try {
      const response = await api.patch(`/paymentproviders/${id}/toggle`);

      // Mettre à jour l'état local
      setProviders(providers.map(provider =>
        provider.id === id ? { ...provider, isActive: response.data.isActive } : provider
      ));

      toast({
        title: response.data.isActive ? "Fournisseur activé" : "Fournisseur désactivé",
        description: `Le fournisseur "${response.data.name}" a été ${response.data.isActive ? 'activé' : 'désactivé'}.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la modification du statut du fournisseur:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du fournisseur.",
        variant: "destructive",
      });
    } finally {
      setTogglingProvider(null);
    }
  };

  // Supprimer un fournisseur de paiement
  const handleDeleteProvider = async () => {
    if (!providerToDelete) return;

    setDeletingProvider(providerToDelete.id);

    try {
      await api.delete(`/paymentproviders/${providerToDelete.id}`);

      // Mettre à jour l'état local
      setProviders(providers.filter(provider => provider.id !== providerToDelete.id));

      // Fermer la boîte de dialogue
      setShowDeleteDialog(false);
      setProviderToDelete(null);

      toast({
        title: "Fournisseur supprimé",
        description: "Le fournisseur de paiement a été supprimé avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du fournisseur:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fournisseur de paiement.",
        variant: "destructive",
      });
    } finally {
      setDeletingProvider(null);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fournisseurs de paiement</h1>
          <p className="text-muted-foreground mt-1">Configurez les méthodes de paiement disponibles</p>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fournisseurs configurés</CardTitle>
            <CardDescription>Liste des méthodes de paiement disponibles</CardDescription>
          </div>
          <Button
            className="bg-ivory-orange hover:bg-ivory-orange/90"
            onClick={openAddDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un fournisseur
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des fournisseurs de paiement...</span>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucun fournisseur de paiement configuré</div>
              <div className="text-sm">Ajoutez un fournisseur pour commencer</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frais</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{provider.type}</Badge>
                      </TableCell>
                      <TableCell>{provider.fees}</TableCell>
                      <TableCell>
                        <Badge variant={provider.mode === 'production' ? 'default' : 'secondary'}>
                          {provider.mode === 'production' ? 'Production' : 'Test'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={provider.isActive}
                            onCheckedChange={() => handleToggleProvider(provider.id)}
                            disabled={togglingProvider === provider.id}
                          />
                          <span className="text-sm">
                            {togglingProvider === provider.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              provider.isActive ? 'Actif' : 'Inactif'
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                            onClick={() => openDeleteDialog(provider)}
                            disabled={deletingProvider === provider.id}
                            title="Supprimer"
                          >
                            {deletingProvider === provider.id ? (
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

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le fournisseur de paiement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce fournisseur de paiement ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {providerToDelete && (
            <div className="py-4">
              <p className="font-medium">{providerToDelete.name}</p>
              <p className="text-sm text-muted-foreground">Type: {providerToDelete.type}</p>
              <p className="text-sm text-muted-foreground">Frais: {providerToDelete.fees}</p>
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
              onClick={handleDeleteProvider}
              disabled={deletingProvider !== null}
            >
              {deletingProvider !== null ? (
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

      {/* Boîte de dialogue d'ajout de fournisseur */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un fournisseur de paiement</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau fournisseur de paiement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                name="name"
                value={newProvider.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Nom du fournisseur"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newProvider.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                  <SelectItem value="Portefeuille électronique">Portefeuille électronique</SelectItem>
                  <SelectItem value="Virement">Virement</SelectItem>
                  <SelectItem value="Prélèvement">Prélèvement</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fees" className="text-right">
                Frais
              </Label>
              <Input
                id="fees"
                name="fees"
                value={newProvider.fees}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="ex: 1.4% + 0.25€"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                Clé API
              </Label>
              <Input
                id="apiKey"
                name="apiKey"
                value={newProvider.apiKey}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Clé API (optionnel)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiSecret" className="text-right">
                Secret API
              </Label>
              <Input
                id="apiSecret"
                name="apiSecret"
                type="password"
                value={newProvider.apiSecret}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Secret API (optionnel)"
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
                      onChange={handleCountryChange}
                    />

                    {/* Afficher les pays sélectionnés */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {newProvider.supportedCountries.length > 0 ? (
                        newProvider.supportedCountries.map(countryId => {
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
                                onClick={() => handleCountryChange(countryId)}
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

            {/* Devises supportées */}
            <div className="grid grid-cols-4 items-start gap-4 pt-2">
              <Label className="text-right pt-2">
                Devises supportées
              </Label>
              <div className="col-span-3 border rounded-md p-3 space-y-2">
                {loadingCurrencies ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement des devises...</span>
                  </div>
                ) : (
                  <>
                    <CurrencySelector
                      id="currency-selector"
                      label=""
                      placeholder="Sélectionner une devise à ajouter"
                      onChange={handleCurrencyChange}
                    />

                    {/* Afficher les devises sélectionnées */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {newProvider.supportedCurrencies.length > 0 ? (
                        newProvider.supportedCurrencies.map(currencyId => {
                          const currency = currencies?.find(c => c.id.toString() === currencyId);
                          return (
                            <Badge
                              key={currencyId}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {currency ? `${currency.code} (${currency.symbol})` : currencyId}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleCurrencyChange(currencyId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucune devise sélectionnée</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddProvider}
              disabled={submitting || !newProvider.name || !newProvider.type || !newProvider.fees}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentProvidersSettings;
