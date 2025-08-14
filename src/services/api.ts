import axios from 'axios';

// Récupérer l'URL de base de l'API depuis les variables d'environnement
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required');
}

// Configuration de base d'axios
const api = axios.create({
  baseURL: apiBaseUrl,
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

