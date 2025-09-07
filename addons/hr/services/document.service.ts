import { api } from '../../../src/config/api';

export interface HrDocument {
  id: number;
  name: string;
  employee_id?: number;
  type?: string;
  file_url: string;
  mime_type?: string;
  size_bytes?: number;
  created_at: string;
  updated_at: string;
}

export const documentService = {
  async getAll(params?: { employee_id?: number | string }): Promise<HrDocument[]> {
    const res = await api.get<HrDocument[]>('/hr/documents', { params });
    return (res.data as any) ?? [];
  },
  async getById(id: number | string): Promise<HrDocument> {
    const res = await api.get<HrDocument>(`/hr/documents/${id}`);
    return res.data as any;
  },
  async create(payload: Partial<HrDocument>): Promise<HrDocument> {
    const res = await api.post<HrDocument>('/hr/documents', payload);
    return res.data as any;
  },
  async update(id: number | string, payload: Partial<HrDocument>): Promise<HrDocument> {
    const res = await api.put<HrDocument>(`/hr/documents/${id}`, payload);
    return res.data as any;
  },
  async remove(id: number | string): Promise<void> {
    await api.delete(`/hr/documents/${id}`);
  }
};

export default documentService;

