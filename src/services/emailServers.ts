import api from './api';

// Types pour les serveurs d'email
export interface EmailServer {
  id: string;
  name: string;
  protocol: 'smtp' | 'sendmail';
  host: string;
  port: number;
  username?: string;
  password?: string;
  encryption: 'tls' | 'ssl' | 'none';
  from_email: string;
  from_name: string;
  is_default: boolean;
  active: boolean;
}

// Service pour les serveurs d'email
export const emailServerService = {
  // Récupérer tous les serveurs d'email
  async getAll(): Promise<EmailServer[]> {
    const response = await api.get('/emailservers');
    return response.data;
  },

  // Récupérer un serveur d'email par son ID
  async getById(id: string): Promise<EmailServer> {
    const response = await api.get(`/emailservers/${id}`);
    return response.data;
  },

  // Créer un nouveau serveur d'email
  async create(emailServer: Omit<EmailServer, 'id'>): Promise<EmailServer> {
    const response = await api.post('/emailservers', emailServer);
    return response.data;
  },

  // Mettre à jour un serveur d'email
  async update(id: string, emailServer: Partial<EmailServer>): Promise<EmailServer> {
    const response = await api.put(`/emailservers/${id}`, emailServer);
    return response.data;
  },

  // Supprimer un serveur d'email
  async delete(id: string): Promise<void> {
    await api.delete(`/emailservers/${id}`);
  },

  // Activer/désactiver un serveur d'email
  async toggleStatus(id: string): Promise<EmailServer> {
    const response = await api.patch(`/emailservers/${id}/toggle-status`);
    return response.data;
  },

  // Définir un serveur d'email comme serveur par défaut
  async setDefault(id: string): Promise<EmailServer> {
    const response = await api.patch(`/emailservers/${id}/set-default`);
    return response.data;
  },

  // Tester la connexion à un serveur d'email
  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/emailservers/${id}/test`);
    return response.data;
  }
};
