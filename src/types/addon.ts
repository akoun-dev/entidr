
import { ReactNode } from 'react';
import { LucideProps } from 'lucide-react';

/**
 * Interface pour le manifeste d'un addon
 * Définit les métadonnées et la configuration d'un module
 */
export interface AddonManifest {
  // Métadonnées de base
  name: string;
  version: string;
  versions?: string[];
  displayName: string;
  summary: string;
  description: string;
  publication?: {
    status: 'draft' | 'published';
    auditLog?: string;
  };
  
  // Configuration
  application: boolean;
  autoInstall: boolean;
  installable: boolean;
  
  // Routes définies par l'addon
  routes?: RouteDefinition[];
  
  // Modèles de données
  models?: ModelDefinition[];
  
  // Menus définis par l'addon
  menus?: MenuDefinition[];
  
  // Dépendances
  dependencies?: string[];
}

/**
 * Définition d'une route pour un addon
 */
export interface RouteDefinition {
  path: string;
  component: React.ComponentType<any>;
  protected?: boolean;
  title: string;
  icon?: string;
  children?: RouteDefinition[];
}

/**
 * Définition d'un modèle de données
 */
export interface ModelDefinition {
  name: string;
  displayName: string;
  fields?: FieldDefinition[];
}

/**
 * Définition d'un champ de modèle
 */
export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'many2one' | 'one2many' | 'many2many';
  required?: boolean;
  label: string;
  default?: any;
  relation?: string; // Pour les champs relationnels
}

/**
 * Définition d'un élément de menu
 */
export interface MenuDefinition {
  id: string;
  name: string;
  sequence: number;
  route?: string;
  icon?: string;
  parent?: string;
  children?: MenuDefinition[];
}

/**
 * Interface pour un addon complet
 */
export interface Addon {
  manifest: AddonManifest;
  routes: ReactNode;
  initialize?: () => void;
  cleanup?: () => void;
  Components?: Record<string, React.ComponentType<any>>;
}

/**
 * Options pour les recherches
 */
export interface SearchOptions {
  limit?: number;
  offset?: number;
  order?: string;
  domain?: any[];
  fields?: string[];
}
