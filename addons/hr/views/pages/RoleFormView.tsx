import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HrLayout } from '../components';
import { securityService } from '../../services';
import type { HrRole } from '../../services/security.service';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../../src/components/ui/card';
import { Input } from '../../../../src/components/ui/input';
import { Textarea } from '../../../../src/components/ui/textarea';
import { Button } from '../../../../src/components/ui/button';
import { Switch } from '../../../../src/components/ui/switch';

const RoleFormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<HrRole>>({
    name: '',
    description: '',
    active: true,
    permissions: [],
  });
  const [permissionsText, setPermissionsText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      try {
        const role = await securityService.getRoleById(id);
        setForm({
          id: role.id,
          name: role.name,
          description: role.description,
          active: role.active,
          permissions: role.permissions || [],
        });
        setPermissionsText((role.permissions || []).join(', '));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id, isEdit]);

  const save = async () => {
    setLoading(true);
    try {
      const payload: Partial<HrRole> = {
        name: form.name?.trim() || '',
        description: form.description || '',
        active: !!form.active,
        permissions: permissionsText
          .split(',')
          .map(p => p.trim())
          .filter(Boolean),
      };
      if (!payload.name) {
        alert('Le nom est requis');
        setLoading(false);
        return;
      }
      if (isEdit && id) await securityService.updateRole(id, payload);
      else await securityService.createRole(payload);
      navigate('/hr/security');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HrLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? 'Modifier un rôle' : 'Nouveau rôle'}</h1>
        <p className="text-muted-foreground">Définir un rôle et ses permissions</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Détails du rôle</CardTitle>
          <CardDescription>Nom, description, statut et permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Nom</label>
              <Input
                value={form.name || ''}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={!!form.active}
                onCheckedChange={val => setForm(prev => ({ ...prev, active: val }))}
              />
              <span className="text-sm">Actif</span>
            </div>
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Textarea
              rows={3}
              value={form.description || ''}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm">Permissions (séparées par des virgules)</label>
            <Input
              placeholder="ex: hr.read, hr.write, hr.admin"
              value={permissionsText}
              onChange={e => setPermissionsText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/hr/security')}>Annuler</Button>
            <Button onClick={save} disabled={loading}>{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </CardContent>
      </Card>
    </HrLayout>
  );
};

export default RoleFormView;

