import { api } from '../../../src/config/api';
import { TTLCache } from './utils/cache';

export interface HrWorkflow {
  id: number;
  name: string;
  kind: string; // onboarding, offboarding, contract, document, etc.
  config?: any;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const workflowService = {
  _cache: new TTLCache<HrWorkflow[]>(),
  async list(): Promise<HrWorkflow[]> {
    try {
      const cacheKey = 'workflows:list';
      const cached = this._cache.get(cacheKey);
      if (cached) return cached;
      const res = await api.get<HrWorkflow[]>('/hr/workflows');
      const items = (res.data as any) ?? [];
      this._cache.set(cacheKey, items);
      return items;
    } catch (e: any) {
      console.error('[workflowService] list error', e?.message || e);
      throw new Error('Impossible de charger les workflows');
    }
  },
  async getById(id: number|string): Promise<HrWorkflow> {
    try {
      const res = await api.get<HrWorkflow>(`/hr/workflows/${id}`);
      return res.data as any;
    } catch (e: any) {
      console.error('[workflowService] getById error', id, e?.message || e);
      throw new Error('Workflow introuvable');
    }
  },
  async create(payload: Partial<HrWorkflow>): Promise<HrWorkflow> {
    try {
      const res = await api.post<HrWorkflow>('/hr/workflows', payload);
      this._cache.clear('workflows:');
      return res.data as any;
    } catch (e: any) {
      console.error('[workflowService] create error', payload, e?.message || e);
      throw new Error('Impossible de créer le workflow');
    }
  },
  async update(id: number|string, payload: Partial<HrWorkflow>): Promise<HrWorkflow> {
    try {
      const res = await api.put<HrWorkflow>(`/hr/workflows/${id}`, payload);
      this._cache.clear('workflows:');
      return res.data as any;
    } catch (e: any) {
      console.error('[workflowService] update error', id, e?.message || e);
      throw new Error('Impossible de mettre à jour le workflow');
    }
  },
  async remove(id: number|string): Promise<void> {
    try {
      await api.delete(`/hr/workflows/${id}`);
      this._cache.clear('workflows:');
    } catch (e: any) {
      console.error('[workflowService] remove error', id, e?.message || e);
      throw new Error('Impossible de supprimer le workflow');
    }
  }
};

export default workflowService;
