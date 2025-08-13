import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Globe, Search, Plus, Pencil, Trash2, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { countryService, Country as ApiCountry } from '../../services/api';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { CurrencySelector } from '../../components/selectors';

// Types pour les pays
interface Country {
  id: string;
  code: string;
  name: string;
  phone_code: string;
  region: string;
  currency_code: string;
  active: boolean;
}

/**
 * Page des paramètres des pays
 * Permet de gérer les pays disponibles dans l'application
 */
const CountriesSettings: React.FC = () => {
  // État pour les pays
  const [countries, setCountries] = useState<Country[]>([]);

  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast pour les notifications
  const { toast } = useToast();

  // Régions disponibles
  const regions = ['Europe', 'Amérique du Nord', 'Amérique du Sud', 'Asie', 'Afrique', 'Océanie', 'Antarctique'];

  // Nous utilisons maintenant le sélecteur de devises qui récupère les données depuis l'API

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  // État pour le pays en cours d'édition
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // États pour la confirmation de suppression
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les pays depuis l'API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await countryService.getAll();

        // Transformer les données pour correspondre à notre interface
        const transformedCountries = data.map(country => ({
          id: country.id,
          code: country.code,
          name: country.name,
          phone_code: country.phone_code || '',
          region: country.region || '',
          currency_code: country.currency_code || '',
          active: country.active
        }));

        setCountries(transformedCountries);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les pays',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filtrer les pays en fonction du terme de recherche et du filtre de région
  const filteredCountries = countries.filter(country => {
    const matchesSearch =
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (country.phone_code && country.phone_code.includes(searchTerm));

    const matchesRegion = regionFilter && regionFilter !== 'all' ? country.region === regionFilter : true;

    return matchesSearch && matchesRegion;
  });

  // Gérer l'ajout ou la modification d'un pays
  const handleSaveCountry = async (country: Country) => {
    setSaving(true);

    try {
      if (editingCountry) {
        // Mise à jour d'un pays existant
        const updatedCountry = await countryService.update(country.id, country);

        // Transformer les données pour correspondre à notre interface
        const transformedCountry = {
          id: updatedCountry.id,
          code: updatedCountry.code,
          name: updatedCountry.name,
          phone_code: updatedCountry.phone_code || '',
          region: updatedCountry.region || '',
          currency_code: updatedCountry.currency_code || '',
          active: updatedCountry.active
        };

        setCountries(countries.map(c => c.id === country.id ? transformedCountry : c));

        toast({
          title: 'Succès',
          description: 'Le pays a été mis à jour avec succès',
          variant: 'default'
        });
      } else {
        // Ajout d'un nouveau pays
        const newCountry = await countryService.create(country);

        // Transformer les données pour correspondre à notre interface
        const transformedCountry = {
          id: newCountry.id,
          code: newCountry.code,
          name: newCountry.name,
          phone_code: newCountry.phone_code || '',
          region: newCountry.region || '',
          currency_code: newCountry.currency_code || '',
          active: newCountry.active
        };

        setCountries([...countries, transformedCountry]);

        toast({
          title: 'Succès',
          description: 'Le pays a été ajouté avec succès',
          variant: 'default'
        });
      }

      setIsDialogOpen(false);
      setEditingCountry(null);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du pays:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le pays',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (country: Country) => {
    setCountryToDelete(country);
    setIsDeleteDialogOpen(true);
  };

  // Gérer la suppression d'un pays
  const handleDeleteCountry = async () => {
    if (!countryToDelete) return;

    setIsDeleting(true);

    try {
      await countryService.delete(countryToDelete.id);

      setCountries(countries.filter(c => c.id !== countryToDelete.id));

      toast({
        title: 'Succès',
        description: 'Le pays a été supprimé avec succès',
        variant: 'default'
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setCountryToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du pays:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le pays',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Gérer l'activation/désactivation d'un pays
  const handleToggleCountryStatus = async (id: string) => {
    try {
      const updatedCountry = await countryService.toggleStatus(id);

      // Transformer les données pour correspondre à notre interface
      const transformedCountry = {
        id: updatedCountry.id,
        code: updatedCountry.code,
        name: updatedCountry.name,
        phone_code: updatedCountry.phone_code || '',
        region: updatedCountry.region || '',
        currency_code: updatedCountry.currency_code || '',
        active: updatedCountry.active
      };

      setCountries(countries.map(country =>
        country.id === id ? transformedCountry : country
      ));

      toast({
        title: 'Succès',
        description: `Le pays a été ${transformedCountry.active ? 'activé' : 'désactivé'} avec succès`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut du pays:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le statut du pays',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pays</h1>
          <p className="text-muted-foreground mt-1">Gérez les pays disponibles dans l'application</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des pays</CardTitle>
            <CardDescription>Configurez les pays et leur disponibilité</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => setEditingCountry(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un pays
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCountry ? 'Modifier le pays' : 'Ajouter un pays'}</DialogTitle>
                <DialogDescription>
                  {editingCountry
                    ? 'Modifiez les informations du pays'
                    : 'Remplissez les informations pour ajouter un nouveau pays'}
                </DialogDescription>
              </DialogHeader>
              <CountryForm
                country={editingCountry || {
                  id: '',
                  code: '',
                  name: '',
                  phone_code: '',
                  region: '',
                  currency_code: '',
                  active: true
                }}
                regions={regions}
                onSave={handleSaveCountry}
                onCancel={() => setIsDialogOpen(false)}
                saving={saving}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un pays..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tableau des pays */}
          <div className="rounded-md border">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Indicatif</TableHead>
                    <TableHead>Région</TableHead>
                    <TableHead>Devise</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell className="font-medium">{country.code}</TableCell>
                        <TableCell>{country.name}</TableCell>
                        <TableCell>{country.phone_code}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{country.region}</Badge>
                        </TableCell>
                        <TableCell>{country.currency_code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={country.active}
                              onCheckedChange={() => handleToggleCountryStatus(country.id)}
                            />
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              country.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {country.active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingCountry(country);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(country)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        {searchTerm || regionFilter ? 'Aucun pays trouvé pour cette recherche' : 'Aucun pays disponible'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Supprimer le pays"
        description="Êtes-vous sûr de vouloir supprimer ce pays ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<AlertTriangle className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteCountry}
      >
        {countryToDelete && (
          <div>
            <p className="font-medium">{countryToDelete.name} ({countryToDelete.code})</p>
            <p className="text-sm text-muted-foreground">
              Région: <Badge variant="outline">{countryToDelete.region || 'Non spécifiée'}</Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              Indicatif: {countryToDelete.phone_code || 'Non spécifié'} |
              Devise: {countryToDelete.currency_code || 'Non spécifiée'}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

// Composant de formulaire pour ajouter/modifier un pays
interface CountryFormProps {
  country: Country;
  regions: string[];
  onSave: (country: Country) => void;
  onCancel: () => void;
  saving?: boolean;
}

const CountryForm: React.FC<CountryFormProps> = ({ country, regions, onSave, onCancel, saving = false }) => {
  const [formData, setFormData] = useState<Country>(country);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Gestionnaire pour le sélecteur de devises
  const handleCurrencyChange = (value: string) => {
    setFormData({
      ...formData,
      currency_code: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="code" className="text-right">Code</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="col-span-3"
            placeholder="FR"
            maxLength={2}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nom</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="col-span-3"
            placeholder="France"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone_code" className="text-right">Indicatif</Label>
          <Input
            id="phone_code"
            name="phone_code"
            value={formData.phone_code}
            onChange={handleChange}
            className="col-span-3"
            placeholder="+33"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="region" className="text-right">Région</Label>
          <Select
            value={formData.region}
            onValueChange={(value) => handleSelectChange('region', value)}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez une région" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="currency_code" className="text-right">Devise</Label>
          <div className="col-span-3">
            <CurrencySelector
              id="currency_code"
              value={formData.currency_code}
              onChange={handleCurrencyChange}
              placeholder="Sélectionner une devise"
              label=""
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="active" className="text-right">Actif</Label>
          <div className="col-span-3 flex items-center">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({...formData, active: checked})}
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-ivory-orange hover:bg-ivory-orange/90"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CountriesSettings;
