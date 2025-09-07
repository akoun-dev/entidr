import axios from 'axios';

// Default to v1 API prefix to match server mounts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    // Vérifier d'abord si on est côté client (dans le navigateur)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Normaliser les réponses enveloppées { data, error } ou { success, data }
api.interceptors.response.use(
  (response) => {
    const payload = response?.data;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return { ...response, data: payload.data } as typeof response;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export { api };
