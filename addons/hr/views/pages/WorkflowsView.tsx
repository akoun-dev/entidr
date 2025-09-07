import React, { useEffect, useState } from 'react';
import { HrLayout } from '../components';
import { workflowService } from '../../services';
import type { HrWorkflow } from '../../services/workflow.service';
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../src/components/ui/card';
import { Switch } from '../../../../src/components/ui/switch';
import { useNavigate } from 'react-router-dom';

const WorkflowsView: React.FC = () => {
  const [items, setItems] = useState<HrWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try { setItems(await workflowService.list()); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.kind.toLowerCase().includes(search.toLowerCase()));

  return (
    <HrLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workflows</h1>
            <p className="text-muted-foreground">Configurer les circuits de validation</p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
            <Button onClick={() => navigate('/hr/workflows/new')}>Nouveau</Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Définitions</CardTitle>
            <CardDescription>Liste des workflows personnalisables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map(w => (
                <div key={w.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-xs text-muted-foreground">{w.kind}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={w.active} onCheckedChange={async (val) => {
                      const updated = await workflowService.update(w.id, { active: val });
                      setItems(prev => prev.map(x => x.id === w.id ? updated : x));
                    }} />
                    <Button variant="outline" size="sm" onClick={() => navigate(`/hr/workflows/edit/${w.id}`)}>Modifier</Button>
                    <Button variant="destructive" size="sm" onClick={async () => { await workflowService.remove(w.id); setItems(prev => prev.filter(x => x.id !== w.id)); }}>Supprimer</Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-sm text-muted-foreground">Aucun workflow</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </HrLayout>
  );
};

export default WorkflowsView;

