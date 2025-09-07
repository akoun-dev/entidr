import { api } from '../../../src/config/api';

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
  async list(): Promise<HrWorkflow[]> {
    const res = await api.get<HrWorkflow[]>('/hr/workflows');
    return (res.data as any) ?? [];
  },
  async getById(id: number|string): Promise<HrWorkflow> {
    const res = await api.get<HrWorkflow>(`/hr/workflows/${id}`);
    return res.data as any;
  },
  async create(payload: Partial<HrWorkflow>): Promise<HrWorkflow> {
    const res = await api.post<HrWorkflow>('/hr/workflows', payload);
    return res.data as any;
  },
  async update(id: number|string, payload: Partial<HrWorkflow>): Promise<HrWorkflow> {
    const res = await api.put<HrWorkflow>(`/hr/workflows/${id}`, payload);
    return res.data as any;
  },
  async remove(id: number|string): Promise<void> {
    await api.delete(`/hr/workflows/${id}`);
  }
};

export default workflowService;

