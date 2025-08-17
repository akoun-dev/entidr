import React from 'react';
import { Pagination } from '@mui/material';
import type { PaginationData } from '../hooks/usePaginatedGroups';

interface PaginationControlsProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({
  pagination,
  onPageChange,
  className = ''
}: PaginationControlsProps) {
  const handleChange = (event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return (
    <div className={`pagination-controls ${className}`}>
      <Pagination
        count={pagination.totalPages}
        page={pagination.currentPage}
        onChange={handleChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </div>
  );
}
