import { useState, useEffect } from 'react';

// Importer les types depuis le fichier types.ts
import {
  Employee,
  Department,
  Contract,
  Document,
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
        if (url.includes('/hr/employees')) {
          if (url.includes('/contracts')) {
            return { data: { contracts: [] } };
          } else if (url.includes('/documents')) {
            return { data: { documents: [] } };
          } else if (url.includes('/subordinates')) {
            return { data: { employees: [] } };
          } else if (url.includes('/hr/employees/') && !url.includes('?')) {
            return {
              data: {
                employee: {
                  id: 1,
                  name: 'John Doe',
                  first_name: 'John',
                  last_name: 'Doe',
                  email: 'john.doe@example.com',
                  phone: '1234567890',
                  birth_date: '1990-01-01',
                  hire_date: '2020-01-01',
                  department_id: 1,
                  position: 'Developer',
                  salary: 50000,
                  address: '123 Main St',
                  city: 'New York',
                  postal_code: '10001',
                  country: 'USA',
                  active: true,
                  created_at: '2020-01-01',
                  updated_at: '2020-01-01'
                }
              }
            };
          } else {
            return {
              data: {
                employees: [],
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
            employee: {
              id: 1,
              name: 'John Doe',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '1234567890',
              birth_date: '1990-01-01',
              hire_date: '2020-01-01',
              department_id: 1,
              position: 'Developer',
              salary: 50000,
              address: '123 Main St',
              city: 'New York',
              postal_code: '10001',
              country: 'USA',
              active: true,
              created_at: '2020-01-01',
              updated_at: '2020-01-01'
            }
          }
        };
      },
      put: async (url: string, data: any) => {
        // Simuler une réponse API
        return {
          data: {
            employee: {
              id: 1,
              name: 'John Doe',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '1234567890',
              birth_date: '1990-01-01',
              hire_date: '2020-01-01',
              department_id: 1,
              position: 'Developer',
              salary: 50000,
              address: '123 Main St',
              city: 'New York',
              postal_code: '10001',
              country: 'USA',
              active: true,
              created_at: '2020-01-01',
              updated_at: '2020-01-01'
            }
          }
        };
      },
      patch: async (url: string, data: any) => {
        // Simuler une réponse API
        return {
          data: {
            employee: {
              id: 1,
              name: 'John Doe',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone: '1234567890',
              birth_date: '1990-01-01',
              hire_date: '2020-01-01',
              department_id: 1,
              position: 'Developer',
              salary: 50000,
              address: '123 Main St',
              city: 'New York',
              postal_code: '10001',
              country: 'USA',
              active: true,
              created_at: '2020-01-01',
              updated_at: '2020-01-01'
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

export interface EmployeeFilters {
  department_id?: number;
  active?: boolean;
  search?: string;
  position?: string;
  page?: number;
  limit?: number;
}

export const useEmployee = () => {
  const { api } = useApi();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Récupérer tous les employés
  const getEmployees = async (filters: EmployeeFilters = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.department_id) params.append('department_id', filters.department_id.toString());
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.position) params.append('position', filters.position);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/hr/employees?${params.toString()}`);

      setEmployees(response.data.employees || []);
      setPagination(response.data.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des employés');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un employé par son ID
  const getEmployeeById = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/employees/${id}`);
      return response.data.employee;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération de l\'employé');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouvel employé
  const createEmployee = async (employeeData: Partial<Employee>) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/hr/employees', employeeData);
      setEmployees(prev => [response.data.employee as Employee, ...prev]);
      return response.data.employee;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'employé');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un employé
  const updateEmployee = async (id: number, employeeData: Partial<Employee>) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/hr/employees/${id}`, employeeData);
      setEmployees(prev => prev.map(emp => emp.id === id ? response.data.employee as Employee : emp));
      return response.data.employee;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'employé');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un employé
  const deleteEmployee = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/hr/employees/${id}`);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression de l\'employé');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Activer/Désactiver un employé
  const toggleEmployeeStatus = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/hr/employees/${id}/toggle-status`, {});
      setEmployees(prev => prev.map(emp => emp.id === id ? response.data.employee as Employee : emp));
      return response.data.employee;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du statut de l\'employé');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les contrats d'un employé
  const getEmployeeContracts = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/employees/${id}/contracts`);
      return response.data.contracts || [];
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des contrats de l\'employé');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les documents d'un employé
  const getEmployeeDocuments = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/employees/${id}/documents`);
      return response.data.documents || [];
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des documents de l\'employé');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les subordonnés d'un employé
  const getEmployeeSubordinates = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/employees/${id}/subordinates`);
      return response.data.employees || [];
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des subordonnés de l\'employé');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Charger les employés au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      getEmployees();
    }
  }, [isAuthenticated]);

  return {
    employees,
    pagination,
    loading,
    error,
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    getEmployeeContracts,
    getEmployeeDocuments,
    getEmployeeSubordinates
  };
};
