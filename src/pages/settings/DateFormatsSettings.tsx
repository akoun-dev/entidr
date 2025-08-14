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
import { Calendar, Search, Plus, Pencil, Trash2, Check, Info, Loader2, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { useToast } from '../../components/ui/use-toast';
import { dateFormatService, DateFormat as ApiDateFormat } from '../../services';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

// Types pour les formats de date
interface DateFormat {
  id: string;
  name: string;
  format: string;
  description?: string;
  type: 'date' | 'time' | 'datetime';
  is_default: boolean;
  active: boolean;
  example?: string; // Calculé localement
}

/**
 * Page des paramètres des formats de date
 * Permet de gérer les formats de date disponibles dans l'application
 */
const DateFormatsSettings: React.FC = () => {
  // Obtenir la date actuelle pour les exemples
  const currentDate = new Date();

  // Fonction pour formater une date selon un format spécifié
  const formatDate = (format: string): string => {
    try {
      // Cette fonction est simplifiée, dans une application réelle,
      // vous utiliseriez une bibliothèque comme date-fns ou moment.js
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();

      return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year.toString())
        .replace('YY', year.toString().slice(-2));
    } catch (error) {
      return 'Format invalide';
    }
  };

  // Fonction pour suggérer un format unique lorsqu'un format existe déjà
  const suggestUniqueFormat = (format: string): string => {
    // Ajouter un suffixe numérique au format
    const match = format.match(/^(.+?)(\d*)$/);
    if (match) {
      const base = match[1];
      const num = match[2] ? parseInt(match[2]) + 1 : 1;
      return `${base}${num}`;
    }
    return `${format}_1`;
  };

  // État pour les formats de date
  const [dateFormats, setDateFormats] = useState<DateFormat[]>([]);

  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast pour les notifications
  const { toast } = useToast();

  // Charger les formats de date depuis l'API
  useEffect(() => {
    const fetchDateFormats = async () => {
      try {
        const data = await dateFormatService.getAll();

        // Transformer les données pour correspondre à notre interface et ajouter l'exemple
        const transformedDateFormats = data.map(format => ({
          id: format.id,
          name: format.name,
          format: format.format,
          description: format.description,
          type: format.type,
          is_default: format.is_default,
          active: format.active,
          example: formatDate(format.format)
        }));

        setDateFormats(transformedDateFormats);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des formats de date:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les formats de date',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchDateFormats();
  }, []);

  // Types de formats disponibles
  const formatTypes = [
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Heure' },
    { value: 'datetime', label: 'Date et heure' }
  ];

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // État pour le format de date en cours d'édition
  const [editingDateFormat, setEditingDateFormat] = useState<DateFormat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // États pour la confirmation de suppression
  const [dateFormatToDelete, setDateFormatToDelete] = useState<DateFormat | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtrer les formats de date en fonction du terme de recherche et du filtre de type
  const filteredDateFormats = dateFormats.filter(dateFormat => {
    const matchesSearch =
      dateFormat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dateFormat.format.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter && typeFilter !== 'all' ? dateFormat.type === typeFilter : true;

    return matchesSearch && matchesType;
  });

  // Gérer l'ajout ou la modification d'un format de date
  const handleSaveDateFormat = async (dateFormat: DateFormat) => {
    setSaving(true);

    try {
      // Ajouter l'exemple calculé
      const updatedDateFormat = {
        ...dateFormat,
        example: formatDate(dateFormat.format)
      };

      if (editingDateFormat) {
        // Mise à jour d'un format existant
        // Assurons-nous que tous les champs requis sont présents et du bon type
        const apiFormat = {
          name: updatedDateFormat.name,
          format: updatedDateFormat.format,
          description: updatedDateFormat.description || '',
          type: updatedDateFormat.type || 'date',
          is_default: Boolean(updatedDateFormat.is_default),
          active: updatedDateFormat.active !== undefined ? Boolean(updatedDateFormat.active) : true
        };


        const updatedFormat = await dateFormatService.update(updatedDateFormat.id, apiFormat);

        // Transformer les données pour correspondre à notre interface et ajouter l'exemple
        const transformedFormat = {
          id: updatedFormat.id,
          name: updatedFormat.name,
          format: updatedFormat.format,
          description: updatedFormat.description,
          type: updatedFormat.type,
          is_default: updatedFormat.is_default,
          active: updatedFormat.active,
          example: formatDate(updatedFormat.format)
        };

        // Si le format a été défini comme par défaut, recharger tous les formats
        // car d'autres formats ont pu être modifiés côté serveur
        if (updatedDateFormat.is_default && !editingDateFormat.is_default) {
          const allFormats = await dateFormatService.getAll();
          const transformedFormats = allFormats.map(format => ({
            id: format.id,
            name: format.name,
            format: format.format,
            description: format.description,
            type: format.type,
            is_default: format.is_default,
            active: format.active,
            example: formatDate(format.format)
          }));

          setDateFormats(transformedFormats);
        } else {
          // Sinon, mettre à jour uniquement le format modifié
          setDateFormats(dateFormats.map(format =>
            format.id === transformedFormat.id ? transformedFormat : format
          ));
        }

        toast({
          title: 'Succès',
          description: 'Le format de date a été mis à jour avec succès',
          variant: 'default'
        });
      } else {
        // Ajout d'un nouveau format
        // Assurons-nous que tous les champs requis sont présents et du bon type
        const apiFormat = {
          name: updatedDateFormat.name,
          format: updatedDateFormat.format,
          description: updatedDateFormat.description || '',
          type: updatedDateFormat.type || 'date',
          is_default: Boolean(updatedDateFormat.is_default),
          active: updatedDateFormat.active !== undefined ? Boolean(updatedDateFormat.active) : true
        };


        const newFormat = await dateFormatService.create(apiFormat);

        // Transformer les données pour correspondre à notre interface et ajouter l'exemple
        const transformedFormat = {
          id: newFormat.id,
          name: newFormat.name,
          format: newFormat.format,
          description: newFormat.description,
          type: newFormat.type,
          is_default: newFormat.is_default,
          active: newFormat.active,
          example: formatDate(newFormat.format)
        };

        // Si le nouveau format est défini comme par défaut, recharger tous les formats
        if (transformedFormat.is_default) {
          const allFormats = await dateFormatService.getAll();
          const transformedFormats = allFormats.map(format => ({
            id: format.id,
            name: format.name,
            format: format.format,
            description: format.description,
            type: format.type,
            is_default: format.is_default,
            active: format.active,
            example: formatDate(format.format)
          }));

          setDateFormats(transformedFormats);
        } else {
          // Sinon, ajouter simplement le nouveau format
          setDateFormats([...dateFormats, transformedFormat]);
        }

        toast({
          title: 'Succès',
          description: 'Le format de date a été ajouté avec succès',
          variant: 'default'
        });
      }

      setIsDialogOpen(false);
      setEditingDateFormat(null);
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement du format de date:', error);

      // Vérifier si nous avons un message d'erreur spécifique du serveur
      let errorMessage = 'Impossible d\'enregistrer le format de date';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;

        // Si l'erreur indique que le format existe déjà, suggérer un format unique
        if (errorMessage.includes('existe déjà') && !editingDateFormat) {
          const uniqueFormat = suggestUniqueFormat(dateFormat.format);
          const uniqueName = `${dateFormat.name} (variante)`;

          toast({
            title: 'Format déjà existant',
            description: `Le format "${dateFormat.format}" existe déjà. Voulez-vous essayer avec "${uniqueFormat}" ?`,
            variant: 'destructive',
            action: (
              <Button
                variant="outline"
                onClick={() => {
                  // Créer un nouveau format avec le format unique suggéré
                  handleSaveDateFormat({
                    ...dateFormat,
                    name: uniqueName,
                    format: uniqueFormat
                  });
                }}
              >
                Utiliser ce format
              </Button>
            )
          });
          return;
        }
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (dateFormat: DateFormat) => {
    // Vérifier si le format à supprimer est le format par défaut
    if (dateFormat.is_default) {
      toast({
        title: 'Action impossible',
        description: 'Vous ne pouvez pas supprimer le format par défaut. Veuillez d\'abord définir un autre format comme format par défaut.',
        variant: 'destructive'
      });
      return;
    }

    setDateFormatToDelete(dateFormat);
    setIsDeleteDialogOpen(true);
  };

  // Gérer la suppression d'un format de date
  const handleDeleteDateFormat = async () => {
    if (!dateFormatToDelete) return;

    setIsDeleting(true);

    try {
      await dateFormatService.delete(dateFormatToDelete.id);

      setDateFormats(dateFormats.filter(format => format.id !== dateFormatToDelete.id));

      toast({
        title: 'Succès',
        description: 'Le format de date a été supprimé avec succès',
        variant: 'default'
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setDateFormatToDelete(null);
    } catch (error: any) {
      console.error('Erreur lors de la suppression du format de date:', error);

      // Vérifier si nous avons un message d'erreur spécifique du serveur
      let errorMessage = 'Impossible de supprimer le format de date';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Gérer le changement de format par défaut
  const handleSetDefaultDateFormat = async (id: string) => {
    try {
      const updatedFormat = await dateFormatService.setDefault(id);

      // Recharger tous les formats car plusieurs ont pu être modifiés
      const allFormats = await dateFormatService.getAll();
      const transformedFormats = allFormats.map(format => ({
        id: format.id,
        name: format.name,
        format: format.format,
        description: format.description,
        type: format.type,
        is_default: format.is_default,
        active: format.active,
        example: formatDate(format.format)
      }));

      setDateFormats(transformedFormats);

      toast({
        title: 'Succès',
        description: `Le format ${updatedFormat.name} a été défini comme format par défaut`,
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Erreur lors du changement de format par défaut:', error);

      // Vérifier si nous avons un message d'erreur spécifique du serveur
      let errorMessage = 'Impossible de changer le format par défaut';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formats de date</h1>
          <p className="text-muted-foreground mt-1">Gérez les formats de date disponibles dans l'application</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des formats de date</CardTitle>
            <CardDescription>Configurez les formats de date et leur disponibilité</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => setEditingDateFormat(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un format
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDateFormat ? 'Modifier le format de date' : 'Ajouter un format de date'}</DialogTitle>
                <DialogDescription>
                  {editingDateFormat
                    ? 'Modifiez les informations du format de date'
                    : 'Remplissez les informations pour ajouter un nouveau format de date'}
                </DialogDescription>
              </DialogHeader>
              <DateFormatForm
                dateFormat={editingDateFormat || {
                  id: '',
                  name: '',
                  format: '',
                  description: '',
                  type: 'date' as 'date' | 'time' | 'datetime',
                  is_default: false,
                  active: true,
                  example: ''
                }}
                formatDate={formatDate}
                onSave={handleSaveDateFormat}
                onCancel={() => setIsDialogOpen(false)}
                hasDefaultFormat={dateFormats.some(format => format.is_default)}
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
                placeholder="Rechercher un format de date..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {formatTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tableau des formats de date */}
          <div className="rounded-md border">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Exemple</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Par défaut</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDateFormats.length > 0 ? (
                    filteredDateFormats.map((dateFormat) => (
                      <TableRow key={dateFormat.id}>
                        <TableCell className="font-medium">{dateFormat.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-1 py-0.5 rounded text-sm">{dateFormat.format}</code>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>DD = Jour, MM = Mois, YYYY = Année (4 chiffres), YY = Année (2 chiffres)</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>{dateFormat.example}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {dateFormat.type === 'date' ? 'Date' :
                             dateFormat.type === 'time' ? 'Heure' : 'Date et heure'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch
                              checked={dateFormat.is_default}
                              onCheckedChange={() => handleSetDefaultDateFormat(dateFormat.id)}
                              disabled={dateFormat.is_default}
                            />
                            {dateFormat.is_default && (
                              <Badge variant="secondary" className="ml-2">
                                Par défaut
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              dateFormat.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {dateFormat.active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingDateFormat(dateFormat);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(dateFormat)}
                              disabled={dateFormat.is_default}
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
                        {searchTerm || typeFilter ? 'Aucun format de date trouvé pour cette recherche' : 'Aucun format de date disponible'}
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
        title="Supprimer le format de date"
        description="Êtes-vous sûr de vouloir supprimer ce format de date ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<AlertTriangle className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteDateFormat}
      >
        {dateFormatToDelete && (
          <div>
            <p className="font-medium">{dateFormatToDelete.name}</p>
            <p className="text-sm text-muted-foreground">
              Format: <code className="bg-muted px-1 py-0.5 rounded text-sm">{dateFormatToDelete.format}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Exemple: {dateFormatToDelete.example}
            </p>
            <p className="text-sm text-muted-foreground">
              Type: <Badge variant="outline">
                {dateFormatToDelete.type === 'date' ? 'Date' :
                 dateFormatToDelete.type === 'time' ? 'Heure' : 'Date et heure'}
              </Badge>
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

// Composant de formulaire pour ajouter/modifier un format de date
interface DateFormatFormProps {
  dateFormat: DateFormat;
  formatDate: (format: string) => string;
  onSave: (dateFormat: DateFormat) => void;
  onCancel: () => void;
  hasDefaultFormat: boolean;
  saving?: boolean;
}

const DateFormatForm: React.FC<DateFormatFormProps> = ({
  dateFormat,
  formatDate,
  onSave,
  onCancel,
  hasDefaultFormat,
  saving = false
}) => {
  const [formData, setFormData] = useState<DateFormat>(dateFormat);
  const [formatPreview, setFormatPreview] = useState(dateFormat.example || formatDate(dateFormat.format));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'format') {
      setFormatPreview(formatDate(value));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
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
            placeholder="Standard français"
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
              placeholder="DD/MM/YYYY"
              required
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Exemple :</span>
              <code className="bg-muted px-1 py-0.5 rounded">{formatPreview}</code>
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisez DD pour le jour, MM pour le mois, YYYY pour l'année (4 chiffres), YY pour l'année (2 chiffres)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="col-span-3"
            placeholder="Description du format"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange('type', value as 'date' | 'time' | 'datetime')}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="time">Heure</SelectItem>
              <SelectItem value="datetime">Date et heure</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="is_default" className="text-right">Par défaut</Label>
          <div className="col-span-3 flex items-center gap-2">
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
              disabled={formData.is_default}
            />
            <span className="text-sm text-muted-foreground">
              {formData.is_default
                ? 'Ce format est défini comme format par défaut'
                : hasDefaultFormat
                  ? 'Activer pour définir ce format comme format par défaut'
                  : 'Aucun format par défaut n\'est défini. Vous devriez activer cette option.'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="active" className="text-right">Actif</Label>
          <div className="col-span-3 flex items-center gap-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({...formData, active: checked})}
              disabled={formData.is_default && formData.active}
            />
            <span className="text-sm text-muted-foreground">
              {formData.active
                ? 'Ce format est actif et disponible pour les utilisateurs'
                : 'Ce format est inactif et n\'est pas disponible pour les utilisateurs'}
            </span>
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

export default DateFormatsSettings;
