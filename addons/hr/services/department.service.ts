import { api } from '../../../src/config/api';

export interface HrDepartment {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const departmentService = {
  async getAll(params?: { active?: boolean }): Promise<HrDepartment[]> {
    try {
      const res = await api.get<HrDepartment[]>('/hr/departments', { params });
      return (res.data as any) ?? [];
    } catch (e: any) {
      console.error('[departmentService] getAll error', e?.message || e);
      throw new Error('Impossible de charger les départements');
    }
  },

  async getById(id: number | string): Promise<HrDepartment> {
    try {
      const res = await api.get<HrDepartment>(`/hr/departments/${id}`);
      return res.data as any;
    } catch (e: any) {
      console.error('[departmentService] getById error', id, e?.message || e);
      throw new Error('Département introuvable');
    }
  },

  async create(payload: Partial<HrDepartment>): Promise<HrDepartment> {
    try {
      const res = await api.post<HrDepartment>('/hr/departments', payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[departmentService] create error', payload, e?.message || e);
      throw new Error('Impossible de créer le département');
    }
  },

  async update(id: number | string, payload: Partial<HrDepartment>): Promise<HrDepartment> {
    try {
      const res = await api.put<HrDepartment>(`/hr/departments/${id}`, payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[departmentService] update error', id, e?.message || e);
      throw new Error('Impossible de mettre à jour le département');
    }
  },

  async remove(id: number | string): Promise<void> {
    try {
      await api.delete(`/hr/departments/${id}`);
    } catch (e: any) {
      console.error('[departmentService] remove error', id, e?.message || e);
      throw new Error('Impossible de supprimer le département');
    }
  }
};

export default departmentService;
