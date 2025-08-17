import { useState, useEffect } from 'react';
import type { Group } from '../types/group';
import ReferenceDataService from '../services/ReferenceDataService';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationData;
}

export function usePaginatedGroups(params = {}, initialPagination = { page: 1, limit: 10 }) {
  const [data, setData] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    totalItems: 0,
    totalPages: 1,
    currentPage: initialPagination.page,
    itemsPerPage: initialPagination.limit
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await ReferenceDataService.getGroups({
          ...params,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage
        });

        setData(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        console.error('Erreur lors de la récupération des groupes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, pagination.currentPage, pagination.itemsPerPage]);

  const setPage = (page: number) => {
    setPagination((prev: PaginationData) => ({ ...prev, currentPage: page }));
  };

  return {
    data,
    loading,
    error,
    pagination,
    setPage
  };
}
