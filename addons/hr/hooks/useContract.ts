import { useState, useEffect } from 'react';

// Importer les types depuis le fichier types.ts
import {
  Contract,
  Employee,
  Pagination,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Simuler les hooks useAuth et useApi pour éviter les erreurs d'importation
// Ces hooks seront remplacés par les vrais hooks une fois qu'ils seront disponibles
export const useAuth = () => {
  return {
    isAuthenticated: true
  };
};

export const useApi = () => {
  return {
    api: {
      get: async (url: string) => {
        // Simuler une réponse API avec les propriétés attendues
        if (url.includes('/hr/contracts')) {
          if (url.includes('/download')) {
            return { data: { url: '' } };
          } else if (url.includes('/expiring')) {
            return { data: { contracts: [] } };
          } else if (url.includes('/hr/contracts/') && !url.includes('?')) {
            return {
              data: {
                contract: {
                  id: 1,
                  employee_id: 1,
                  type: 'cdi',
                  title: 'CDI Developer',
                  start_date: '2023-01-01',
                  end_date: undefined,
                  salary: 50000,
                  currency: 'EUR',
                  working_hours: 35,
                  status: 'active',
                  description: 'CDI contract for developer position',
                  file_path: '/uploads/contracts/contract-123456789.pdf',
                  created_at: '2023-01-01',
                  updated_at: '2023-01-01'
                }
              }
            };
          } else {
            return {
              data: {
                contracts: [],
                pagination: {
                  total: 0,
                  page: 1,
                  limit: 10,
                  pages: 0
                }
              }
            };
          }
        }
        return { data: {} };
      },
      post: async (url: string, data: any) => {
        // Simuler une réponse API
        return {
          data: {
            contract: {
              id: 1,
              employee_id: 1,
              type: 'cdi',
              title: 'CDI Developer',
              start_date: '2023-01-01',
              end_date: undefined,
              salary: 50000,
              currency: 'EUR',
              working_hours: 35,
              status: 'active',
              description: 'CDI contract for developer position',
              file_path: '/uploads/contracts/contract-123456789.pdf',
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            }
          }
        };
      },
      put: async (url: string, data: any) => {
        // Simuler une réponse API
        return {
          data: {
            contract: {
              id: 1,
              employee_id: 1,
              type: 'cdi',
              title: 'CDI Developer',
              start_date: '2023-01-01',
              end_date: undefined,
              salary: 50000,
              currency: 'EUR',
              working_hours: 35,
              status: 'active',
              description: 'CDI contract for developer position',
              file_path: '/uploads/contracts/contract-123456789.pdf',
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            }
          }
        };
      },
      patch: async (url: string, data: any) => {
        // Simuler une réponse API
        return {
          data: {
            contract: {
              id: 1,
              employee_id: 1,
              type: 'cdi',
              title: 'CDI Developer',
              start_date: '2023-01-01',
              end_date: undefined,
              salary: 50000,
              currency: 'EUR',
              working_hours: 35,
              status: 'active',
              description: 'CDI contract for developer position',
              file_path: '/uploads/contracts/contract-123456789.pdf',
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            }
          }
        };
      },
      delete: async (url: string) => {
        // Simuler une réponse API
        return { data: {} };
      }
    }
  };
};

export interface ContractFilters {
  employee_id?: number;
  type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export const useContract = () => {
  const { api } = useApi();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Récupérer tous les contrats
  const getContracts = async (filters: ContractFilters = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.employee_id) params.append('employee_id', filters.employee_id.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/hr/contracts?${params.toString()}`);

      setContracts(response.data.contracts || []);
      setPagination(response.data.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des contrats');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un contrat par son ID
  const getContractById = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/contracts/${id}`);
      return response.data.contract;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du contrat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau contrat
  const createContract = async (contractData: Partial<Contract>) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/hr/contracts', contractData);
      setContracts(prev => [response.data.contract as Contract, ...prev]);
      return response.data.contract;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du contrat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un contrat
  const updateContract = async (id: number, contractData: Partial<Contract>) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/hr/contracts/${id}`, contractData);
      setContracts(prev => prev.map(contract => contract.id === id ? response.data.contract as Contract : contract));
      return response.data.contract;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du contrat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un contrat
  const deleteContract = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/hr/contracts/${id}`);
      setContracts(prev => prev.filter(contract => contract.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du contrat');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Télécharger le fichier d'un contrat
  const downloadContractFile = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/contracts/${id}/download`);
      return response.data.url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du téléchargement du fichier du contrat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'un contrat
  const updateContractStatus = async (id: number, status: string) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/hr/contracts/${id}/status`, { status });
      setContracts(prev => prev.map(contract => contract.id === id ? response.data.contract as Contract : contract));
      return response.data.contract;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut du contrat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les contrats qui expirent bientôt
  const getExpiringContracts = async (days: number = 30) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/contracts/expiring?days=${days}`);
      return response.data.contracts || [];
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des contrats expirant bientôt');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Charger les contrats au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      getContracts();
    }
  }, [isAuthenticated]);

  return {
    contracts,
    pagination,
    loading,
    error,
    getContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract,
    downloadContractFile,
    updateContractStatus,
    getExpiringContracts
  };
};
