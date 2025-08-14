import api from './api';

// Types pour les traductions
export interface Translation {
  id: string;
  key: string;
  locale: string;
  namespace: string;
  value: string;
  is_default: boolean;
  active: boolean;
  description?: string;
}

// Service pour les traductions
export const translationService = {
  // Récupérer toutes les traductions
  async getAll(): Promise<Translation[]> {
    const response = await api.get('/translations');
    return response.data;
  },

  // Récupérer une traduction par son ID
  async getById(id: string): Promise<Translation> {
    const response = await api.get(`/translations/${id}`);
    return response.data;
  },

  // Récupérer les traductions par locale
  async getByLocale(locale: string): Promise<Record<string, Record<string, string>>> {
    const response = await api.get(`/translations/locale/${locale}`);
    return response.data;
  },

  // Récupérer les traductions par clé
  async getByKey(key: string): Promise<Translation[]> {
    const response = await api.get(`/translations/key/${key}`);
    return response.data;
  },

  // Récupérer les traductions par namespace
  async getByNamespace(namespace: string): Promise<Translation[]> {
    const response = await api.get(`/translations/namespace/${namespace}`);
    return response.data;
  },

  // Créer une nouvelle traduction
  async create(translation: Omit<Translation, 'id'>): Promise<Translation> {
    const response = await api.post('/translations', translation);
    return response.data;
  },

  // Mettre à jour une traduction
  async update(id: string, translation: Partial<Translation>): Promise<Translation> {
    const response = await api.put(`/translations/${id}`, translation);
    return response.data;
  },

  // Supprimer une traduction
  async delete(id: string): Promise<void> {
    await api.delete(`/translations/${id}`);
  },

  // Activer/désactiver une traduction
  async toggleStatus(id: string): Promise<Translation> {
    const response = await api.patch(`/translations/${id}/toggle-status`);
    return response.data;
  },

  // Définir une traduction comme traduction par défaut
  async setDefault(id: string): Promise<Translation> {
    const response = await api.patch(`/translations/${id}/set-default`);
    return response.data;
  }
};
