import api from './api';

// Types pour les groupes
export interface Group {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  active: boolean;
  memberCount?: number;
}

// Service pour les groupes
export const groupService = {
  // Récupérer tous les groupes
  async getAll(): Promise<Group[]> {
    const response = await api.get('/groups');
    return response.data;
  },

  // Récupérer un groupe par son ID
  async getById(id: string): Promise<Group> {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  // Créer un nouveau groupe
  async create(group: Omit<Group, 'id'>): Promise<Group> {
    const response = await api.post('/groups', group);
    return response.data;
  },

  // Mettre à jour un groupe
  async update(id: string, group: Partial<Group>): Promise<Group> {
    const response = await api.put(`/groups/${id}`, group);
    return response.data;
  },

  // Supprimer un groupe
  async delete(id: string): Promise<void> {
    await api.delete(`/groups/${id}`);
  }
};
