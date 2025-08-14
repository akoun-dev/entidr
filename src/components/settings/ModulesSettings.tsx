import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Loader2, Trash2, Power, RefreshCw } from 'lucide-react';
import { Module } from '../../types/module';

// Utilise l'URL de base de l'API définie dans les variables d'environnement, avec un
// repli local identique au reste du projet pour éviter toute adresse codée en dur.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Composant pour la gestion des modules
 */
const ModulesSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('installed');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les popups de confirmation
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showUninstallDialog, setShowUninstallDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [processingModule, setProcessingModule] = useState<string | null>(null);

  // Charger les modules au chargement du composant
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Module[]>(`${API_BASE_URL}/modules`);
        setModules(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des modules:', err);
        setError('Erreur lors du chargement des modules. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Filtrer les modules en fonction de l'onglet actif
  const filteredModules = modules.filter(module => {
    if (activeTab === 'installed') return module.installed;
    if (activeTab === 'available') return !module.installed && module.installable;
    return true; // Onglet 'all'
  });

  // Ouvrir la boîte de dialogue de confirmation pour l'activation/désactivation
  const openToggleDialog = (module: Module) => {
    setSelectedModule(module);
    setShowToggleDialog(true);
  };

  // Gérer l'activation/désactivation d'un module
  const handleToggleModule = async () => {
    if (!selectedModule) return;

    setProcessingModule(selectedModule.name);

    try {
      await axios.put(`${API_BASE_URL}/modules/${selectedModule.name}/status`, {
        active: !selectedModule.active
      });

      // Recharger tous les modules pour avoir les données à jour
      const response = await axios.get<Module[]>(`${API_BASE_URL}/modules`);
      setModules(response.data);
      setError(null);

      // Afficher un message de confirmation
      toast.success(`Le module ${selectedModule.displayName} a été ${!selectedModule.active ? 'activé' : 'désactivé'} avec succès.`);

      // Fermer la boîte de dialogue
      setShowToggleDialog(false);

      // Recharger la page pour appliquer les changements
      window.location.reload();
    } catch (err) {
      console.error(`Erreur lors de la modification du statut du module ${selectedModule.name}:`, err);
      setError(`Erreur lors de la modification du statut du module ${selectedModule.displayName}.`);
      toast.error(`Erreur lors de la modification du statut du module ${selectedModule.displayName}.`);
    } finally {
      setProcessingModule(null);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation pour l'installation
  const openInstallDialog = (module: Module) => {
    setSelectedModule(module);
    setShowInstallDialog(true);
  };

  // Gérer l'installation d'un module
  const handleInstallModule = async () => {
    if (!selectedModule) return;

    setProcessingModule(selectedModule.name);

    try {
      await axios.post(`${API_BASE_URL}/modules/${selectedModule.name}/install`);

      // Recharger tous les modules pour avoir les données à jour
      const response = await axios.get<Module[]>(`${API_BASE_URL}/modules`);
      setModules(response.data);
      setError(null);

      // Afficher un message de confirmation
      toast.success(`Le module ${selectedModule.displayName} a été installé avec succès.`);

      // Fermer la boîte de dialogue
      setShowInstallDialog(false);

      // Recharger la page pour appliquer les changements
      window.location.reload();
    } catch (err) {
      console.error(`Erreur lors de l'installation du module ${selectedModule.name}:`, err);
      setError(`Erreur lors de l'installation du module ${selectedModule.displayName}.`);
      toast.error(`Erreur lors de l'installation du module ${selectedModule.displayName}.`);
    } finally {
      setProcessingModule(null);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation pour la désinstallation
  const openUninstallDialog = (module: Module) => {
    setSelectedModule(module);
    setShowUninstallDialog(true);
  };

  // Gérer la désinstallation d'un module
  const handleUninstallModule = async () => {
    if (!selectedModule) return;

    setProcessingModule(selectedModule.name);

    try {
      await axios.post(`${API_BASE_URL}/modules/${selectedModule.name}/uninstall`);

      // Recharger tous les modules pour avoir les données à jour
      const response = await axios.get<Module[]>(`${API_BASE_URL}/modules`);
      setModules(response.data);
      setError(null);

      // Afficher un message de confirmation
      toast.success(`Le module ${selectedModule.displayName} a été désinstallé avec succès.`);

      // Fermer la boîte de dialogue
      setShowUninstallDialog(false);

      // Recharger la page pour appliquer les changements
      window.location.reload();
    } catch (err) {
      console.error(`Erreur lors de la désinstallation du module ${selectedModule.name}:`, err);
      setError(`Erreur lors de la désinstallation du module ${selectedModule.displayName}.`);
      toast.error(`Erreur lors de la désinstallation du module ${selectedModule.displayName}.`);
    } finally {
      setProcessingModule(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestion des modules</CardTitle>
        <CardDescription>
          Gérez les modules de l'application. Activez, désactivez, installez ou désinstallez des modules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-md mb-4">
            <p className="font-medium">Erreur</p>
            <p>{error}</p>
          </div>
        ) : null}

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

        <Tabs defaultValue="installed" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="installed">Installés</TabsTrigger>
            <TabsTrigger value="available">Disponibles</TabsTrigger>
            <TabsTrigger value="all">Tous</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="p-8 text-center">
                <p>Chargement des modules...</p>
              </div>
            ) : (
              <Table>
                <TableCaption>Liste des modules {activeTab === 'installed' ? 'installés' : activeTab === 'available' ? 'disponibles' : ''}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Aucun module {activeTab === 'installed' ? 'installé' : activeTab === 'available' ? 'disponible' : 'trouvé'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredModules.map(module => (
                      <TableRow key={module.name}>
                        <TableCell className="font-medium">{module.displayName}</TableCell>
                        <TableCell>{module.version}</TableCell>
                        <TableCell>{module.summary || module.description}</TableCell>
                        <TableCell>
                          {module.installed ? (
                            <Badge variant={module.active ? "default" : "secondary"} className={module.active ? "bg-green-500" : ""}>
                              {module.active ? 'Actif' : 'Inactif'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Non installé</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {module.installed ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={module.active}
                                onCheckedChange={() => openToggleDialog(module)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUninstallDialog(module)}
                              >
                                Désinstaller
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInstallDialog(module)}
                              disabled={!module.installable}
                            >
                              Installer
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {modules.length} modules au total, {modules.filter(m => m.installed).length} installés
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setLoading(true);
            axios.get<Module[]>(`${API_BASE_URL}/modules`)
              .then(response => {
                setModules(response.data);
                setError(null);
                setLoading(false);
              })
              .catch(err => {
                console.error('Erreur lors du rafraîchissement des modules:', err);
                setError('Erreur lors du rafraîchissement des modules.');
                setLoading(false);
              });
          }}
        >
          Rafraîchir
        </Button>
      </CardFooter>

      {/* Boîte de dialogue de confirmation pour l'activation/désactivation */}
      <Dialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedModule?.active ? 'Désactiver' : 'Activer'} le module</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir {selectedModule?.active ? 'désactiver' : 'activer'} le module {selectedModule?.displayName} ?
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <div className="py-4">
              <p className="font-medium">{selectedModule.displayName}</p>
              <p className="text-sm text-muted-foreground">Version: {selectedModule.version}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowToggleDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant={selectedModule?.active ? "destructive" : "default"}
              onClick={handleToggleModule}
              disabled={processingModule !== null}
            >
              {processingModule !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  {selectedModule?.active ? 'Désactiver' : 'Activer'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation pour l'installation */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Installer le module</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir installer le module {selectedModule?.displayName} ?
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <div className="py-4">
              <p className="font-medium">{selectedModule.displayName}</p>
              <p className="text-sm text-muted-foreground">Version: {selectedModule.version}</p>
              <p className="text-sm text-muted-foreground">{selectedModule.summary || selectedModule.description}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInstallDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              onClick={handleInstallModule}
              disabled={processingModule !== null}
            >
              {processingModule !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Installation...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Installer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation pour la désinstallation */}
      <Dialog open={showUninstallDialog} onOpenChange={setShowUninstallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Désinstaller le module</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désinstaller le module {selectedModule?.displayName} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <div className="py-4">
              <p className="font-medium">{selectedModule.displayName}</p>
              <p className="text-sm text-muted-foreground">Version: {selectedModule.version}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUninstallDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleUninstallModule}
              disabled={processingModule !== null}
            >
              {processingModule !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Désinstallation...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Désinstaller
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ModulesSettings;
