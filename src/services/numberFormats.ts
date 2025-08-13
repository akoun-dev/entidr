import api from './api';

// Types pour les formats de nombre
export interface NumberFormat {
  id: string;
  name: string;
  decimal_separator: string;
  thousands_separator?: string;
  decimal_places: number;
  currency_display: 'symbol' | 'code' | 'name';
  is_default: boolean;
  active: boolean;
}

// Service pour les formats de nombre
export const numberFormatService = {
  // Récupérer tous les formats de nombre
  async getAll(): Promise<NumberFormat[]> {
    const response = await api.get('/numberformats');
    return response.data;
  },

  // Récupérer un format de nombre par son ID
  async getById(id: string): Promise<NumberFormat> {
    const response = await api.get(`/numberformats/${id}`);
    return response.data;
  },

  // Créer un nouveau format de nombre
  async create(numberFormat: Omit<NumberFormat, 'id'>): Promise<NumberFormat> {
    const response = await api.post('/numberformats', numberFormat);
    return response.data;
  },

  // Mettre à jour un format de nombre
  async update(id: string, numberFormat: Partial<NumberFormat>): Promise<NumberFormat> {
    const response = await api.put(`/numberformats/${id}`, numberFormat);
    return response.data;
  },

  // Supprimer un format de nombre
  async delete(id: string): Promise<void> {
    await api.delete(`/numberformats/${id}`);
  },

  // Activer/désactiver un format de nombre
  async toggleStatus(id: string): Promise<NumberFormat> {
    const response = await api.patch(`/numberformats/${id}/toggle-status`);
    return response.data;
  },

  // Définir un format de nombre comme format par défaut
  async setDefault(id: string): Promise<NumberFormat> {
    const response = await api.patch(`/numberformats/${id}/set-default`);
    return response.data;
  }
};
