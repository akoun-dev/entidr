/**
 * Service centralisé pour accéder aux données de référence
 * Ce service fournit des méthodes pour récupérer les données des tables de référence
 * comme les utilisateurs, pays, devises, langues, etc.
 */
import axios from 'axios';

class ReferenceDataService {
  // Méthodes génériques
  async getAll(endpoint: string, params = {}) {
    try {
      const response = await axios.get(`/api/${endpoint}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données depuis ${endpoint}:`, error);
      throw error;
    }
  }
  
  async getById(endpoint: string, id: number | string) {
    try {
      const response = await axios.get(`/api/${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données depuis ${endpoint}/${id}:`, error);
      throw error;
    }
  }
  
  // Méthodes spécifiques pour chaque type de données de référence
  
  // Utilisateurs
  async getUsers(params = {}) {
    return this.getAll('users', params);
  }
  
  async getUser(id: number | string) {
    return this.getById('users', id);
  }
  
  // Groupes
  async getGroups(params = {}) {
    return this.getAll('groups', params);
  }
  
  async getGroup(id: number | string) {
    return this.getById('groups', id);
  }
  
  // Pays
  async getCountries(params = {}) {
    return this.getAll('countries', params);
  }
  
  async getCountry(id: number | string) {
    return this.getById('countries', id);
  }
  
  // Devises
  async getCurrencies(params = {}) {
    return this.getAll('currencies', params);
  }
  
  async getCurrency(id: number | string) {
    return this.getById('currencies', id);
  }
  
  // Langues
  async getLanguages(params = {}) {
    return this.getAll('languages', params);
  }
  
  async getLanguage(id: number | string) {
    return this.getById('languages', id);
  }
  
  // Formats de date
  async getDateFormats(params = {}) {
    return this.getAll('dateformats', params);
  }
  
  async getDateFormat(id: number | string) {
    return this.getById('dateformats', id);
  }
  
  // Formats d'heure
  async getTimeFormats(params = {}) {
    return this.getAll('timeformats', params);
  }
  
  async getTimeFormat(id: number | string) {
    return this.getById('timeformats', id);
  }
  
  // Formats de nombre
  async getNumberFormats(params = {}) {
    return this.getAll('numberformats', params);
  }
  
  async getNumberFormat(id: number | string) {
    return this.getById('numberformats', id);
  }
  
  // Canaux de notification
  async getNotificationChannels(params = {}) {
    return this.getAll('notification-channels', params);
  }
  
  async getNotificationChannel(id: number | string) {
    return this.getById('notification-channels', id);
  }
  
  // Fournisseurs de paiement
  async getPaymentProviders(params = {}) {
    return this.getAll('payment-providers', params);
  }
  
  async getPaymentProvider(id: number | string) {
    return this.getById('payment-providers', id);
  }
  
  // Méthodes d'expédition
  async getShippingMethods(params = {}) {
    return this.getAll('shipping-methods', params);
  }
  
  async getShippingMethod(id: number | string) {
    return this.getById('shipping-methods', id);
  }
  
  // Imprimantes
  async getPrinters(params = {}) {
    return this.getAll('printers', params);
  }
  
  async getPrinter(id: number | string) {
    return this.getById('printers', id);
  }
}

// Exporter une instance unique du service
export default new ReferenceDataService();
