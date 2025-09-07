import { Module } from '../types/module';
import { api } from '../config/api';
import SettingsService from './settingsService';

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
      const response = await api.get<Module[]>(`/modules`);
      return response.data as Module[];
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
      const response = await api.get<Module>(`/modules/${name}`);
      return response.data as Module;
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
      const response = await api.put<Module>(`/modules/${name}/status`, { active });
      return response.data as Module;
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
      const response = await api.post<Module>(`/modules/${name}/install`);
      return response.data as Module;
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
      const response = await api.post<Module>(`/modules/${name}/uninstall`);
      return response.data as Module;
    } catch (error) {
      console.error(`Erreur lors de la désinstallation du module ${name}:`, error);
      throw error;
    }
  }
};

export default moduleService;
