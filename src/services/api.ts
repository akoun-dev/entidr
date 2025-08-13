import axios from 'axios';

// Configuration de base d'axios
const api = axios.create({
  baseURL: 'http://164.160.40.182:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
export { api };
