import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Gauge, Database, Clock, Server, Activity, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface PerformanceConfig {
  id: string;
  cacheEnabled: boolean;
  cacheSize: number;
  cacheTTL: number;
  defaultPageSize: number;
  queryOptimization: boolean;
  responseCompression: boolean;
  loggingLevel: string;
  requestTimeout: number;
  maxDbConnections: number;
  advancedSettings: {
    minifyAssets: boolean;
    useEtags: boolean;
    gzipCompression: boolean;
    staticCacheMaxAge: number;
    apiRateLimit: number;
    apiRateLimitWindow: number;
    dbPoolIdleTimeout: number;
    dbPoolAcquireTimeout: number;
    dbPoolMaxUsage: number;
    dbSlowQueryThreshold: number;
    memoryWatchEnabled: boolean;
    memoryWatchThreshold: number;
    cpuWatchEnabled: boolean;
    cpuWatchThreshold: number;
  };
}

interface PerformanceMetrics {
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    connections: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  api: {
    requests: number;
    responseTime: number;
    errors: number;
  };
  timestamp: string;
}

const PerformanceSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PerformanceConfig | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // États locaux pour l'édition
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [cacheSize, setCacheSize] = useState(500);
  const [pageSize, setPageSize] = useState(25);
  const [queryOptimization, setQueryOptimization] = useState(true);

  // États pour la confirmation de diagnostic
  const [isDiagnosticDialogOpen, setIsDiagnosticDialogOpen] = useState(false);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer la configuration des performances
        const configResponse = await axios.get(`${API_BASE_URL}/performanceconfig`);
        setConfig(configResponse.data);

        // Mettre à jour les états locaux
        setCacheEnabled(configResponse.data.cacheEnabled);
        setCacheSize(configResponse.data.cacheSize);
        setPageSize(configResponse.data.defaultPageSize);
        setQueryOptimization(configResponse.data.queryOptimization);

        // Récupérer les métriques de performance
        const metricsResponse = await axios.get(`${API_BASE_URL}/performancemetrics`);
        setMetrics(metricsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données de performance:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Mettre à jour les métriques toutes les 10 secondes
    const intervalId = setInterval(async () => {
      try {
        const metricsResponse = await axios.get(`${API_BASE_URL}/performancemetrics`);
        setMetrics(metricsResponse.data);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des métriques:', error);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  // Fonction pour sauvegarder la configuration
  const saveConfig = async () => {
    try {
      setLoading(true);

      if (!config) return;

      // Mettre à jour la configuration avec les valeurs des états locaux
      const updatedConfig = {
        ...config,
        cacheEnabled,
        cacheSize,
        defaultPageSize: pageSize,
        queryOptimization
      };

      await axios.put(`${API_BASE_URL}/performanceconfig`, updatedConfig);
      setConfig(updatedConfig);

      setLoading(false);
      toast({
        title: "Configuration sauvegardée",
        description: "Configuration des performances enregistrée avec succès",
        variant: "default",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la configuration",
        variant: "destructive",
      });
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de diagnostic
  const openDiagnosticDialog = () => {
    setIsDiagnosticDialogOpen(true);
  };

  // Fonction pour lancer un diagnostic
  const runDiagnostic = async () => {
    try {
      setIsRunningDiagnostic(true);

      // Récupérer les métriques de performance
      const metricsResponse = await axios.get(`${API_BASE_URL}/performancemetrics`);
      setMetrics(metricsResponse.data);

      toast({
        title: "Diagnostic terminé",
        description: "Le diagnostic des performances a été effectué avec succès",
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsDiagnosticDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du diagnostic des performances",
        variant: "destructive",
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Gauge className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground mt-1">Optimisation des performances du système</p>
        </div>
      </div>

      {loading && !metrics ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
          <span className="ml-2">Chargement des données...</span>
        </div>
      ) : (
        <div className="space-y-6">
        {/* Configuration du cache */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration du cache</CardTitle>
            <CardDescription>Gestion du cache système pour améliorer les performances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <Label>Activer le cache</Label>
              </div>
              <Switch
                checked={cacheEnabled}
                onCheckedChange={setCacheEnabled}
              />
            </div>

            {cacheEnabled && (
              <div>
                <Label htmlFor="cache-size">Taille maximale du cache (MB)</Label>
                <Input
                  id="cache-size"
                  type="number"
                  value={cacheSize}
                  onChange={(e) => setCacheSize(parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paramètres d'affichage */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres d'affichage</CardTitle>
            <CardDescription>Configuration des performances d'affichage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="page-size">Taille de page par défaut</Label>
              <Input
                id="page-size"
                type="number"
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Nombre d'éléments affichés par page dans les listes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Optimisation des requêtes */}
        <Card>
          <CardHeader>
            <CardTitle>Optimisation des requêtes</CardTitle>
            <CardDescription>Paramètres avancés pour les requêtes de base de données</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <Label>Optimisation automatique des requêtes</Label>
              </div>
              <Switch
                checked={queryOptimization}
                onCheckedChange={setQueryOptimization}
              />
            </div>
          </CardContent>
        </Card>

        {/* Surveillance des performances */}
        <Card>
          <CardHeader>
            <CardTitle>Surveillance des performances</CardTitle>
            <CardDescription>Statistiques et métriques système</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Server className="h-4 w-4" />
                      <span className="text-sm">Utilisation CPU</span>
                    </div>
                    <div className="mt-2 font-medium text-2xl">
                      {metrics.cpu.usage}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {metrics.cpu.cores} cœurs • Charge: {metrics.cpu.load[0].toFixed(2)}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Mémoire utilisée</span>
                    </div>
                    <div className="mt-2 font-medium text-2xl">
                      {(metrics.memory.used / 1024).toFixed(1)}GB
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {metrics.memory.usage}% • Total: {(metrics.memory.total / 1024).toFixed(1)}GB
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Temps de réponse API</span>
                    </div>
                    <div className="mt-2 font-medium text-2xl">
                      {metrics.api.responseTime}ms
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {metrics.api.requests} requêtes • {metrics.api.errors} erreurs
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Base de données</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Connexions:</span>
                        <span className="font-medium">{metrics.database.connections}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Temps de requête:</span>
                        <span className="font-medium">{metrics.database.queryTime}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Requêtes lentes:</span>
                        <span className="font-medium">{metrics.database.slowQueries}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Server className="h-4 w-4" />
                      <span className="text-sm">Disque</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilisation:</span>
                        <span className="font-medium">{metrics.disk.usage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Utilisé:</span>
                        <span className="font-medium">{metrics.disk.used}GB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Libre:</span>
                        <span className="font-medium">{metrics.disk.free}GB</span>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Réseau</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Entrant:</span>
                        <span className="font-medium">{metrics.network.inbound} KB/s</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sortant:</span>
                        <span className="font-medium">{metrics.network.outbound} KB/s</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Connexions:</span>
                        <span className="font-medium">{metrics.network.connections}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-4 text-right">
                  Dernière mise à jour: {new Date(metrics.timestamp).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement des métriques...</span>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={saveConfig}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={openDiagnosticDialog}
                disabled={loading || isRunningDiagnostic}
              >
                <Activity className="h-4 w-4 mr-2" />
                Lancer un diagnostic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Boîte de dialogue de confirmation de diagnostic */}
      <ConfirmationDialog
        open={isDiagnosticDialogOpen}
        onOpenChange={setIsDiagnosticDialogOpen}
        title="Lancer un diagnostic"
        description="Êtes-vous sûr de vouloir lancer un diagnostic complet du système ? Cette opération peut prendre quelques instants et pourrait affecter temporairement les performances."
        actionLabel="Lancer le diagnostic"
        variant="default"
        isProcessing={isRunningDiagnostic}
        icon={<Activity className="h-4 w-4 mr-2" />}
        onConfirm={runDiagnostic}
      >
        <div>
          <p className="text-sm text-muted-foreground">
            Le diagnostic va analyser les performances du système et mettre à jour les métriques affichées.
          </p>
          <p className="text-sm font-medium text-amber-500 mt-2">
            <AlertTriangle className="h-4 w-4 inline-block mr-1" />
            Cette opération peut ralentir temporairement le système.
          </p>
        </div>
      </ConfirmationDialog>
    </div>
  );
};

export default PerformanceSettings;