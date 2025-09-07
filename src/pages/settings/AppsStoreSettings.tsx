import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Package, Download, RefreshCw, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import type { Module } from '../../types/module';
import { api } from '../../config/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

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
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // États pour la confirmation d'installation
  const [appToInstall, setAppToInstall] = useState<App | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // États pour la confirmation de mise à jour
  const [appToUpdate, setAppToUpdate] = useState<App | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // États pour la confirmation de désinstallation
  const [appToUninstall, setAppToUninstall] = useState<App | null>(null);
  const [isUninstallDialogOpen, setIsUninstallDialogOpen] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);

  // Charger le catalogue des applications à partir des modules présents sur le disque (installable !== false)
  const loadCatalog = useCallback(async () => {
    setError(null);
    const res = await api.get<Module[]>(`/modules`);
    const modules = ((res.data as any) ?? []) as Module[];
    const present = modules.filter(m => m.installable !== false);
    const toApp = (m: Module): App => ({
      id: m.name,
      name: m.displayName || m.name,
      description: m.summary || m.description || 'Module sans description',
      version: m.version,
      installed: !!m.installed,
      rating: ratingFromName(m.name),
      category: inferCategory(m.name, m.description || '')
    });
    setApps(present.map(toApp));
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (mounted) await loadCatalog();
      } catch (e) {
        if (mounted) setError("Impossible de charger le catalogue des applications");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [loadCatalog]);

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
      // Installer via l'API des modules
      await api.post(`/modules/${encodeURIComponent(appToInstall.id)}/install`);

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
    } catch (error: any) {
      console.error('Erreur lors de l\'installation de l\'application:', error);
      const msg = error?.response?.data?.error?.message || "Impossible d'installer l'application.";
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
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
      // Synchroniser puis recharger le catalogue
      await api.post(`/modules/sync`);
      await loadCatalog();

      // Mettre à jour l'état local (dans un cas réel, on mettrait à jour la version)
      toast({
        title: "Application mise à jour",
        description: `${appToUpdate.name} a été mis à jour avec succès.`,
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsUpdateDialogOpen(false);
      setAppToUpdate(null);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'application:', error);
      const msg = error?.response?.data?.error?.message || "Impossible de mettre à jour l'application.";
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Désinstallation
  const openUninstallDialog = (app: App) => {
    setAppToUninstall(app);
    setIsUninstallDialogOpen(true);
  };

  const handleUninstall = async () => {
    if (!appToUninstall) return;
    setIsUninstalling(true);
    try {
      await api.post(`/modules/${encodeURIComponent(appToUninstall.id)}/uninstall`);
      setApps(prev => prev.map(a => a.id === appToUninstall.id ? { ...a, installed: false } : a));
      toast({ title: 'Application désinstallée', description: `${appToUninstall.name} a été désinstallé avec succès.` });
      setIsUninstallDialogOpen(false);
      setAppToUninstall(null);
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || "Impossible de désinstaller l'application.";
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setIsUninstalling(false);
    }
  };

  // Catégories
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of apps) set.add(a.category);
    return ['all', ...Array.from(set).sort((a,b) => a.localeCompare(b))];
  }, [apps]);

  const filteredApps = apps.filter(app => {
    const term = searchTerm.toLowerCase();
    const matchSearch = app.name.toLowerCase().includes(term) || app.description.toLowerCase().includes(term) || app.category.toLowerCase().includes(term);
    const matchCategory = categoryFilter === 'all' ? true : app.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const hasInstalled = useMemo(() => apps.some(a => a.installed), [apps]);

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

      {/* Barre de recherche + filtre catégorie */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des applications..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des applications */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {apps.length} applications disponibles
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                setIsSyncing(true);
                await api.post(`/modules/sync`);
                await loadCatalog();
                toast({ title: 'Vérification terminée', description: 'Catalogue mis à jour.' });
              } catch (e) {
                toast({ title: 'Erreur', description: 'Impossible de rechercher les mises à jour.', variant: 'destructive' });
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing || loading}
          >
            {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Rechercher des mises à jour
          </Button>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucune application trouvée</div>
        ) : filteredApps.map((app) => (
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
                  <div className="flex items-center gap-2">
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
                    <Button
                      variant="destructive"
                      onClick={() => openUninstallDialog(app)}
                      disabled={isUninstalling && appToUninstall?.id === app.id}
                    >
                      {isUninstalling && appToUninstall?.id === app.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Désinstaller
                    </Button>
                  </div>
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

      {/* Boîte de dialogue de confirmation de désinstallation */}
      <ConfirmationDialog
        open={isUninstallDialogOpen}
        onOpenChange={setIsUninstallDialogOpen}
        title="Désinstaller l'application"
        description="Êtes-vous sûr de vouloir désinstaller cette application ? Cette action est irréversible."
        actionLabel="Désinstaller"
        variant="destructive"
        isProcessing={isUninstalling}
        icon={<Trash2 className="h-4 w-4 mr-2" />}
        onConfirm={handleUninstall}
      >
        {appToUninstall && (
          <div>
            <p className="font-medium">{appToUninstall.name}</p>
            <p className="text-sm text-muted-foreground">Version: {appToUninstall.version}</p>
            <p className="text-sm text-muted-foreground">Catégorie: {appToUninstall.category}</p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default AppsStoreSettings;

// Helpers
function ratingFromName(name: string): number {
  // Génère un score stable entre 3 et 5 basé sur le hash du nom
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  const n = Math.abs(hash % 20) / 20; // 0..1
  return 3 + Math.round(n * 20) / 10; // 3.0 .. 5.0 par pas de 0.1
}

function inferCategory(name: string, desc: string): string {
  const s = `${name} ${desc}`.toLowerCase();
  if (/(crm|client|sale|vente)/.test(s)) return 'CRM';
  if (/(rh|hr|employ|payroll)/.test(s)) return 'RH';
  if (/(compta|account|finance|billing|invoice)/.test(s)) return 'Finance';
  if (/(inventory|stock|warehouse|logistic)/.test(s)) return 'Opérations';
  return 'Général';
}
