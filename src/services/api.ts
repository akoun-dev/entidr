import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Configuration de base d'axios
const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalisation des réponses: déballe { data, error } ou { success, data }
api.interceptors.response.use(
  (response) => {
    const payload = response?.data;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      // Conserver l'objet Response mais aplatir .data au contenu utile
      return { ...response, data: payload.data } as typeof response;
    }
    return response;
  },
  (error) => {
    console.error('Erreur API:', error);
    return Promise.reject(error);
  }
);

export default api;
