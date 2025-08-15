import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Workflow, Plus, Pencil, Trash2, Users, ArrowRight, Bell, Loader2, X, Check, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import axios from 'axios';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

// Interface pour les conditions de workflow
interface WorkflowCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  valueType?: string;
  logicGroup?: string;
}

// Interface pour les étapes de workflow
interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  assignee?: string;
  assigneeType?: string;
  sequence?: number;
  delay?: number;
  timeout?: number;
  action?: string;
  conditions: WorkflowCondition[] | string[];
}

// Interface pour les workflows
interface Workflow {
  id: string;
  name: string;
  description: string;
  entityType?: string;
  triggerEvent?: string;
  active: boolean;
  priority?: number;
  steps: WorkflowStep[];
}

const WorkflowSettings: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  // État pour un nouveau workflow ou un workflow en cours d'édition
  const [workflowForm, setWorkflowForm] = useState<{
    id?: string;
    name: string;
    description: string;
    entityType: string;
    triggerEvent: string;
    active: boolean;
  }>({
    name: '',
    description: '',
    entityType: 'general',
    triggerEvent: 'manual',
    active: true
  });

  // État pour une nouvelle étape
  const [stepForm, setStepForm] = useState<{
    name: string;
    type: string;
    assignee: string;
    assigneeType: string;
    sequence: number;
    action: string;
  }>({
    name: '',
    type: 'approval',
    assignee: '',
    assigneeType: 'user',
    sequence: 10,
    action: ''
  });

  // Charger les workflows depuis l'API
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer tous les workflows
        const response = await axios.get<Workflow[]>('/api/workflows', {
          timeout: 5000 // Timeout de 5 secondes
        });
        const workflowsData: Workflow[] = response.data;

        // Pour chaque workflow, récupérer ses étapes et conditions
        const workflowsWithDetails = await Promise.all(
          workflowsData.map(async (workflow: any) => {
            try {
              const detailResponse = await axios.get<Workflow>(`/api/workflows/${workflow.id}`, {
                timeout: 5000 // Timeout de 5 secondes
              });
              return detailResponse.data;
            } catch (err) {
              console.error(`Erreur lors du chargement du workflow ${workflow.id}:`, err);
              return {
                ...workflow,
                steps: [],
                error: `Erreur de chargement des détails`
              };
            }
          })
        );

        setWorkflows(workflowsWithDetails);

        // Sélectionner le premier workflow par défaut s'il y en a
        if (workflowsWithDetails.length > 0 && !selectedWorkflow) {
          setSelectedWorkflow(workflowsWithDetails[0].id);
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des workflows:', err);
        if (err.response) {
          setError(`Erreur serveur (${err.response.status}): ${err.response.data?.message || 'Veuillez réessayer'}`);
        } else if (err.request) {
          setError('Le serveur ne répond pas. Vérifiez votre connexion ou que le serveur est démarré.');
        } else {
          setError('Erreur lors du chargement des workflows. Veuillez réessayer.');
        }
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour ouvrir le formulaire de création
  const handleOpenCreateForm = () => {
    setWorkflowForm({
      name: '',
      description: '',
      entityType: 'general',
      triggerEvent: 'manual',
      active: true
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  // Fonction pour ouvrir le formulaire d'édition
  const handleOpenEditForm = (workflow: Workflow) => {
    setWorkflowForm({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      entityType: workflow.entityType || 'general',
      triggerEvent: workflow.triggerEvent || 'manual',
      active: workflow.active
    });
    setEditingWorkflowId(workflow.id);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Fonction pour créer un nouveau workflow
  const handleSaveWorkflow = async () => {
    try {
      setError(null);

      // Validation des champs
      if (!workflowForm.name.trim()) {
        setError('Le nom du workflow est requis.');
        return;
      }

      if (isEditing && workflowForm.id) {
        // Mettre à jour le workflow existant
        const response = await axios.put<Workflow>(`/api/workflows/${workflowForm.id}`, {
          name: workflowForm.name,
          description: workflowForm.description,
          entityType: workflowForm.entityType,
          triggerEvent: workflowForm.triggerEvent,
          active: workflowForm.active
        });

        // Mettre à jour la liste des workflows
        const updatedWorkflow: Workflow = {
          ...response.data,
          steps: workflows.find(w => w.id === workflowForm.id)?.steps || []
        };

        setWorkflows(workflows.map(w => w.id === workflowForm.id ? updatedWorkflow : w));

        // Fermer le formulaire d'édition
        setIsEditing(false);
        setEditingWorkflowId(null);
      } else {
        // Créer un nouveau workflow
        const response = await axios.post<Workflow>('/api/workflows', {
          name: workflowForm.name,
          description: workflowForm.description,
          entityType: workflowForm.entityType,
          triggerEvent: workflowForm.triggerEvent,
          active: workflowForm.active,
          priority: 10 // Priorité par défaut
        });

        // Ajouter le nouveau workflow à la liste
        const createdWorkflow = response.data;
        createdWorkflow.steps = []; // Initialiser avec un tableau vide
        setWorkflows([...workflows, createdWorkflow]);

        // Sélectionner le nouveau workflow
        setSelectedWorkflow(createdWorkflow.id);

        // Fermer le formulaire de création
        setIsCreating(false);
      }

      // Réinitialiser le formulaire
      setWorkflowForm({
        name: '',
        description: '',
        entityType: 'general',
        triggerEvent: 'manual',
        active: true
      });
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du workflow:', err);
      setError('Erreur lors de l\'enregistrement du workflow. Veuillez réessayer.');
    }
  };

  // Fonction pour annuler la création ou l'édition
  const handleCancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingWorkflowId(null);
    setWorkflowForm({
      name: '',
      description: '',
      entityType: 'general',
      triggerEvent: 'manual',
      active: true
    });
  };

  // États pour la confirmation de suppression
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
    setIsDeleteDialogOpen(true);
  };

  // Supprimer un workflow
  const handleDeleteWorkflow = async () => {
    if (!workflowToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Supprimer le workflow via l'API
      await axios.delete(`/api/workflows/${workflowToDelete.id}`);

      // Mettre à jour la liste des workflows
      setWorkflows(workflows.filter(w => w.id !== workflowToDelete.id));

      // Si le workflow supprimé était sélectionné, désélectionner
      if (selectedWorkflow === workflowToDelete.id) {
        setSelectedWorkflow(workflows.length > 1 ? workflows.find(w => w.id !== workflowToDelete.id)?.id || null : null);
      }

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    } catch (err) {
      console.error('Erreur lors de la suppression du workflow:', err);
      setError('Erreur lors de la suppression du workflow. Veuillez réessayer.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Fonction pour ouvrir le formulaire d'ajout d'étape
  const handleOpenAddStepForm = () => {
    if (!selectedWorkflow) {
      setError('Veuillez sélectionner un workflow avant d\'ajouter une étape.');
      return;
    }

    // Réinitialiser le formulaire d'étape
    setStepForm({
      name: '',
      type: 'approval',
      assignee: '',
      assigneeType: 'user',
      sequence: 10,
      action: ''
    });

    setIsAddingStep(true);
  };

  // Fonction pour ajouter une étape à un workflow
  const handleAddStep = async () => {
    try {
      setError(null);

      if (!selectedWorkflow) {
        setError('Aucun workflow sélectionné.');
        return;
      }

      // Validation des champs
      if (!stepForm.name.trim()) {
        setError('Le nom de l\'étape est requis.');
        return;
      }

      // Créer l'étape via l'API
      const response = await axios.post<WorkflowStep>('/api/workflowsteps', {
        workflowId: selectedWorkflow,
        name: stepForm.name,
        type: stepForm.type,
        assignee: stepForm.assignee,
        assigneeType: stepForm.assigneeType,
        sequence: stepForm.sequence,
        action: stepForm.action,
        active: true
      });

      // Ajouter l'étape au workflow sélectionné
      const createdStep = response.data;
      createdStep.conditions = []; // Initialiser avec un tableau vide

      // Mettre à jour le workflow dans la liste
      const updatedWorkflows = workflows.map(workflow => {
        if (workflow.id === selectedWorkflow) {
          return {
            ...workflow,
            steps: [...workflow.steps, createdStep]
          };
        }
        return workflow;
      });

      setWorkflows(updatedWorkflows);

      // Fermer le formulaire
      setIsAddingStep(false);

      // Réinitialiser le formulaire
      setStepForm({
        name: '',
        type: 'approval',
        assignee: '',
        assigneeType: 'user',
        sequence: 10,
        action: ''
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'étape:', err);
      setError('Erreur lors de l\'ajout de l\'étape. Veuillez réessayer.');
    }
  };

  // Fonction pour annuler l'ajout d'étape
  const handleCancelAddStep = () => {
    setIsAddingStep(false);
    setStepForm({
      name: '',
      type: 'approval',
      assignee: '',
      assigneeType: 'user',
      sequence: 10,
      action: ''
    });
  };

  // Fonction pour formater une condition en texte lisible
  const formatCondition = (condition: WorkflowCondition | string | null | undefined): string => {
    try {
      // Gestion des cas null/undefined
      if (!condition) return '';
      
      // Si c'est une chaîne, vérifier qu'elle est valide
      if (typeof condition === 'string') {
        return condition.trim();
      }

      // Vérification approfondie de la structure de l'objet
      if (typeof condition !== 'object' ||
          condition === null ||
          Array.isArray(condition)) {
        return 'Condition invalide';
      }

      // Vérification des propriétés obligatoires avec leurs types
      if (typeof condition.field !== 'string' ||
          typeof condition.operator !== 'string' ||
          !condition.field.trim() ||
          !condition.operator.trim()) {
        return 'Condition invalide';
      }

      // Gestion sécurisée de la valeur
      const value = (condition.value !== undefined && condition.value !== null)
        ? String(condition.value).trim()
        : '';

      const operatorMap: Record<string, string> = {
        'equals': '=',
        'not_equals': '≠',
        'greater_than': '>',
        'less_than': '<',
        'greater_than_or_equal': '≥',
        'less_than_or_equal': '≤',
        'contains': 'contient',
        'not_contains': 'ne contient pas',
        'starts_with': 'commence par',
        'ends_with': 'finit par'
      };

      // Vérification que l'opérateur existe dans la map
      const operator = (condition.operator in operatorMap)
        ? operatorMap[condition.operator]
        : condition.operator;

      return `${condition.field.trim()} ${operator} ${value}`.trim();
    } catch (err) {
      console.error('Erreur critique dans formatCondition:', err);
      return 'Format invalide';
    }
  };

  // Trouver le workflow sélectionné
  const selectedWorkflowData = selectedWorkflow
    ? workflows.find(w => w.id === selectedWorkflow)
    : filteredWorkflows.length > 0 ? filteredWorkflows[0] : null;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Workflow className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">Configuration des flux de travail automatisés</p>
        </div>
      </div>

      {/* Afficher un message d'erreur si nécessaire */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Dialogue de création/édition de workflow */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) handleCancelForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Modifier le workflow' : 'Créer un nouveau workflow'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifiez les informations du workflow existant.'
                : 'Définissez les informations de base pour votre nouveau workflow.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom *
              </Label>
              <Input
                id="name"
                value={workflowForm.name}
                onChange={(e) => setWorkflowForm({...workflowForm, name: e.target.value})}
                className="col-span-3"
                placeholder="Nom du workflow"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={workflowForm.description}
                onChange={(e) => setWorkflowForm({...workflowForm, description: e.target.value})}
                className="col-span-3"
                placeholder="Description du workflow"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="entityType" className="text-right">
                Type d'entité
              </Label>
              <Select
                value={workflowForm.entityType}
                onValueChange={(value) => setWorkflowForm({...workflowForm, entityType: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type d'entité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="order">Commande</SelectItem>
                  <SelectItem value="invoice">Facture</SelectItem>
                  <SelectItem value="customer">Client</SelectItem>
                  <SelectItem value="product">Produit</SelectItem>
                  <SelectItem value="payment">Paiement</SelectItem>
                  <SelectItem value="complaint">Réclamation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="triggerEvent" className="text-right">
                Événement déclencheur
              </Label>
              <Select
                value={workflowForm.triggerEvent}
                onValueChange={(value) => setWorkflowForm({...workflowForm, triggerEvent: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manuel</SelectItem>
                  <SelectItem value="creation">Création</SelectItem>
                  <SelectItem value="update">Mise à jour</SelectItem>
                  <SelectItem value="status_change">Changement de statut</SelectItem>
                  <SelectItem value="approval">Approbation</SelectItem>
                  <SelectItem value="rejection">Rejet</SelectItem>
                  <SelectItem value="overdue">Retard</SelectItem>
                  <SelectItem value="pre_send">Avant envoi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Actif
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="active"
                  checked={workflowForm.active}
                  onCheckedChange={(checked) => setWorkflowForm({...workflowForm, active: checked})}
                />
                <Label htmlFor="active">
                  {workflowForm.active ? 'Activé' : 'Désactivé'}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelForm}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSaveWorkflow} className="bg-ivory-orange hover:bg-ivory-orange/90">
              <Check className="h-4 w-4 mr-2" />
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'ajout d'étape */}
      <Dialog open={isAddingStep} onOpenChange={(open) => {
        if (!open) handleCancelAddStep();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une étape au workflow</DialogTitle>
            <DialogDescription>
              Définissez les informations pour la nouvelle étape du workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stepName" className="text-right">
                Nom *
              </Label>
              <Input
                id="stepName"
                value={stepForm.name}
                onChange={(e) => setStepForm({...stepForm, name: e.target.value})}
                className="col-span-3"
                placeholder="Nom de l'étape"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stepType" className="text-right">
                Type
              </Label>
              <Select
                value={stepForm.type}
                onValueChange={(value) => setStepForm({...stepForm, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type d'étape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approval">Approbation</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="task">Tâche</SelectItem>
                  <SelectItem value="automatic">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stepAssignee" className="text-right">
                Assigné à
              </Label>
              <Input
                id="stepAssignee"
                value={stepForm.assignee}
                onChange={(e) => setStepForm({...stepForm, assignee: e.target.value})}
                className="col-span-3"
                placeholder="Utilisateur, rôle ou groupe"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stepAssigneeType" className="text-right">
                Type d'assigné
              </Label>
              <Select
                value={stepForm.assigneeType}
                onValueChange={(value) => setStepForm({...stepForm, assigneeType: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type d'assigné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="role">Rôle</SelectItem>
                  <SelectItem value="group">Groupe</SelectItem>
                  <SelectItem value="department">Département</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stepSequence" className="text-right">
                Séquence
              </Label>
              <Input
                id="stepSequence"
                type="number"
                value={stepForm.sequence.toString()}
                onChange={(e) => setStepForm({...stepForm, sequence: parseInt(e.target.value) || 10})}
                className="col-span-3"
                placeholder="Ordre d'exécution"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stepAction" className="text-right">
                Action
              </Label>
              <Input
                id="stepAction"
                value={stepForm.action}
                onChange={(e) => setStepForm({...stepForm, action: e.target.value})}
                className="col-span-3"
                placeholder="Action à effectuer"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAddStep}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleAddStep} className="bg-ivory-orange hover:bg-ivory-orange/90">
              <Check className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Afficher un indicateur de chargement si nécessaire */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
          <span className="ml-2">Chargement des workflows...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Liste des workflows */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Workflows configurés</CardTitle>
                <CardDescription>Liste des workflows disponibles dans l'application</CardDescription>
              </div>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={handleOpenCreateForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau workflow
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Input
                  placeholder="Rechercher un workflow..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {filteredWorkflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Aucun workflow ne correspond à votre recherche.' : 'Aucun workflow configuré.'}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Étapes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkflows.map((workflow) => (
                        <TableRow
                          key={workflow.id}
                          className={selectedWorkflow === workflow.id ? "bg-muted/50" : ""}
                          onClick={() => setSelectedWorkflow(workflow.id)}
                        >
                          <TableCell className="font-medium">{workflow.name}</TableCell>
                          <TableCell>{workflow.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {workflow.entityType || 'Général'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={workflow.active ? 'default' : 'secondary'}>
                              {workflow.active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {workflow.steps.length}
                              <Badge variant="outline" className="text-xs">
                                {workflow.steps.filter(s => s.type === 'approval').length} approbations
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation(); // Empêcher la sélection du workflow
                                  handleOpenEditForm(workflow);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation(); // Empêcher la sélection du workflow
                                  openDeleteDialog(workflow);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Détails d'un workflow */}
          {selectedWorkflowData && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Détails du workflow: {selectedWorkflowData.name}</CardTitle>
                  <CardDescription>
                    {selectedWorkflowData.description}
                    {selectedWorkflowData.entityType && (
                      <span className="ml-2">
                        Type: <Badge variant="outline">{selectedWorkflowData.entityType}</Badge>
                      </span>
                    )}
                    {selectedWorkflowData.triggerEvent && (
                      <span className="ml-2">
                        Déclencheur: <Badge variant="outline">{selectedWorkflowData.triggerEvent}</Badge>
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  className="bg-ivory-orange hover:bg-ivory-orange/90"
                  onClick={handleOpenAddStepForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une étape
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedWorkflowData.steps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Ce workflow ne contient aucune étape.
                    </div>
                  ) : (
                    selectedWorkflowData.steps
                      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                      .map((step, index) => (
                        <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
                            {step.type === 'approval' && <Users className="h-5 w-5 text-gray-600" />}
                            {step.type === 'notification' && <Bell className="h-5 w-5 text-gray-600" />}
                            {step.type === 'task' && <Workflow className="h-5 w-5 text-gray-600" />}
                            {step.type === 'automatic' && <Workflow className="h-5 w-5 text-gray-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{step.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Type: <Badge variant="outline">{step.type}</Badge>
                              {step.sequence && <span className="ml-2">Séquence: {step.sequence}</span>}
                              {step.delay && <span className="ml-2">Délai: {step.delay}h</span>}
                            </div>
                            {step.assignee && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Assigné à: {step.assignee} {step.assigneeType && `(${step.assigneeType})`}
                              </div>
                            )}
                            {step.conditions && step.conditions.length > 0 && (
                              <div className="mt-2">
                                <Label>Conditions:</Label>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                  {Array.isArray(step.conditions) && step.conditions.map((condition, i) => (
                                    <li key={i}>{formatCondition(condition)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          {index < selectedWorkflowData.steps.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Supprimer le workflow"
        description="Êtes-vous sûr de vouloir supprimer ce workflow ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<AlertTriangle className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteWorkflow}
      >
        {workflowToDelete && (
          <div>
            <p className="font-medium">{workflowToDelete.name}</p>
            <p className="text-sm text-muted-foreground">
              {workflowToDelete.description}
            </p>
            <p className="text-sm text-muted-foreground">
              Type: <Badge variant="outline">
                {workflowToDelete.entityType || 'Général'}
              </Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              Statut: <Badge variant={workflowToDelete.active ? 'default' : 'secondary'}>
                {workflowToDelete.active ? 'Actif' : 'Inactif'}
              </Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              Nombre d'étapes: {workflowToDelete.steps.length}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default WorkflowSettings;