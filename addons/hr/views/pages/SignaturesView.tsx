import React, { useEffect, useState } from 'react';
import { HrLayout } from '../components';
import { signatureService } from '../../services';
import type { HrSignatureRequest } from '../../services/signature.service';
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../src/components/ui/card';

const SignaturesView: React.FC = () => {
  const [items, setItems] = useState<HrSignatureRequest[]>([]);
  const [docId, setDocId] = useState('');
  const [empId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems(await signatureService.list()); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const requestSignature = async () => {
    if (!docId) return alert('document_id requis');
    const created = await signatureService.request({ document_id: Number(docId), employee_id: empId ? Number(empId) : undefined });
    setItems(prev => [created as any, ...prev]);
    setDocId(''); setEmpId('');
  };

  return (
    <HrLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Signatures électroniques</h1>
            <p className="text-muted-foreground">Demandes de signature pour les documents RH</p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Document ID" className="w-40" value={docId} onChange={e => setDocId(e.target.value)} />
            <Input placeholder="Employé ID (optionnel)" className="w-56" value={empId} onChange={e => setEmpId(e.target.value)} />
            <Button onClick={requestSignature}>Demander une signature</Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Demandes</CardTitle>
            <CardDescription>Suivi des demandes de signature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map(s => (
                <div key={s.id} className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <div className="font-medium">Document #{s.document_id}</div>
                    <div className="text-xs text-muted-foreground">Status: {s.status} {s.employee_id ? `• Employé #${s.employee_id}` : ''}</div>
                  </div>
                  <div className="flex gap-2">
                    {s.status !== 'signed' && (
                      <Button size="sm" variant="outline" onClick={async () => {
                        const updated = await signatureService.sign(s.id);
                        setItems(prev => prev.map(x => x.id === s.id ? updated : x));
                      }}>Marquer signé</Button>
                    )}
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="text-sm text-muted-foreground">Aucune demande</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </HrLayout>
  );
};

export default SignaturesView;

