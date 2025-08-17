import { render } from '@testing-library/react';
import { PaginationControls } from '../../src/components/PaginationControls';
import { test, expect } from 'vitest';

// Test basique de vérification du composant
test('PaginationControls renders without crashing', () => {
  const { container } = render(<PaginationControls
    pagination={{
      totalItems: 10,
      totalPages: 2,
      currentPage: 1,
      itemsPerPage: 5
    }}
    onPageChange={() => {}}
  />);

  expect(container).toBeDefined();
});
