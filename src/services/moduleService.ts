import axios from 'axios';
import { Module } from '../types/module';

/**
 * Récupère l'URL de base de l'API et vérifie qu'elle est définie.
 * Lance une erreur si la variable d'environnement est absente.
 */
const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (!url) {
    throw new Error('VITE_API_BASE_URL is required');
  }
  return url;
};

/**
 * Service pour interagir avec l'API des modules
 */
const moduleService = {
  /**
   * Récupère tous les modules
   * @returns Promise résolvant vers un tableau de modules
   */
  async getAllModules(): Promise<Module[]> {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await axios.get(`${baseUrl}/modules`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      throw error;
    }
  },

  /**
   * Récupère un module par son nom
   * @param name Nom du module
   * @returns Promise résolvant vers le module
   */
  async getModuleByName(name: string): Promise<Module> {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await axios.get(`${baseUrl}/modules/${name}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du module ${name}:`, error);
      throw error;
    }
  },

  /**
   * Active ou désactive un module
   * @param name Nom du module
   * @param active État d'activation du module
   * @returns Promise résolvant vers le module mis à jour
   */
  async toggleModuleStatus(name: string, active: boolean): Promise<Module> {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await axios.put(`${baseUrl}/modules/${name}/status`, { active });
      return response.data.module;
    } catch (error) {
      console.error(`Erreur lors de la modification du statut du module ${name}:`, error);
      throw error;
    }
  },

  /**
   * Installe un module
   * @param name Nom du module
   * @returns Promise résolvant vers le module installé
   */
  async installModule(name: string): Promise<Module> {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await axios.post(`${baseUrl}/modules/${name}/install`);
      return response.data.module;
    } catch (error) {
      console.error(`Erreur lors de l'installation du module ${name}:`, error);
      throw error;
    }
  },

  /**
   * Désinstalle un module
   * @param name Nom du module
   * @returns Promise résolvant vers le module désinstallé
   */
  async uninstallModule(name: string): Promise<Module> {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await axios.post(`${baseUrl}/modules/${name}/uninstall`);
      return response.data.module;
    } catch (error) {
      console.error(`Erreur lors de la désinstallation du module ${name}:`, error);
      throw error;
    }
  }
};

export default moduleService;
