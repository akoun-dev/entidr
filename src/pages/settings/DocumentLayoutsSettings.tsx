import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { FileText, Plus, FileEdit, Trash2, Loader2, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface DocumentLayout {
  id: string;
  name: string;
  type: string;
  lastModified: string;
  isDefault: boolean;
  orientation?: string;
  paperSize?: string;
  previewUrl?: string;
  status?: string;
}

const DocumentLayoutsSettings: React.FC = () => {
  const { toast } = useToast();
  const [layouts, setLayouts] = useState<DocumentLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState<DocumentLayout | null>(null);
  const [deletingLayout, setDeletingLayout] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  // Charger les modèles de documents depuis l'API
  useEffect(() => {
    const fetchLayouts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/documentlayouts');
        setLayouts(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des modèles de documents:', err);
        setError('Impossible de charger les modèles de documents. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchLayouts();
  }, []);

  // Définir un modèle comme modèle par défaut
  const handleSetDefault = async (id: string) => {
    setSettingDefault(id);

    try {
      const response = await api.patch(`/documentlayouts/${id}/setdefault`);

      // Mettre à jour l'état local
      setLayouts(layouts.map(layout => {
        if (layout.type === response.data.type) {
          return {
            ...layout,
            isDefault: layout.id === id
          };
        }
        return layout;
      }));

      toast({
        title: "Modèle par défaut",
        description: `Le modèle "${response.data.name}" a été défini comme modèle par défaut.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la définition du modèle par défaut:', err);
      toast({
        title: "Erreur",
        description: "Impossible de définir ce modèle comme modèle par défaut.",
        variant: "destructive",
      });
    } finally {
      setSettingDefault(null);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (layout: DocumentLayout) => {
    setLayoutToDelete(layout);
    setShowDeleteDialog(true);
  };

  // Supprimer un modèle de document
  const handleDeleteLayout = async () => {
    if (!layoutToDelete) return;

    setDeletingLayout(layoutToDelete.id);

    try {
      await api.delete(`/documentlayouts/${layoutToDelete.id}`);

      // Mettre à jour l'état local
      setLayouts(layouts.filter(layout => layout.id !== layoutToDelete.id));

      // Fermer la boîte de dialogue
      setShowDeleteDialog(false);
      setLayoutToDelete(null);

      toast({
        title: "Modèle supprimé",
        description: "Le modèle de document a été supprimé avec succès.",
        variant: "default",
      });
    } catch (err: any) {
      console.error('Erreur lors de la suppression du modèle de document:', err);

      // Afficher un message d'erreur spécifique si le modèle est par défaut
      if (err.response && err.response.status === 400) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer un modèle par défaut. Veuillez d'abord définir un autre modèle comme modèle par défaut.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le modèle de document.",
          variant: "destructive",
        });
      }
    } finally {
      setDeletingLayout(null);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modèles de documents</h1>
          <p className="text-muted-foreground mt-1">Gérez les modèles pour vos factures, devis et autres documents</p>
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
            <CardDescription>Liste des modèles de documents configurés</CardDescription>
          </div>
          <Button className="bg-ivory-orange hover:bg-ivory-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau modèle
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des modèles de documents...</span>
            </div>
          ) : layouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucun modèle de document trouvé</div>
              <div className="text-sm">Créez un nouveau modèle pour commencer</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Dernière modification</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {layouts.map((layout) => (
                    <TableRow key={layout.id}>
                      <TableCell className="font-medium">{layout.name}</TableCell>
                      <TableCell>{layout.type}</TableCell>
                      <TableCell>
                        {layout.paperSize || 'A4'} ({layout.orientation || 'portrait'})
                      </TableCell>
                      <TableCell>{layout.lastModified}</TableCell>
                      <TableCell>
                        {layout.isDefault ? (
                          <Badge variant="default">Par défaut</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(layout.id)}
                            disabled={settingDefault === layout.id}
                          >
                            {settingDefault === layout.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Définition...
                              </>
                            ) : (
                              <>Définir par défaut</>
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                            onClick={() => openDeleteDialog(layout)}
                            disabled={deletingLayout === layout.id || layout.isDefault}
                            title="Supprimer"
                          >
                            {deletingLayout === layout.id ? (
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
            <DialogTitle>Supprimer le modèle de document</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce modèle de document ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {layoutToDelete && (
            <div className="py-4">
              <p className="font-medium">{layoutToDelete.name}</p>
              <p className="text-sm text-muted-foreground">Type: {layoutToDelete.type}</p>
              {layoutToDelete.isDefault && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Attention</AlertTitle>
                  <AlertDescription>
                    Ce modèle est défini comme modèle par défaut. Vous devez d'abord définir un autre modèle comme modèle par défaut avant de pouvoir le supprimer.
                  </AlertDescription>
                </Alert>
              )}
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
              onClick={handleDeleteLayout}
              disabled={deletingLayout !== null || (layoutToDelete && layoutToDelete.isDefault)}
            >
              {deletingLayout !== null ? (
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

export default DocumentLayoutsSettings;
