import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Search, Plus, Pencil, Trash2, Loader2, Languages, FileX } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { translationService, type Translation } from '../../services';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

/**
 * Page des paramètres des traductions
 * Permet de gérer les traductions de l'application
 */
const TranslationsSettings: React.FC = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // États pour la confirmation de suppression
  const [translationToDelete, setTranslationToDelete] = useState<Translation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les traductions
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const translationsData = await translationService.getAll();
        setTranslations(translationsData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des traductions:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les traductions',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  // Filtrer les traductions
  const filteredTranslations = translations.filter(translation =>
    translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.locale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.namespace.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer l'enregistrement
  const handleSaveTranslation = async (translation: Translation) => {
    setSaving(true);
    try {
      if (editingTranslation) {
        // Mise à jour
        const updated = await translationService.update(translation.id, translation);
        setTranslations(translations.map(t => t.id === updated.id ? updated : t));
        toast({
          title: 'Succès',
          description: 'Traduction mise à jour',
          variant: 'default'
        });
      } else {
        // Création
        const created = await translationService.create(translation);
        setTranslations([...translations, created]);
        toast({
          title: 'Succès',
          description: 'Traduction créée',
          variant: 'default'
        });
      }
      setIsDialogOpen(false);
      setEditingTranslation(null);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de l\'enregistrement',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (translation: Translation) => {
    setTranslationToDelete(translation);
    setIsDeleteDialogOpen(true);
  };

  // Gérer la suppression
  const handleDeleteTranslation = async () => {
    if (!translationToDelete) return;

    setIsDeleting(true);

    try {
      await translationService.delete(translationToDelete.id);
      setTranslations(translations.filter(t => t.id !== translationToDelete.id));

      toast({
        title: 'Succès',
        description: 'Traduction supprimée',
        variant: 'default'
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setTranslationToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la suppression',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Gérer l'activation/désactivation
  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await translationService.toggleStatus(id);
      setTranslations(translations.map(t =>
        t.id === id ? updated : t
      ));
      toast({
        title: 'Succès',
        description: `Traduction ${updated.active ? 'activée' : 'désactivée'}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: 'Erreur',
        description: 'Échec du changement de statut',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Languages className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traductions</h1>
          <p className="text-muted-foreground mt-1">Gérez les traductions de l'application</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des traductions</CardTitle>
            <CardDescription>Gérez les textes traduits dans différentes langues</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => setEditingTranslation(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une traduction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTranslation ? 'Modifier la traduction' : 'Ajouter une traduction'}
                </DialogTitle>
                <DialogDescription>
                  {editingTranslation
                    ? 'Modifiez les détails de la traduction'
                    : 'Remplissez les champs pour ajouter une nouvelle traduction'}
                </DialogDescription>
              </DialogHeader>
              <TranslationForm
                translation={editingTranslation || {
                  id: '',
                  key: '',
                  locale: 'fr',
                  namespace: 'common',
                  value: '',
                  is_default: false,
                  active: true
                }}
                onSave={handleSaveTranslation}
                onCancel={() => setIsDialogOpen(false)}
                saving={saving}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une traduction..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tableau des traductions */}
          <div className="rounded-md border">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clé</TableHead>
                    <TableHead>Locale</TableHead>
                    <TableHead>Namespace</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.length > 0 ? (
                    filteredTranslations.map((translation) => (
                      <TableRow key={translation.id}>
                        <TableCell className="font-medium">{translation.key}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{translation.locale}</Badge>
                        </TableCell>
                        <TableCell>{translation.namespace}</TableCell>
                        <TableCell className="max-w-xs truncate">{translation.value}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={translation.active}
                              onCheckedChange={() => handleToggleStatus(translation.id)}
                            />
                            <Badge variant={translation.active ? 'default' : 'secondary'}>
                              {translation.active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingTranslation(translation);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(translation)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        {searchTerm ? 'Aucune traduction trouvée' : 'Aucune traduction disponible'}
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
        title="Supprimer la traduction"
        description="Êtes-vous sûr de vouloir supprimer cette traduction ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<FileX className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteTranslation}
      >
        {translationToDelete && (
          <div>
            <p className="font-medium">Clé: {translationToDelete.key}</p>
            <p className="text-sm text-muted-foreground">
              Locale: <Badge variant="outline">{translationToDelete.locale}</Badge> |
              Namespace: {translationToDelete.namespace}
            </p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              "{translationToDelete.value}"
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

// Composant de formulaire pour les traductions
interface TranslationFormProps {
  translation: Translation;
  onSave: (translation: Translation) => void;
  onCancel: () => void;
  saving: boolean;
}

const TranslationForm: React.FC<TranslationFormProps> = ({
  translation,
  onSave,
  onCancel,
  saving
}) => {
  const [formData, setFormData] = useState<Translation>(translation);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        {/* Clé */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="key" className="text-right">Clé</Label>
          <Input
            id="key"
            name="key"
            value={formData.key}
            onChange={handleChange}
            className="col-span-3"
            required
          />
        </div>

        {/* Locale */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="locale" className="text-right">Locale</Label>
          <Input
            id="locale"
            name="locale"
            value={formData.locale}
            onChange={handleChange}
            className="col-span-3"
            required
          />
        </div>

        {/* Namespace */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="namespace" className="text-right">Namespace</Label>
          <Input
            id="namespace"
            name="namespace"
            value={formData.namespace}
            onChange={handleChange}
            className="col-span-3"
            required
          />
        </div>

        {/* Valeur */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="value" className="text-right">Valeur</Label>
          <textarea
            id="value"
            name="value"
            value={formData.value}
            onChange={handleChange}
            className="col-span-3 border rounded-md p-2 min-h-[100px]"
            required
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Options</Label>
          <div className="col-span-3 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) =>
                setFormData({...formData, is_default: Boolean(checked)})
              }
            />
            <Label htmlFor="is_default">Par défaut</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({...formData, active: Boolean(checked)})
                }
              />
              <Label htmlFor="active">Actif</Label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
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
          ) : 'Enregistrer'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default TranslationsSettings;
