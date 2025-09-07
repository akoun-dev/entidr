import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Settings, Save, Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { HrConfigSidebar } from '../components';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../src/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../src/components/ui/table';

/**
 * Page de configuration RH
 */
const ConfigView: React.FC = () => {
  const { configType } = useParams<{ configType: string }>();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  // Données simulées pour les différentes configurations
  const configData = {
    'work-locations': {
      title: 'Lieux de travail',
      description: 'Gérez les différents lieux de travail de l\'entreprise',
      items: [
        { id: 1, name: 'Siège social - Paris', address: '123 Avenue des Champs-Élysées, 75008 Paris' },
        { id: 2, name: 'Bureau - Lyon', address: '45 Rue de la République, 69002 Lyon' },
        { id: 3, name: 'Agence - Marseille', address: '67 La Canebière, 13001 Marseille' }
      ],
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'address', label: 'Adresse', type: 'text', required: true }
      ]
    },
    'work-hours': {
      title: 'Horaires de travail',
      description: 'Définissez les différents horaires de travail',
      items: [
        { id: 1, name: 'Standard (35h)', hours_per_week: 35, description: 'Lun-Ven, 9h-17h' },
        { id: 2, name: 'Temps partiel (20h)', hours_per_week: 20, description: 'Lun-Mer, 9h-17h' },
        { id: 3, name: 'Cadre (39h)', hours_per_week: 39, description: 'Lun-Ven, 9h-18h' }
      ],
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'hours_per_week', label: 'Heures par semaine', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'text', required: false }
      ]
    },
    'departure-reasons': {
      title: 'Raisons du départ',
      description: 'Gérez les différentes raisons de départ des employés',
      items: [
        { id: 1, name: 'Démission', requires_notice: true },
        { id: 2, name: 'Licenciement économique', requires_notice: true },
        { id: 3, name: 'Fin de contrat', requires_notice: false },
        { id: 4, name: 'Retraite', requires_notice: true },
        { id: 5, name: 'Rupture conventionnelle', requires_notice: true }
      ],
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'requires_notice', label: 'Préavis requis', type: 'checkbox', required: false }
      ]
    },
    'skill-types': {
      title: 'Types de compétences',
      description: 'Définissez les différents types de compétences',
      items: [
        { id: 1, name: 'Technique', description: 'Compétences techniques et professionnelles' },
        { id: 2, name: 'Linguistique', description: 'Langues étrangères' },
        { id: 3, name: 'Management', description: 'Compétences de gestion d\'équipe' },
        { id: 4, name: 'Soft skills', description: 'Compétences interpersonnelles' }
      ],
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text', required: false }
      ]
    },
    'job-positions': {
      title: 'Postes',
      description: 'Gérez les différents postes de l\'entreprise',
      items: [
        { id: 1, name: 'Développeur Frontend', department: 'IT', is_active: true },
        { id: 2, name: 'Développeur Backend', department: 'IT', is_active: true },
        { id: 3, name: 'Chef de projet', department: 'IT', is_active: true },
        { id: 4, name: 'Responsable RH', department: 'RH', is_active: true },
        { id: 5, name: 'Comptable', department: 'Finance', is_active: true }
      ],
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'department', label: 'Département', type: 'text', required: true },
        { name: 'is_active', label: 'Actif', type: 'checkbox', required: false }
      ]
    },
    'employment-types': {
      title: 'Types d\'emploi',
      description: 'Définissez les différents types de contrats',
      items: [
        { id: 1, name: 'CDI', description: 'Contrat à durée indéterminée' },
        { id: 2, name: 'CDD', description: 'Contrat à durée déterminée' },
        { id: 3, name: 'Intérim', description: 'Contrat temporaire' },
        { id: 4, name: 'Stage', description: 'Contrat de stage' },
        { id: 5, name: 'Alternance', description: 'Contrat d\'apprentissage ou de professionnalisation' }
      ],
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text', required: false }
      ]
    },
    'activity-planning': {
      title: 'Planning d\'activités',
      description: 'Gérez les différents types d\'activités planifiables',
      items: [
        { id: 1, name: 'Formation', color: '#4CAF50' },
        { id: 2, name: 'Réunion', color: '#2196F3' },
        { id: 3, name: 'Congé', color: '#FF9800' },
        { id: 4, name: 'Télétravail', color: '#9C27B0' }
      ],
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'color', label: 'Couleur', type: 'color', required: true }
      ]
    },
    'integration-plans': {
      title: 'Plans d\'intégration/de gestion des départs',
      description: 'Définissez les étapes des processus d\'intégration et de départ',
      items: [
        { id: 1, name: 'Intégration standard', type: 'integration', steps: 5 },
        { id: 2, name: 'Intégration cadre', type: 'integration', steps: 7 },
        { id: 3, name: 'Départ standard', type: 'departure', steps: 4 },
        { id: 4, name: 'Départ retraite', type: 'departure', steps: 6 }
      ],
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'type', label: 'Type', type: 'select', options: [
          { value: 'integration', label: 'Intégration' },
          { value: 'departure', label: 'Départ' }
        ], required: true },
        { name: 'steps', label: 'Nombre d\'étapes', type: 'number', required: true }
      ]
    }
  };

  // Obtenir les données pour le type de configuration actuel
  const currentConfig = configType ? configData[configType as keyof typeof configData] : null;

  // Si aucun type de configuration n'est spécifié, rediriger vers la première option
  React.useEffect(() => {
    if (!configType) {
      navigate('/hr/config/work-locations');
    }
  }, [configType, navigate]);

  if (!currentConfig) {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar de configuration */}
        <HrConfigSidebar />

        {/* Contenu principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="container px-4 py-6">
            <div className="flex justify-center py-8">
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar de configuration */}
      <HrConfigSidebar />

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="container px-4 py-6">
          {/* En-tête avec actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configuration RH</h1>
              <p className="text-muted-foreground mt-1">Paramètres et configurations du module RH</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/hr/settings')}>
                <ArrowLeft size={16} />
                Retour aux paramètres
              </Button>
              <Button size="sm" className="flex items-center gap-2">
                <Save size={16} />
                Enregistrer
              </Button>
            </div>
          </div>

          {/* Menu de navigation */}
          {/* Navigation HR gérée globalement par HrLayout */}

          {/* Contenu de la configuration */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{currentConfig.title}</CardTitle>
                  <CardDescription>{currentConfig.description}</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
          {showForm && (
            <Card className="mb-6 border-primary/20">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-lg">Ajouter un nouvel élément</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-4">
                  {currentConfig.fields.map((field, index) => (
                    <div key={index} className="grid gap-2">
                      <Label htmlFor={field.name}>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
                      {field.type === 'text' && (
                        <Input id={field.name} placeholder={field.label} />
                      )}
                      {field.type === 'number' && (
                        <Input id={field.name} type="number" placeholder={field.label} />
                      )}
                      {field.type === 'checkbox' && (
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id={field.name} className="rounded border-gray-300" />
                          <label htmlFor={field.name}>Activer</label>
                        </div>
                      )}
                      {field.type === 'color' && (
                        <Input id={field.name} type="color" />
                      )}
                      {field.type === 'select' && field.options && (
                        <select id={field.name} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                          <option value="">Sélectionner...</option>
                          {field.options.map((option, optIndex) => (
                            <option key={optIndex} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button>Enregistrer</Button>
              </CardFooter>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                {currentConfig.items.length > 0 && Object.keys(currentConfig.items[0])
                  .filter(key => key !== 'id')
                  .map((key, index) => (
                    <TableHead key={index} className="capitalize">
                      {key.replace(/_/g, ' ')}
                    </TableHead>
                  ))
                }
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentConfig.items.map((item, index) => (
                <TableRow key={index}>
                  {Object.entries(item)
                    .filter(([key]) => key !== 'id')
                    .map(([key, value], cellIndex) => (
                      <TableCell key={cellIndex}>
                        {typeof value === 'boolean'
                          ? (value ? 'Oui' : 'Non')
                          : key === 'color'
                            ? <div className="w-6 h-6 rounded-full" style={{ backgroundColor: value as string }}></div>
                            : value as React.ReactNode
                        }
                      </TableCell>
                    ))
                  }
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfigView;
