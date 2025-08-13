import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { FileBarChart2, Plus, FileEdit, Trash2, Download, Loader2, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  lastModified: string;
  format: string;
  previewUrl?: string;
  status?: string;
}

const ReportTemplatesSettings: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ReportTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [showGenerateResultDialog, setShowGenerateResultDialog] = useState(false);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null);

  // États pour la création d'un nouveau modèle
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Finance',
    description: '',
    format: 'PDF',
    content: JSON.stringify({
      title: "Nouveau rapport",
      sections: [
        {
          title: "Résumé",
          type: "summary",
          content: "Ce rapport présente un aperçu des données pour la période sélectionnée."
        },
        {
          title: "Données",
          type: "table",
          dataSource: "main_data",
          columns: [
            { "field": "name", "header": "Nom" },
            { "field": "value", "header": "Valeur", "format": "number" }
          ]
        }
      ]
    }, null, 2)
  });

  // Charger les modèles de rapports depuis l'API
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/reporttemplates');
        setTemplates(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des modèles de rapports:', err);
        setError('Impossible de charger les modèles de rapports. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (template: ReportTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  // Supprimer un modèle de rapport
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    setDeletingTemplate(templateToDelete.id);

    try {
      await api.delete(`/reporttemplates/${templateToDelete.id}`);

      // Mettre à jour l'état local
      setTemplates(templates.filter(template => template.id !== templateToDelete.id));

      // Fermer la boîte de dialogue
      setShowDeleteDialog(false);
      setTemplateToDelete(null);

      toast({
        title: "Modèle supprimé",
        description: "Le modèle de rapport a été supprimé avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du modèle de rapport:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le modèle de rapport.",
        variant: "destructive",
      });
    } finally {
      setDeletingTemplate(null);
    }
  };

  // Ouvrir la boîte de dialogue de création d'un nouveau modèle
  const openNewTemplateDialog = () => {
    setNewTemplate({
      name: '',
      category: 'Finance',
      description: '',
      format: 'PDF',
      content: JSON.stringify({
        title: "Nouveau rapport",
        sections: [
          {
            title: "Résumé",
            type: "summary",
            content: "Ce rapport présente un aperçu des données pour la période sélectionnée."
          },
          {
            title: "Données",
            type: "table",
            dataSource: "main_data",
            columns: [
              { "field": "name", "header": "Nom" },
              { "field": "value", "header": "Valeur", "format": "number" }
            ]
          }
        ]
      }, null, 2)
    });
    setShowNewTemplateDialog(true);
  };

  // Gérer les changements dans le formulaire de création
  const handleNewTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer les changements dans les sélecteurs
  const handleSelectChange = (name: string, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Créer un nouveau modèle de rapport
  const handleCreateTemplate = async () => {
    // Validation de base
    if (!newTemplate.name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du modèle est requis.",
        variant: "destructive",
      });
      return;
    }

    setCreatingTemplate(true);

    try {
      const response = await api.post('/reporttemplates', {
        name: newTemplate.name,
        category: newTemplate.category,
        description: newTemplate.description,
        content: newTemplate.content,
        format: newTemplate.format,
        parameters: JSON.stringify({
          date_range: { type: 'daterange', required: true }
        }),
        status: 'active',
        isShared: true
      });

      // Ajouter le nouveau modèle à la liste
      setTemplates([...templates, response.data]);

      // Fermer la boîte de dialogue
      setShowNewTemplateDialog(false);

      toast({
        title: "Modèle créé",
        description: "Le modèle de rapport a été créé avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la création du modèle de rapport:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer le modèle de rapport.",
        variant: "destructive",
      });
    } finally {
      setCreatingTemplate(false);
    }
  };

  // Générer un rapport à partir d'un modèle
  const handleGenerateReport = async (id: string) => {
    setGeneratingReport(id);

    try {
      const response = await api.post(`/reporttemplates/${id}/generate`, {
        parameters: {
          // Paramètres fictifs pour la démonstration
          date_range: {
            start: new Date().toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        }
      });

      // Afficher le résultat de la génération
      setGeneratedReportUrl(response.data.reportUrl);
      setShowGenerateResultDialog(true);

      toast({
        title: "Rapport généré",
        description: "Le rapport a été généré avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la génération du rapport:', err);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <FileBarChart2 className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modèles de rapports</h1>
          <p className="text-muted-foreground mt-1">Gérez les modèles pour vos rapports analytiques</p>
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
            <CardTitle>Modèles disponibles</CardTitle>
            <CardDescription>Liste des modèles de rapports configurés</CardDescription>
          </div>
          <Button
            className="bg-ivory-orange hover:bg-ivory-orange/90"
            onClick={openNewTemplateDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau modèle
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des modèles de rapports...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucun modèle de rapport trouvé</div>
              <div className="text-sm">Créez un nouveau modèle pour commencer</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Dernière modification</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>{template.lastModified}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{template.format}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerateReport(template.id)}
                            disabled={generatingReport === template.id}
                            title="Générer un rapport"
                          >
                            {generatingReport === template.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Modifier"
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(template)}
                            disabled={deletingTemplate === template.id}
                            title="Supprimer"
                          >
                            {deletingTemplate === template.id ? (
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
            <DialogTitle>Supprimer le modèle de rapport</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce modèle de rapport ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {templateToDelete && (
            <div className="py-4">
              <p className="font-medium">{templateToDelete.name}</p>
              <p className="text-sm text-muted-foreground">Catégorie: {templateToDelete.category}</p>
              <p className="text-sm text-muted-foreground">Format: {templateToDelete.format}</p>
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
              onClick={handleDeleteTemplate}
              disabled={deletingTemplate !== null}
            >
              {deletingTemplate !== null ? (
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

      {/* Boîte de dialogue de résultat de génération de rapport */}
      <Dialog open={showGenerateResultDialog} onOpenChange={setShowGenerateResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rapport généré avec succès</DialogTitle>
            <DialogDescription>
              Votre rapport a été généré et est prêt à être téléchargé.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center">
            <div className="bg-green-50 p-4 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-center mb-4">
              Le rapport a été généré avec succès. Vous pouvez maintenant le télécharger ou le consulter en ligne.
            </p>
            {generatedReportUrl && (
              <Button
                className="w-full bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => window.open(generatedReportUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le rapport
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateResultDialog(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de création d'un nouveau modèle */}
      <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau modèle de rapport</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouveau modèle de rapport.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du modèle</Label>
                <Input
                  id="name"
                  name="name"
                  value={newTemplate.name}
                  onChange={handleNewTemplateChange}
                  placeholder="Nom du modèle"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Ventes">Ventes</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Opérations">Opérations</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newTemplate.description}
                onChange={handleNewTemplateChange}
                placeholder="Description du modèle de rapport"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select
                  value={newTemplate.format}
                  onValueChange={(value) => handleSelectChange('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Structure du rapport (JSON)</Label>
              <Textarea
                id="content"
                name="content"
                value={newTemplate.content}
                onChange={handleNewTemplateChange}
                placeholder="Structure du rapport en JSON"
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Définissez la structure du rapport en format JSON. Vous pouvez spécifier les sections, graphiques, tableaux, etc.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewTemplateDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={creatingTemplate || !newTemplate.name.trim()}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              {creatingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le modèle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportTemplatesSettings;
