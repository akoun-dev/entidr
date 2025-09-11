import {
  EntidrViewDefinition,
  EntidrViewProps,
  EntidrViewRendererService as IEntidrViewRendererService,
  EntidrViewType,
  EntidrViewWidget,
  EntidrFilterType,
  EntidrGroupType
} from '../types/entidr-view';
import React from 'react';

/**
 * Service de rendu des vues
 * Implémente l'interface EntidrViewRendererService
 */
export class EntidrViewRendererService implements IEntidrViewRendererService {
  private componentRegistry: Map<EntidrViewType, React.ComponentType<EntidrViewProps>> = new Map();
  private widgetRegistry: Map<EntidrViewWidget, React.ComponentType<any>> = new Map();

  constructor() {
    // Initialiser le registre avec les composants de base
    this.initializeComponentRegistry();
    this.initializeWidgetRegistry();
  }

  /**
   * Rendre une vue
   */
  async renderView(view: EntidrViewDefinition, props: EntidrViewProps): Promise<JSX.Element> {
    const Component = await this.getComponentForViewType(view.type);

    if (!Component) {
      throw new Error(`No component found for view type: ${view.type}`);
    }

    return React.createElement(Component, {
      ...props,
      view,
    });
  }

  /**
   * Récupérer le composant pour un type de vue
   */
  async getComponentForViewType(type: EntidrViewType): Promise<React.ComponentType<EntidrViewProps>> {
    let Component = this.componentRegistry.get(type);

    if (!Component) {
      // Essayer de charger le composant dynamiquement
      Component = await this.loadComponentDynamically(type);

      if (Component) {
        this.componentRegistry.set(type, Component);
      }
    }

    return Component || this.getFallbackComponent(type);
  }

  /**
   * Enregistrer un composant personnalisé
   */
  registerCustomComponent(type: EntidrViewType, component: React.ComponentType<EntidrViewProps>): void {
    this.componentRegistry.set(type, component);
  }

  /**
   * Obtenir les widgets disponibles
   */
  async getAvailableWidgets(): Promise<EntidrViewWidget[]> {
    return Array.from(this.widgetRegistry.keys());
  }

  /**
   * Obtenir les types de filtres disponibles
   */
  async getAvailableFilterTypes(): Promise<EntidrFilterType[]> {
    return [
      'TEXT',
      'NUMBER',
      'DATE',
      'SELECT',
      'BOOLEAN',
      'RELATION',
      'CUSTOM'
    ];
  }

  /**
   * Obtenir les types de groupement disponibles
   */
  async getAvailableGroupTypes(): Promise<EntidrGroupType[]> {
    return [
      'FIELD',
      'DATE',
      'RELATION',
      'CUSTOM'
    ];
  }

  /**
   * Obtenir un widget par son type
   */
  getWidget(widgetType: EntidrViewWidget): React.ComponentType<any> | null {
    return this.widgetRegistry.get(widgetType) || null;
  }

  /**
   * Enregistrer un widget personnalisé
   */
  registerWidget(widgetType: EntidrViewWidget, component: React.ComponentType<any>): void {
    this.widgetRegistry.set(widgetType, component);
  }

  /**
   * Initialiser le registre des composants
   */
  private initializeComponentRegistry(): void {
    // Les composants seront chargés dynamiquement ou enregistrés plus tard
    // Pour l'instant, on utilise des composants de fallback
  }

  /**
   * Initialiser le registre des widgets
   */
  private initializeWidgetRegistry(): void {
    // Les widgets seront enregistrés au fur et à mesure de leur implémentation
    // Pour l'instant, le registre est vide
  }

  /**
   * Charger un composant dynamiquement
   */
  private async loadComponentDynamically(type: EntidrViewType): Promise<React.ComponentType<EntidrViewProps> | null> {
    try {
      // Mapping des types de vue vers les modules correspondants
      const componentMap: Record<EntidrViewType, string> = {
        'LIST': '../components/views/ListView',
        'FORM': '../components/views/FormView',
        'KANBAN': '../components/views/KanbanView',
        'CALENDAR': '../components/views/CalendarView',
        'CHART': '../components/views/ChartView',
        'TREE': '../components/views/TreeView',
        'GALLERY': '../components/views/GalleryView',
        'TIMELINE': '../components/views/TimelineView',
        'MAP': '../components/views/MapView',
        'DASHBOARD': '../components/DashboardView/DashboardView'
      };

      const modulePath = componentMap[type];
      if (!modulePath) {
        return null;
      }

      // Import dynamique du composant
      const module = await import(/* webpackChunkName: "view-[request]" */ modulePath);
      return module.default || module[type + 'View'];
    } catch (error) {
      console.warn(`Failed to load component for view type ${type}:`, error);
      return null;
    }
  }

  /**
   * Obtenir un composant de fallback
   */
  private getFallbackComponent(type: EntidrViewType): React.ComponentType<EntidrViewProps> {
    // Composant de fallback qui affiche un message d'erreur
    const FallbackComponent: React.FC<EntidrViewProps> = ({ view }) => {
      return React.createElement('div', {
        className: 'p-4 border border-red-300 bg-red-50 rounded'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-semibold text-red-800 mb-2'
        }, 'Vue non disponible'),
        React.createElement('p', {
          key: 'message1',
          className: 'text-red-600 mb-2'
        }, `Le composant pour le type de vue "${type}" n'est pas disponible.`),
        React.createElement('p', {
          key: 'view-name',
          className: 'text-sm text-red-500'
        }, `Nom de la vue: ${view.name}`),
        React.createElement('p', {
          key: 'view-model',
          className: 'text-sm text-red-500'
        }, `Modèle: ${view.model}`)
      ]);
    };

    return FallbackComponent;
  }
}

// Exporter une instance singleton
export const entidrViewRendererService = new EntidrViewRendererService();
