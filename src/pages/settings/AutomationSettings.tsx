import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Zap, Plus, Trash2, Pencil, Loader2, AlertCircle, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_value: string;
  action_type: string;
  action_params?: any;
  enabled: boolean;
  priority: number;
  last_run?: string | null;
  last_status?: string | null;
  success_count: number;
  failure_count: number;
  createdAt: string;
}

const AutomationSettings: React.FC = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<string | null>(null);
  const [togglingRule, setTogglingRule] = useState<string | null>(null);
  const [runningRule, setRunningRule] = useState<string | null>(null);
  const [showRunResultDialog, setShowRunResultDialog] = useState(false);
  const [runResult, setRunResult] = useState<{
    rule: AutomationRule;
    execution: {
      success: boolean;
      message: string;
      timestamp: string;
    }
  } | null>(null);

  // Charger les règles d'automatisation depuis l'API
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/automationrules');
        setRules(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des règles d\'automatisation:', err);
        setError('Impossible de charger les règles d\'automatisation. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  // Activer/désactiver une règle d'automatisation
  const handleToggleRule = async (id: string) => {
    setTogglingRule(id);

    try {
      const response = await api.patch(`/automationrules/${id}/toggle`);

      // Mettre à jour l'état local
      setRules(rules.map(rule =>
        rule.id === id ? { ...rule, enabled: response.data.enabled } : rule
      ));

      toast({
        title: "Statut mis à jour",
        description: `La règle a été ${response.data.enabled ? 'activée' : 'désactivée'}.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la modification du statut de la règle:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la règle.",
        variant: "destructive",
      });
    } finally {
      setTogglingRule(null);
    }
  };

  // Supprimer une règle d'automatisation
  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;

    setDeletingRule(ruleToDelete.id);

    try {
      await api.delete(`/automationrules/${ruleToDelete.id}`);

      // Mettre à jour l'état local
      setRules(rules.filter(rule => rule.id !== ruleToDelete.id));

      // Fermer la boîte de dialogue
      setShowDeleteDialog(false);
      setRuleToDelete(null);

      toast({
        title: "Règle supprimée",
        description: "La règle d'automatisation a été supprimée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la suppression de la règle:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la règle d'automatisation.",
        variant: "destructive",
      });
    } finally {
      setDeletingRule(null);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (rule: AutomationRule) => {
    setRuleToDelete(rule);
    setShowDeleteDialog(true);
  };

  // Exécuter une règle d'automatisation
  const handleRunRule = async (id: string) => {
    setRunningRule(id);

    try {
      const response = await api.post(`/automationrules/${id}/run`);

      // Mettre à jour l'état local
      setRules(rules.map(rule =>
        rule.id === id ? response.data.rule : rule
      ));

      // Afficher le résultat de l'exécution
      setRunResult(response.data);
      setShowRunResultDialog(true);

      toast({
        title: response.data.execution.success ? "Exécution réussie" : "Échec de l'exécution",
        description: response.data.execution.message,
        variant: response.data.execution.success ? "default" : "destructive",
      });
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la règle:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter la règle d'automatisation.",
        variant: "destructive",
      });
    } finally {
      setRunningRule(null);
    }
  };

  // Formater l'expression cron pour l'affichage
  const formatTrigger = (rule: AutomationRule): string => {
    if (rule.trigger_type === 'cron') {
      const cronMap: Record<string, string> = {
        '0 2 * * *': 'Tous les jours à 02:00',
        '0 3 * * 1': 'Tous les lundis à 03:00',
        '0 18 L * *': 'Dernier jour du mois à 18:00',
        '0 1 * * *': 'Tous les jours à 01:00'
      };

      return cronMap[rule.trigger_value] || rule.trigger_value;
    }

    return rule.trigger_value;
  };

  // Formater le type d'action pour l'affichage
  const formatAction = (rule: AutomationRule): string => {
    const actionMap: Record<string, string> = {
      'database_backup': 'Sauvegarde de la base de données',
      'cleanup_logs': 'Nettoyage des logs',
      'send_report': 'Envoi de rapport',
      'update_exchange_rates': 'Mise à jour des taux de change'
    };

    return actionMap[rule.action_type] || rule.action_type;
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Actions automatisées</h1>
          <p className="text-muted-foreground mt-1">Configurez les règles d'automatisation de votre application</p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Règles d'automatisation</CardTitle>
            <CardDescription>Créez et gérez les règles qui automatisent vos processus</CardDescription>
          </div>
          <Button className="bg-ivory-orange hover:bg-ivory-orange/90">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une règle
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des règles d'automatisation...</span>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucune règle d'automatisation trouvée</div>
              <div className="text-sm">Ajoutez une nouvelle règle pour commencer</div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Déclencheur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Dernière exécution</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        {rule.name}
                        {rule.description && (
                          <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                        )}
                      </TableCell>
                      <TableCell>{formatTrigger(rule)}</TableCell>
                      <TableCell>{formatAction(rule)}</TableCell>
                      <TableCell>
                        {rule.last_run ? (
                          <div>
                            <div className="text-sm">{new Date(rule.last_run).toLocaleString()}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {rule.last_status === 'success' ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : rule.last_status === 'failure' ? (
                                <XCircle className="h-3 w-3 text-red-500" />
                              ) : null}
                              <span className="text-xs text-muted-foreground">
                                {rule.success_count} succès, {rule.failure_count} échecs
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Jamais exécutée</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                            disabled={togglingRule === rule.id}
                          />
                          <Badge variant={rule.enabled ? 'default' : 'outline'}>
                            {togglingRule === rule.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            {rule.enabled ? 'Activé' : 'Désactivé'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRunRule(rule.id)}
                            disabled={runningRule === rule.id || !rule.enabled}
                            title="Exécuter maintenant"
                          >
                            {runningRule === rule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(rule)}
                            disabled={deletingRule === rule.id}
                            title="Supprimer"
                          >
                            {deletingRule === rule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la règle d'automatisation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette règle d'automatisation ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {ruleToDelete && (
            <div className="py-4">
              <p className="font-medium">{ruleToDelete.name}</p>
              <p className="text-sm text-muted-foreground">{formatTrigger(ruleToDelete)} - {formatAction(ruleToDelete)}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRule}
              disabled={deletingRule !== null}
            >
              {deletingRule !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de résultat d'exécution */}
      <Dialog open={showRunResultDialog} onOpenChange={setShowRunResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résultat de l'exécution</DialogTitle>
            <DialogDescription>
              Résultat de l'exécution de la règle d'automatisation
            </DialogDescription>
          </DialogHeader>
          {runResult && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-full bg-muted">
                  {runResult.execution.success ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{runResult.rule.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(runResult.execution.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-medium">{runResult.execution.message}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {runResult.execution.success ? (
                    <>Succès: {runResult.rule.success_count}, Échecs: {runResult.rule.failure_count}</>
                  ) : (
                    <>Succès: {runResult.rule.success_count}, Échecs: {runResult.rule.failure_count}</>
                  )}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setShowRunResultDialog(false)}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomationSettings;
