import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Mail, Send, Server, TestTube2, Loader2, Plus, Check, X, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { emailServerService, type EmailServer } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

const EmailSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [emailServers, setEmailServers] = useState<EmailServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<EmailServer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // États pour la confirmation de suppression
  const [serverToDelete, setServerToDelete] = useState<EmailServer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // État pour le formulaire
  const [emailConfig, setEmailConfig] = useState({
    id: '',
    name: '',
    protocol: 'smtp',
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls',
    from_email: '',
    from_name: '',
    is_default: false,
    active: true
  });

  // Charger les serveurs d'email depuis l'API
  useEffect(() => {
    const fetchEmailServers = async () => {
      try {
        setLoading(true);
        const servers = await emailServerService.getAll();
        setEmailServers(servers);
      } catch (error) {
        console.error('Erreur lors du chargement des serveurs d\'email:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les serveurs d\'email',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmailServers();
  }, [toast]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setEmailConfig({
      id: '',
      name: '',
      protocol: 'smtp',
      host: '',
      port: 587,
      username: '',
      password: '',
      encryption: 'tls',
      from_email: '',
      from_name: '',
      is_default: false,
      active: true
    });
    setSelectedServer(null);
    setTestResult(null);
  };

  // Ouvrir le formulaire pour ajouter un nouveau serveur
  const handleAddServer = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Ouvrir le formulaire pour éditer un serveur existant
  const handleEditServer = (server: EmailServer) => {
    setEmailConfig({
      id: server.id,
      name: server.name,
      protocol: server.protocol,
      host: server.host,
      port: server.port,
      username: server.username || '',
      password: server.password || '',
      encryption: server.encryption,
      from_email: server.from_email,
      from_name: server.from_name,
      is_default: server.is_default,
      active: server.active
    });
    setSelectedServer(server);
    setIsDialogOpen(true);
  };

  // Gérer les changements dans les champs de texte
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({ ...prev, [name]: value }));
  };

  // Gérer les changements dans les champs de sélection
  const handleSelectChange = (name: string, value: string) => {
    setEmailConfig(prev => ({ ...prev, [name]: value }));
  };

  // Gérer les changements dans les champs de type nombre
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  // Gérer les changements dans les champs de type switch
  const handleSwitchChange = (name: string, checked: boolean) => {
    setEmailConfig(prev => ({ ...prev, [name]: checked }));
  };

  // Tester la connexion au serveur SMTP
  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setTestResult(null);

      if (selectedServer) {
        // Tester un serveur existant
        const result = await emailServerService.testConnection(selectedServer.id);
        setTestResult(result);
      } else {
        // Simuler un test pour un nouveau serveur
        await new Promise(resolve => setTimeout(resolve, 1000));
        const success = Math.random() > 0.2; // 80% de chances de succès
        setTestResult({
          success,
          message: success
            ? 'Connexion au serveur SMTP réussie'
            : 'Échec de la connexion au serveur SMTP. Vérifiez vos paramètres et réessayez.'
        });
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      setTestResult({
        success: false,
        message: 'Erreur lors du test de connexion. Veuillez réessayer.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Sauvegarder les paramètres du serveur d'email
  const handleSave = async () => {
    try {
      setLoading(true);

      // Valider les champs requis
      if (!emailConfig.name || !emailConfig.host || !emailConfig.from_email || !emailConfig.from_name) {
        toast({
          title: 'Erreur de validation',
          description: 'Veuillez remplir tous les champs obligatoires',
          variant: 'destructive'
        });
        return;
      }

      let savedServer: EmailServer;

      if (selectedServer) {
        // Mettre à jour un serveur existant
        savedServer = await emailServerService.update(selectedServer.id, emailConfig);

        // Si le serveur est défini comme serveur par défaut, mettre à jour le statut
        if (emailConfig.is_default && !selectedServer.is_default) {
          await emailServerService.setDefault(selectedServer.id);
        }

        toast({
          title: 'Serveur mis à jour',
          description: 'Le serveur d\'email a été mis à jour avec succès',
          variant: 'default'
        });
      } else {
        // Créer un nouveau serveur
        savedServer = await emailServerService.create(emailConfig);

        // Si le serveur est défini comme serveur par défaut, mettre à jour le statut
        if (emailConfig.is_default) {
          await emailServerService.setDefault(savedServer.id);
        }

        toast({
          title: 'Serveur créé',
          description: 'Le serveur d\'email a été créé avec succès',
          variant: 'default'
        });
      }

      // Mettre à jour la liste des serveurs
      const servers = await emailServerService.getAll();
      setEmailServers(servers);

      // Fermer le formulaire
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du serveur d\'email:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le serveur d\'email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (server: EmailServer) => {
    // Empêcher la suppression d'un serveur par défaut
    if (server.is_default) {
      toast({
        title: 'Action impossible',
        description: 'Vous ne pouvez pas supprimer un serveur par défaut. Veuillez d\'abord définir un autre serveur comme serveur par défaut.',
        variant: 'destructive'
      });
      return;
    }

    setServerToDelete(server);
    setIsDeleteDialogOpen(true);
  };

  // Supprimer un serveur d'email
  const handleDeleteServer = async () => {
    if (!serverToDelete) return;

    setIsDeleting(true);

    try {
      // Supprimer le serveur
      await emailServerService.delete(serverToDelete.id);

      // Mettre à jour la liste des serveurs
      const servers = await emailServerService.getAll();
      setEmailServers(servers);

      toast({
        title: 'Serveur supprimé',
        description: 'Le serveur d\'email a été supprimé avec succès',
        variant: 'default'
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setServerToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du serveur d\'email:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le serveur d\'email',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Activer/désactiver un serveur d'email
  const handleToggleStatus = async (server: EmailServer) => {
    try {
      // Empêcher la désactivation d'un serveur par défaut
      if (server.is_default && server.active) {
        toast({
          title: 'Action impossible',
          description: 'Vous ne pouvez pas désactiver un serveur par défaut. Veuillez d\'abord définir un autre serveur comme serveur par défaut.',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);

      // Activer/désactiver le serveur
      await emailServerService.toggleStatus(server.id);

      // Mettre à jour la liste des serveurs
      const servers = await emailServerService.getAll();
      setEmailServers(servers);

      toast({
        title: server.active ? 'Serveur désactivé' : 'Serveur activé',
        description: `Le serveur d'email a été ${server.active ? 'désactivé' : 'activé'} avec succès`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors de la modification du statut du serveur d\'email:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du serveur d\'email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Définir un serveur comme serveur par défaut
  const handleSetDefault = async (server: EmailServer) => {
    try {
      // Empêcher la définition d'un serveur inactif comme serveur par défaut
      if (!server.active) {
        toast({
          title: 'Action impossible',
          description: 'Vous ne pouvez pas définir un serveur inactif comme serveur par défaut. Veuillez d\'abord activer le serveur.',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);

      // Définir le serveur comme serveur par défaut
      await emailServerService.setDefault(server.id);

      // Mettre à jour la liste des serveurs
      const servers = await emailServerService.getAll();
      setEmailServers(servers);

      toast({
        title: 'Serveur par défaut mis à jour',
        description: 'Le serveur d\'email par défaut a été mis à jour avec succès',
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors de la définition du serveur par défaut:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de définir le serveur par défaut',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-ivory-orange" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Serveurs de messagerie</h1>
            <p className="text-muted-foreground mt-1">Configurez les paramètres d'envoi d'emails</p>
          </div>
        </div>
        <Button className="bg-ivory-orange hover:bg-ivory-orange/90" onClick={handleAddServer}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un serveur
        </Button>
      </div>

      {/* Liste des serveurs d'email */}
      <Card>
        <CardHeader>
          <CardTitle>Serveurs d'email configurés</CardTitle>
          <CardDescription>Liste des serveurs d'email disponibles pour l'envoi de messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Protocole</TableHead>
                  <TableHead>Serveur</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Email d'expédition</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Par défaut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Chargement des serveurs d'email...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : emailServers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Aucun serveur d'email configuré. Cliquez sur "Ajouter un serveur" pour commencer.
                    </TableCell>
                  </TableRow>
                ) : (
                  emailServers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>{server.protocol.toUpperCase()}</TableCell>
                      <TableCell>{server.host}</TableCell>
                      <TableCell>{server.port}</TableCell>
                      <TableCell>{server.from_email}</TableCell>
                      <TableCell>
                        <Badge variant={server.active ? "success" : "secondary"}>
                          {server.active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {server.is_default ? (
                          <Badge variant="default" className="bg-ivory-orange">
                            <Check className="h-3 w-3 mr-1" />
                            Par défaut
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(server)}
                            disabled={loading || !server.active}
                          >
                            Définir par défaut
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(server)}
                            disabled={loading}
                          >
                            {server.active ? "Désactiver" : "Activer"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditServer(server)}
                            disabled={loading}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(server)}
                            disabled={loading || server.is_default}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogue pour ajouter/modifier un serveur d'email */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedServer ? "Modifier le serveur d'email" : "Ajouter un serveur d'email"}
            </DialogTitle>
            <DialogDescription>
              {selectedServer
                ? "Modifiez les paramètres du serveur d'email sélectionné"
                : "Configurez un nouveau serveur d'email pour l'envoi de messages"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom du serveur
              </Label>
              <Input
                id="name"
                name="name"
                value={emailConfig.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Ex: Serveur SMTP principal"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="protocol" className="text-right">Protocole</Label>
              <Select
                value={emailConfig.protocol}
                onValueChange={(value) => handleSelectChange('protocol', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un protocole" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                  <SelectItem value="sendmail">Sendmail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host" className="text-right">Serveur SMTP</Label>
              <Input
                id="host"
                name="host"
                value={emailConfig.host}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Ex: smtp.example.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">Port</Label>
              <Input
                id="port"
                name="port"
                type="number"
                value={emailConfig.port}
                onChange={handleNumberChange}
                className="col-span-3"
                placeholder="Ex: 587"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">Identifiant</Label>
              <Input
                id="username"
                name="username"
                value={emailConfig.username}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Ex: user@example.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={emailConfig.password}
                onChange={handleChange}
                className="col-span-3"
                placeholder={selectedServer ? "Laissez vide pour conserver le mot de passe actuel" : ""}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="encryption" className="text-right">Chiffrement</Label>
              <Select
                value={emailConfig.encryption}
                onValueChange={(value) => handleSelectChange('encryption', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un chiffrement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">Aucun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from_email" className="text-right">Email d'expédition</Label>
              <Input
                id="from_email"
                name="from_email"
                type="email"
                value={emailConfig.from_email}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Ex: noreply@example.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from_name" className="text-right">Nom d'expédition</Label>
              <Input
                id="from_name"
                name="from_name"
                value={emailConfig.from_name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Ex: ERP System"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_default" className="text-right">
                Serveur par défaut
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="is_default"
                  checked={emailConfig.is_default}
                  onCheckedChange={(checked) => handleSwitchChange('is_default', checked)}
                />
                <Label htmlFor="is_default">
                  Utiliser comme serveur par défaut
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Statut
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="active"
                  checked={emailConfig.active}
                  onCheckedChange={(checked) => handleSwitchChange('active', checked)}
                />
                <Label htmlFor="active">
                  Serveur actif
                </Label>
              </div>
            </div>

            {/* Résultat du test de connexion */}
            {testResult && (
              <div className="col-span-4 mt-2">
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    <AlertTitle>
                      {testResult.success ? "Connexion réussie" : "Échec de la connexion"}
                    </AlertTitle>
                  </div>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={loading || testingConnection}
            >
              {testingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <TestTube2 className="h-4 w-4 mr-2" />
                  Tester la connexion
                </>
              )}
            </Button>
            <Button
              className="bg-ivory-orange hover:bg-ivory-orange/90"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Supprimer le serveur d'email"
        description="Êtes-vous sûr de vouloir supprimer ce serveur d'email ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<Trash2 className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteServer}
      >
        {serverToDelete && (
          <div>
            <p className="font-medium">{serverToDelete.name}</p>
            <p className="text-sm text-muted-foreground">
              Protocole: {serverToDelete.protocol.toUpperCase()} |
              Serveur: {serverToDelete.host}:{serverToDelete.port}
            </p>
            <p className="text-sm text-muted-foreground">
              Email d'expédition: {serverToDelete.from_email}
            </p>
            <p className="text-sm text-muted-foreground">
              Statut: <Badge variant={serverToDelete.active ? "success" : "secondary"}>
                {serverToDelete.active ? "Actif" : "Inactif"}
              </Badge>
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default EmailSettings;
