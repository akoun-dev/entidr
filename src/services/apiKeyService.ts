import { api } from '@/config/api';
import type { ApiKey } from '@/types/apiKeys';

export const apiKeyService = {
  async getAll(): Promise<ApiKey[]> {
    const response = await api.get('/api-keys');
    return response.data;
  },

  async create(keyData: Omit<ApiKey, 'id'>): Promise<ApiKey> {
    const response = await api.post('/api-keys', keyData);
    return response.data;
  },

  async update(id: string, keyData: Partial<ApiKey>): Promise<ApiKey> {
    const response = await api.patch(`/api-keys/${id}`, keyData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api-keys/${id}`);
  }
};
