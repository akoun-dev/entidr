import { Department } from '../models/types';
import { api } from '../../../src/config/api';

export const departmentService = {
  async getAll(): Promise<Department[]> {
    const res = await api.get<Department[]>('/hr/departments');
    return (res.data as any) ?? [];
  },
  async getById(id: number | string): Promise<Department> {
    const res = await api.get<Department>(`/hr/departments/${id}`);
    return res.data as any;
  },
  async create(payload: Partial<Department>): Promise<Department> {
    const res = await api.post<Department>('/hr/departments', payload);
    return res.data as any;
  },
  async update(id: number | string, payload: Partial<Department>): Promise<Department> {
    const res = await api.put<Department>(`/hr/departments/${id}`, payload);
    return res.data as any;
  },
  async remove(id: number | string): Promise<void> {
    await api.delete(`/hr/departments/${id}`);
  }
};

export default departmentService;

