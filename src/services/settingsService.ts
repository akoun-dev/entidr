import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { Settings } from '../types/settings.ts';
import type {
  DatabaseSettings,
  NotificationSettings,
  AppearanceSettings,
  SecuritySettings,
  EmailSettings,
  CompanySettings
} from '../types/settings.ts';

export interface DatabaseConnectionParams {
  host: string;
  port: string;
  name: string;
  user: string;
  password: string;
}

const SettingsService = {
  // Méthodes principales
  async getSettings<T extends Settings>(module: string): Promise<T> {
    const response = await axios.get(`${API_BASE_URL}/settings/${module}`);
    return response.data as T;
  },

  async saveSettings<T extends Settings>(module: string, settings: T): Promise<T> {
    const response = await axios.put(`${API_BASE_URL}/settings/${module}`, settings);
    return response.data as T;
  },

  async getAllSettings(): Promise<Record<string, Settings>> {
    const response = await axios.get(`${API_BASE_URL}/settings`);
    return response.data as Record<string, Settings>;
  },

  async testDatabaseConnection(connection: DatabaseConnectionParams): Promise<{success: boolean; message: string}> {
    const response = await axios.post(`${API_BASE_URL}/settings/database/test`, connection);
    return response.data as {success: boolean; message: string};
  },

  // Namespaces
  Database: {
    testDatabaseConnection: async (connection: DatabaseConnectionParams) => {
      return SettingsService.testDatabaseConnection(connection);
    },
    save: async (settings: DatabaseSettings) => {
      return SettingsService.saveSettings<DatabaseSettings>('database', settings);
    },
    get: async (): Promise<DatabaseSettings> => {
      return SettingsService.getSettings<DatabaseSettings>('database');
    }
  },

  Notification: {
    save: async (settings: NotificationSettings) => {
      return SettingsService.saveSettings<NotificationSettings>('notification', settings);
    },
    get: async (): Promise<NotificationSettings> => {
      return SettingsService.getSettings<NotificationSettings>('notification');
    }
  },

  Appearance: {
    save: async (settings: AppearanceSettings) => {
      return SettingsService.saveSettings<AppearanceSettings>('appearance', settings);
    },
    get: async (): Promise<AppearanceSettings> => {
      return SettingsService.getSettings<AppearanceSettings>('appearance');
    }
  },

  Security: {
    save: async (settings: SecuritySettings) => {
      return SettingsService.saveSettings<SecuritySettings>('security', settings);
    },
    get: async (): Promise<SecuritySettings> => {
      return SettingsService.getSettings<SecuritySettings>('security');
    }
  },

  Email: {
    save: async (settings: EmailSettings) => {
      return SettingsService.saveSettings<EmailSettings>('email', settings);
    },
    get: async (): Promise<EmailSettings> => {
      return SettingsService.getSettings<EmailSettings>('email');
    }
  },

  Company: {
    save: async (settings: CompanySettings) => {
      return SettingsService.saveSettings<CompanySettings>('company', settings);
    },
    get: async (): Promise<CompanySettings> => {
      return SettingsService.getSettings<CompanySettings>('company');
    }
  }
};

export default SettingsService;
