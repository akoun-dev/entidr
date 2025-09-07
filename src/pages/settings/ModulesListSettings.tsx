
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Layers, ChevronLeft } from 'lucide-react';
import ModulesSettings from '../../components/settings/ModulesSettings';
import DependencyGraph from '../../components/settings/DependencyGraph';
import type { Module } from '../../types/module';
import { api } from '../../config/api';

/**
 * Page de gestion des modules
 * Permet de gérer les modules installés dans l'application
 */
const ModulesListSettings: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeMissing, setIncludeMissing] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await api.get<Module[]>(`/modules`);
        const all = ((res.data as any) ?? []) as Module[];
        // Ne charger que les modules réellement disponibles dans addons (installable !== false)
        const present = all.filter(m => m.installable !== false);
        if (mounted) setModules(present);
      } catch (e) {
        if (mounted) setError('Erreur lors du chargement des modules');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchModules();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => window.history.back()}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
          <Layers className="h-8 w-8 text-ivory-orange" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modules installés</h1>
            <p className="text-muted-foreground mt-1">Gérez les modules de votre application</p>
          </div>
        </div>

        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="dependencies">Dépendances</TabsTrigger>
          </TabsList>
          <TabsContent value="modules" className="space-y-4">
            <ModulesSettings />
          </TabsContent>
          <TabsContent value="dependencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Graphe de dépendances</CardTitle>
                <CardDescription>Visualisez les dépendances entre les modules</CardDescription>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-sm text-red-600">{error}</div>
                ) : loading ? (
                  <div className="text-sm text-muted-foreground">Chargement…</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-muted-foreground">
                        {modules.length} modules chargés
                      </div>
                      <label className="text-sm flex items-center gap-2">
                        <input type="checkbox" checked={includeMissing} onChange={(e) => setIncludeMissing(e.target.checked)} />
                        Inclure les dépendances manquantes
                      </label>
                    </div>
                    <DependencyGraph modules={modules} includeMissing={includeMissing} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default ModulesListSettings;
