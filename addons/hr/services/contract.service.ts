import { Contract } from '../models/types';
import { api } from '../../../src/config/api';

export const contractService = {
  async getAll(params?: { q?: string; employee_id?: number | string }): Promise<Contract[]> {
    try {
      const res = await api.get<Contract[]>('/hr/contracts', { params });
      return (res.data as any) ?? [];
    } catch (e: any) {
      console.error('[contractService] getAll error', e?.message || e);
      throw new Error('Impossible de charger les contrats');
    }
  },
  async getById(id: number | string): Promise<Contract> {
    try {
      const res = await api.get<Contract>(`/hr/contracts/${id}`);
      return res.data as any;
    } catch (e: any) {
      console.error('[contractService] getById error', id, e?.message || e);
      throw new Error('Contrat introuvable');
    }
  },
  async create(payload: Partial<Contract>): Promise<Contract> {
    try {
      const res = await api.post<Contract>('/hr/contracts', payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[contractService] create error', payload, e?.message || e);
      throw new Error('Impossible de créer le contrat');
    }
  },
  async update(id: number | string, payload: Partial<Contract>): Promise<Contract> {
    try {
      const res = await api.put<Contract>(`/hr/contracts/${id}`, payload);
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
