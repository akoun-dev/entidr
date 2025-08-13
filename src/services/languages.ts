import api from './api';

// Types pour les langues
export interface Language {
  id: string;
  name: string;
  code: string;
  native_name?: string;
  direction: 'ltr' | 'rtl';
  is_default: boolean;
  active: boolean;
}

// Service pour les langues
export const languageService = {
  // Récupérer toutes les langues
  async getAll(): Promise<Language[]> {
    const response = await api.get('/languages');
    return response.data;
  },

  // Récupérer une langue par son ID
  async getById(id: string): Promise<Language> {
    const response = await api.get(`/languages/${id}`);
    return response.data;
  },

  // Créer une nouvelle langue
  async create(language: Omit<Language, 'id'>): Promise<Language> {
    const response = await api.post('/languages', language);
    return response.data;
  },

  // Mettre à jour une langue
  async update(id: string, language: Partial<Language>): Promise<Language> {
    const response = await api.put(`/languages/${id}`, language);
    return response.data;
  },

  // Supprimer une langue
  async delete(id: string): Promise<void> {
    await api.delete(`/languages/${id}`);
  },

  // Activer/désactiver une langue
  async toggleStatus(id: string): Promise<Language> {
    const response = await api.patch(`/languages/${id}/toggle-status`);
    return response.data;
  },

  // Définir une langue comme langue par défaut
  async setDefault(id: string): Promise<Language> {
    const response = await api.patch(`/languages/${id}/set-default`);
    return response.data;
  }
};
