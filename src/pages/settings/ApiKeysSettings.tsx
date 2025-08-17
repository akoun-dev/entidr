import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { apiKeyService } from '@/services/apiKeyService';
import type { ApiKey, CreateApiKeyDto } from '@/types/apiKeys';

export const ApiKeysSettings = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState<CreateApiKeyDto>({
    name: '',
    permissions: []
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const keys = await apiKeyService.getAll();
      setApiKeys(keys);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les clés API', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKey.name) return;
    setSaving(true);
    try {
      const createdKey = await apiKeyService.create(newKey);
      setApiKeys([...apiKeys, createdKey]);
      setNewKey({ name: '', permissions: [] });
      toast({ title: 'Succès', description: 'Clé API créée' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiKeyService.delete(id);
      setApiKeys(apiKeys.filter(key => key.id !== id));
      toast({ title: 'Succès', description: 'Clé API supprimée' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des clés API</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newKey.name}
              onChange={(e) => setNewKey({...newKey, name: e.target.value})}
              placeholder="Nom de la clé"
            />
            <Button onClick={handleCreate} disabled={saving || !newKey.name}>
              {saving ? 'Création...' : 'Créer'}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3}>Chargement...</TableCell>
                </TableRow>
              ) : (
                apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(key.id)}>
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
