import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../src/components/ui/card';
import { Button } from '../../../../src/components/ui/button';
import { documentService } from '../../services';
import type { HrDocument } from '../../services/document.service';
import { HrLayout } from '../components';

const DocumentDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [d, setD] = useState<HrDocument | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try { setD(await documentService.getById(id)); } catch (e) { console.error(e); }
    };
    load();
  }, [id]);

  return (
    <HrLayout>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Document {d?.name || ''}</CardTitle>
              <CardDescription>Détails du document RH</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/hr/documents')}>Retour</Button>
              {id && (
                <Button variant="outline" onClick={() => navigate(`/hr/documents/edit/${id}`)}>Modifier</Button>
              )}
              {id && (
                <Button variant="destructive" onClick={async () => {
                  if (!window.confirm('Supprimer ce document ?')) return;
                  try { await documentService.remove(id); navigate('/hr/documents'); } catch (e) { alert('Suppression impossible'); }
                }}>Supprimer</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><b>Employé:</b> {d?.employee_id ? <Link to={`/hr/employees/${d.employee_id}`}>#{d.employee_id}</Link> : '—'}</div>
          <div><b>Type:</b> {d?.type || '—'}</div>
          <div><b>URL:</b> {d?.file_url ? <a className="text-primary" href={d.file_url} target="_blank" rel="noreferrer">Télécharger</a> : '—'}</div>
          <div><b>MIME:</b> {d?.mime_type || '—'}</div>
          <div><b>Taille:</b> {d?.size_bytes ? `${(d.size_bytes/1024).toFixed(1)} KB` : '—'}</div>
          <div><b>Créé le:</b> {d ? new Date(d.created_at).toLocaleString() : ''}</div>
          <div><b>Mis à jour:</b> {d ? new Date(d.updated_at).toLocaleString() : ''}</div>
        </CardContent>
      </Card>
    </HrLayout>
  );
};

export default DocumentDetailView;

