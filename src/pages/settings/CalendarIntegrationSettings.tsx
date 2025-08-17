import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { calendarIntegrationService } from '@/services/calendarIntegrationService';
import type { CalendarIntegration, CreateCalendarIntegrationDto } from '@/types/calendarIntegration';

const PROVIDERS = [
  { value: 'google', label: 'Google Calendar' },
  { value: 'outlook', label: 'Microsoft Outlook' },
  { value: 'apple', label: 'Apple Calendar' }
];

export const CalendarIntegrationSettings = () => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newIntegration, setNewIntegration] = useState<CreateCalendarIntegrationDto>({
    provider: '',
    credentials: {},
    settings: { syncEnabled: false },
    createdBy: 'current-user-id' // A remplacer par l'ID réel de l'utilisateur
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await calendarIntegrationService.list();
      setIntegrations(data);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les intégrations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newIntegration.provider) return;
    setSaving(true);
    try {
      const created = await calendarIntegrationService.create(newIntegration);
      setIntegrations([...integrations, created]);
      setNewIntegration({
        provider: '',
        credentials: {},
        settings: { syncEnabled: false },
        createdBy: 'current-user-id'
      });
      toast({ title: 'Succès', description: 'Intégration créée' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await calendarIntegrationService.delete(id);
      setIntegrations(integrations.filter(i => i.id !== id));
      toast({ title: 'Succès', description: 'Intégration supprimée' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intégrations calendrier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fournisseur</Label>
              <Select
                value={newIntegration.provider}
                onValueChange={(value) => setNewIntegration({...newIntegration, provider: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(provider => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Identifiants</Label>
              <Input
                type="password"
                placeholder="Token d'accès"
                onChange={(e) => setNewIntegration({
                  ...newIntegration,
                  credentials: { ...newIntegration.credentials, token: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="sync-enabled"
              checked={newIntegration.settings.syncEnabled}
              onCheckedChange={(checked) => setNewIntegration({
                ...newIntegration,
                settings: { ...newIntegration.settings, syncEnabled: checked }
              })}
            />
            <Label htmlFor="sync-enabled">Synchronisation activée</Label>
          </div>

          <Button onClick={handleCreate} disabled={saving || !newIntegration.provider}>
            {saving ? 'Création...' : 'Créer une intégration'}
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Synchronisation</TableHead>
              <TableHead>Créée le</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Chargement...</TableCell>
              </TableRow>
            ) : integrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Aucune intégration configurée</TableCell>
              </TableRow>
            ) : (
              integrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell>
                    {PROVIDERS.find(p => p.value === integration.provider)?.label || integration.provider}
                  </TableCell>
                  <TableCell>
                    {integration.settings.syncEnabled ? 'Activée' : 'Désactivée'}
                  </TableCell>
                  <TableCell>
                    {new Date(integration.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(integration.id)}>
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
