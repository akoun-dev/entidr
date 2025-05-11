import React, { useState, useEffect } from 'react';
import {
  DollarSign, Search, Plus, MoreHorizontal,
  Edit, Trash2, Save, Check, X, ArrowUpDown, Loader2, AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../components/ui/use-toast';
import { currencyService, Currency as ApiCurrency } from '../../services/api';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

/**
 * Page de gestion des devises
 * Cette page permet de gérer les devises utilisées dans l'application
 */
const CurrenciesSettings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCurrencyDialogOpen, setIsAddCurrencyDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);

  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // États pour la confirmation de suppression
  const [currencyToDelete, setCurrencyToDelete] = useState<ApiCurrency | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast pour les notifications
  const { toast } = useToast();

  // État pour le formulaire d'ajout de devise
  const [newCurrency, setNewCurrency] = useState({
    name: '',
    symbol: '',
    code: '',
    rate: '1.0',
    position: 'after' as 'before' | 'after',
    decimal_places: '2',
    rounding: '0.01',
    active: true
  });

  // État pour les devises
  const [currencies, setCurrencies] = useState<ApiCurrency[]>([]);

  // Charger les devises depuis l'API
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await currencyService.getAll();
        setCurrencies(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des devises:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les devises',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Filtrer les devises en fonction du terme de recherche
  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer les changements dans le formulaire d'ajout de devise
  const handleNewCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCurrency(prev => ({ ...prev, [name]: value }));
  };

  // Gérer les changements de select dans le formulaire d'ajout de devise
  const handleNewCurrencySelectChange = (name: string, value: string) => {
    setNewCurrency(prev => ({ ...prev, [name]: value }));
  };

  // Gérer les changements de switch dans le formulaire d'ajout de devise
  const handleNewCurrencySwitchChange = (name: string, checked: boolean) => {
    setNewCurrency(prev => ({ ...prev, [name]: checked }));
  };

  // Ajouter une nouvelle devise
  const handleAddCurrency = async () => {
    setSaving(true);

    try {
      const newCurrencyData = {
        name: newCurrency.name,
        symbol: newCurrency.symbol,
        code: newCurrency.code,
        rate: parseFloat(newCurrency.rate),
        position: newCurrency.position,
        decimal_places: parseInt(newCurrency.decimal_places),
        rounding: parseFloat(newCurrency.rounding),
        active: newCurrency.active
      };

      const createdCurrency = await currencyService.create(newCurrencyData);

      setCurrencies([...currencies, createdCurrency]);
      setNewCurrency({
        name: '',
        symbol: '',
        code: '',
        rate: '1.0',
        position: 'after' as 'before' | 'after',
        decimal_places: '2',
        rounding: '0.01',
        active: true
      });

      toast({
        title: 'Succès',
        description: 'La devise a été ajoutée avec succès',
        variant: 'default'
      });

      setIsAddCurrencyDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la devise:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la devise',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Activer/désactiver une devise
  const toggleCurrencyStatus = async (currencyId: string) => {
    try {
      const updatedCurrency = await currencyService.toggleStatus(currencyId);

      setCurrencies(currencies.map(currency =>
        currency.id === currencyId ? updatedCurrency : currency
      ));

      toast({
        title: 'Succès',
        description: `La devise a été ${updatedCurrency.active ? 'activée' : 'désactivée'} avec succès`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut de la devise:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le statut de la devise',
        variant: 'destructive'
      });
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (currency: ApiCurrency) => {
    setCurrencyToDelete(currency);
    setIsDeleteDialogOpen(true);
  };

  // Supprimer une devise
  const deleteCurrency = async () => {
    if (!currencyToDelete) return;

    setIsDeleting(true);

    try {
      await currencyService.delete(currencyToDelete.id);

      setCurrencies(currencies.filter(currency => currency.id !== currencyToDelete.id));

      toast({
        title: 'Succès',
        description: 'La devise a été supprimée avec succès',
        variant: 'default'
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setCurrencyToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la devise:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la devise',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Commencer l'édition d'une devise
  const startEditingCurrency = (currencyId: string) => {
    setEditingCurrency(currencyId);
  };

  // Terminer l'édition d'une devise
  const finishEditingCurrency = async () => {
    if (editingCurrency) {
      const currency = currencies.find(c => c.id === editingCurrency);

      if (currency) {
        try {
          await currencyService.update(editingCurrency, currency);

          toast({
            title: 'Succès',
            description: 'La devise a été mise à jour avec succès',
            variant: 'default'
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la devise:', error);
          toast({
            title: 'Erreur',
            description: 'Impossible de mettre à jour la devise',
            variant: 'destructive'
          });

          // Recharger les devises pour annuler les modifications
          const data = await currencyService.getAll();
          setCurrencies(data);
        }
      }
    }

    setEditingCurrency(null);
  };

  // Mettre à jour une devise en cours d'édition
  const updateCurrency = (currencyId: string, field: string, value: string | number | boolean) => {
    setCurrencies(currencies.map(currency =>
      currency.id === currencyId ? { ...currency, [field]: value } : currency
    ));
  };

  return (
    <div className="w-full px-4 py-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devises</h1>
          <p className="text-muted-foreground mt-1">Gestion des devises utilisées dans l'application</p>
        </div>
        <Dialog open={isAddCurrencyDialogOpen} onOpenChange={setIsAddCurrencyDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus size={16} />
              Nouvelle devise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle devise</DialogTitle>
              <DialogDescription>
                Créez une nouvelle devise pour l'utiliser dans l'application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={newCurrency.name}
                    onChange={handleNewCurrencyChange}
                    placeholder="Euro"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code <span className="text-destructive">*</span></Label>
                  <Input
                    id="code"
                    name="code"
                    value={newCurrency.code}
                    onChange={handleNewCurrencyChange}
                    placeholder="EUR"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbole <span className="text-destructive">*</span></Label>
                  <Input
                    id="symbol"
                    name="symbol"
                    value={newCurrency.symbol}
                    onChange={handleNewCurrencyChange}
                    placeholder="€"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Taux de change <span className="text-destructive">*</span></Label>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.000001"
                    value={newCurrency.rate}
                    onChange={handleNewCurrencyChange}
                    placeholder="1.0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decimal_places">Décimales</Label>
                  <Input
                    id="decimal_places"
                    name="decimal_places"
                    type="number"
                    min="0"
                    max="6"
                    value={newCurrency.decimal_places}
                    onChange={handleNewCurrencyChange}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rounding">Arrondi</Label>
                  <Input
                    id="rounding"
                    name="rounding"
                    type="number"
                    step="0.01"
                    value={newCurrency.rounding}
                    onChange={handleNewCurrencyChange}
                    placeholder="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position du symbole</Label>
                <Select
                  value={newCurrency.position}
                  onValueChange={(value) => handleNewCurrencySelectChange('position', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Avant le montant ($ 100)</SelectItem>
                    <SelectItem value="after">Après le montant (100 €)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newCurrency.active}
                  onCheckedChange={(checked) => handleNewCurrencySwitchChange('active', checked)}
                />
                <Label htmlFor="active">Devise active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddCurrencyDialogOpen(false)}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddCurrency}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  'Ajouter'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contenu principal */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Devises</CardTitle>
              <CardDescription>Liste des devises disponibles dans l'application</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Symbole</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Taux
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Décimales</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map(currency => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">
                      {editingCurrency === currency.id ? (
                        <Input
                          value={currency.name}
                          onChange={(e) => updateCurrency(currency.id, 'name', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        currency.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCurrency === currency.id ? (
                        <Input
                          value={currency.code}
                          onChange={(e) => updateCurrency(currency.id, 'code', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        currency.code
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCurrency === currency.id ? (
                        <Input
                          value={currency.symbol}
                          onChange={(e) => updateCurrency(currency.id, 'symbol', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        currency.symbol
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCurrency === currency.id ? (
                        <Input
                          type="number"
                          step="0.000001"
                          value={currency.rate}
                          onChange={(e) => updateCurrency(currency.id, 'rate', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      ) : (
                        currency.rate
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCurrency === currency.id ? (
                        <Select
                          value={currency.position}
                          onValueChange={(value) => updateCurrency(currency.id, 'position', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="before">Avant</SelectItem>
                            <SelectItem value="after">Après</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        currency.position === 'before' ? 'Avant' : 'Après'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCurrency === currency.id ? (
                        <Input
                          type="number"
                          min="0"
                          max="6"
                          value={currency.decimal_places}
                          onChange={(e) => updateCurrency(currency.id, 'decimal_places', parseInt(e.target.value))}
                          className="w-full"
                        />
                      ) : (
                        currency.decimal_places
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={currency.active ? "default" : "outline"} className={currency.active ? "bg-green-500" : ""}>
                        {currency.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingCurrency === currency.id ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={finishEditingCurrency}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={finishEditingCurrency}>
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="flex items-center gap-2" onClick={() => startEditingCurrency(currency.id)}>
                              <Edit className="h-4 w-4" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => toggleCurrencyStatus(currency.id)}
                            >
                              {currency.active ? (
                                <>
                                  <X className="h-4 w-4" />
                                  <span>Désactiver</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4" />
                                  <span>Activer</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                              onClick={() => openDeleteDialog(currency)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    Aucune devise trouvée
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {loading ? 'Chargement...' : `${filteredCurrencies.length} devise${filteredCurrencies.length !== 1 ? 's' : ''} au total`}
          </div>
        </CardFooter>
      </Card>

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Supprimer la devise"
        description="Êtes-vous sûr de vouloir supprimer cette devise ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<AlertTriangle className="h-4 w-4 mr-2" />}
        onConfirm={deleteCurrency}
      >
        {currencyToDelete && (
          <div>
            <p className="font-medium">{currencyToDelete.name} ({currencyToDelete.code})</p>
            <p className="text-sm text-muted-foreground">
              Symbole: {currencyToDelete.symbol} |
              Taux: {currencyToDelete.rate}
            </p>
            <p className="text-sm text-muted-foreground">
              Position: {currencyToDelete.position === 'before' ? 'Avant' : 'Après'} |
              Décimales: {currencyToDelete.decimal_places}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default CurrenciesSettings;
