import api from './api';

// Types pour les devises
export interface Currency {
  id: string;
  name: string;
  symbol: string;
  code: string;
  rate: number;
  position: 'before' | 'after';
  decimal_places: number;
  rounding: number;
  active: boolean;
}

// Service pour les devises
export const currencyService = {
  // Récupérer toutes les devises
  async getAll(): Promise<Currency[]> {
    const response = await api.get('/currencies');
    return response.data;
  },

  // Récupérer une devise par son ID
  async getById(id: string): Promise<Currency> {
    const response = await api.get(`/currencies/${id}`);
    return response.data;
  },

  // Créer une nouvelle devise
  async create(currency: Omit<Currency, 'id'>): Promise<Currency> {
    const response = await api.post('/currencies', currency);
    return response.data;
  },

  // Mettre à jour une devise
  async update(id: string, currency: Partial<Currency>): Promise<Currency> {
    const response = await api.put(`/currencies/${id}`, currency);
    return response.data;
  },

  // Supprimer une devise
  async delete(id: string): Promise<void> {
    await api.delete(`/currencies/${id}`);
  },

  // Activer/désactiver une devise
  async toggleStatus(id: string): Promise<Currency> {
    const response = await api.patch(`/currencies/${id}/toggle-status`);
    return response.data;
  }
};
