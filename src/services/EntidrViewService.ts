import { EntidrViewDefinition } from '../types/entidr-view';
import { EntidrSecurityContext } from '../types/entidr-security';

/**
 * Service de gestion des vues
 * Implémente l'interface EntidrViewService
 */
export class EntidrViewService implements EntidrViewService {
  private views: Map<string, EntidrViewDefinition> = new Map();
  private modelViews: Map<string, string[]> = new Map();

  constructor() {
    // Initialiser avec quelques vues par défaut
    this.initializeDefaultViews();
  }

  /**
   * Récupérer toutes les vues
   */
  async getAllViews(): Promise<EntidrViewDefinition[]> {
    return Array.from(this.views.values());
  }

  /**
   * Récupérer une vue par son ID
   */
  async getViewById(id: string): Promise<EntidrViewDefinition | null> {
    return this.views.get(id) || null;
  }

  /**
   * Récupérer les vues pour un modèle
   */
  async getViewsForModel(model: string): Promise<EntidrViewDefinition[]> {
    const viewIds = this.modelViews.get(model) || [];
    return viewIds.map(id => this.views.get(id)).filter(Boolean) as EntidrViewDefinition[];
  }

  /**
   * Créer une nouvelle vue
   */
  async createView(viewData: Omit<EntidrViewDefinition, 'id' | 'createdAt' | 'modifiedAt'>): Promise<EntidrViewDefinition> {
    const id = this.generateId();
    const now = new Date();

    const view: EntidrViewDefinition = {
      ...viewData,
      id,
      metadata: {
        ...viewData.metadata,
        createdAt: now,
        modifiedAt: now,
        version: 1,
      },
    };

    // Valider la vue
    const validationErrors = this.validateView(view);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Sauvegarder la vue
    this.views.set(id, view);

    // Mettre à jour l'index des modèles
    const modelViews = this.modelViews.get(view.model) || [];
    modelViews.push(id);
    this.modelViews.set(view.model, modelViews);

    return view;
  }

  /**
   * Mettre à jour une vue
   */
  async updateView(id: string, updates: Partial<EntidrViewDefinition>): Promise<EntidrViewDefinition> {
    const existingView = this.views.get(id);
    if (!existingView) {
      throw new Error(`View with id ${id} not found`);
    }

    const updatedView: EntidrViewDefinition = {
      ...existingView,
      ...updates,
      id, // S'assurer que l'ID ne change pas
      metadata: {
        ...existingView.metadata,
        ...updates.metadata,
        modifiedAt: new Date(),
        version: (existingView.metadata?.version || 0) + 1,
      },
    };

    // Valider la vue mise à jour
    const validationErrors = this.validateView(updatedView);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Sauvegarder la vue mise à jour
    this.views.set(id, updatedView);

    // Si le modèle a changé, mettre à jour les index
    if (updates.model && updates.model !== existingView.model) {
      // Retirer de l'ancien modèle
      const oldModelViews = this.modelViews.get(existingView.model) || [];
      const newOldModelViews = oldModelViews.filter(viewId => viewId !== id);
      this.modelViews.set(existingView.model, newOldModelViews);

      // Ajouter au nouveau modèle
      const newModelViews = this.modelViews.get(updates.model) || [];
      newModelViews.push(id);
      this.modelViews.set(updates.model, newModelViews);
    }

    return updatedView;
  }

  /**
   * Supprimer une vue
   */
  async deleteView(id: string): Promise<boolean> {
    const view = this.views.get(id);
    if (!view) {
      return false;
    }

    // Supprimer la vue
    this.views.delete(id);

    // Mettre à jour l'index des modèles
    const modelViews = this.modelViews.get(view.model) || [];
    const newModelViews = modelViews.filter(viewId => viewId !== id);
    this.modelViews.set(view.model, newModelViews);

    return true;
  }

  /**
   * Dupliquer une vue
   */
  async duplicateView(id: string, newName?: string): Promise<EntidrViewDefinition> {
    const originalView = this.views.get(id);
    if (!originalView) {
      throw new Error(`View with id ${id} not found`);
    }

    const viewData = { ...originalView };
    delete viewData.id;
    delete viewData.metadata?.createdAt;
    delete viewData.metadata?.modifiedAt;

    if (newName) {
      viewData.name = newName;
    } else {
      viewData.name = `${viewData.name} (Copy)`;
    }

    return this.createView(viewData);
  }

  /**
   * Valider une vue
   */
  validateView(view: EntidrViewDefinition): string[] {
    const errors: string[] = [];

    // Validation de base
    if (!view.name || view.name.trim() === '') {
      errors.push('View name is required');
    }

    if (!view.model || view.model.trim() === '') {
      errors.push('View model is required');
    }

    if (!view.type) {
      errors.push('View type is required');
    }

    if (!view.fields || view.fields.length === 0) {
      errors.push('View must have at least one field');
    }

    // Validation des champs
    view.fields.forEach((field, index) => {
      if (!field.name || field.name.trim() === '') {
        errors.push(`Field ${index + 1}: Field name is required`);
      }

      if (!field.widget) {
        errors.push(`Field ${index + 1}: Field widget is required`);
      }
    });

    // Validation spécifique au type de vue
    if (view.type === 'CHART' && !view.chartConfig) {
      errors.push('Chart view requires chartConfig');
    }

    if (view.type === 'CALENDAR' && !view.calendarConfig) {
      errors.push('Calendar view requires calendarConfig');
    }

    if (view.type === 'KANBAN' && !view.kanbanConfig) {
      errors.push('Kanban view requires kanbanConfig');
    }

    return errors;
  }

  /**
   * Exporter une vue
   */
  async exportView(id: string): Promise<string> {
    const view = this.views.get(id);
    if (!view) {
      throw new Error(`View with id ${id} not found`);
    }

    return JSON.stringify(view, null, 2);
  }

  /**
   * Importer une vue
   */
  async importView(data: string): Promise<EntidrViewDefinition> {
    try {
      const viewData = JSON.parse(data);

      // Nettoyer les données importées
      delete viewData.id;
      delete viewData.metadata?.createdAt;
      delete viewData.metadata?.modifiedAt;

      return this.createView(viewData);
    } catch (error) {
      throw new Error(`Invalid view data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialiser quelques vues par défaut
   */
  private initializeDefaultViews(): void {
    // Vue liste par défaut pour le modèle User
    const defaultUserListView: EntidrViewDefinition = {
      id: 'user_list_default',
      name: 'Liste des utilisateurs',
      description: 'Vue par défaut pour afficher la liste des utilisateurs',
      model: 'User',
      type: 'LIST',
      isDefault: true,
      isSystem: true,
      active: true,
      fields: [
        {
          name: 'id',
          label: 'ID',
          widget: 'INPUT',
          visible: true,
          editable: false,
          required: false,
          order: 1,
          width: '80px',
          align: 'center',
        },
        {
          name: 'username',
          label: "Nom d'utilisateur",
          widget: 'INPUT',
          visible: true,
          editable: true,
          required: true,
          order: 2,
          width: '200px',
        },
        {
          name: 'email',
          label: 'Email',
          widget: 'EMAIL',
          visible: true,
          editable: true,
          required: true,
          order: 3,
          width: '250px',
        },
        {
          name: 'isActive',
          label: 'Actif',
          widget: 'BOOLEAN',
          visible: true,
          editable: true,
          required: false,
          order: 4,
          width: '100px',
          align: 'center',
        },
      ],
      pagination: {
        enabled: true,
        pageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
        position: 'bottom',
        type: 'advanced',
      },
      permissions: {
        visible: true,
        editable: true,
        create: true,
        read: true,
        update: true,
        delete: true,
        export: true,
        import: false,
      },
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        modifiedBy: 'system',
        modifiedAt: new Date(),
        version: 1,
        tags: ['system', 'default'],
        category: 'user',
      },
    };

    this.views.set(defaultUserListView.id, defaultUserListView);
    this.modelViews.set('User', [defaultUserListView.id]);
  }
}

// Exporter une instance singleton
export const entidrViewService = new EntidrViewService();
