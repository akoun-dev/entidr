import api from './api';

// Types pour les paramètres
export interface Parameter {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
}

// Service pour les paramètres
export const parameterService = {
  // Récupérer tous les paramètres
  async getAll(): Promise<Parameter[]> {
    const response = await api.get('/parameters');
    return response.data;
  },

  // Récupérer les paramètres par catégorie
  async getByCategory(category: string): Promise<Parameter[]> {
    const response = await api.get(`/parameters/category/${category}`);
    return response.data;
  },

  // Récupérer un paramètre par sa clé
  async getByKey(key: string): Promise<Parameter> {
    const response = await api.get(`/parameters/key/${key}`);
    return response.data;
  },

  // Mettre à jour un paramètre
  async update(key: string, value: string): Promise<Parameter> {
    const response = await api.put(`/parameters/key/${key}`, { value });
    return response.data;
  },

  // Mettre à jour plusieurs paramètres
  async updateBatch(parameters: { key: string; value: string }[]): Promise<Parameter[]> {
    const response = await api.put('/parameters/batch', { parameters });
    return response.data;
  }
};
