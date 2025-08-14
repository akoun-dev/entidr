import api from './api';

// Types pour les formats d'heure
export interface TimeFormat {
  id: string;
  name: string;
  format: string;
  example: string;
  region: string;
  uses_24_hour: boolean;
  is_default: boolean;
  active: boolean;
}

// Service pour les formats d'heure
export const timeFormatService = {
  // Récupérer tous les formats d'heure
  async getAll(): Promise<TimeFormat[]> {
    const response = await api.get('/timeformats');
    return response.data;
  },

  // Récupérer un format d'heure par son ID
  async getById(id: string): Promise<TimeFormat> {
    const response = await api.get(`/timeformats/${id}`);
    return response.data;
  },

  // Créer un nouveau format d'heure
  async create(timeFormat: Omit<TimeFormat, 'id'>): Promise<TimeFormat> {
    const response = await api.post('/timeformats', timeFormat);
    return response.data;
  },

  // Mettre à jour un format d'heure
  async update(id: string, timeFormat: Partial<TimeFormat>): Promise<TimeFormat> {
    const response = await api.put(`/timeformats/${id}`, timeFormat);
    return response.data;
  },

  // Supprimer un format d'heure
  async delete(id: string): Promise<void> {
    await api.delete(`/timeformats/${id}`);
  },

  // Activer/désactiver un format d'heure
  async toggleStatus(id: string): Promise<TimeFormat> {
    const response = await api.patch(`/timeformats/${id}/toggle-status`);
    return response.data;
  },

  // Définir un format d'heure comme format par défaut
  async setDefault(id: string): Promise<TimeFormat> {
    const response = await api.patch(`/timeformats/${id}/set-default`);
    return response.data;
  }
};
