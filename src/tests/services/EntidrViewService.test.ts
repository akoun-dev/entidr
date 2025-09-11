import { EntidrViewService } from '../../services/EntidrViewService';
import { EntidrViewDefinition, EntidrViewType, EntidrViewFieldConfig } from '../../types/entidr-view';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock du repository
const mockViewRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByModel: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  validate: vi.fn(),
  exportToJSON: vi.fn(),
  importFromJSON: vi.fn(),
};

// Mock du cache service
const mockCacheService = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn(),
};

// Mock du logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

describe('EntidrViewService', () => {
  let viewService: EntidrViewService;

  const mockView: EntidrViewDefinition = {
    id: 'test-view-id',
    name: 'Test View',
    description: 'Test view description',
    type: 'LIST',
    model: 'User',
    fields: [],
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

  beforeEach(() => {
    vi.clearAllMocks();
    viewService = new EntidrViewService(
      mockViewRepository as any,
      mockCacheService as any,
      mockLogger
    );
  });

  describe('getAllViews', () => {
    it('devrait retourner toutes les vues depuis le cache si disponible', async () => {
      const cachedViews = [mockView];
      mockCacheService.get.mockReturnValue(cachedViews);

      const result = await viewService.getAllViews();

      expect(result).toEqual(cachedViews);
      expect(mockCacheService.get).toHaveBeenCalledWith('views:all');
      expect(mockViewRepository.findAll).not.toHaveBeenCalled();
    });

    it('devrait récupérer les vues depuis le repository si non en cache', async () => {
      const dbViews = [mockView];
      mockCacheService.get.mockReturnValue(null);
      mockViewRepository.findAll.mockResolvedValue(dbViews);

      const result = await viewService.getAllViews();

      expect(result).toEqual(dbViews);
      expect(mockCacheService.get).toHaveBeenCalledWith('views:all');
      expect(mockViewRepository.findAll).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith('views:all', dbViews, 300);
    });

    it('devrait gérer les erreurs et logger', async () => {
      const error = new Error('Database error');
      mockCacheService.get.mockReturnValue(null);
      mockViewRepository.findAll.mockRejectedValue(error);

      await expect(viewService.getAllViews()).rejects.toThrow('Database error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Erreur lors de la récupération de toutes les vues',
        error
      );
    });
  });

  describe('getViewById', () => {
    it('devrait retourner une vue par son ID', async () => {
      mockViewRepository.findById.mockResolvedValue(mockView);

      const result = await viewService.getViewById('test-view-id');

      expect(result).toEqual(mockView);
      expect(mockViewRepository.findById).toHaveBeenCalledWith('test-view-id');
    });

    it('devrait retourner null si la vue n\'existe pas', async () => {
      mockViewRepository.findById.mockResolvedValue(null);

      const result = await viewService.getViewById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getViewsForModel', () => {
    it('devrait retourner les vues pour un modèle spécifique', async () => {
      const modelViews = [mockView];
      mockViewRepository.findByModel.mockResolvedValue(modelViews);

      const result = await viewService.getViewsForModel('User');

      expect(result).toEqual(modelViews);
      expect(mockViewRepository.findByModel).toHaveBeenCalledWith('User');
    });
  });

  describe('createView', () => {
    it('devrait créer une nouvelle vue', async () => {
      const newView = { ...mockView, id: undefined };
      const createdView = { ...newView, id: 'new-view-id' };
      mockViewRepository.create.mockResolvedValue(createdView);

      const result = await viewService.createView(newView);

      expect(result).toEqual(createdView);
      expect(mockViewRepository.create).toHaveBeenCalledWith(newView);
      expect(mockCacheService.delete).toHaveBeenCalledWith('views:all');
    });

    it('devrait valider la vue avant création', async () => {
      const invalidView = { ...mockView, name: '' };
      mockViewRepository.validate.mockReturnValue(false);

      await expect(viewService.createView(invalidView)).rejects.toThrow('Vue invalide');
      expect(mockViewRepository.validate).toHaveBeenCalledWith(invalidView);
    });
  });

  describe('updateView', () => {
    it('devrait mettre à jour une vue existante', async () => {
      const updatedView = { ...mockView, name: 'Updated View' };
      mockViewRepository.findById.mockResolvedValue(mockView);
      mockViewRepository.update.mockResolvedValue(updatedView);

      const result = await viewService.updateView('test-view-id', updatedView);

      expect(result).toEqual(updatedView);
      expect(mockViewRepository.update).toHaveBeenCalledWith('test-view-id', updatedView);
      expect(mockCacheService.delete).toHaveBeenCalledWith('views:all');
    });

    it('devrait lancer une erreur si la vue n\'existe pas', async () => {
      mockViewRepository.findById.mockResolvedValue(null);

      await expect(viewService.updateView('non-existent-id', mockView))
        .rejects.toThrow('Vue non trouvée');
    });
  });

  describe('deleteView', () => {
    it('devrait supprimer une vue existante', async () => {
      mockViewRepository.findById.mockResolvedValue(mockView);
      mockViewRepository.delete.mockResolvedValue(true);

      const result = await viewService.deleteView('test-view-id');

      expect(result).toBe(true);
      expect(mockViewRepository.delete).toHaveBeenCalledWith('test-view-id');
      expect(mockCacheService.delete).toHaveBeenCalledWith('views:all');
    });

    it('devrait retourner false si la vue n\'existe pas', async () => {
      mockViewRepository.findById.mockResolvedValue(null);

      const result = await viewService.deleteView('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('duplicateView', () => {
    it('devrait dupliquer une vue existante', async () => {
      const duplicatedView = { ...mockView, id: 'duplicated-view-id', name: 'Test View (copie)' };
      mockViewRepository.findById.mockResolvedValue(mockView);
      mockViewRepository.create.mockResolvedValue(duplicatedView);

      const result = await viewService.duplicateView('test-view-id');

      expect(result).toEqual(duplicatedView);
      expect(mockViewRepository.findById).toHaveBeenCalledWith('test-view-id');
      expect(mockViewRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test View (copie)',
        })
      );
    });
  });

  describe('validateView', () => {
    it('devrait valider une vue correcte', () => {
      mockViewRepository.validate.mockReturnValue(true);

      const result = viewService.validateView(mockView);

      expect(result).toBe(true);
      expect(mockViewRepository.validate).toHaveBeenCalledWith(mockView);
    });

    it('devrait invalider une vue incorrecte', () => {
      const invalidView = { ...mockView, name: '' };
      mockViewRepository.validate.mockReturnValue(false);

      const result = viewService.validateView(invalidView);

      expect(result).toBe(false);
    });
  });

  describe('exportView', () => {
    it('devrait exporter une vue au format JSON', async () => {
      const exportData = { view: mockView, metadata: { exportedAt: new Date() } };
      mockViewRepository.findById.mockResolvedValue(mockView);
      mockViewRepository.exportToJSON.mockResolvedValue(exportData);

      const result = await viewService.exportView('test-view-id');

      expect(result).toEqual(exportData);
      expect(mockViewRepository.exportToJSON).toHaveBeenCalledWith(mockView);
    });
  });

  describe('importView', () => {
    it('devrait importer une vue depuis JSON', async () => {
      const importData = JSON.stringify({ view: mockView });
      const importedView = { ...mockView, id: 'imported-view-id' };
      mockViewRepository.importFromJSON.mockResolvedValue(importedView);

      const result = await viewService.importView(importData);

      expect(result).toEqual(importedView);
      expect(mockViewRepository.importFromJSON).toHaveBeenCalledWith(importData);
      expect(mockCacheService.delete).toHaveBeenCalledWith('views:all');
    });

    it('devrait valider les données avant import', async () => {
      const invalidImportData = JSON.stringify({ view: { ...mockView, name: '' } });
      mockViewRepository.validate.mockReturnValue(false);

      await expect(viewService.importView(invalidImportData))
        .rejects.toThrow('Données d\'import invalides');
    });
  });
});
