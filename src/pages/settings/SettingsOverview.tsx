import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Settings, Building2, Users, Globe, Database,
  FileText, Layers, CreditCard, Languages, DollarSign,
  Server, Shield, Mail, Workflow, FileSpreadsheet, Printer,
  ShoppingCart, Truck, Bell, HardDrive, Cloud, Lock, Clock,
  Palette, Moon, Calendar, Zap, RefreshCw,
  Hash, Gauge, Activity,
  Network
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Page d'accueil de la section des paramètres
 * Affiche les différentes catégories de paramètres sous forme de cartes
 */
const SettingsOverview: React.FC = () => {
  // Catégories de paramètres
  // Groupes thématiques pour une meilleure organisation
  const settingsCategories = [
    // 1. Paramètres de base
    {
      id: 'core',
      name: 'Configuration de base',
      icon: <Settings className="w-8 h-8 text-blue-500" />,
      description: 'Paramètres fondamentaux du système',
      items: [
        { id: 'company', name: 'Société', icon: <Building2 className="w-4 h-4" />, route: '/settings/general/company' },
        { id: 'users', name: 'Utilisateurs', icon: <Users className="w-4 h-4" />, route: '/settings/general/users' },
        { id: 'groups', name: 'Groupes', icon: <Users className="w-4 h-4" />, route: '/settings/general/groups' },
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
        { id: 'apps_store', name: 'Boutique d\'applications', icon: <ShoppingCart className="w-4 h-4" />, route: '/settings/modules/store' },
        { id: 'updates', name: 'Mises à jour', icon: <RefreshCw className="w-4 h-4" />, route: '/settings/modules/updates' }
      ]
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: <FileText className="w-8 h-8 text-amber-500" />,
      description: 'Gestion des documents et rapports',
      items: [
        { id: 'document_layouts', name: 'Mise en page', icon: <FileText className="w-4 h-4" />, route: '/settings/documents/layouts' },
        { id: 'report_templates', name: 'Modèles', icon: <FileSpreadsheet className="w-4 h-4" />, route: '/settings/documents/templates' },
        { id: 'printers', name: 'Imprimantes', icon: <Printer className="w-4 h-4" />, route: '/settings/documents/printers' }
      ]
    },
    // 5. Intégrations
    {
      id: 'integrations',
      name: 'Connecteurs',
      icon: <Network className="w-8 h-8 text-orange-500" />,
      description: 'Connexions avec services externes',
      items: [
        { id: 'payments', name: 'Paiements', icon: <CreditCard className="w-4 h-4" />, route: '/settings/integrations/payments' },
        { id: 'shipping', name: 'Expéditions', icon: <Truck className="w-4 h-4" />, route: '/settings/integrations/shipping' },
        { id: 'external', name: 'Services externes', icon: <Globe className="w-4 h-4" />, route: '/settings/integrations/external' },
        { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" />, route: '/settings/integrations/notifications' }
      ]
    },
    // 4. Automatisation
    {
      id: 'automation',
      name: 'Automatisation',
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      description: 'Automatisation des processus métier',
      items: [
        { id: 'workflows', name: 'Workflows', icon: <Workflow className="w-4 h-4" />, route: '/settings/workflows' },
        { id: 'automation', name: 'Règles', icon: <Zap className="w-4 h-4" />, route: '/settings/system/automation' },
        { id: 'sequences', name: 'Numérotation', icon: <Hash className="w-4 h-4" />, route: '/settings/sequences' }
      ]
    },
    // Paramètres système avancés
    {
      id: 'advanced-system',
      name: 'Système avancé',
      icon: <Server className="w-8 h-8 text-gray-500" />,
      description: 'Configuration avancée du système',
      items: [
        { id: 'backup', name: 'Sauvegarde', icon: <Cloud className="w-4 h-4" />, route: '/settings/backup' },
        { id: 'compliance', name: 'Conformité', icon: <Shield className="w-4 h-4" />, route: '/settings/compliance' },
        { id: 'import-export', name: 'Import/Export', icon: <FileText className="w-4 h-4" />, route: '/settings/data/import-export' },
        { id: 'sequences', name: 'Numération', icon: <Hash className="w-4 h-4" />, route: '/settings/sequences' },
        { id: 'performance', name: 'Performance', icon: <Activity className="w-4 h-4" />, route: '/settings/performance' }
      ]
    },

    // 2. Personnalisation
    {
      id: 'customization',
      name: 'Personnalisation',
      icon: <Palette className="w-8 h-8 text-teal-500" />,
      description: 'Personnalisation de l\'interface et notifications',
      items: [
        { id: 'theme', name: 'Thèmes', icon: <Moon className="w-4 h-4" />, route: '/settings/appearance/themes' },
        { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" />, route: '/settings/integrations/notifications' },
        { id: 'calendar', name: 'Calendrier', icon: <Calendar className="w-4 h-4" />, route: '/settings/calendar' }
      ]
    },

    // 3. Internationalisation
    {
      id: 'i18n',
      name: 'Internationalisation',
      icon: <Globe className="w-8 h-8 text-green-500" />,
      description: 'Paramètres multilingues et régionaux',
      items: [
        { id: 'languages', name: 'Langues', icon: <Languages className="w-4 h-4" />, route: '/settings/localization/languages' },
        { id: 'translations', name: 'Traductions', icon: <Languages className="w-4 h-4" />, route: '/settings/localization/translations' },
        { id: 'countries', name: 'Pays', icon: <Globe className="w-4 h-4" />, route: '/settings/localization/countries' },
        { id: 'currencies', name: 'Devises', icon: <DollarSign className="w-4 h-4" />, route: '/settings/localization/currencies' },
        { id: 'formats', name: 'Formats', icon: <Calendar className="w-4 h-4" />, route: '/settings/localization/date-formats' }
      ]
    },
    // 3. Données et système
    {
      id: 'system',
      name: 'Données & Système',
      icon: <Database className="w-8 h-8 text-purple-500" />,
      description: 'Gestion des données et infrastructure',
      items: [
        { id: 'database', name: 'Base de données', icon: <Database className="w-4 h-4" />, route: '/settings/system/database' },
        { id: 'backup', name: 'Sauvegarde', icon: <HardDrive className="w-4 h-4" />, route: '/settings/system/backup' },
        { id: 'api', name: 'API', icon: <Cloud className="w-4 h-4" />, route: '/settings/system/api' },
        { id: 'email', name: 'Email', icon: <Mail className="w-4 h-4" />, route: '/settings/system/email' },
        { id: 'logging', name: 'Journaux', icon: <FileText className="w-4 h-4" />, route: '/settings/system/logging' }
      ]
    },
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
