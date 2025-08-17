import { api } from '../config/api';
import type { SecuritySetting } from '@/types/security';

export const securityService = {
  async getAll(): Promise<SecuritySetting[]> {
    const response = await api.get('/security-settings');
    return response.data;
  },

  async getByKey(key: string): Promise<SecuritySetting> {
    const response = await api.get(`/security-settings/${key}`);
    return response.data;
  },

  async update(key: string, value: string): Promise<SecuritySetting> {
    const response = await api.patch(`/security-settings/${key}`, { value });
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/security-settings/categories');
    return response.data;
  }
};
