import React, { useEffect, useState } from 'react';
import { Button } from '../../../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { FileText, Upload, Download, Plus, Search, Filter } from 'lucide-react';
// Navigation is handled by HrLayout; no need to import HrDashboardMenu here
import { documentService } from '../../services';
import { useNavigate } from 'react-router-dom';
import type { HrDocument } from '../../services/document.service';
import { Input } from '../../../../src/components/ui/input';

/**
 * Page de gestion des documents RH
 */
const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<HrDocument[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const load = async () => {
      try {
        const docs = await documentService.getAll();
        setDocuments(docs);
      } catch (e) {
        console.error('Erreur chargement documents', e);
      }
    };
    load();
  }, []);

  return (
    <>
    <div className="container mx-auto px-4 py-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents RH</h1>
          <p className="text-muted-foreground mt-1">Gestion des documents et fichiers RH</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download size={16} />
            Exporter
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <Upload size={16} />
            Importer
          </Button>
        </div>
      </div>
      
      {/* Menu de navigation géré par HrLayout pour cohérence */}
      
      {/* Barre de recherche et filtres */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un document..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter size={16} />
                Filtres
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigate('/hr/documents/new')}
              >
                <Plus size={16} />
                Nouveau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Liste des documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Liste des documents RH</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nom</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Format</th>
                  <th className="text-left py-3 px-4 font-medium">Taille</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents
                  .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()))
                  .map(doc => (
                  <tr key={doc.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{doc.type || '—'}</td>
                    <td className="py-3 px-4">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{doc.mime_type || '—'}</td>
                    <td className="py-3 px-4">{doc.size_bytes ? `${(doc.size_bytes/1024).toFixed(1)} KB` : '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/hr/documents/edit/${doc.id}`)}>
                          Modifier
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Dialog removed: using dedicated views for create/edit */}
    </>
  );
};

export default DocumentsView;
