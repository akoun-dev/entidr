import { Contract } from '../models/types';
import { api } from '../../../src/config/api';

export const contractService = {
  async getAll(params?: { q?: string; employee_id?: number | string }): Promise<Contract[]> {
    const res = await api.get<Contract[]>('/hr/contracts', { params });
    return (res.data as any) ?? [];
  },
  async getById(id: number | string): Promise<Contract> {
    const res = await api.get<Contract>(`/hr/contracts/${id}`);
    return res.data as any;
  },
  async create(payload: Partial<Contract>): Promise<Contract> {
    const res = await api.post<Contract>('/hr/contracts', payload);
    return res.data as any;
  },
  async update(id: number | string, payload: Partial<Contract>): Promise<Contract> {
    const res = await api.put<Contract>(`/hr/contracts/${id}`, payload);
    return res.data as any;
  },
  async remove(id: number | string): Promise<void> {
    await api.delete(`/hr/contracts/${id}`);
  }
};

export default contractService;

