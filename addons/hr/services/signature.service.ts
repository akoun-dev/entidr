import { api } from '../../../src/config/api';
import { TTLCache } from './utils/cache';

export interface HrSignatureRequest {
  id: number;
  document_id: number;
  employee_id?: number;
  provider: string;
  status: 'pending'|'signed'|'declined';
  token?: string;
  signed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const signatureService = {
  _cache: new TTLCache<HrSignatureRequest[]>(),
  async list(params?: { employee_id?: number|string; document_id?: number|string }) {
    try {
      const key = `signatures:list:${params?.employee_id || ''}:${params?.document_id || ''}`;
      const cached = this._cache.get(key);
      if (cached) return cached;
      const res = await api.get<HrSignatureRequest[]>('/hr/signatures', { params });
      const items = (res.data as any) ?? [];
      this._cache.set(key, items);
      return items;
    } catch (e: any) {
      console.error('[signatureService] list error', e?.message || e);
      throw new Error('Impossible de charger les demandes de signature');
    }
  },
  async request(payload: Partial<HrSignatureRequest>) {
    try {
      const res = await api.post<HrSignatureRequest>('/hr/signatures', payload);
      this._cache.clear('signatures:list:');
      return res.data as any;
    } catch (e: any) {
      console.error('[signatureService] request error', payload, e?.message || e);
      throw new Error('Impossible de créer la demande de signature');
    }
  },
  async sign(id: number|string) {
    try {
      const res = await api.post<HrSignatureRequest>(`/hr/signatures/${id}/sign`, {});
      this._cache.clear('signatures:list:');
      return res.data as any;
    } catch (e: any) {
      console.error('[signatureService] sign error', id, e?.message || e);
      throw new Error('Impossible de marquer la demande comme signée');
    }
  }
};

export default signatureService;
