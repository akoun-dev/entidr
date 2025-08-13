import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Languages, Search, Plus, Pencil, Trash2, Check, Globe, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { languageService, Language as ApiLanguage } from '../../services';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { CountrySelector } from '../../components/selectors';
import { useCountries } from '../../hooks/useReferenceData';

// Types pour les langues
interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_default: boolean;
  active: boolean;
  countries?: string[]; // IDs des pays où cette langue est parlée
}

/**
 * Page des paramètres des langues
 * Permet de gérer les langues disponibles dans l'application
 */
const LanguagesSettings: React.FC = () => {
  // État pour les langues
  const [languages, setLanguages] = useState<Language[]>([]);

  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast pour les notifications
  const { toast } = useToast();

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');

  // État pour la langue en cours d'édition
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // États pour la confirmation de suppression
  const [languageToDelete, setLanguageToDelete] = useState<Language | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les langues depuis l'API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data = await languageService.getAll();

        // Transformer les données pour correspondre à notre interface
        const transformedLanguages = data.map(language => ({
          id: language.id,
          code: language.code,
          name: language.name,
          native_name: language.native_name || '',
          direction: language.direction,
          is_default: language.is_default,
          active: language.active
        }));

        setLanguages(transformedLanguages);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des langues:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les langues',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Filtrer les langues en fonction du terme de recherche
  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    language.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (language.native_name && language.native_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Gérer l'ajout ou la modification d'une langue
  const handleSaveLanguage = async (language: Language) => {
    setSaving(true);

    try {
      if (editingLanguage) {
        // Mise à jour d'une langue existante
        const updatedLanguage = await languageService.update(language.id, language);

        // Transformer les données pour correspondre à notre interface
        const transformedLanguage = {
          id: updatedLanguage.id,
          code: updatedLanguage.code,
          name: updatedLanguage.name,
          native_name: updatedLanguage.native_name || '',
          direction: updatedLanguage.direction,
          is_default: updatedLanguage.is_default,
          active: updatedLanguage.active
        };

        setLanguages(languages.map(l => l.id === language.id ? transformedLanguage : l));

        toast({
          title: 'Succès',
          description: 'La langue a été mise à jour avec succès',
          variant: 'default'
        });
      } else {
        // Ajout d'une nouvelle langue
        const newLanguage = await languageService.create(language);

        // Transformer les données pour correspondre à notre interface
        const transformedLanguage = {
          id: newLanguage.id,
          code: newLanguage.code,
          name: newLanguage.name,
          native_name: newLanguage.native_name || '',
          direction: newLanguage.direction,
          is_default: newLanguage.is_default,
          active: newLanguage.active
        };

        setLanguages([...languages, transformedLanguage]);

        toast({
          title: 'Succès',
          description: 'La langue a été ajoutée avec succès',
          variant: 'default'
        });
      }

      setIsDialogOpen(false);
      setEditingLanguage(null);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la langue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la langue',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (language: Language) => {
    setLanguageToDelete(language);
    setIsDeleteDialogOpen(true);
  };

  // Gérer la suppression d'une langue
  const handleDeleteLanguage = async () => {
    if (!languageToDelete) return;

    setIsDeleting(true);

    try {
      await languageService.delete(languageToDelete.id);

      setLanguages(languages.filter(l => l.id !== languageToDelete.id));

      toast({
        title: 'Succès',
        description: 'La langue a été supprimée avec succès',
        variant: 'default'
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setLanguageToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la langue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la langue',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Gérer l'activation/désactivation d'une langue
  const handleToggleLanguageStatus = async (id: string) => {
    try {
      const updatedLanguage = await languageService.toggleStatus(id);

      // Transformer les données pour correspondre à notre interface
      const transformedLanguage = {
        id: updatedLanguage.id,
        code: updatedLanguage.code,
        name: updatedLanguage.name,
        native_name: updatedLanguage.native_name || '',
        direction: updatedLanguage.direction,
        is_default: updatedLanguage.is_default,
        active: updatedLanguage.active
      };

      setLanguages(languages.map(language =>
        language.id === id ? transformedLanguage : language
      ));

      toast({
        title: 'Succès',
        description: `La langue a été ${transformedLanguage.active ? 'activée' : 'désactivée'} avec succès`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut de la langue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le statut de la langue',
        variant: 'destructive'
      });
    }
  };

  // Gérer le changement de langue par défaut
  const handleSetDefaultLanguage = async (id: string) => {
    try {
      const updatedLanguage = await languageService.setDefault(id);

      // Mettre à jour toutes les langues pour refléter le changement de langue par défaut
      const updatedLanguages = await languageService.getAll();

      // Transformer les données pour correspondre à notre interface
      const transformedLanguages = updatedLanguages.map(language => ({
        id: language.id,
        code: language.code,
        name: language.name,
        native_name: language.native_name || '',
        direction: language.direction,
        is_default: language.is_default,
        active: language.active
      }));

      setLanguages(transformedLanguages);

      toast({
        title: 'Succès',
        description: `La langue ${updatedLanguage.name} a été définie comme langue par défaut`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors du changement de langue par défaut:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de changer la langue par défaut',
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
          <h1 className="text-3xl font-bold tracking-tight">Langues</h1>
          <p className="text-muted-foreground mt-1">Gérez les langues disponibles dans l'application</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des langues</CardTitle>
            <CardDescription>Configurez les langues et leur disponibilité</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => setEditingLanguage(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une langue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLanguage ? 'Modifier la langue' : 'Ajouter une langue'}</DialogTitle>
                <DialogDescription>
                  {editingLanguage
                    ? 'Modifiez les informations de la langue'
                    : 'Remplissez les informations pour ajouter une nouvelle langue'}
                </DialogDescription>
              </DialogHeader>
              <LanguageForm
                language={editingLanguage || {
                  id: '',
                  code: '',
                  name: '',
                  native_name: '',
                  direction: 'ltr',
                  is_default: false,
                  active: true
                }}
                onSave={handleSaveLanguage}
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
              placeholder="Rechercher une langue..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tableau des langues */}
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
                    <TableHead>Nom natif</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Par défaut</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((language) => (
                      <TableRow key={language.id}>
                        <TableCell className="font-medium">{language.code}</TableCell>
                        <TableCell>{language.name}</TableCell>
                        <TableCell>{language.native_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {language.direction === 'rtl' ? 'Droite à gauche' : 'Gauche à droite'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={language.is_default}
                            onCheckedChange={() => handleSetDefaultLanguage(language.id)}
                            disabled={language.is_default || !language.active}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={language.active}
                              onCheckedChange={() => handleToggleLanguageStatus(language.id)}
                              disabled={language.is_default}
                            />
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              language.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {language.active ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingLanguage(language);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(language)}
                              disabled={language.is_default}
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
                        {searchTerm ? 'Aucune langue trouvée pour cette recherche' : 'Aucune langue disponible'}
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
        title="Supprimer la langue"
        description="Êtes-vous sûr de vouloir supprimer cette langue ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<AlertTriangle className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteLanguage}
      >
        {languageToDelete && (
          <div>
            <p className="font-medium">{languageToDelete.name} ({languageToDelete.code})</p>
            <p className="text-sm text-muted-foreground">
              Nom natif: {languageToDelete.native_name || 'Non spécifié'}
            </p>
            <p className="text-sm text-muted-foreground">
              Direction: <Badge variant="outline">
                {languageToDelete.direction === 'rtl' ? 'Droite à gauche' : 'Gauche à droite'}
              </Badge>
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

// Composant de formulaire pour ajouter/modifier une langue
interface LanguageFormProps {
  language: Language;
  onSave: (language: Language) => void;
  onCancel: () => void;
  saving?: boolean;
}

const LanguageForm: React.FC<LanguageFormProps> = ({ language, onSave, onCancel, saving = false }) => {
  const [formData, setFormData] = useState<Language>({
    ...language,
    countries: language.countries || []
  });

  // Utiliser le hook useCountries pour récupérer les pays
  const { data: countries, loading: loadingCountries } = useCountries();

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

  // Gérer les changements de pays associés
  const handleCountryChange = (countryId: string) => {
    setFormData(prev => {
      const currentCountries = [...(prev.countries || [])];
      if (currentCountries.includes(countryId)) {
        return { ...prev, countries: currentCountries.filter(id => id !== countryId) };
      } else {
        return { ...prev, countries: [...currentCountries, countryId] };
      }
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
            placeholder="fr-FR"
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
            placeholder="Français"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="native_name" className="text-right">Nom natif</Label>
          <Input
            id="native_name"
            name="native_name"
            value={formData.native_name}
            onChange={handleChange}
            className="col-span-3"
            placeholder="Français"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="direction" className="text-right">Direction</Label>
          <Select
            value={formData.direction}
            onValueChange={(value) => handleSelectChange('direction', value as 'ltr' | 'rtl')}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez une direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ltr">Gauche à droite (LTR)</SelectItem>
              <SelectItem value="rtl">Droite à gauche (RTL)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-start gap-4 pt-2">
          <Label className="text-right pt-2">Pays associés</Label>
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
                  {formData.countries && formData.countries.length > 0 ? (
                    formData.countries.map(countryId => {
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
                            <Trash2 className="h-3 w-3" />
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

export default LanguagesSettings;
