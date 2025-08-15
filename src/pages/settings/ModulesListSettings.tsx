
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Layers, ChevronLeft } from 'lucide-react';
import ModulesSettings from '../../components/settings/ModulesSettings';

/**
 * Page de gestion des modules
 * Permet de gérer les modules installés dans l'application
 */
const ModulesListSettings: React.FC = () => {
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
                <p className="text-sm text-muted-foreground">
                  Cette fonctionnalité sera disponible dans une prochaine version.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default ModulesListSettings;
