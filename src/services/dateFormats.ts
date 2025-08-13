import api from './api';

// Types pour les formats de date
export interface DateFormat {
  id: string;
  name: string;
  format: string;
  description?: string;
  type: 'date' | 'time' | 'datetime';
  is_default: boolean;
  active: boolean;
}

// Service pour les formats de date
export const dateFormatService = {
  // Récupérer tous les formats de date
  async getAll(): Promise<DateFormat[]> {
    const response = await api.get('/dateformats');
    return response.data;
  },

  // Récupérer un format de date par son ID
  async getById(id: string): Promise<DateFormat> {
    const response = await api.get(`/dateformats/${id}`);
    return response.data;
  },

  // Créer un nouveau format de date
  async create(dateFormat: Omit<DateFormat, 'id'>): Promise<DateFormat> {
    const response = await api.post('/dateformats', dateFormat);
    return response.data;
  },

  // Mettre à jour un format de date
  async update(id: string, dateFormat: Partial<DateFormat>): Promise<DateFormat> {
    const response = await api.put(`/dateformats/${id}`, dateFormat);
    return response.data;
  },

  // Supprimer un format de date
  async delete(id: string): Promise<void> {
    await api.delete(`/dateformats/${id}`);
  },

  // Activer/désactiver un format de date
  async toggleStatus(id: string): Promise<DateFormat> {
    const response = await api.patch(`/dateformats/${id}/toggle-status`);
    return response.data;
  },

  // Définir un format de date comme format par défaut
  async setDefault(id: string): Promise<DateFormat> {
    const response = await api.patch(`/dateformats/${id}/set-default`);
    return response.data;
  }
};
