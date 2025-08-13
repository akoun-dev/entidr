import api from './api';

// Types pour les utilisateurs
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastLogin?: string;
  groups: string[];
}

// Service pour les utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs
  async getAll(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  // Récupérer un utilisateur par son ID
  async getById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Créer un nouvel utilisateur
  async create(user: Omit<User, 'id'>): Promise<User> {
    const response = await api.post('/users', user);
    return response.data;
  },

  // Mettre à jour un utilisateur
  async update(id: string, user: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  // Supprimer un utilisateur
  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Activer/désactiver un utilisateur
  async toggleStatus(id: string, status: 'active' | 'inactive'): Promise<User> {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  }
};
