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
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

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
  const [showNewLayoutDialog, setShowNewLayoutDialog] = useState(false);
  const [creatingLayout, setCreatingLayout] = useState(false);
  const [newLayout, setNewLayout] = useState({
    name: '',
    type: 'invoice',
    orientation: 'portrait',
    paperSize: 'A4',
    content: '<div>Modèle de document</div>',
    metadata: JSON.stringify({ margins: { top: 10, right: 10, bottom: 10, left: 10 } })
  });

  // Charger les modèles de documents depuis l'API
  useEffect(() => {
    const fetchLayouts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/documentlayouts');
        const mapped = (response.data || []).map((l: any) => ({
          id: String(l.id),
          name: l.name,
          type: l.type,
          lastModified: l.updatedAt || l.updated_at || '',
          isDefault: !!l.isDefault,
          orientation: l.orientation,
          paperSize: l.paperSize,
          previewUrl: l.previewUrl,
          status: l.status
        }));
        setLayouts(mapped);
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
          <Button className="bg-ivory-orange hover:bg-ivory-orange/90" onClick={() => setShowNewLayoutDialog(true)}>
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
      {/* Boîte de dialogue de création d'un modèle */}
      <Dialog open={showNewLayoutDialog} onOpenChange={setShowNewLayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau modèle de document</DialogTitle>
            <DialogDescription>Configurez le modèle de document</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input id="name" value={newLayout.name} onChange={e => setNewLayout({ ...newLayout, name: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={newLayout.type} onValueChange={v => setNewLayout({ ...newLayout, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Facture</SelectItem>
                    <SelectItem value="quote">Devis</SelectItem>
                    <SelectItem value="order">Commande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orientation</Label>
                <Select value={newLayout.orientation} onValueChange={v => setNewLayout({ ...newLayout, orientation: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Paysage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Taille de papier</Label>
                <Select value={newLayout.paperSize} onValueChange={v => setNewLayout({ ...newLayout, paperSize: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A5">A5</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewLayoutDialog(false)}>Annuler</Button>
            <Button disabled={creatingLayout} onClick={async () => {
              if (!newLayout.name.trim()) {
                toast({ title: 'Erreur de validation', description: 'Le nom est requis', variant: 'destructive' });
                return;
              }
              setCreatingLayout(true);
              try {
                const payload: any = {
                  name: newLayout.name,
                  type: newLayout.type,
                  orientation: newLayout.orientation,
                  paperSize: newLayout.paperSize,
                  content: newLayout.content,
                  metadata: JSON.parse(newLayout.metadata)
                };
                const resp = await api.post('/documentlayouts', payload);
                const l = resp.data;
                const dto = {
                  id: String(l.id),
                  name: l.name,
                  type: l.type,
                  lastModified: l.updatedAt || '',
                  isDefault: !!l.isDefault,
                  orientation: l.orientation,
                  paperSize: l.paperSize,
                  previewUrl: l.previewUrl,
                  status: l.status
                } as DocumentLayout;
                setLayouts([...layouts, dto]);
                setShowNewLayoutDialog(false);
                toast({ title: 'Modèle créé', description: "Le modèle de document a été créé avec succès." });
              } catch (e) {
                console.error('Erreur création layout:', e);
                toast({ title: 'Erreur', description: "Impossible de créer le modèle.", variant: 'destructive' });
              } finally {
                setCreatingLayout(false);
              }
            }}>
              {creatingLayout ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Création...</> : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentLayoutsSettings;
