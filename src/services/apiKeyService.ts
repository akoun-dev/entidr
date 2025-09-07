import { api } from '@/config/api';
import type { ApiKey } from '@/types/apiKeys';

export const apiKeyService = {
  async getAll(): Promise<ApiKey[]> {
    const response = await api.get('/apikeys');
    return (response.data && response.data.data !== undefined)
      ? response.data.data
      : response.data;
  },

  async create(keyData: Omit<ApiKey, 'id'>): Promise<ApiKey> {
    const response = await api.post('/apikeys', keyData);
    return (response.data && response.data.data !== undefined)
      ? response.data.data
      : response.data;
  },

  async update(id: string, keyData: Partial<ApiKey>): Promise<ApiKey> {
    const response = await api.patch(`/apikeys/${id}`, keyData);
    return (response.data && response.data.data !== undefined)
      ? response.data.data
      : response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/apikeys/${id}`);
  }
};
