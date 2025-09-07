import { api } from '../config/api';
import { Company } from '@/types/company';

/**
 * Service pour interagir avec l'API des entreprises
 */
const companyService = {
  /**
   * Récupère les informations de l'entreprise
   * @returns Promise résolvant vers les données de l'entreprise
   */
  async get(): Promise<Company> {
    try {
      const response = await api.get<Company>(`/company`);
      return (response.data as Company) || {
        name: '',
        trading_name: '',
        description: '',
        industry: '',
        foundation_date: '',
        address: '',
        postal_code: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        logo: '',
        legal_form: '',
        registration_number: '',
        vat_number: '',
        share_capital: '',
        legal_representative: '',
        legal_info: ''
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données de l\'entreprise:', error);
      throw error;
    }
  },

  /**
   * Met à jour les informations de l'entreprise
   * @param data Données de l'entreprise à mettre à jour
   * @returns Promise résolvant vers les données mises à jour
   */
  async update(data: Company): Promise<Company> {
    try {
      const response = await api.put<Company>(`/company`, data);
      return response.data as Company;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données de l\'entreprise:', error);
      throw error;
    }
  }
};

export default companyService;
