import { api } from '@/config/api';
import type { AuditConfig } from '@/types/audit';

export const auditService = {
  async getConfig(): Promise<AuditConfig> {
    const response = await api.get('/audit-config');
    return response.data;
  },

  async updateConfig(config: Partial<AuditConfig>): Promise<AuditConfig> {
    const response = await api.patch('/audit-config', config);
    return response.data;
  }
};
