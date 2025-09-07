import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Settings, Save, Users, Building2, FileText, Shield, Bell, ChevronRight, Clock, LogOut, Award } from 'lucide-react';
import { HrSettingsSidebar } from '../components';
import { Switch } from '../../../../src/components/ui/switch';
import { Label } from '../../../../src/components/ui/label';

/**
 * Page de paramètres du module RH
 */
const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Fonction pour changer d'onglet
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Fonction pour rendre l'onglet Général
  const renderGeneralTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paramètres généraux</CardTitle>
          <CardDescription>Configuration générale du module RH</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Affichage</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-stats">Afficher les statistiques sur le tableau de bord</Label>
                <Switch id="show-stats" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-departments">Afficher les départements sur le tableau de bord</Label>
                <Switch id="show-departments" defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Intégrations</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-odoo">Activer l'intégration Odoo</Label>
                <Switch id="enable-odoo" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-export">Activer l'export des données</Label>
                <Switch id="enable-export" defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration avancée</h3>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Paramètres de configuration RH</CardTitle>
                <CardDescription>
                  Configurez les lieux de travail, horaires, raisons de départ, types de compétences, etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-2">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link
                    to="/hr/config/work-locations"
                    className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Lieux de travail</span>
                  </Link>
                  <Link
                    to="/hr/config/work-hours"
                    className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">Horaires de travail</span>
                  </Link>
                  <Link
                    to="/hr/config/departure-reasons"
                    className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-primary" />
                    <span className="text-sm">Raisons du départ</span>
                  </Link>
                  <Link
                    to="/hr/config/skill-types"
                    className="flex items-center gap-2 p-2 hover:bg-primary/10 rounded-md transition-colors"
                  >
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm">Types de compétences</span>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/hr/config/work-locations">
                    Voir tous les paramètres de configuration
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Enregistrer</Button>
        </CardFooter>
      </Card>
    );
  };

  // Fonction pour rendre l'onglet Employés
  const renderEmployeesTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paramètres des employés</CardTitle>
          <CardDescription>Configuration des fiches employés</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Champs obligatoires</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="req-email">Email professionnel obligatoire</Label>
                <Switch id="req-email" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="req-phone">Téléphone professionnel obligatoire</Label>
                <Switch id="req-phone" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="req-department">Département obligatoire</Label>
                <Switch id="req-department" defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Enregistrer</Button>
        </CardFooter>
      </Card>
    );
  };

  // Fonction pour rendre l'onglet Permissions
  const renderPermissionsTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Gestion des droits d'accès</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Cette fonctionnalité est en cours de développement.
          </p>
        </CardContent>
      </Card>
    );
  };

  // Fonction pour rendre l'onglet Notifications
  const renderNotificationsTab = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configuration des alertes et notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Cette fonctionnalité est en cours de développement.
          </p>
        </CardContent>
      </Card>
    );
  };

  // Fonction pour rendre le contenu en fonction de l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'employees':
        return renderEmployeesTab();
      case 'permissions':
        return renderPermissionsTab();
      case 'notifications':
        return renderNotificationsTab();
      default:
        return renderGeneralTab();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar de paramètres à gauche */}
      <HrSettingsSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="container px-4 py-6">
          {/* En-tête avec actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Paramètres RH</h1>
              <p className="text-muted-foreground mt-1">Configuration du module Ressources Humaines</p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" className="flex items-center gap-2">
                <Save size={16} />
                Enregistrer les modifications
              </Button>
            </div>
          </div>

          {/* Contenu de l'onglet actif */}
          <div className="mt-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
