import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HrLayout } from '../components';
import { securityService } from '../../services';
import type { HrPermission } from '../../services/security.service';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../../src/components/ui/card';
import { Input } from '../../../../src/components/ui/input';
import { Textarea } from '../../../../src/components/ui/textarea';
import { Button } from '../../../../src/components/ui/button';

const PermissionFormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<HrPermission>>({
    name: '',
    resource: '',
    action: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      try {
        // Pas d'endpoint get-by-id défini; fallback en listant et en filtrant
        const list = await securityService.listPermissions();
        const p = list.find(x => String(x.id) === String(id));
        if (p) setForm(p);
      } catch (e) { console.error(e); }
    };
    load();
  }, [id, isEdit]);

  const save = async () => {
    setLoading(true);
    try {
      const payload: Partial<HrPermission> = {
        name: (form.name || '').trim(),
        resource: (form.resource || '').trim(),
        action: (form.action || '').trim(),
        description: form.description || ''
      };
      if (!payload.name || !payload.resource || !payload.action) {
        alert('name, resource et action sont requis');
        setLoading(false);
        return;
      }
      if (isEdit && id) await securityService.updatePermission(id, payload);
      else await securityService.createPermission(payload);
      navigate('/hr/security');
    } finally { setLoading(false); }
  };

  return (
    <HrLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? 'Modifier une permission' : 'Nouvelle permission'}</h1>
        <p className="text-muted-foreground">Définir une permission applicative</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Détails de la permission</CardTitle>
          <CardDescription>Nom, ressource, action, description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Nom</label>
              <Input value={form.name || ''} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Ressource</label>
              <Input value={form.resource || ''} onChange={e => setForm(prev => ({ ...prev, resource: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Action</label>
              <Input value={form.action || ''} onChange={e => setForm(prev => ({ ...prev, action: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Textarea rows={3} value={form.description || ''} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
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

export default PermissionFormView;

