import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../src/components/ui/card';
import { Button } from '../../../../src/components/ui/button';
import { contractService } from '../../services';
import { Contract } from '../../models/types';
import { HrLayout } from '../components';

const ContractDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [c, setC] = useState<Contract | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try { setC(await contractService.getById(id)); } catch (e) { console.error(e); }
    };
    load();
  }, [id]);

  return (
    <HrLayout>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Contrat {c?.name || ''}</CardTitle>
              <CardDescription>Détails du contrat</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/hr/contracts')}>Retour</Button>
              {id && (
                <Button variant="outline" onClick={() => navigate(`/hr/contracts/edit/${id}`)}>Modifier</Button>
              )}
              {id && (
                <Button variant="destructive" onClick={async () => {
                  if (!window.confirm('Supprimer ce contrat ?')) return;
                  try { await contractService.remove(id); navigate('/hr/contracts'); } catch (e) { alert('Suppression impossible'); }
                }}>Supprimer</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><b>Employé:</b> <Link to={`/hr/employees/${c?.employee_id}`}>#{c?.employee_id}</Link></div>
          <div><b>Type:</b> {c?.contract_type}</div>
          <div><b>Début:</b> {c ? new Date(c.date_start).toLocaleDateString() : ''}</div>
          <div><b>Fin:</b> {c?.date_end ? new Date(c.date_end).toLocaleDateString() : '—'}</div>
          <div><b>Salaire:</b> {c?.wage != null ? c.wage : '—'}</div>
          <div><b>Statut:</b> {c?.state}</div>
          <div><b>Notes:</b> {c?.notes || '—'}</div>
        </CardContent>
      </Card>
    </HrLayout>
  );
};

export default ContractDetailView;

