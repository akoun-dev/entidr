import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HrLayout } from '../components';
import { workflowService } from '../../services';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../src/components/ui/card';
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Textarea } from '../../../../src/components/ui/textarea';

const WorkflowFormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ name: '', kind: 'onboarding', configText: '{\n  "steps": []\n}' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      try {
        const w = await workflowService.getById(id);
        setForm({ name: w.name || '', kind: w.kind || 'onboarding', configText: JSON.stringify(w.config || { steps: [] }, null, 2) });
      } catch (e) { console.error(e); }
    };
    load();
  }, [id, isEdit]);

  const save = async () => {
    setLoading(true);
    try {
      let cfg: any = undefined;
      try { cfg = JSON.parse(form.configText || '{}'); } catch { alert('Config JSON invalide'); setLoading(false); return; }
      if (isEdit && id) await workflowService.update(id, { name: form.name, kind: form.kind, config: cfg });
      else await workflowService.create({ name: form.name, kind: form.kind, config: cfg });
      navigate('/hr/workflows');
    } finally { setLoading(false); }
  };

  return (
    <HrLayout>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Modifier un workflow' : 'Nouveau workflow'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Nom</label>
              <Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Type</label>
              <Input value={form.kind} onChange={e => setForm(prev => ({ ...prev, kind: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm">Config (JSON)</label>
            <Textarea rows={12} value={form.configText} onChange={e => setForm(prev => ({ ...prev, configText: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/hr/workflows')}>Annuler</Button>
            <Button onClick={save} disabled={loading}>{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </CardContent>
      </Card>
    </HrLayout>
  );
};

export default WorkflowFormView;

