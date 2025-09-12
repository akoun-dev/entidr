import { api } from '../../../src/config/api';

export interface HrEmployee {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  department_id?: number;
  hire_date?: string;
  salary?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const employeeService = {
  async getAll(params?: { active?: boolean; department_id?: number }): Promise<HrEmployee[]> {
    try {
      const res = await api.get<HrEmployee[]>('/hr/employees', { params });
      return (res.data as any) ?? [];
    } catch (e: any) {
      console.error('[employeeService] getAll error', e?.message || e);
      throw new Error('Impossible de charger les employés');
    }
  },

  async getById(id: number | string): Promise<HrEmployee> {
    try {
      const res = await api.get<HrEmployee>(`/hr/employees/${id}`);
      return res.data as any;
    } catch (e: any) {
      console.error('[employeeService] getById error', id, e?.message || e);
      throw new Error('Employé introuvable');
    }
  },

  async create(payload: Partial<HrEmployee>): Promise<HrEmployee> {
    try {
      const res = await api.post<HrEmployee>('/hr/employees', payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[employeeService] create error', payload, e?.message || e);
      throw new Error('Impossible de créer l\'employé');
    }
  },

  async update(id: number | string, payload: Partial<HrEmployee>): Promise<HrEmployee> {
    try {
      const res = await api.put<HrEmployee>(`/hr/employees/${id}`, payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[employeeService] update error', id, e?.message || e);
      throw new Error('Impossible de mettre à jour l\'employé');
    }
  },

  async remove(id: number | string): Promise<void> {
    try {
      await api.delete(`/hr/employees/${id}`);
    } catch (e: any) {
      console.error('[employeeService] remove error', id, e?.message || e);
      throw new Error('Impossible de supprimer l\'employé');
    }
  }
};

export default employeeService;
