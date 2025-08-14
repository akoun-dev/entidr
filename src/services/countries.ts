import api from './api';

// Types pour les pays
export interface Country {
  id: string;
  name: string;
  code: string;
  phone_code?: string;
  currency_code?: string;
  region?: string;
  active: boolean;
}

// Service pour les pays
export const countryService = {
  // Récupérer tous les pays
  async getAll(): Promise<Country[]> {
    const response = await api.get('/countries');
    return response.data;
  },

  // Récupérer un pays par son ID
  async getById(id: string): Promise<Country> {
    const response = await api.get(`/countries/${id}`);
    return response.data;
  },

  // Créer un nouveau pays
  async create(country: Omit<Country, 'id'>): Promise<Country> {
    const response = await api.post('/countries', country);
    return response.data;
  },

  // Mettre à jour un pays
  async update(id: string, country: Partial<Country>): Promise<Country> {
    const response = await api.put(`/countries/${id}`, country);
    return response.data;
  },

  // Supprimer un pays
  async delete(id: string): Promise<void> {
    await api.delete(`/countries/${id}`);
  },

  // Activer/désactiver un pays
  async toggleStatus(id: string): Promise<Country> {
    const response = await api.patch(`/countries/${id}/toggle-status`);
    return response.data;
  }
};
