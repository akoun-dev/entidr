import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../src/components/ui/tabs';
import { employeeService, departmentService, contractService, documentService } from '../../services';
import type { Contract } from '../../models/types';
import type { HrDocument } from '../../services/document.service';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, Building2, Calendar, FileText, Briefcase, Clock, Download } from 'lucide-react';
import { Separator } from '../../../../src/components/ui/separator';
import { Badge } from '../../../../src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../src/components/ui/avatar';

/**
 * Vue de détail d'un employé
 */
const EmployeeDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // État pour stocker les données de l'employé
  const [employee, setEmployee] = useState<any>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documents, setDocuments] = useState<HrDocument[]>([]);
  
  // Charger les données de l'employé et ses éléments liés
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const emp = await employeeService.getEmployeeById(Number(id));
        if (!emp) return;
        setEmployee(emp);
        // Charger contrats et documents liés
        const [cs, ds] = await Promise.all([
          contractService.getAll({ employee_id: emp.id }),
          documentService.getAll({ employee_id: emp.id })
        ]);
        setContracts(cs);
        setDocuments(ds);
      } catch (e) {
        console.error('Erreur chargement employé', e);
      }
    };
    load();
  }, [id]);
  
  // Formater une date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };
  
  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fiche employé</h1>
          <p className="text-muted-foreground mt-1">Détails et informations de l'employé</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/hr/employees')}>
            <ArrowLeft size={16} />
            Retour
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate(`/hr/employees/edit/${id}`)}>
            <Edit size={16} />
            Modifier
          </Button>
          <Button variant="destructive" size="sm" className="flex items-center gap-2">
            <Trash2 size={16} />
            Supprimer
          </Button>
        </div>
      </div>
      
      {/* Menu de navigation */}
      {/* <HrDashboardMenu /> */}
      
      {/* En-tête de la fiche employé */}
      <div className="flex flex-col md:flex-row gap-6 items-start mt-8 mb-6">
        <Avatar className="h-24 w-24">
          {employee?.avatar_url ? (
            <AvatarImage src={employee.avatar_url} alt={employee?.name || ''} />
          ) : (
            <AvatarFallback className="text-2xl">{getInitials(employee?.name || '')}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h2 className="text-2xl font-bold">{employee?.name}</h2>
            <Badge variant={employee?.active ? "default" : "secondary"}>
              {employee?.active ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
          
          <div className="text-lg text-muted-foreground mt-1">{employee?.job_title}</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>Département #{employee?.department_id || '—'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${employee?.work_email || ''}`} className="text-primary hover:underline">
                {employee?.work_email}
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${employee?.work_phone || ''}`} className="hover:underline">
                {employee?.work_phone}
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Embauché le {formatDate(employee?.hire_date as any)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Onglets d'information */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 md:w-fit">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informations générales
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Contrats
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        {/* Onglet Informations générales */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Date de naissance</div>
                    <div>{formatDate(employee?.birth_date as any)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Adresse</div>
                  <div className="whitespace-pre-line">{employee?.address || ''}</div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Téléphone professionnel</div>
                    <div>{employee?.work_phone || ''}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Téléphone mobile</div>
                    <div>{employee?.mobile_phone || ''}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Département</div>
                    <div>Département #{employee?.department_id || '—'}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Type de contrat</div>
                    <div>{employee?.employment_type || '—'}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Date d'embauche</div>
                    <div>{formatDate(employee?.hire_date as any)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Responsable</div>
                  <div>{employee?.parent_id ? `Manager #${employee.parent_id}` : '—'}</div>
                </div>
              </CardContent>
            </Card>
            
            {employee?.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">{employee?.notes}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Onglet Contrats */}
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Historique des contrats</CardTitle>
              <CardDescription>Historique des contrats et changements de poste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {contracts.map((contract) => (
                  <div key={contract.id} className="relative pl-6 pb-6 border-l border-border">
                    {/* Indicateur de chronologie */}
                    <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-primary"></div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{contract.name}</h3>
                        <p className="text-sm text-muted-foreground">{contract.contract_type}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{contract.state}</Badge>
                        <span className="text-sm">
                          {formatDate(contract.date_start)} - {contract.date_end ? formatDate(contract.date_end) : 'Présent'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Documents liés à l'employé</CardDescription>
              </div>
              <Button
                size="sm"
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    if (!employee?.id) return;
                    const name = window.prompt('Nom du document');
                    if (!name) return;
                    const file_url = window.prompt('URL du fichier');
                    if (!file_url) return;
                    const type = window.prompt('Type de document (ex: Contrat, Avenant)') || '';
                    const created = await documentService.create({ name, file_url, type, employee_id: employee.id } as any);
                    setDocuments(prev => [created as any, ...prev]);
                  } catch (e) {
                    console.error('Erreur ajout document', e);
                    alert('Ajout impossible');
                  }
                }}
              >
                <FileText className="h-4 w-4" />
                Ajouter un document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {doc.type || '—'} • {formatDate(doc.created_at as any)} • {(doc.size_bytes ? `${(doc.size_bytes/1024).toFixed(1)} KB` : '—')}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetailView;
