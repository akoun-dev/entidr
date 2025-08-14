import axios from 'axios';
import {
  Settings,
  NotificationSettings,
  AuditSettings,
  BackupSettings,
  AppearanceSettings,
  WorkflowSettings,
  ComplianceSettings,
  ImportExportSettings,
  CalendarSettings,
  SequenceSettings,
  PerformanceSettings,
  CompanySettings,
  UserSettings,
  GroupSettings,
  LanguageSettings,
  CurrencySettings,
  CountrySettings,
  DatabaseSettings,
  EmailSettings,
  SecuritySettings,
  ModuleListSettings,
  AppsStoreSettings,
  DocumentLayoutsSettings,
  ReportTemplatesSettings,
  PaymentProvidersSettings,
  ShippingMethodsSettings
} from '../types/settings.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required');
}

/**
 * Service pour la gestion des paramètres
 */
export const SettingsService = {
  /**
   * Récupère les paramètres pour un module spécifique
   * @param module Nom du module (ex: 'notifications', 'appearance')
   */
  async getSettings<T extends Settings>(module: string): Promise<T> {
    const response = await axios.get(`${API_BASE_URL}/settings/${module}`);
    return response.data as T;
  },

  /**
   * Enregistre les paramètres pour un module spécifique
   * @param module Nom du module
   * @param settings Données des paramètres
   */
  async saveSettings<T extends Settings>(module: string, settings: T): Promise<T> {
    const response = await axios.put(`${API_BASE_URL}/settings/${module}`, settings);
    return response.data as T;
  },

  /**
   * Récupère tous les paramètres de l'application
   */
  async getAllSettings(): Promise<Record<string, Settings>> {
    const response = await axios.get(`${API_BASE_URL}/settings`);
    return response.data as Record<string, Settings>;
  },

  /**
   * Teste la connexion à la base de données
   */
  async testDatabaseConnection(connection: {
    host: string;
    port: string;
    name: string;
    user: string;
    password: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${API_BASE_URL}/settings/database/test`, connection);
    return response.data as { success: boolean; message: string };
  }
};

// Services spécifiques pour chaque module
export const NotificationSettingsService = {
  async get(): Promise<NotificationSettings> {
    return SettingsService.getSettings<NotificationSettings>('notifications');
  },
  async save(settings: NotificationSettings): Promise<NotificationSettings> {
    return SettingsService.saveSettings<NotificationSettings>('notifications', settings);
  }
};

export const AuditSettingsService = {
  async get(): Promise<AuditSettings> {
    return SettingsService.getSettings<AuditSettings>('audit');
  },
  async save(settings: AuditSettings): Promise<AuditSettings> {
    return SettingsService.saveSettings<AuditSettings>('audit', settings);
  }
};

export const BackupSettingsService = {
  async get(): Promise<BackupSettings> {
    return SettingsService.getSettings<BackupSettings>('backup');
  },
  async save(settings: BackupSettings): Promise<BackupSettings> {
    return SettingsService.saveSettings<BackupSettings>('backup', settings);
  }
};

export const AppearanceSettingsService = {
  async get(): Promise<AppearanceSettings> {
    return SettingsService.getSettings<AppearanceSettings>('appearance');
  },
  async save(settings: AppearanceSettings): Promise<AppearanceSettings> {
    return SettingsService.saveSettings<AppearanceSettings>('appearance', settings);
  }
};


export const WorkflowSettingsService = {
  async get(): Promise<WorkflowSettings> {
    return SettingsService.getSettings<WorkflowSettings>('workflow');
  },
  async save(settings: WorkflowSettings): Promise<WorkflowSettings> {
    return SettingsService.saveSettings<WorkflowSettings>('workflow', settings);
  }
};

export const ComplianceSettingsService = {
  async get(): Promise<ComplianceSettings> {
    return SettingsService.getSettings<ComplianceSettings>('compliance');
  },
  async save(settings: ComplianceSettings): Promise<ComplianceSettings> {
    return SettingsService.saveSettings<ComplianceSettings>('compliance', settings);
  }
};

export const ImportExportSettingsService = {
  async get(): Promise<ImportExportSettings> {
    return SettingsService.getSettings<ImportExportSettings>('import-export');
  },
  async save(settings: ImportExportSettings): Promise<ImportExportSettings> {
    return SettingsService.saveSettings<ImportExportSettings>('import-export', settings);
  }
};

export const CalendarSettingsService = {
  async get(): Promise<CalendarSettings> {
    return SettingsService.getSettings<CalendarSettings>('calendar');
  },
  async save(settings: CalendarSettings): Promise<CalendarSettings> {
    return SettingsService.saveSettings<CalendarSettings>('calendar', settings);
  }
};

export const SequenceSettingsService = {
  async get(): Promise<SequenceSettings> {
    return SettingsService.getSettings<SequenceSettings>('sequence');
  },
  async save(settings: SequenceSettings): Promise<SequenceSettings> {
    return SettingsService.saveSettings<SequenceSettings>('sequence', settings);
  }
};
export const PerformanceSettingsService = {
  async get(): Promise<PerformanceSettings> {
    return SettingsService.getSettings<PerformanceSettings>('performance');
  },
  async save(settings: PerformanceSettings): Promise<PerformanceSettings> {
    return SettingsService.saveSettings<PerformanceSettings>('performance', settings);
  }
};

export const CompanySettingsService = {
  async get(): Promise<CompanySettings> {
    return SettingsService.getSettings<CompanySettings>('company');
  },
  async save(settings: CompanySettings): Promise<CompanySettings> {
    return SettingsService.saveSettings<CompanySettings>('company', settings);
  }
};

export const UserSettingsService = {
  async get(): Promise<UserSettings> {
    return SettingsService.getSettings<UserSettings>('users');
  },
  async save(settings: UserSettings): Promise<UserSettings> {
    return SettingsService.saveSettings<UserSettings>('users', settings);
  }
};

export const GroupSettingsService = {
  async get(): Promise<GroupSettings> {
    return SettingsService.getSettings<GroupSettings>('groups');
  },
  async save(settings: GroupSettings): Promise<GroupSettings> {
    return SettingsService.saveSettings<GroupSettings>('groups', settings);
  }
};

export const LanguageSettingsService = {
  async get(): Promise<LanguageSettings> {
    return SettingsService.getSettings<LanguageSettings>('languages');
  },
  async save(settings: LanguageSettings): Promise<LanguageSettings> {
    return SettingsService.saveSettings<LanguageSettings>('languages', settings);
  }
};

export const CurrencySettingsService = {
  async get(): Promise<CurrencySettings> {
    return SettingsService.getSettings<CurrencySettings>('currencies');
  },
  async save(settings: CurrencySettings): Promise<CurrencySettings> {
    return SettingsService.saveSettings<CurrencySettings>('currencies', settings);
  }
};

export const CountrySettingsService = {
  async get(): Promise<CountrySettings> {
    return SettingsService.getSettings<CountrySettings>('countries');
  },
  async save(settings: CountrySettings): Promise<CountrySettings> {
    return SettingsService.saveSettings<CountrySettings>('countries', settings);
  }
};

export const DatabaseSettingsService = {
  async get(): Promise<DatabaseSettings> {
    return SettingsService.getSettings<DatabaseSettings>('database');
  },
  async save(settings: DatabaseSettings): Promise<DatabaseSettings> {
    return SettingsService.saveSettings<DatabaseSettings>('database', settings);
  }
};

export const EmailSettingsService = {
  async get(): Promise<EmailSettings> {
    return SettingsService.getSettings<EmailSettings>('email');
  },
  async save(settings: EmailSettings): Promise<EmailSettings> {
    return SettingsService.saveSettings<EmailSettings>('email', settings);
  }
};

export const SecuritySettingsService = {
  async get(): Promise<SecuritySettings> {
    return SettingsService.getSettings<SecuritySettings>('security');
  },
  async save(settings: SecuritySettings): Promise<SecuritySettings> {
    return SettingsService.saveSettings<SecuritySettings>('security', settings);
  }
};

export const ModuleListSettingsService = {
  async get(): Promise<ModuleListSettings> {
    return SettingsService.getSettings<ModuleListSettings>('modules-list');
  },
  async save(settings: ModuleListSettings): Promise<ModuleListSettings> {
    return SettingsService.saveSettings<ModuleListSettings>('modules-list', settings);
  }
};

export const AppsStoreSettingsService = {
  async get(): Promise<AppsStoreSettings> {
    return SettingsService.getSettings<AppsStoreSettings>('apps-store');
  },
  async save(settings: AppsStoreSettings): Promise<AppsStoreSettings> {
    return SettingsService.saveSettings<AppsStoreSettings>('apps-store', settings);
  }
};

export const DocumentLayoutsSettingsService = {
  async get(): Promise<DocumentLayoutsSettings> {
    return SettingsService.getSettings<DocumentLayoutsSettings>('document-layouts');
  },
  async save(settings: DocumentLayoutsSettings): Promise<DocumentLayoutsSettings> {
    return SettingsService.saveSettings<DocumentLayoutsSettings>('document-layouts', settings);
  }
};

export const ReportTemplatesSettingsService = {
  async get(): Promise<ReportTemplatesSettings> {
    return SettingsService.getSettings<ReportTemplatesSettings>('report-templates');
  },
  async save(settings: ReportTemplatesSettings): Promise<ReportTemplatesSettings> {
    return SettingsService.saveSettings<ReportTemplatesSettings>('report-templates', settings);
  }
};

export const PaymentProvidersSettingsService = {
  async get(): Promise<PaymentProvidersSettings> {
    return SettingsService.getSettings<PaymentProvidersSettings>('payment-providers');
  },
  async save(settings: PaymentProvidersSettings): Promise<PaymentProvidersSettings> {
    return SettingsService.saveSettings<PaymentProvidersSettings>('payment-providers', settings);
  }
};

export const ShippingMethodsSettingsService = {
  async get(): Promise<ShippingMethodsSettings> {
    return SettingsService.getSettings<ShippingMethodsSettings>('shipping-methods');
  },
  async save(settings: ShippingMethodsSettings): Promise<ShippingMethodsSettings> {
    return SettingsService.saveSettings<ShippingMethodsSettings>('shipping-methods', settings);
  }
};
