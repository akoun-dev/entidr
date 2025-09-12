import { useState, useEffect } from 'react';

// Importer les types depuis le fichier types.ts
import {
  Document,
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
        if (url.includes('/hr/documents')) {
          if (url.includes('/download')) {
            return { data: { url: '' } };
          } else if (url.includes('/expiring')) {
            return { data: { documents: [] } };
          } else if (url.includes('/hr/documents/') && !url.includes('?')) {
            return {
              data: {
                document: {
                  id: 1,
                  employee_id: 1,
                  type: 'cv',
                  title: 'CV - John Doe',
                  description: 'Curriculum Vitae de John Doe',
                  file_name: 'cv_john_doe.pdf',
                  file_path: '/uploads/documents/cv_john_doe.pdf',
                  file_size: 1024,
                  mime_type: 'application/pdf',
                  status: 'active',
                  expiry_date: undefined,
                  created_by: 1,
                  created_at: '2023-01-01',
                  updated_at: '2023-01-01'
                }
              }
            };
          } else {
            return {
              data: {
                documents: [],
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
            document: {
              id: 1,
              employee_id: 1,
              type: 'cv',
              title: 'CV - John Doe',
              description: 'Curriculum Vitae de John Doe',
              file_name: 'cv_john_doe.pdf',
              file_path: '/uploads/documents/cv_john_doe.pdf',
              file_size: 1024,
              mime_type: 'application/pdf',
              status: 'active',
              expiry_date: undefined,
              created_by: 1,
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
            document: {
              id: 1,
              employee_id: 1,
              type: 'cv',
              title: 'CV - John Doe',
              description: 'Curriculum Vitae de John Doe',
              file_name: 'cv_john_doe.pdf',
              file_path: '/uploads/documents/cv_john_doe.pdf',
              file_size: 1024,
              mime_type: 'application/pdf',
              status: 'active',
              expiry_date: undefined,
              created_by: 1,
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
            document: {
              id: 1,
              employee_id: 1,
              type: 'cv',
              title: 'CV - John Doe',
              description: 'Curriculum Vitae de John Doe',
              file_name: 'cv_john_doe.pdf',
              file_path: '/uploads/documents/cv_john_doe.pdf',
              file_size: 1024,
              mime_type: 'application/pdf',
              status: 'active',
              expiry_date: undefined,
              created_by: 1,
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

export interface DocumentFilters {
  employee_id?: number;
  type?: string;
  status?: string;
  expiry_date?: string;
  page?: number;
  limit?: number;
}

export const useDocument = () => {
  const { api } = useApi();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Récupérer tous les documents
  const getDocuments = async (filters: DocumentFilters = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.employee_id) params.append('employee_id', filters.employee_id.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.expiry_date) params.append('expiry_date', filters.expiry_date);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/hr/documents?${params.toString()}`);

      setDocuments(response.data.documents || []);
      setPagination(response.data.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des documents');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un document par son ID
  const getDocumentById = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/documents/${id}`);
      return response.data.document;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau document
  const createDocument = async (documentData: Partial<Document>) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/hr/documents', documentData);
      setDocuments(prev => [response.data.document as Document, ...prev]);
      return response.data.document;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un document
  const updateDocument = async (id: number, documentData: Partial<Document>) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/hr/documents/${id}`, documentData);
      setDocuments(prev => prev.map(document => document.id === id ? response.data.document as Document : document));
      return response.data.document;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un document
  const deleteDocument = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/hr/documents/${id}`);
      setDocuments(prev => prev.filter(document => document.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du document');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Télécharger le fichier d'un document
  const downloadDocumentFile = async (id: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/documents/${id}/download`);
      return response.data.url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du téléchargement du fichier du document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'un document
  const updateDocumentStatus = async (id: number, status: string) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/hr/documents/${id}/status`, { status });
      setDocuments(prev => prev.map(document => document.id === id ? response.data.document as Document : document));
      return response.data.document;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut du document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les documents qui expirent bientôt
  const getExpiringDocuments = async (days: number = 30) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/hr/documents/expiring?days=${days}`);
      return response.data.documents || [];
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des documents expirant bientôt');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Charger les documents au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      getDocuments();
    }
  }, [isAuthenticated]);

  return {
    documents,
    pagination,
    loading,
    error,
    getDocuments,
    getDocumentById,
    createDocument,
    updateDocument,
    deleteDocument,
    downloadDocumentFile,
    updateDocumentStatus,
    getExpiringDocuments
  };
};
