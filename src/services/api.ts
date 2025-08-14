import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Configuration de base d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error);
    return Promise.reject(error);
  }
);

export default api;

