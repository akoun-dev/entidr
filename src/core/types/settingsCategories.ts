import {
  Settings, Building2, Users, Globe, Cpu,
  Bell, Mail, FileText, BarChart2, Shield,
  Zap, Cloud, RefreshCw, Database, Languages,
  Calendar, CreditCard, Printer, Clock, Box,
  Truck, Hash, Layers, Network, Key, Lock,
  MessageSquare, AlertCircle, Workflow, FileSpreadsheet,
  ShoppingCart, Server, BarChart, DollarSign
} from 'lucide-react';
import type { SettingsCategory } from './settingsTypes';

export const settingsCategories: SettingsCategory[] = [
  // Catégorie Générale
  {
    id: 'general',
    name: 'Général',
    icon: Settings,
    description: 'Paramètres généraux de l\'application',
    items: [
      {
        id: 'company',
        name: 'Société',
        icon: Building2,
        route: '/settings/general/company'
      },
      {
        id: 'users',
        name: 'Utilisateurs',
        icon: Users,
        route: '/settings/general/users'
      },
      {
        id: 'modules',
        name: 'Modules',
        icon: Box,
        route: '/settings/general/modules'
      }
    ]
  },
  // Catégorie Apparence
  {
    id: 'appearance',
    name: 'Apparence',
    icon: Globe,
    description: 'Personnalisation de l\'interface',
    items: [
      {
        id: 'themes',
        name: 'Thèmes',
        icon: Settings,
        route: '/settings/appearance/themes'
      },
      {
        id: 'languages',
        name: 'Langues',
        icon: Languages,
        route: '/settings/appearance/languages'
      }
    ]
  },
  // Catégorie Localisation
  {
    id: 'localization',
    name: 'Localisation',
    icon: Globe,
    description: 'Paramètres régionaux et formats',
    items: [
      {
        id: 'languages',
        name: 'Langues',
        icon: Languages,
        route: '/settings/localization/languages'
      },
      {
        id: 'currencies',
        name: 'Devises',
        icon: DollarSign,
        route: '/settings/localization/currencies'
      },
      {
        id: 'countries',
        name: 'Pays',
        icon: Globe,
        route: '/settings/localization/countries'
      },
      {
        id: 'translations',
        name: 'Traductions',
        icon: Languages,
        route: '/settings/localization/translations'
      },
      {
        id: 'date-formats',
        name: 'Formats de date',
        icon: Calendar,
        route: '/settings/localization/date-formats'
      },
      {
        id: 'time-formats',
        name: 'Formats d\'heure',
        icon: Clock,
        route: '/settings/localization/time-formats'
      },
      {
        id: 'number-formats',
        name: 'Formats de nombre',
        icon: Hash,
        route: '/settings/localization/number-formats'
      }
    ]
  },
  // Catégorie Système
  {
    id: 'system',
    name: 'Système',
    icon: Cpu,
    description: 'Configuration système avancée',
    items: [
      {
        id: 'database',
        name: 'Base de données',
        icon: Database,
        route: '/settings/system/database'
      },
      {
        id: 'email',
        name: 'Email',
        icon: Mail,
        route: '/settings/system/email'
      },
      {
        id: 'security',
        name: 'Sécurité',
        icon: Lock,
        route: '/settings/system/security'
      },
      {
        id: 'api',
        name: 'API',
        icon: Cloud,
        route: '/settings/system/api'
      },
      {
        id: 'logging',
        name: 'Journalisation',
        icon: FileText,
        route: '/settings/system/logging'
      }
    ]
  },
  // Catégorie Localisation
  {
    id: 'localization',
    name: 'Localisation',
    icon: Globe,
    description: 'Paramètres régionaux et formats',
    items: [
      {
        id: 'languages',
        name: 'Langues',
        icon: Languages,
        route: '/settings/languages'
      },
      {
        id: 'currencies',
        name: 'Devises',
        icon: DollarSign,
        route: '/settings/currencies'
      },
      {
        id: 'countries',
        name: 'Pays',
        icon: Globe,
        route: '/settings/countries'
      },
      {
        id: 'translations',
        name: 'Traductions',
        icon: Languages,
        route: '/settings/translations'
      },
      {
        id: 'date_formats',
        name: 'Formats de date',
        icon: Calendar,
        route: '/settings/date-formats'
      },
      {
        id: 'time_formats',
        name: 'Formats d\'heure',
        icon: Clock,
        route: '/settings/time-formats'
      },
      {
        id: 'number_formats',
        name: 'Formats de nombre',
        icon: Hash,
        route: '/settings/number-formats'
      }
    ]
  },

  // Catégorie Documents
  {
    id: 'documents',
    name: 'Documents',
    icon: FileText,
    description: 'Gestion des documents et rapports',
    items: [
      {
        id: 'layouts',
        name: 'Mises en page',
        icon: FileText,
        route: '/settings/documents/layouts'
      },
      {
        id: 'templates',
        name: 'Modèles',
        icon: FileSpreadsheet,
        route: '/settings/documents/templates'
      },
      {
        id: 'printers',
        name: 'Imprimantes',
        icon: Printer,
        route: '/settings/documents/printers'
      }
    ]
  },


  // Catégorie Audit
  {
    id: 'audit',
    name: 'Audit',
    icon: FileText,
    description: 'Configuration des audits et traçabilité',
    items: [
      {
        id: 'audit_settings',
        name: 'Paramètres d\'audit',
        icon: FileText,
        route: '/settings/audit'
      }
    ]
  },

  // Catégorie Backup
  {
    id: 'backup',
    name: 'Sauvegarde',
    icon: Database,
    description: 'Gestion des sauvegardes et restaurations',
    items: [
      {
        id: 'backup_settings',
        name: 'Paramètres de sauvegarde',
        icon: Database,
        route: '/settings/backup'
      }
    ]
  },

  // Catégorie Workflow
  {
    id: 'workflow',
    name: 'Workflow',
    icon: Workflow,
    description: 'Configuration des flux de travail automatisés',
    items: [
      {
        id: 'workflow_settings',
        name: 'Paramètres de workflow',
        icon: Workflow,
        route: '/settings/workflows'
      }
    ]
  },

  // Catégorie Conformité
  {
    id: 'compliance',
    name: 'Conformité',
    icon: Shield,
    description: 'Gestion de la conformité réglementaire',
    items: [
      {
        id: 'compliance_settings',
        name: 'Paramètres de conformité',
        icon: Shield,
        route: '/settings/compliance'
      }
    ]
  },

  // Catégorie Import/Export
  {
    id: 'import_export',
    name: 'Import/Export',
    icon: FileSpreadsheet,
    description: 'Configuration des outils d\'échange de données',
    items: [
      {
        id: 'import_export_settings',
        name: 'Paramètres d\'import/export',
        icon: FileSpreadsheet,
        route: '/settings/import-export'
      }
    ]
  },

  // Catégorie Calendrier
  {
    id: 'calendar',
    name: 'Calendrier',
    icon: Calendar,
    description: 'Configuration du système de calendrier',
    items: [
      {
        id: 'calendar_settings',
        name: 'Paramètres de calendrier',
        icon: Calendar,
        route: '/settings/calendar'
      }
    ]
  },

  // Catégorie Numération
  {
    id: 'sequences',
    name: 'Numération',
    icon: Hash,
    description: 'Gestion des numéros de séquence pour les documents',
    items: [
      {
        id: 'sequences_settings',
        name: 'Paramètres de numération',
        icon: Hash,
        route: '/settings/sequences'
      }
    ]
  },

  {
    id: 'security',
    name: 'Sécurité',
    icon: Lock,
    description: 'Paramètres de sécurité et permissions',
    items: [
      {
        id: 'authentication',
        name: 'Authentification',
        icon: Key,
        route: '/settings/security/authentication'
      },
      {
        id: 'permissions',
        name: 'Permissions',
        icon: Shield,
        route: '/settings/security/permissions'
      }
    ]
  },
  // Catégorie Intégrations
  {
    id: 'integrations',
    name: 'Intégrations',
    icon: Network,
    description: 'Connexions avec services externes',
    items: [
      {
        id: 'payment_providers',
        name: 'Fournisseurs de paiement',
        icon: CreditCard,
        route: '/settings/integrations/payment'
      },
      {
        id: 'shipping_methods',
        name: 'Méthodes d\'expédition',
        icon: Truck,
        route: '/settings/integrations/shipping'
      },
      {
        id: 'external_services',
        name: 'Services externes',
        icon: Globe,
        route: '/settings/integrations/external'
      },
      {
        id: 'calendar',
        name: 'Calendriers',
        icon: Calendar,
        route: '/settings/integrations/calendar'
      }
    ]
  },

  // Catégorie Performance
  {
    id: 'performance',
    name: 'Performance',
    icon: Server,
    description: 'Optimisation des performances du système',
    items: [
      {
        id: 'performance_settings',
        name: 'Paramètres',
        icon: Server,
        route: '/settings/performance'
      },
      {
        id: 'monitoring',
        name: 'Monitoring',
        icon: Shield,
        route: '/settings/performance/monitoring'
      },
      {
        id: 'caching',
        name: 'Cache',
        icon: Zap,
        route: '/settings/performance/caching'
      }
    ]
  },
  {
    id: 'data',
    name: 'Données',
    icon: Database,
    description: 'Gestion des données et exports',
    items: [
      {
        id: 'import-export',
        name: 'Import/Export',
        icon: Layers,
        route: '/settings/data/import-export'
      },
      {
        id: 'backup',
        name: 'Sauvegardes',
        icon: Database,
        route: '/settings/data/backup'
      }
    ]
  }
];