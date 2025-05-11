import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { ArrowUp, Check, RefreshCw, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

interface Update {
  id: string;
  name: string;
  currentVersion: string;
  newVersion: string;
  size: string;
  releaseDate: string;
  changelog: string[];
  security: boolean;
}

const UpdatesSettings: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([
    {
      id: '1',
      name: 'ERP Core',
      currentVersion: '2.3.1',
      newVersion: '2.4.0',
      size: '45.2 MB',
      releaseDate: '2025-05-01',
      changelog: [
        'Nouveau système de permissions',
        'Amélioration des performances',
        'Correction de bugs critiques'
      ],
      security: true
    },
    {
      id: '2',
      name: 'Module CRM',
      currentVersion: '1.2.0',
      newVersion: '1.2.1',
      size: '12.5 MB',
      releaseDate: '2025-04-28',
      changelog: [
        'Correction des problèmes de synchronisation',
        'Amélioration de l\'interface utilisateur'
      ],
      security: false
    }
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // États pour la confirmation d'installation
  const [updateToInstall, setUpdateToInstall] = useState<Update | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleCheckUpdates = () => {
    setIsChecking(true);
    // Simuler une vérification des mises à jour
    setTimeout(() => {
      setIsChecking(false);
      toast({
        title: "Vérification terminée",
        description: "Toutes les mises à jour disponibles ont été trouvées.",
        variant: "default",
      });
    }, 2000);
  };

  // Ouvrir la boîte de dialogue de confirmation d'installation
  const openInstallDialog = (update: Update) => {
    setUpdateToInstall(update);
    setIsInstallDialogOpen(true);
  };

  // Installer une mise à jour
  const handleInstallUpdate = async () => {
    if (!updateToInstall) return;

    setIsInstalling(true);

    try {
      // Simuler une installation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mettre à jour l'état local
      setUpdates(updates.filter(u => u.id !== updateToInstall.id));

      toast({
        title: "Mise à jour installée",
        description: `${updateToInstall.name} a été mis à jour vers la version ${updateToInstall.newVersion}.`,
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsInstallDialogOpen(false);
      setUpdateToInstall(null);
    } catch (error) {
      console.error('Erreur lors de l\'installation de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'installer la mise à jour.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <ArrowUp className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mises à jour</h1>
          <p className="text-muted-foreground mt-1">Gérez les mises à jour du système et des modules</p>
        </div>
      </div>

      {/* Bouton de vérification */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleCheckUpdates}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Vérification en cours...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Vérifier les mises à jour
            </>
          )}
        </Button>
      </div>

      {/* Liste des mises à jour */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertTitle>Aucune mise à jour disponible</AlertTitle>
            <AlertDescription>
              Votre système est à jour avec la dernière version.
            </AlertDescription>
          </Alert>
        ) : (
          updates.map((update) => (
            <Card key={update.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{update.name}</CardTitle>
                  <CardDescription>
                    Version {update.currentVersion} → {update.newVersion}
                  </CardDescription>
                </div>
                {update.security && (
                  <Badge variant="destructive">Sécurité</Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Taille</p>
                      <p>{update.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p>{update.releaseDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge variant="outline">Disponible</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Journal des modifications:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {update.changelog.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-ivory-orange hover:bg-ivory-orange/90"
                      onClick={() => openInstallDialog(update)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Installer la mise à jour
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Boîte de dialogue de confirmation d'installation */}
      <ConfirmationDialog
        open={isInstallDialogOpen}
        onOpenChange={setIsInstallDialogOpen}
        title="Installer la mise à jour"
        description="Êtes-vous sûr de vouloir installer cette mise à jour ? Le système pourrait redémarrer pendant le processus."
        actionLabel="Installer"
        variant="default"
        isProcessing={isInstalling}
        icon={<Download className="h-4 w-4 mr-2" />}
        onConfirm={handleInstallUpdate}
      >
        {updateToInstall && (
          <div>
            <p className="font-medium">{updateToInstall.name}</p>
            <p className="text-sm text-muted-foreground">
              Version {updateToInstall.currentVersion} → {updateToInstall.newVersion}
            </p>
            <p className="text-sm text-muted-foreground">
              Taille: {updateToInstall.size}
            </p>
            <p className="text-sm text-muted-foreground">
              Date de sortie: {updateToInstall.releaseDate}
            </p>
            {updateToInstall.security && (
              <p className="text-sm font-medium text-destructive mt-2">
                Cette mise à jour contient des correctifs de sécurité importants.
              </p>
            )}
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default UpdatesSettings;
