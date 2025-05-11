import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Package, Download, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

interface App {
  id: string;
  name: string;
  description: string;
  version: string;
  installed: boolean;
  rating: number;
  category: string;
}

const AppsStoreSettings: React.FC = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([
    {
      id: '1',
      name: 'Module CRM',
      description: 'Gestion complète de la relation client',
      version: '1.2.0',
      installed: true,
      rating: 4.5,
      category: 'CRM'
    },
    {
      id: '2',
      name: 'Module Comptabilité',
      description: 'Gestion financière et comptable',
      version: '2.1.3',
      installed: false,
      rating: 4.2,
      category: 'Finance'
    },
    {
      id: '3',
      name: 'Module RH',
      description: 'Gestion des ressources humaines',
      version: '1.5.2',
      installed: true,
      rating: 4.7,
      category: 'RH'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // États pour la confirmation d'installation
  const [appToInstall, setAppToInstall] = useState<App | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // États pour la confirmation de mise à jour
  const [appToUpdate, setAppToUpdate] = useState<App | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Ouvrir la boîte de dialogue de confirmation d'installation
  const openInstallDialog = (app: App) => {
    setAppToInstall(app);
    setIsInstallDialogOpen(true);
  };

  // Installer une application
  const handleInstall = async () => {
    if (!appToInstall) return;

    setIsInstalling(true);

    try {
      // Simuler une installation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mettre à jour l'état local
      setApps(apps.map(app =>
        app.id === appToInstall.id ? { ...app, installed: true } : app
      ));

      toast({
        title: "Application installée",
        description: `${appToInstall.name} a été installé avec succès.`,
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsInstallDialogOpen(false);
      setAppToInstall(null);
    } catch (error) {
      console.error('Erreur lors de l\'installation de l\'application:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'installer l'application.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de mise à jour
  const openUpdateDialog = (app: App) => {
    setAppToUpdate(app);
    setIsUpdateDialogOpen(true);
  };

  // Mettre à jour une application
  const handleUpdate = async () => {
    if (!appToUpdate) return;

    setIsUpdating(true);

    try {
      // Simuler une mise à jour
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mettre à jour l'état local (dans un cas réel, on mettrait à jour la version)
      toast({
        title: "Application mise à jour",
        description: `${appToUpdate.name} a été mis à jour avec succès.`,
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsUpdateDialogOpen(false);
      setAppToUpdate(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'application:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'application.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Magasin d'applications</h1>
          <p className="text-muted-foreground mt-1">Installez et gérez les modules complémentaires</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher des applications..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste des applications */}
      <div className="grid gap-4">
        {filteredApps.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{app.name}</CardTitle>
                <CardDescription>{app.description}</CardDescription>
              </div>
              <Badge variant="outline">{app.category}</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Version: {app.version}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < Math.floor(app.rating) ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {app.installed ? (
                  <Button
                    variant="outline"
                    onClick={() => openUpdateDialog(app)}
                    disabled={isUpdating && appToUpdate?.id === app.id}
                  >
                    {isUpdating && appToUpdate?.id === app.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Mettre à jour
                  </Button>
                ) : (
                  <Button
                    className="bg-ivory-orange hover:bg-ivory-orange/90"
                    onClick={() => openInstallDialog(app)}
                    disabled={isInstalling && appToInstall?.id === app.id}
                  >
                    {isInstalling && appToInstall?.id === app.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Installer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Boîte de dialogue de confirmation d'installation */}
      <ConfirmationDialog
        open={isInstallDialogOpen}
        onOpenChange={setIsInstallDialogOpen}
        title="Installer l'application"
        description="Êtes-vous sûr de vouloir installer cette application ?"
        actionLabel="Installer"
        variant="default"
        isProcessing={isInstalling}
        icon={<Download className="h-4 w-4 mr-2" />}
        onConfirm={handleInstall}
      >
        {appToInstall && (
          <div>
            <p className="font-medium">{appToInstall.name}</p>
            <p className="text-sm text-muted-foreground">
              Version: {appToInstall.version}
            </p>
            <p className="text-sm text-muted-foreground">
              Catégorie: {appToInstall.category}
            </p>
            <p className="text-sm text-muted-foreground">
              {appToInstall.description}
            </p>
          </div>
        )}
      </ConfirmationDialog>

      {/* Boîte de dialogue de confirmation de mise à jour */}
      <ConfirmationDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        title="Mettre à jour l'application"
        description="Êtes-vous sûr de vouloir mettre à jour cette application ?"
        actionLabel="Mettre à jour"
        variant="default"
        isProcessing={isUpdating}
        icon={<RefreshCw className="h-4 w-4 mr-2" />}
        onConfirm={handleUpdate}
      >
        {appToUpdate && (
          <div>
            <p className="font-medium">{appToUpdate.name}</p>
            <p className="text-sm text-muted-foreground">
              Version actuelle: {appToUpdate.version}
            </p>
            <p className="text-sm text-muted-foreground">
              Catégorie: {appToUpdate.category}
            </p>
            <p className="text-sm text-muted-foreground">
              {appToUpdate.description}
            </p>
            <p className="text-sm font-medium text-amber-500 mt-2">
              <AlertTriangle className="h-4 w-4 inline-block mr-1" />
              Assurez-vous de sauvegarder vos données avant la mise à jour.
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default AppsStoreSettings;
