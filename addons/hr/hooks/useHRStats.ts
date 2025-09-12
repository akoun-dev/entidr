import { useState, useEffect } from 'react';

// Importer les types depuis le fichier types.ts
import {
  Employee,
  Department,
  Contract,
  Document,
  HRStats
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
        if (url.includes('/hr/stats')) {
          if (url.includes('/dashboard')) {
            return {
              data: {
                total_employees: 50,
                active_employees: 45,
                inactive_employees: 5,
                total_departments: 5,
                total_contracts: 48,
                active_contracts: 45,
                expiring_contracts: 3,
                total_documents: 120,
                pending_documents: 10,
                approved_documents: 100,
                rejected_documents: 5,
                expired_documents: 5,
                new_hires_last_month: 5,
                departures_last_month: 2,
                gender_distribution: {
                  male: 25,
                  female: 20,
                  other: 5
                },
                department_distribution: [
                  { name: 'IT', count: 15 },
                  { name: 'HR', count: 5 },
                  { name: 'Finance', count: 10 },
                  { name: 'Marketing', count: 10 },
                  { name: 'Operations', count: 10 }
                ],
                contract_type_distribution: {
                  cdi: 40,
                  cdd: 5,
                  stage: 3,
                  alternance: 0,
                  freelance: 0
                },
                document_type_distribution: {
                  id_card: 50,
                  passport: 20,
                  cv: 30,
                  diploma: 15,
                  certificate: 5
                }
              }
            };
          } else if (url.includes('/employees')) {
            return {
              data: {
                total_employees: 50,
                active_employees: 45,
                inactive_employees: 5,
                new_hires_last_month: 5,
                departures_last_month: 2,
                gender_distribution: {
                  male: 25,
                  female: 20,
                  other: 5
                },
                department_distribution: [
                  { name: 'IT', count: 15 },
                  { name: 'HR', count: 5 },
                  { name: 'Finance', count: 10 },
                  { name: 'Marketing', count: 10 },
                  { name: 'Operations', count: 10 }
                ]
              }
            };
          } else if (url.includes('/contracts')) {
            return {
              data: {
                total_contracts: 48,
                active_contracts: 45,
                expiring_contracts: 3,
                contract_type_distribution: {
                  cdi: 40,
                  cdd: 5,
                  stage: 3,
                  alternance: 0,
                  freelance: 0
                }
              }
            };
          } else if (url.includes('/documents')) {
            return {
              data: {
                total_documents: 120,
                pending_documents: 10,
                approved_documents: 100,
                rejected_documents: 5,
                expired_documents: 5,
                document_type_distribution: {
                  id_card: 50,
                  passport: 20,
                  cv: 30,
                  diploma: 15,
                  certificate: 5
                }
              }
            };
          }
        }
        return { data: {} };
      }
    }
  };
};

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  total_departments: number;
  total_contracts: number;
  active_contracts: number;
  expiring_contracts: number;
  total_documents: number;
  pending_documents: number;
  approved_documents: number;
  rejected_documents: number;
  expired_documents: number;
  new_hires_last_month: number;
  departures_last_month: number;
  gender_distribution: {
    male: number;
    female: number;
    other: number;
  };
  department_distribution: Array<{
    name: string;
    count: number;
  }>;
  contract_type_distribution: {
    cdi: number;
    cdd: number;
    stage: number;
    alternance: number;
    freelance: number;
  };
  document_type_distribution: {
    id_card: number;
    passport: number;
    cv: number;
    diploma: number;
    certificate: number;
  };
}

export interface EmployeeStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  new_hires_last_month: number;
  departures_last_month: number;
  gender_distribution: {
    male: number;
    female: number;
    other: number;
  };
  department_distribution: Array<{
    name: string;
    count: number;
  }>;
}

export interface ContractStats {
  total_contracts: number;
  active_contracts: number;
  expiring_contracts: number;
  contract_type_distribution: {
    cdi: number;
    cdd: number;
    stage: number;
    alternance: number;
    freelance: number;
  };
}

export interface DocumentStats {
  total_documents: number;
  pending_documents: number;
  approved_documents: number;
  rejected_documents: number;
  expired_documents: number;
  document_type_distribution: {
    id_card: number;
    passport: number;
    cv: number;
    diploma: number;
    certificate: number;
  };
}

export const useHRStats = () => {
  const { api } = useApi();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);

  // Récupérer les statistiques du tableau de bord
  const getDashboardStats = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/hr/stats/dashboard');
      setDashboardStats(response.data as DashboardStats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques des employés
  const getEmployeeStats = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/hr/stats/employees');
      setEmployeeStats(response.data as EmployeeStats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques des employés');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques des contrats
  const getContractStats = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/hr/stats/contracts');
      setContractStats(response.data as ContractStats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques des contrats');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques des documents
  const getDocumentStats = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/hr/stats/documents');
      setDocumentStats(response.data as DocumentStats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques des documents');
    } finally {
      setLoading(false);
    }
  };

  // Charger toutes les statistiques au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      getDashboardStats();
      getEmployeeStats();
      getContractStats();
      getDocumentStats();
    }
  }, [isAuthenticated]);

  return {
    loading,
    error,
    dashboardStats,
    employeeStats,
    contractStats,
    documentStats,
    getDashboardStats,
    getEmployeeStats,
    getContractStats,
    getDocumentStats
  };
};
