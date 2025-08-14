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
import { Hash, Search, Plus, Pencil, Trash2, Check, Info, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { useToast } from '../../components/ui/use-toast';
import { numberFormatService, type NumberFormat as ApiNumberFormat } from '../../services';

// Types pour les formats de nombre
interface NumberFormat {
  id: string;
  name: string;
  decimalSeparator: string;
  thousandsSeparator: string;
  decimalPlaces: number;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  example: string;
  exampleCurrency: string;
  isDefault: boolean;
  region: string;
}

// Fonction pour convertir le format d'API en format local
const apiToLocalNumberFormat = (apiFormat: ApiNumberFormat): NumberFormat => ({
  id: apiFormat.id,
  name: apiFormat.name,
  decimalSeparator: apiFormat.decimal_separator,
  thousandsSeparator: apiFormat.thousands_separator || '',
  decimalPlaces: apiFormat.decimal_places,
  currencySymbol: '€', // Valeur par défaut, à ajuster selon les besoins
  currencyPosition: 'after', // Valeur par défaut, à ajuster selon les besoins
  example: '', // Sera calculé lors du rendu
  exampleCurrency: '', // Sera calculé lors du rendu
  isDefault: apiFormat.is_default,
  region: 'Europe' // Valeur par défaut, à ajuster selon les besoins
});

// Fonction pour convertir le format local en format API
const localToApiNumberFormat = (localFormat: NumberFormat): Omit<ApiNumberFormat, 'id'> => ({
  name: localFormat.name,
  decimal_separator: localFormat.decimalSeparator,
  thousands_separator: localFormat.thousandsSeparator,
  decimal_places: localFormat.decimalPlaces,
  currency_display: 'symbol', // Valeur par défaut, à ajuster selon les besoins
  is_default: localFormat.isDefault,
  active: true
});

/**
 * Page des paramètres des formats de nombre
 * Permet de gérer les formats de nombre disponibles dans l'application
 */
const NumberFormatsSettings: React.FC = () => {
  const { toast } = useToast();

  // État pour le chargement
  const [loading, setLoading] = useState(true);

  // Fonction pour formater un nombre selon un format spécifié
  const formatNumber = (
    decimalSeparator: string,
    thousandsSeparator: string,
    decimalPlaces: number,
    currencySymbol: string,
    currencyPosition: 'before' | 'after'
  ): { number: string, currency: string } => {
    try {
      // Cette fonction est simplifiée, dans une application réelle,
      // vous utiliseriez une bibliothèque comme Intl ou numeral.js
      const number = 1234567.89;

      // Formater le nombre
      const parts = number.toFixed(decimalPlaces).split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
      const decimalPart = parts.length > 1 ? parts[1] : '';

      const formattedNumber = decimalPart
        ? `${integerPart}${decimalSeparator}${decimalPart}`
        : integerPart;

      // Formater avec devise
      const formattedCurrency = currencyPosition === 'before'
        ? `${currencySymbol} ${formattedNumber}`
        : `${formattedNumber} ${currencySymbol}`;

      return {
        number: formattedNumber,
        currency: formattedCurrency
      };
    } catch (error) {
      return {
        number: 'Format invalide',
        currency: 'Format invalide'
      };
    }
  };

  // État pour les formats de nombre
  const [numberFormats, setNumberFormats] = useState<NumberFormat[]>([]);

  // Charger les formats de nombre depuis l'API
  useEffect(() => {
    const fetchNumberFormats = async () => {
      try {
        setLoading(true);
        const apiFormats = await numberFormatService.getAll();

        // Convertir les formats API en formats locaux et calculer les exemples
        const localFormats = apiFormats.map(apiFormat => {
          const localFormat = apiToLocalNumberFormat(apiFormat);

          // Calculer les exemples
          const examples = formatNumber(
            localFormat.decimalSeparator,
            localFormat.thousandsSeparator,
            localFormat.decimalPlaces,
            localFormat.currencySymbol,
            localFormat.currencyPosition
          );

          return {
            ...localFormat,
            example: examples.number,
            exampleCurrency: examples.currency
          };
        });

        setNumberFormats(localFormats);
      } catch (error) {
        console.error('Erreur lors du chargement des formats de nombre:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les formats de nombre',
          variant: 'destructive'
        });

        // Charger des données par défaut en cas d'erreur
        setNumberFormats([
          {
            id: '1',
            name: 'Standard français',
            decimalSeparator: ',',
            thousandsSeparator: ' ',
            decimalPlaces: 2,
            currencySymbol: '€',
            currencyPosition: 'after',
            example: formatNumber(',', ' ', 2, '€', 'after').number,
            exampleCurrency: formatNumber(',', ' ', 2, '€', 'after').currency,
            isDefault: true,
            region: 'Europe'
          },
          {
            id: '2',
            name: 'Standard américain',
            decimalSeparator: '.',
            thousandsSeparator: ',',
            decimalPlaces: 2,
            currencySymbol: '$',
            currencyPosition: 'before',
            example: formatNumber('.', ',', 2, '$', 'before').number,
            exampleCurrency: formatNumber('.', ',', 2, '$', 'before').currency,
            isDefault: false,
            region: 'Amérique du Nord'
          },
          {
            id: '3',
            name: 'Standard britannique',
            decimalSeparator: '.',
            thousandsSeparator: ',',
            decimalPlaces: 2,
            currencySymbol: '£',
            currencyPosition: 'before',
            example: formatNumber('.', ',', 2, '£', 'before').number,
            exampleCurrency: formatNumber('.', ',', 2, '£', 'before').currency,
            isDefault: false,
            region: 'Europe'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNumberFormats();
  }, [toast]);

  // Régions disponibles
  const regions = ['Europe', 'Amérique du Nord', 'Amérique du Sud', 'Asie', 'Afrique', 'Océanie', 'International'];

  // Symboles de devise courants
  const currencySymbols = ['€', '$', '£', '¥', '₹', '₽', 'Fr', 'R$', 'kr', '₩'];

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  // État pour le format de nombre en cours d'édition
  const [editingNumberFormat, setEditingNumberFormat] = useState<NumberFormat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtrer les formats de nombre en fonction du terme de recherche et du filtre de région
  const filteredNumberFormats = numberFormats.filter(numberFormat => {
    const matchesSearch =
      numberFormat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      numberFormat.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = regionFilter && regionFilter !== 'all' ? numberFormat.region === regionFilter : true;

    return matchesSearch && matchesRegion;
  });

  // Gérer l'ajout ou la modification d'un format de nombre
  const handleSaveNumberFormat = async (numberFormat: NumberFormat) => {
    try {
      setLoading(true);

      // Générer les exemples
      const examples = formatNumber(
        numberFormat.decimalSeparator,
        numberFormat.thousandsSeparator,
        numberFormat.decimalPlaces,
        numberFormat.currencySymbol,
        numberFormat.currencyPosition
      );

      const updatedNumberFormat = {
        ...numberFormat,
        example: examples.number,
        exampleCurrency: examples.currency
      };

      // Convertir le format local en format API
      const apiNumberFormat = localToApiNumberFormat(updatedNumberFormat);

      if (editingNumberFormat) {
        // Mise à jour d'un format existant
        const updatedFormat = await numberFormatService.update(numberFormat.id, apiNumberFormat);

        // Si le format est défini comme par défaut, mettre à jour le statut par défaut via l'API
        if (updatedNumberFormat.isDefault && !editingNumberFormat.isDefault) {
          await numberFormatService.setDefault(numberFormat.id);
        }

        // Mettre à jour la liste locale
        const updatedLocalFormat = apiToLocalNumberFormat(updatedFormat);
        const updatedWithExamples = {
          ...updatedLocalFormat,
          example: examples.number,
          exampleCurrency: examples.currency,
          currencySymbol: numberFormat.currencySymbol,
          currencyPosition: numberFormat.currencyPosition,
          region: numberFormat.region
        };

        setNumberFormats(numberFormats.map(format =>
          format.id === numberFormat.id ? updatedWithExamples : format
        ));

        toast({
          title: 'Format de nombre mis à jour',
          description: 'Le format de nombre a été mis à jour avec succès',
          variant: 'default'
        });
      } else {
        // Ajout d'un nouveau format
        const newFormat = await numberFormatService.create(apiNumberFormat);

        // Si le format est défini comme par défaut, mettre à jour le statut par défaut via l'API
        if (updatedNumberFormat.isDefault) {
          await numberFormatService.setDefault(newFormat.id);
        }

        // Ajouter le nouveau format à la liste locale
        const newLocalFormat = apiToLocalNumberFormat(newFormat);
        const newWithExamples = {
          ...newLocalFormat,
          example: examples.number,
          exampleCurrency: examples.currency,
          currencySymbol: numberFormat.currencySymbol,
          currencyPosition: numberFormat.currencyPosition,
          region: numberFormat.region
        };

        setNumberFormats([...numberFormats, newWithExamples]);

        toast({
          title: 'Format de nombre ajouté',
          description: 'Le format de nombre a été ajouté avec succès',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du format de nombre:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le format de nombre',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
      setEditingNumberFormat(null);
    }
  };

  // Gérer la suppression d'un format de nombre
  const handleDeleteNumberFormat = async (id: string) => {
    try {
      // Vérifier si le format à supprimer est le format par défaut
      const formatToDelete = numberFormats.find(format => format.id === id);

      if (formatToDelete?.isDefault) {
        toast({
          title: 'Action impossible',
          description: 'Vous ne pouvez pas supprimer le format par défaut. Veuillez d\'abord définir un autre format comme format par défaut.',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);

      // Supprimer le format via l'API
      await numberFormatService.delete(id);

      // Mettre à jour la liste locale
      setNumberFormats(numberFormats.filter(format => format.id !== id));

      toast({
        title: 'Format de nombre supprimé',
        description: 'Le format de nombre a été supprimé avec succès',
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du format de nombre:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le format de nombre',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de format par défaut
  const handleSetDefaultNumberFormat = async (id: string) => {
    try {
      setLoading(true);

      // Définir le format comme format par défaut via l'API
      await numberFormatService.setDefault(id);

      // Mettre à jour la liste locale
      setNumberFormats(numberFormats.map(format => ({
        ...format,
        isDefault: format.id === id
      })));

      toast({
        title: 'Format par défaut mis à jour',
        description: 'Le format de nombre par défaut a été mis à jour avec succès',
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors de la définition du format par défaut:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de définir le format par défaut',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Hash className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formats de nombre</h1>
          <p className="text-muted-foreground mt-1">Gérez les formats de nombre et de devise disponibles dans l'application</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des formats de nombre</CardTitle>
            <CardDescription>Configurez les formats de nombre et leur disponibilité</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => setEditingNumberFormat(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un format
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNumberFormat ? 'Modifier le format de nombre' : 'Ajouter un format de nombre'}</DialogTitle>
                <DialogDescription>
                  {editingNumberFormat
                    ? 'Modifiez les informations du format de nombre'
                    : 'Remplissez les informations pour ajouter un nouveau format de nombre'}
                </DialogDescription>
              </DialogHeader>
              <NumberFormatForm
                numberFormat={editingNumberFormat || {
                  id: '',
                  name: '',
                  decimalSeparator: ',',
                  thousandsSeparator: ' ',
                  decimalPlaces: 2,
                  currencySymbol: '€',
                  currencyPosition: 'after',
                  example: '',
                  exampleCurrency: '',
                  isDefault: false,
                  region: 'Europe'
                }}
                regions={regions}
                currencySymbols={currencySymbols}
                formatNumber={formatNumber}
                onSave={handleSaveNumberFormat}
                onCancel={() => setIsDialogOpen(false)}
                hasDefaultFormat={numberFormats.some(format => format.isDefault)}
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
                placeholder="Rechercher un format de nombre..."
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

          {/* Tableau des formats de nombre */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Séparateurs</TableHead>
                  <TableHead>Décimales</TableHead>
                  <TableHead>Devise</TableHead>
                  <TableHead>Exemple</TableHead>
                  <TableHead>Exemple avec devise</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Par défaut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Chargement des formats de nombre...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredNumberFormats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Aucun format de nombre trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNumberFormats.map((numberFormat) => (
                  <TableRow key={numberFormat.id}>
                    <TableCell className="font-medium">{numberFormat.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {numberFormat.thousandsSeparator === ' ' ? 'espace' : numberFormat.thousandsSeparator}
                        </Badge>
                        <span>/</span>
                        <Badge variant="outline" className="text-xs">
                          {numberFormat.decimalSeparator}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{numberFormat.decimalPlaces}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {numberFormat.currencySymbol}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {numberFormat.currencyPosition === 'before' ? 'Avant' : 'Après'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">
                        {numberFormat.example}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">
                        {numberFormat.exampleCurrency}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{numberFormat.region}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch
                          checked={numberFormat.isDefault}
                          onCheckedChange={() => handleSetDefaultNumberFormat(numberFormat.id)}
                          disabled={numberFormat.isDefault}
                        />
                        {numberFormat.isDefault && (
                          <Badge variant="secondary" className="ml-2">
                            Par défaut
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingNumberFormat(numberFormat);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNumberFormat(numberFormat.id)}
                          disabled={numberFormat.isDefault}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant de formulaire pour ajouter/modifier un format de nombre
interface NumberFormatFormProps {
  numberFormat: NumberFormat;
  regions: string[];
  currencySymbols: string[];
  formatNumber: (
    decimalSeparator: string,
    thousandsSeparator: string,
    decimalPlaces: number,
    currencySymbol: string,
    currencyPosition: 'before' | 'after'
  ) => { number: string, currency: string };
  onSave: (numberFormat: NumberFormat) => void;
  onCancel: () => void;
  hasDefaultFormat: boolean;
}

const NumberFormatForm: React.FC<NumberFormatFormProps> = ({
  numberFormat,
  regions,
  currencySymbols,
  formatNumber,
  onSave,
  onCancel,
  hasDefaultFormat
}) => {
  const [formData, setFormData] = useState<NumberFormat>(numberFormat);
  const [formatPreview, setFormatPreview] = useState({
    number: numberFormat.example || '',
    currency: numberFormat.exampleCurrency || ''
  });

  // Mettre à jour l'aperçu lorsque les données du formulaire changent
  const updatePreview = (data: NumberFormat) => {
    const preview = formatNumber(
      data.decimalSeparator,
      data.thousandsSeparator,
      data.decimalPlaces,
      data.currencySymbol,
      data.currencyPosition
    );
    setFormatPreview(preview);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    updatePreview(newFormData);
  };

  const handleSelectChange = (name: string, value: string | number) => {
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    updatePreview(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      example: formatPreview.number,
      exampleCurrency: formatPreview.currency
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nom</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="col-span-3"
            placeholder="Standard français"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="decimalSeparator" className="text-right">Séparateur décimal</Label>
          <Input
            id="decimalSeparator"
            name="decimalSeparator"
            value={formData.decimalSeparator}
            onChange={handleChange}
            className="col-span-3"
            placeholder=","
            maxLength={1}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="thousandsSeparator" className="text-right">Séparateur milliers</Label>
          <Input
            id="thousandsSeparator"
            name="thousandsSeparator"
            value={formData.thousandsSeparator}
            onChange={handleChange}
            className="col-span-3"
            placeholder=" "
            maxLength={1}
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="decimalPlaces" className="text-right">Décimales</Label>
          <Input
            id="decimalPlaces"
            name="decimalPlaces"
            type="number"
            min={0}
            max={10}
            value={formData.decimalPlaces}
            onChange={(e) => handleSelectChange('decimalPlaces', parseInt(e.target.value))}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="currencySymbol" className="text-right">Symbole devise</Label>
          <Select
            value={formData.currencySymbol}
            onValueChange={(value) => handleSelectChange('currencySymbol', value)}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez un symbole" />
            </SelectTrigger>
            <SelectContent>
              {currencySymbols.map(symbol => (
                <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
              ))}
              <SelectItem value="custom">Personnalisé...</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.currencySymbol === 'custom' && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customCurrencySymbol" className="text-right">Symbole personnalisé</Label>
            <Input
              id="customCurrencySymbol"
              name="customCurrencySymbol"
              value={formData.currencySymbol === 'custom' ? '' : formData.currencySymbol}
              onChange={(e) => handleSelectChange('currencySymbol', e.target.value)}
              className="col-span-3"
              placeholder="₽"
              maxLength={3}
              required
            />
          </div>
        )}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="currencyPosition" className="text-right">Position devise</Label>
          <Select
            value={formData.currencyPosition}
            onValueChange={(value: 'before' | 'after') => handleSelectChange('currencyPosition', value)}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez une position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before">Avant le nombre</SelectItem>
              <SelectItem value="after">Après le nombre</SelectItem>
            </SelectContent>
          </Select>
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
          <Label className="text-right">Aperçu</Label>
          <div className="col-span-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Nombre :</span>
              <code className="bg-muted px-1 py-0.5 rounded">{formatPreview.number}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Avec devise :</span>
              <code className="bg-muted px-1 py-0.5 rounded">{formatPreview.currency}</code>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="isDefault" className="text-right">Par défaut</Label>
          <div className="col-span-3 flex items-center gap-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData({...formData, isDefault: checked})}
              disabled={formData.isDefault}
            />
            <span className="text-sm text-muted-foreground">
              {formData.isDefault
                ? 'Ce format est défini comme format par défaut'
                : hasDefaultFormat
                  ? 'Activer pour définir ce format comme format par défaut'
                  : 'Aucun format par défaut n\'est défini. Vous devriez activer cette option.'}
            </span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-ivory-orange hover:bg-ivory-orange/90">
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  );
};

export default NumberFormatsSettings;
