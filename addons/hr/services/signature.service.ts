import { api } from '../../../src/config/api';

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
  async list(params?: { employee_id?: number|string; document_id?: number|string }) {
    const res = await api.get<HrSignatureRequest[]>('/hr/signatures', { params });
    return (res.data as any) ?? [];
  },
  async request(payload: Partial<HrSignatureRequest>) {
    const res = await api.post<HrSignatureRequest>('/hr/signatures', payload);
    return res.data as any;
  },
  async sign(id: number|string) {
    const res = await api.post<HrSignatureRequest>(`/hr/signatures/${id}/sign`, {});
    return res.data as any;
  }
};

export default signatureService;

