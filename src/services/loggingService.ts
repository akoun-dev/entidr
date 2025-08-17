import { api } from '@/config/api';
import type { LoggingConfig } from '@/types/logging';

export const loggingService = {
  async getConfig(): Promise<LoggingConfig> {
    const response = await api.get('/logging-settings');
    return response.data;
  },

  async updateConfig(config: Partial<LoggingConfig>): Promise<LoggingConfig> {
    const response = await api.patch('/logging-settings', config);
    return response.data;
  }
};
