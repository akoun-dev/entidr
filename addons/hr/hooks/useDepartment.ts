import { useState, useEffect } from 'react';

// Importer les types depuis le fichier types.ts
import {
  Department,
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
        if (url.includes('/hr/departments')) {
          if (url.includes('/employees')) {
            return { data: { employees: [] } };
          } else if (url.includes('/sub-departments')) {
            return { data: { departments: [] } };
          } else if (url.includes('/hr/departments/') && !url.includes('?')) {
            return {
              data: {
                department: {
                  id: 1,
                  name: 'IT',
                  code: 'IT',
                  description: 'Information Technology',
                  manager_id: 1,
                  parent_id: undefined,
                  active: true,
                  created_at: '2023-01-01',
                  updated_at: '2023-01-01'
                }
              }
            };
          } else {
            return {
              data: {
                departments: [],
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
            department: {
              id: 1,
              name: 'IT',
              code: 'IT',
              description: 'Information Technology',
              manager_id: 1,
              parent_id: undefined,
              active: true,
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
            department: {
              id: 1,
              name: 'IT',
              code: 'IT',
              description: 'Information Technology',
              manager_id: 1,
              parent_id: undefined,
              active: true,
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
            department: {
              id: 1,
              name: 'IT',
              code: 'IT',
              description: 'Information Technology',
              manager_id: 1,
              parent_id: undefined,
              active: true,
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

export interface DepartmentFilters {
  manager_id?: number;
  parent_id?: number;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const useDepartment = () => {
  const { api } = useApi();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Récupérer tous les départements
  const getDepartments = async (filters: DepartmentFilters = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.manager_id) params.append('manager_id', filters.manager_id.toString());
      if (filters.parent_id) params.append('parent_id', filters.parent_id.toString());
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/hr/departments?${params.toString()}`);

      setDepartments(response.data.departments || []);
      setPagination(response.data.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des départements');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un département par son ID
  const getDepartmentById = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/departments/${id}`);
      return response.data.department;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du département');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau département
  const createDepartment = async (departmentData: Partial<Department>) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/hr/departments', departmentData);
      setDepartments(prev => [response.data.department as Department, ...prev]);
      return response.data.department;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du département');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un département
  const updateDepartment = async (id: number, departmentData: Partial<Department>) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/hr/departments/${id}`, departmentData);
      setDepartments(prev => prev.map(dept => dept.id === id ? response.data.department as Department : dept));
      return response.data.department;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du département');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un département
  const deleteDepartment = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/hr/departments/${id}`);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du département');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Activer/Désactiver un département
  const toggleDepartmentStatus = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/hr/departments/${id}/toggle-status`, {});
      setDepartments(prev => prev.map(dept => dept.id === id ? response.data.department as Department : dept));
      return response.data.department;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du statut du département');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les sous-départements d'un département
  const getSubDepartments = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/departments/${id}/sub-departments`);
      return response.data.departments || [];
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des sous-départements');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les employés d'un département
  const getDepartmentEmployees = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/departments/${id}/employees`);
      return response.data.employees || [];
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des employés du département');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Charger les départements au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      getDepartments();
    }
  }, [isAuthenticated]);

  return {
    departments,
    pagination,
    loading,
    error,
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus,
    getSubDepartments,
    getDepartmentEmployees
  };
};
