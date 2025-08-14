import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Code, Key, RefreshCw, Plus, Trash2, Loader2, AlertCircle, Check, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  active: boolean;
  expires_at?: string | null;
  last_used_at?: string | null;
  description?: string;
  createdAt: string;
}

const ApiSettings: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newGeneratedKey, setNewGeneratedKey] = useState<string | null>(null);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);

  // Charger les clés API depuis l'API
  useEffect(() => {
    const fetchApiKeys = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/apikeys');
        setApiKeys(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des clés API:', err);
        setError('Impossible de charger les clés API. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  // Activer/désactiver une clé API
  const handleToggleKey = async (id: string) => {
    try {
      const response = await api.patch(`/apikeys/${id}/toggle`);

      // Mettre à jour l'état local
      setApiKeys(apiKeys.map(key =>
        key.id === id ? { ...key, active: response.data.active } : key
      ));

      toast({
        title: "Statut mis à jour",
        description: `La clé API a été ${response.data.active ? 'activée' : 'désactivée'}.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la modification du statut de la clé API:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la clé API.",
        variant: "destructive",
      });
    }
  };

  // Générer une nouvelle clé API
  const handleGenerateKey = async () => {
    if (!newKeyName) return;

    setGeneratingKey(true);

    try {
      const response = await api.post('/apikeys', {
        name: newKeyName,
        permissions: ['read'],
        active: true
      });

      // Mettre à jour l'état local
      setApiKeys([...apiKeys, response.data]);

      // Afficher la nouvelle clé dans une boîte de dialogue
      setNewGeneratedKey(response.data.key);
      setShowNewKeyDialog(true);

      // Réinitialiser le formulaire
      setNewKeyName('');

      toast({
        title: "Clé API générée",
        description: "La nouvelle clé API a été créée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la génération de la clé API:', err);
      toast({
        title: "Erreur",
        description: "Impossible de générer la clé API.",
        variant: "destructive",
      });
    } finally {
      setGeneratingKey(false);
    }
  };

  // Régénérer une clé API existante
  const handleRegenerateKey = async (id: string) => {
    setRegeneratingKey(id);

    try {
      const response = await api.post(`/apikeys/${id}/regenerate`);

      // Mettre à jour l'état local
      setApiKeys(apiKeys.map(key =>
        key.id === id ? { ...key, key: response.data.key } : key
      ));

      // Afficher la nouvelle clé dans une boîte de dialogue
      setNewGeneratedKey(response.data.key);
      setShowNewKeyDialog(true);

      toast({
        title: "Clé API régénérée",
        description: "La clé API a été régénérée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la régénération de la clé API:', err);
      toast({
        title: "Erreur",
        description: "Impossible de régénérer la clé API.",
        variant: "destructive",
      });
    } finally {
      setRegeneratingKey(null);
    }
  };

  // Supprimer une clé API
  const handleDeleteKey = async () => {
    if (!keyToDelete) return;

    setDeletingKey(keyToDelete.id);

    try {
      await api.delete(`/apikeys/${keyToDelete.id}`);

      // Mettre à jour l'état local
      setApiKeys(apiKeys.filter(key => key.id !== keyToDelete.id));

      // Fermer la boîte de dialogue
      setShowDeleteDialog(false);
      setKeyToDelete(null);

      toast({
        title: "Clé API supprimée",
        description: "La clé API a été supprimée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression de la clé API:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la clé API.",
        variant: "destructive",
      });
    } finally {
      setDeletingKey(null);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (key: ApiKey) => {
    setKeyToDelete(key);
    setShowDeleteDialog(true);
  };

  // Copier la clé API dans le presse-papiers
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copié !",
        description: "La clé API a été copiée dans le presse-papiers.",
        variant: "default",
      });
    });
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Code className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API & Intégrations</h1>
          <p className="text-muted-foreground mt-1">Gérez les clés API et les intégrations externes</p>
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

      {/* Carte pour générer de nouvelles clés */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Générer une nouvelle clé API</CardTitle>
          <CardDescription>Créez des clés pour autoriser l'accès à votre API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Nom de la clé (ex: Application mobile)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <Button
              className="bg-ivory-orange hover:bg-ivory-orange/90"
              onClick={handleGenerateKey}
              disabled={!newKeyName || generatingKey}
            >
              {generatingKey ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Générer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carte pour la liste des clés */}
      <Card>
        <CardHeader>
          <CardTitle>Clés API existantes</CardTitle>
          <CardDescription>Gérez les clés existantes et leurs permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des clés API...</span>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucune clé API trouvée</div>
              <div className="text-sm">Générez une nouvelle clé pour commencer</div>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{key.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      {key.key}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {key.permissions.map((perm, i) => (
                        <Badge key={i} variant="outline">{perm}</Badge>
                      ))}
                    </div>
                    {key.last_used_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Dernière utilisation: {new Date(key.last_used_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={key.active}
                        onCheckedChange={() => handleToggleKey(key.id)}
                      />
                      <span className="text-sm">
                        {key.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRegenerateKey(key.id)}
                      disabled={regeneratingKey === key.id}
                    >
                      {regeneratingKey === key.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(key)}
                      disabled={deletingKey === key.id}
                    >
                      {deletingKey === key.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boîte de dialogue pour afficher la nouvelle clé générée */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle clé API générée</DialogTitle>
            <DialogDescription>
              Copiez cette clé maintenant. Pour des raisons de sécurité, elle ne sera plus jamais affichée complètement.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-md font-mono text-sm break-all">
            {newGeneratedKey}
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(newGeneratedKey || '')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
            <Button
              onClick={() => setShowNewKeyDialog(false)}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              <Check className="h-4 w-4 mr-2" />
              J'ai copié ma clé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la clé API</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette clé API ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {keyToDelete && (
            <div className="py-4">
              <p className="font-medium">{keyToDelete.name}</p>
              <p className="text-sm text-muted-foreground">{keyToDelete.key}</p>
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
              onClick={handleDeleteKey}
              disabled={deletingKey !== null}
            >
              {deletingKey !== null ? (
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

export default ApiSettings;
