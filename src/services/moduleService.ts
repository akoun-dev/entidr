import axios from 'axios';
import { Module } from '../types/module';
import { API_BASE_URL } from '../config/api';

/**
 * Service pour interagir avec l'API des modules
 */
const moduleService = {
  /**
   * Récupère tous les modules
   * @returns Promise résolvant vers un tableau de modules
   */
  async getAllModules(): Promise<Module[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/modules`);
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
    try {
      const response = await axios.get(`${API_BASE_URL}/modules/${name}`);
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
    try {
      const response = await axios.put(`${API_BASE_URL}/modules/${name}/status`, { active });
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
    try {
      const response = await axios.post(`${API_BASE_URL}/modules/${name}/install`);
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
    try {
      const response = await axios.post(`${API_BASE_URL}/modules/${name}/uninstall`);
      return response.data.module;
    } catch (error) {
      console.error(`Erreur lors de la désinstallation du module ${name}:`, error);
      throw error;
    }
  }
};

export default moduleService;
