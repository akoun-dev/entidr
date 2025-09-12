import { api } from '../../../src/config/api';

export interface HrDocument {
  id: number;
  employee_id?: number;
  name: string;
  type?: string;
  file_url: string;
  mime_type?: string;
  size_bytes?: number;
  created_at: string;
  updated_at: string;
}

export const documentService = {
  async getAll(params?: { employee_id?: number | string }): Promise<HrDocument[]> {
    try {
      const res = await api.get<HrDocument[]>('/hr/documents', { params });
      return (res.data as any) ?? [];
    } catch (e: any) {
      console.error('[documentService] getAll error', e?.message || e);
      throw new Error('Impossible de charger les documents');
    }
  },

  async getById(id: number | string): Promise<HrDocument> {
    try {
      const res = await api.get<HrDocument>(`/hr/documents/${id}`);
      return res.data as any;
    } catch (e: any) {
      console.error('[documentService] getById error', id, e?.message || e);
      throw new Error('Document introuvable');
    }
  },

  async create(payload: Partial<HrDocument>): Promise<HrDocument> {
    try {
      const res = await api.post<HrDocument>('/hr/documents', payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[documentService] create error', payload, e?.message || e);
      throw new Error('Impossible de créer le document');
    }
  },

  async update(id: number | string, payload: Partial<HrDocument>): Promise<HrDocument> {
    try {
      const res = await api.put<HrDocument>(`/hr/documents/${id}`, payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[documentService] update error', id, e?.message || e);
      throw new Error('Impossible de mettre à jour le document');
    }
  },

  async remove(id: number | string): Promise<void> {
    try {
      await api.delete(`/hr/documents/${id}`);
    } catch (e: any) {
      console.error('[documentService] remove error', id, e?.message || e);
      throw new Error('Impossible de supprimer le document');
    }
  }
};

export default documentService;
