import { api } from '../config/api';
import type { SecuritySetting } from '@/types/security';

export const securityService = {
  async getAll(): Promise<SecuritySetting[]> {
    const response = await api.get('/security-settings');
    const body = response.data;
    // Unwrap controller wrapper { success, message, data } if present
    if (Array.isArray(body)) return body as SecuritySetting[];
    if (body && Array.isArray(body.data)) return body.data as SecuritySetting[];
    return [];
  },

  async getByKey(key: string): Promise<SecuritySetting> {
    const response = await api.get(`/security-settings/${key}`);
    const body = response.data;
    return (body && body.data) ? body.data as SecuritySetting : body as SecuritySetting;
  },

  async update(key: string, value: string): Promise<SecuritySetting> {
    const response = await api.patch(`/security-settings/${key}`, { value });
    const body = response.data;
    return (body && body.data) ? body.data as SecuritySetting : body as SecuritySetting;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/security-settings/categories');
    const body = response.data;
    if (Array.isArray(body)) return body as string[];
    if (body && Array.isArray(body.data)) return body.data as string[];
    return [];
  }
};
