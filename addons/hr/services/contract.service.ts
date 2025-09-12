import { api } from '../../../src/config/api';

export interface HrContract {
  id: number;
  employee_id: number;
  type: string;
  start_date: string;
  end_date?: string;
  salary?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const contractService = {
  async getAll(params?: { employee_id?: number; status?: string }): Promise<HrContract[]> {
    try {
      const res = await api.get<HrContract[]>('/hr/contracts', { params });
      return (res.data as any) ?? [];
    } catch (e: any) {
      console.error('[contractService] getAll error', e?.message || e);
      throw new Error('Impossible de charger les contrats');
    }
  },

  async getById(id: number | string): Promise<HrContract> {
    try {
      const res = await api.get<HrContract>(`/hr/contracts/${id}`);
      return res.data as any;
    } catch (e: any) {
      console.error('[contractService] getById error', id, e?.message || e);
      throw new Error('Contrat introuvable');
    }
  },

  async create(payload: Partial<HrContract>): Promise<HrContract> {
    try {
      const res = await api.post<HrContract>('/hr/contracts', payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[contractService] create error', payload, e?.message || e);
      throw new Error('Impossible de créer le contrat');
    }
  },

  async update(id: number | string, payload: Partial<HrContract>): Promise<HrContract> {
    try {
      const res = await api.put<HrContract>(`/hr/contracts/${id}`, payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[contractService] update error', id, e?.message || e);
      throw new Error('Impossible de mettre à jour le contrat');
    }
  },

  async remove(id: number | string): Promise<void> {
    try {
      await api.delete(`/hr/contracts/${id}`);
    } catch (e: any) {
      console.error('[contractService] remove error', id, e?.message || e);
      throw new Error('Impossible de supprimer le contrat');
    }
  }
};

export default contractService;
