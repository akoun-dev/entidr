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
import { Clock, Search, Plus, Pencil, Trash2, Check, Info, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { useToast } from '../../components/ui/use-toast';
import { timeFormatService, type TimeFormat as ApiTimeFormat } from '../../services';

// Types pour les formats d'heure
interface TimeFormat {
  id: string;
  name: string;
  format: string;
  example: string;
  isDefault: boolean;
  region: string;
  uses24Hour: boolean;
}

// Fonction pour convertir le format d'API en format local
const apiToLocalTimeFormat = (apiFormat: ApiTimeFormat): TimeFormat => ({
  id: apiFormat.id,
  name: apiFormat.name,
  format: apiFormat.format,
  example: apiFormat.example,
  isDefault: apiFormat.is_default,
  region: apiFormat.region,
  uses24Hour: apiFormat.uses_24_hour
});

// Fonction pour convertir le format local en format d'API
const localToApiTimeFormat = (localFormat: TimeFormat): Omit<ApiTimeFormat, 'id'> => ({
  name: localFormat.name,
  format: localFormat.format,
  example: localFormat.example,
  is_default: localFormat.isDefault,
  region: localFormat.region,
  uses_24_hour: localFormat.uses24Hour,
  active: true
});

/**
 * Page des paramètres des formats d'heure
 * Permet de gérer les formats d'heure disponibles dans l'application
 */
const TimeFormatsSettings: React.FC = () => {
  const { toast } = useToast();

  // Obtenir l'heure actuelle pour les exemples
  const currentTime = new Date();

  // État pour le chargement
  const [loading, setLoading] = useState(true);

  // Fonction pour formater une heure selon un format spécifié
  const formatTime = (format: string, uses24Hour: boolean): string => {
    try {
      // Cette fonction est simplifiée, dans une application réelle,
      // vous utiliseriez une bibliothèque comme date-fns ou moment.js
      const hours24 = currentTime.getHours();
      const hours12 = hours24 % 12 || 12;
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      const seconds = currentTime.getSeconds().toString().padStart(2, '0');
      const ampm = hours24 >= 12 ? 'PM' : 'AM';

      const hours = uses24Hour ? hours24.toString().padStart(2, '0') : hours12.toString();

      return format
        .replace('HH', hours.padStart(2, '0'))
        .replace('H', hours)
        .replace('mm', minutes)
        .replace('m', parseInt(minutes).toString())
        .replace('ss', seconds)
        .replace('s', parseInt(seconds).toString())
        .replace('a', ampm);
    } catch (error) {
      return 'Format invalide';
    }
  };

  // État pour les formats d'heure
  const [timeFormats, setTimeFormats] = useState<TimeFormat[]>([]);

  // Charger les formats d'heure depuis l'API
  useEffect(() => {
    const fetchTimeFormats = async () => {
      try {
        setLoading(true);
        const apiFormats = await timeFormatService.getAll();
        setTimeFormats(apiFormats.map(apiToLocalTimeFormat));
      } catch (error) {
        console.error('Erreur lors du chargement des formats d\'heure:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les formats d\'heure',
          variant: 'destructive'
        });
        // Charger des données par défaut en cas d'erreur
        setTimeFormats([
          {
            id: '1',
            name: '24 heures avec secondes',
            format: 'HH:mm:ss',
            example: formatTime('HH:mm:ss', true),
            isDefault: true,
            region: 'Europe',
            uses24Hour: true
          },
          {
            id: '2',
            name: '24 heures sans secondes',
            format: 'HH:mm',
            example: formatTime('HH:mm', true),
            isDefault: false,
            region: 'Europe',
            uses24Hour: true
          },
          {
            id: '3',
            name: '12 heures avec AM/PM',
            format: 'HH:mm a',
            example: formatTime('HH:mm a', false),
            isDefault: false,
            region: 'Amérique du Nord',
            uses24Hour: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeFormats();
  }, [toast]);

  // Régions disponibles
  const regions = ['Europe', 'Amérique du Nord', 'Amérique du Sud', 'Asie', 'Afrique', 'Océanie', 'International'];

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  // État pour le format d'heure en cours d'édition
  const [editingTimeFormat, setEditingTimeFormat] = useState<TimeFormat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtrer les formats d'heure en fonction du terme de recherche et du filtre de région
  const filteredTimeFormats = timeFormats.filter(timeFormat => {
    const matchesSearch =
      timeFormat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timeFormat.format.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = regionFilter && regionFilter !== 'all' ? timeFormat.region === regionFilter : true;

    return matchesSearch && matchesRegion;
  });

  // Gérer l'ajout ou la modification d'un format d'heure
  const handleSaveTimeFormat = async (timeFormat: TimeFormat) => {
    try {
      setLoading(true);

      // Préparer le format d'heure avec l'exemple mis à jour
      const updatedTimeFormat = {
        ...timeFormat,
        example: formatTime(timeFormat.format, timeFormat.uses24Hour)
      };

      // Convertir le format local en format API
      const apiTimeFormat = localToApiTimeFormat(updatedTimeFormat);

      if (editingTimeFormat) {
        // Mise à jour d'un format existant
        const updatedFormat = await timeFormatService.update(timeFormat.id, apiTimeFormat);

        // Si le format est défini comme par défaut, mettre à jour la liste locale
        if (updatedTimeFormat.isDefault && !editingTimeFormat.isDefault) {
          // Mettre à jour le statut par défaut via l'API
          await timeFormatService.setDefault(timeFormat.id);
        }

        // Mettre à jour la liste locale
        setTimeFormats(timeFormats.map(format =>
          format.id === timeFormat.id ? apiToLocalTimeFormat(updatedFormat) : format
        ));

        toast({
          title: 'Format d\'heure mis à jour',
          description: 'Le format d\'heure a été mis à jour avec succès',
          variant: 'default'
        });
      } else {
        // Ajout d'un nouveau format
        const newFormat = await timeFormatService.create(apiTimeFormat);

        // Si le format est défini comme par défaut, mettre à jour le statut par défaut via l'API
        if (updatedTimeFormat.isDefault) {
          await timeFormatService.setDefault(newFormat.id);
        }

        // Ajouter le nouveau format à la liste locale
        setTimeFormats([...timeFormats, apiToLocalTimeFormat(newFormat)]);

        toast({
          title: 'Format d\'heure ajouté',
          description: 'Le format d\'heure a été ajouté avec succès',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du format d\'heure:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le format d\'heure',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
      setEditingTimeFormat(null);
    }
  };

  // Gérer la suppression d'un format d'heure
  const handleDeleteTimeFormat = async (id: string) => {
    try {
      // Vérifier si le format à supprimer est le format par défaut
      const formatToDelete = timeFormats.find(format => format.id === id);

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
      await timeFormatService.delete(id);

      // Mettre à jour la liste locale
      setTimeFormats(timeFormats.filter(format => format.id !== id));

      toast({
        title: 'Format d\'heure supprimé',
        description: 'Le format d\'heure a été supprimé avec succès',
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du format d\'heure:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le format d\'heure',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de format par défaut
  const handleSetDefaultTimeFormat = async (id: string) => {
    try {
      setLoading(true);

      // Définir le format comme format par défaut via l'API
      await timeFormatService.setDefault(id);

      // Mettre à jour la liste locale
      setTimeFormats(timeFormats.map(format => ({
        ...format,
        isDefault: format.id === id
      })));

      toast({
        title: 'Format par défaut mis à jour',
        description: 'Le format d\'heure par défaut a été mis à jour avec succès',
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
        <Clock className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formats d'heure</h1>
          <p className="text-muted-foreground mt-1">Gérez les formats d'heure disponibles dans l'application</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des formats d'heure</CardTitle>
            <CardDescription>Configurez les formats d'heure et leur disponibilité</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => setEditingTimeFormat(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un format
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTimeFormat ? 'Modifier le format d\'heure' : 'Ajouter un format d\'heure'}</DialogTitle>
                <DialogDescription>
                  {editingTimeFormat
                    ? 'Modifiez les informations du format d\'heure'
                    : 'Remplissez les informations pour ajouter un nouveau format d\'heure'}
                </DialogDescription>
              </DialogHeader>
              <TimeFormatForm
                timeFormat={editingTimeFormat || {
                  id: '',
                  name: '',
                  format: '',
                  example: '',
                  isDefault: false,
                  region: 'Europe',
                  uses24Hour: true
                }}
                regions={regions}
                formatTime={formatTime}
                onSave={handleSaveTimeFormat}
                onCancel={() => setIsDialogOpen(false)}
                hasDefaultFormat={timeFormats.some(format => format.isDefault)}
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
                placeholder="Rechercher un format d'heure..."
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

          {/* Tableau des formats d'heure */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Exemple</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Par défaut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Chargement des formats d'heure...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTimeFormats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Aucun format d'heure trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTimeFormats.map((timeFormat) => (
                  <TableRow key={timeFormat.id}>
                    <TableCell className="font-medium">{timeFormat.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-1 py-0.5 rounded text-sm">{timeFormat.format}</code>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>HH = Heures, mm = Minutes, ss = Secondes, a = AM/PM</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>{timeFormat.example}</TableCell>
                    <TableCell>
                      <Badge variant={timeFormat.uses24Hour ? "default" : "secondary"}>
                        {timeFormat.uses24Hour ? '24 heures' : '12 heures'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{timeFormat.region}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch
                          checked={timeFormat.isDefault}
                          onCheckedChange={() => handleSetDefaultTimeFormat(timeFormat.id)}
                          disabled={timeFormat.isDefault}
                        />
                        {timeFormat.isDefault && (
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
                            setEditingTimeFormat(timeFormat);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTimeFormat(timeFormat.id)}
                          disabled={timeFormat.isDefault}
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

// Composant de formulaire pour ajouter/modifier un format d'heure
interface TimeFormatFormProps {
  timeFormat: TimeFormat;
  regions: string[];
  formatTime: (format: string, uses24Hour: boolean) => string;
  onSave: (timeFormat: TimeFormat) => void;
  onCancel: () => void;
  hasDefaultFormat: boolean;
}

const TimeFormatForm: React.FC<TimeFormatFormProps> = ({
  timeFormat,
  regions,
  formatTime,
  onSave,
  onCancel,
  hasDefaultFormat
}) => {
  const [formData, setFormData] = useState<TimeFormat>(timeFormat);
  const [formatPreview, setFormatPreview] = useState(timeFormat.example || formatTime(timeFormat.format, timeFormat.uses24Hour));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'format') {
      setFormatPreview(formatTime(value, formData.uses24Hour));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUses24HourChange = (checked: boolean) => {
    const newFormData = {
      ...formData,
      uses24Hour: checked
    };
    setFormData(newFormData);
    setFormatPreview(formatTime(formData.format, checked));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      example: formatPreview
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
            placeholder="24 heures avec secondes"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="format" className="text-right">Format</Label>
          <div className="col-span-3 space-y-2">
            <Input
              id="format"
              name="format"
              value={formData.format}
              onChange={handleChange}
              placeholder="HH:mm:ss"
              required
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Exemple :</span>
              <code className="bg-muted px-1 py-0.5 rounded">{formatPreview}</code>
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisez HH pour les heures, mm pour les minutes, ss pour les secondes, a pour AM/PM
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="uses24Hour" className="text-right">Format 24h</Label>
          <div className="col-span-3 flex items-center gap-2">
            <Switch
              id="uses24Hour"
              checked={formData.uses24Hour}
              onCheckedChange={handleUses24HourChange}
            />
            <span className="text-sm text-muted-foreground">
              {formData.uses24Hour
                ? 'Utilise le format 24 heures'
                : 'Utilise le format 12 heures (AM/PM)'}
            </span>
          </div>
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

export default TimeFormatsSettings;
