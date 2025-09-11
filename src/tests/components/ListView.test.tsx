import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ListView } from '../../components/views/ListView';
import { EntidrViewDefinition, EntidrViewType } from '../../types/entidr-view';
import { EntidrSecurityContext } from '../../types/entidr-security';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock du contexte de sécurité
const mockSecurityContext: EntidrSecurityContext = {
  user: {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['admin'],
    groups: ['users'],
    permissions: ['view:read', 'view:write'],
  },
  hasPermission: vi.fn(),
  hasRole: vi.fn(),
  isInGroup: vi.fn(),
  checkAccess: vi.fn(),
};

// Mock data
const mockView: EntidrViewDefinition = {
  id: 'test-view-id',
  name: 'Test List View',
  description: 'Test list view description',
  type: 'LIST',
  model: 'User',
  fields: [
    {
      name: 'id',
      label: 'ID',
      widget: 'INPUT',
      visible: true,
      editable: false,
      required: false,
      order: 1,
    },
    {
      name: 'name',
      label: 'Name',
      widget: 'INPUT',
      visible: true,
      editable: true,
      required: true,
      order: 2,
    },
    {
      name: 'email',
      label: 'Email',
      widget: 'EMAIL',
      visible: true,
      editable: true,
      required: true,
      order: 3,
    },
  ],
  isDefault: false,
  active: true,
  permissions: {
    visible: true,
    editable: true,
    create: true,
    read: true,
    update: true,
    delete: true,
    export: true,
    import: true,
  },
  metadata: {
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
};

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

// Mock des callbacks
const mockCallbacks = {
  onDataLoad: vi.fn(),
  onDataSave: vi.fn(),
  onDataDelete: vi.fn(),
  onFilterChange: vi.fn(),
  onSortChange: vi.fn(),
  onGroupChange: vi.fn(),
  onPageChange: vi.fn(),
  onSelectionChange: vi.fn(),
  onEdit: vi.fn(),
  onViewChange: vi.fn(),
};

describe('ListView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSecurityContext.hasPermission.mockReturnValue(true);
    mockSecurityContext.hasRole.mockReturnValue(true);
    mockSecurityContext.isInGroup.mockReturnValue(true);
    mockSecurityContext.checkAccess.mockReturnValue(true);
  });

  it('devrait rendre le composant ListView avec les données initiales', () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    expect(screen.getByText('Test List View')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('devrait afficher les en-têtes de colonnes correctement', () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('devrait gérer le tri des colonnes', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      expect(mockCallbacks.onSortChange).toHaveBeenCalled();
    });
  });

  it('devrait gérer la sélection d\'une ligne', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const firstRow = screen.getByText('John Doe').closest('tr');
    if (firstRow) {
      fireEvent.click(firstRow);

      await waitFor(() => {
        expect(mockCallbacks.onSelectionChange).toHaveBeenCalled();
      });
    }
  });

  it('devrait gérer la sélection multiple avec Ctrl/Cmd', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const firstRow = screen.getByText('John Doe').closest('tr');
    const secondRow = screen.getByText('Jane Smith').closest('tr');

    if (firstRow && secondRow) {
      // Simulation de la sélection multiple
      fireEvent.click(firstRow, { ctrlKey: true });
      fireEvent.click(secondRow, { ctrlKey: true });

      await waitFor(() => {
        expect(mockCallbacks.onSelectionChange).toHaveBeenCalledTimes(2);
      });
    }
  });

  it('devrait gérer le changement de page', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    // Simuler un composant de pagination
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    if (nextPageButton) {
      fireEvent.click(nextPageButton);

      await waitFor(() => {
        expect(mockCallbacks.onPageChange).toHaveBeenCalled();
      });
    }
  });

  it('devrait afficher un indicateur de chargement', () => {
    const { container } = render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={[]}
        loading={true}
        callbacks={mockCallbacks}
      />
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('devrait afficher un message d\'erreur', () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={[]}
        error="Test error message"
        callbacks={mockCallbacks}
      />
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('devrait gérer la recherche', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(mockCallbacks.onFilterChange).toHaveBeenCalled();
      });
    }
  });

  it('devrait respecter les permissions', () => {
    mockSecurityContext.hasPermission.mockReturnValue(false);

    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        readonly={true}
        callbacks={mockCallbacks}
      />
    );

    // Vérifier que les boutons d'édition ne sont pas visibles
    const editButton = screen.queryByRole('button', { name: /edit/i });
    expect(editButton).not.toBeInTheDocument();
  });

  it('devrait gérer le mode édition', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockCallbacks.onEdit).toHaveBeenCalled();
    });
  });

  it('devrait gérer la suppression d\'un élément', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirmer la suppression
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockCallbacks.onDataDelete).toHaveBeenCalled();
    });
  });

  it('devrait gérer l\'export des données', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockCallbacks.onViewChange).toHaveBeenCalled();
    });
  });

  it('devrait être accessible', () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    // Vérifier les attributs ARIA
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Test List View');

    // Vérifier que les en-têtes ont le bon rôle
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3); // ID, Name, Email
  });

  it('devrait gérer le redimensionnement des colonnes', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const nameHeader = screen.getByText('Name');

    // Simuler le début du redimensionnement
    fireEvent.mouseDown(nameHeader, { clientX: 100 });

    // Simuler le déplacement
    fireEvent.mouseMove(window, { clientX: 150 });

    // Simuler la fin du redimensionnement
    fireEvent.mouseUp(window);

    // Le redimensionnement devrait mettre à jour la configuration
    await waitFor(() => {
      expect(mockCallbacks.onViewChange).toHaveBeenCalled();
    });
  });

  it('devrait gérer le glisser-déposer pour le réordonnancement', async () => {
    render(
      <ListView
        view={mockView}
        securityContext={mockSecurityContext}
        initialData={mockData}
        callbacks={mockCallbacks}
      />
    );

    const firstRow = screen.getByText('John Doe').closest('tr');
    const secondRow = screen.getByText('Jane Smith').closest('tr');

    if (firstRow && secondRow) {
      // Simuler le début du glisser-déposer
      fireEvent.dragStart(firstRow);

      // Simuler le survol de la deuxième ligne
      fireEvent.dragOver(secondRow);

      // Simuler le dépôt
      fireEvent.drop(secondRow);

      await waitFor(() => {
        expect(mockCallbacks.onViewChange).toHaveBeenCalled();
      });
    }
  });
});
