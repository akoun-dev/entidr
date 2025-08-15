import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Settings, Building2, Users, Globe, Database,
  FileText, Layers, CreditCard, Languages, DollarSign,
  Server, Shield, Mail, Workflow, FileSpreadsheet, Printer,
  ShoppingCart, Truck, Bell, HardDrive, Cloud, Lock,
  Palette, Moon, Calendar,
  Hash, Gauge, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Page d'accueil de la section des paramètres
 * Affiche les différentes catégories de paramètres sous forme de cartes
 */
const SettingsOverview: React.FC = () => {
  // Catégories de paramètres
  const settingsCategories = [
    {
      id: 'general',
      name: 'Général',
      icon: <Settings className="w-8 h-8 text-ivory-orange" />,
      description: 'Paramètres généraux de l\'application',
      items: [
        { id: 'company', name: 'Société', icon: <Building2 className="w-4 h-4" />, route: '/settings/general/company' },
        { id: 'users', name: 'Utilisateurs', icon: <Users className="w-4 h-4" />, route: '/settings/general/users' },
        { id: 'groups', name: 'Groupes d\'utilisateurs', icon: <Users className="w-4 h-4" />, route: '/settings/general/groups' }
      ]
    },
    {
      id: 'localization',
      name: 'Localisation',
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      description: 'Paramètres régionaux et formats',
      items: [
        { id: 'languages', name: 'Langues', icon: <Languages className="w-4 h-4" />, route: '/settings/localization/languages' },
        { id: 'currencies', name: 'Devises', icon: <DollarSign className="w-4 h-4" />, route: '/settings/localization/currencies' },
        { id: 'countries', name: 'Pays', icon: <Globe className="w-4 h-4" />, route: '/settings/localization/countries' }
      ]
    },
    {
      id: 'technical',
      name: 'Technique',
      icon: <Database className="w-8 h-8 text-purple-500" />,
      description: 'Paramètres techniques et base de données',
      items: [
        { id: 'database', name: 'Base de données', icon: <Database className="w-4 h-4" />, route: '/settings/system/database' },
        { id: 'email', name: 'Serveurs de messagerie', icon: <Mail className="w-4 h-4" />, route: '/settings/system/email' },
        { id: 'security', name: 'Sécurité', icon: <Shield className="w-4 h-4" />, route: '/settings/system/security' }
      ]
    },
    {
      id: 'modules',
      name: 'Modules',
      icon: <Layers className="w-8 h-8 text-green-500" />,
      description: 'Gestion des modules et applications',
      items: [
        { id: 'modules_list', name: 'Modules installés', icon: <Layers className="w-4 h-4" />, route: '/settings/modules/list' },
        { id: 'apps_store', name: 'Boutique d\'applications', icon: <ShoppingCart className="w-4 h-4" />, route: '/settings/modules/store' }
      ]
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: <FileText className="w-8 h-8 text-amber-500" />,
      description: 'Gestion des documents et rapports',
      items: [
        { id: 'document_layouts', name: 'Mise en page', icon: <FileText className="w-4 h-4" />, route: '/settings/documents/layouts' },
        { id: 'report_templates', name: 'Modèles', icon: <FileSpreadsheet className="w-4 h-4" />, route: '/settings/documents/templates' }
      ]
    },
    {
      id: 'integrations',
      name: 'Intégrations',
      icon: <CreditCard className="w-8 h-8 text-red-500" />,
      description: 'Intégrations avec des services externes',
      items: [
        { id: 'payment_providers', name: 'Paiements', icon: <CreditCard className="w-4 h-4" />, route: '/settings/integrations/payments' },
        { id: 'shipping_methods', name: 'Expéditions', icon: <Truck className="w-4 h-4" />, route: '/settings/integrations/shipping' }
      ]
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell className="w-8 h-8 text-pink-500" />,
      description: 'Configuration des canaux et modèles de notification',
      items: [
        { id: 'notifications', name: 'Paramètres', icon: <Bell className="w-4 h-4" />, route: '/settings/notifications' }
      ]
    },
    {
      id: 'backup',
      name: 'Sauvegarde',
      icon: <HardDrive className="w-8 h-8 text-indigo-500" />,
      description: 'Gestion des sauvegardes et restauration',
      items: [
        { id: 'backup', name: 'Configuration', icon: <Cloud className="w-4 h-4" />, route: '/settings/backup' }
      ]
    },
    {
      id: 'appearance',
      name: 'Apparence',
      icon: <Palette className="w-8 h-8 text-teal-500" />,
      description: 'Personnalisation de l\'interface utilisateur',
      items: [
        { id: 'appearance', name: 'Thèmes', icon: <Moon className="w-4 h-4" />, route: '/settings/appearance' }
      ]
    },
    {
      id: 'workflows',
      name: 'Workflows',
      icon: <Workflow className="w-8 h-8 text-cyan-500" />,
      description: 'Configuration des flux de travail automatisés',
      items: [
        { id: 'workflows', name: 'Gestion', icon: <Workflow className="w-4 h-4" />, route: '/settings/workflows' }
      ]
    },
    {
      id: 'compliance',
      name: 'Conformité',
      icon: <Shield className="w-8 h-8 text-amber-500" />,
      description: 'Gestion de la conformité réglementaire',
      items: [
        { id: 'compliance', name: 'Paramètres', icon: <Shield className="w-4 h-4" />, route: '/settings/compliance' }
      ]
    },
    {
      id: 'import-export',
      name: 'Import/Export',
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      description: 'Outils d\'échange de données',
      items: [
        { id: 'import-export', name: 'Configuration', icon: <FileText className="w-4 h-4" />, route: '/settings/import-export' }
      ]
    },
    {
      id: 'calendar',
      name: 'Calendrier',
      icon: <Calendar className="w-8 h-8 text-red-500" />,
      description: 'Configuration des calendriers et plannings',
      items: [
        { id: 'calendar', name: 'Paramètres', icon: <Calendar className="w-4 h-4" />, route: '/settings/calendar' }
      ]
    },
    {
      id: 'sequences',
      name: 'Numération',
      icon: <Hash className="w-8 h-8 text-purple-500" />,
      description: 'Gestion des séquences de numérotation',
      items: [
        { id: 'sequences', name: 'Configuration', icon: <Hash className="w-4 h-4" />, route: '/settings/sequences' }
      ]
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: <Gauge className="w-8 h-8 text-green-500" />,
      description: 'Optimisation des performances du système',
      items: [
        { id: 'performance', name: 'Paramètres', icon: <Activity className="w-4 h-4" />, route: '/settings/performance' }
      ]
    }
  ];

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Configuration globale de l'application</p>
      </div>

      {/* Grille de catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map(category => (
          <Card key={category.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {category.icon}
                <CardTitle>{category.name}</CardTitle>
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.items.map(item => (
                  <li key={item.id}>
                    <Link
                      to={item.route}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SettingsOverview;
