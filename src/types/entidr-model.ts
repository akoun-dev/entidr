/**
 * Types et interfaces pour le système de modèles Entidr
 * Ces types définissent la structure des modèles de données pour l'ERP Entidr
 */

import { EntidrFieldType, EntidrFieldDefinition } from './entidr-addon';

export interface EntidrModel {
  // Métadonnées du modèle
  _name: string;
  _description?: string;
  _order?: string;
  _rec_name?: string;
  _inherit?: string[];
  _table?: string;
  _auto?: boolean;

  // Champs du modèle
  fields: Record<string, EntidrModelField>;

  // Méthodes du modèle
  methods?: Record<string, EntidrModelMethod>;

  // Contraintes
  _sql_constraints?: [string, string, string][];

  // Valeurs par défaut
  _defaults?: Record<string, any>;

  // Hooks du cycle de vie
  _hooks?: EntidrModelHooks;

  // Configuration
  config?: EntidrModelConfig;
}

export interface EntidrModelField extends Omit<EntidrFieldDefinition, 'compute'> {
  // Propriétés spécifiques aux modèles
  string?: string; // Définition SQL du champ
  compute?: string | Function; // Méthode de calcul (nom ou fonction)
  inverse?: string; // Méthode inverse pour les champs calculés
  search?: string; // Méthode de recherche
  related?: string; // Champ lié
  store?: boolean; // Stocker en base de données
  readonly?: boolean; // Champ en lecture seule
  required?: boolean; // Champ requis
  index?: boolean; // Indexer le champ
  default?: any; // Valeur par défaut
  translate?: boolean; // Champ traduisible
  tracking?: boolean; // Suivi des modifications
  size?: number; // Taille du champ
  domain?: string; // Domaine de filtrage
  context?: string; // Contexte
}

export interface EntidrModelMethod {
  name: string;
  description?: string;
  parameters?: EntidrMethodParameter[];
  returns?: EntidrMethodReturn;
  body: string | Function;
  api?: boolean; // Exposer via API
  permissions?: string[]; // Permissions requises
}

export interface EntidrMethodParameter {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
  description?: string;
}

export interface EntidrMethodReturn {
  type: string;
  description?: string;
}

export interface EntidrModelHooks {
  // Hooks de cycle de vie
  beforeCreate?: Function;
  afterCreate?: Function;
  beforeUpdate?: Function;
  afterUpdate?: Function;
  beforeDelete?: Function;
  afterDelete?: Function;
  beforeValidate?: Function;
  afterValidate?: Function;
  beforeSave?: Function;
  afterSave?: Function;
  beforeFind?: Function;
  afterFind?: Function;
}

export interface EntidrModelConfig {
  // Configuration du modèle
  logging?: boolean;
  timestamps?: boolean;
  paranoid?: boolean;
  underscored?: boolean;
  freezeTableName?: boolean;
  schema?: string;
  engine?: string;
  charset?: string;
  collate?: string;
  initialAutoIncrement?: string;
  comment?: string;
}

// Types pour les relations entre modèles
export interface EntidrRelation {
  type: 'belongsTo' | 'hasOne' | 'hasMany' | 'belongsToMany';
  target: string;
  foreignKey?: string;
  otherKey?: string;
  as?: string;
  through?: string;
  foreignKeyConstraint?: boolean;
  onDelete?: string;
  onUpdate?: string;
  constraints?: boolean;
  scope?: Record<string, any>;
}

// Types pour les requêtes et résultats
export interface EntidrQueryOptions {
  where?: Record<string, any>;
  include?: EntidrIncludeOptions[];
  attributes?: string[];
  order?: string[];
  limit?: number;
  offset?: number;
  group?: string[];
  having?: Record<string, any>;
  subQuery?: boolean;
  paranoid?: boolean;
  raw?: boolean;
  transaction?: any;
  logging?: boolean;
  benchmark?: boolean;
}

export interface EntidrIncludeOptions {
  model: string;
  as?: string;
  attributes?: string[];
  where?: Record<string, any>;
  include?: EntidrIncludeOptions[];
  required?: boolean;
  right?: boolean;
  separate?: boolean;
  limit?: number;
  offset?: number;
  through?: EntidrIncludeThroughOptions;
}

export interface EntidrIncludeThroughOptions {
  model: string;
  as?: string;
  attributes?: string[];
  where?: Record<string, any>;
}

export interface EntidrFindOptions extends EntidrQueryOptions {
  rejectOnEmpty?: boolean;
}

export interface EntidrCreateOptions {
  fields?: string[];
  validate?: boolean;
  logging?: boolean;
  transaction?: any;
  returning?: boolean | string[];
  silent?: boolean;
  hooks?: boolean;
  individualHooks?: boolean;
}

export interface EntidrUpdateOptions {
  where?: Record<string, any>;
  fields?: string[];
  validate?: boolean;
  logging?: boolean;
  transaction?: any;
  returning?: boolean | string[];
  silent?: boolean;
  hooks?: boolean;
  individualHooks?: boolean;
  sideEffects?: boolean;
  limit?: number;
}

export interface EntidrDestroyOptions {
  where?: Record<string, any>;
  logging?: boolean;
  transaction?: any;
  individualHooks?: boolean;
  force?: boolean;
  cascade?: boolean;
  restartIdentity?: boolean;
}

// Types pour les résultats de requêtes
export interface EntidrModelInstance {
  id: string | number;
  [key: string]: any;
  isNewRecord?: boolean;
  isDirty?: boolean;
  isDeleted?: boolean;
  changed?: Record<string, boolean>;
  previous?: Record<string, any>;
  dataValues?: Record<string, any>;
  _options?: any;
}

export interface EntidrModelResult<T = any> {
  count?: number;
  rows: T[];
  page?: number;
  pageSize?: number;
  total?: number;
}

// Types pour la validation
export interface EntidrValidationRule {
  field: string;
  rule: string;
  message?: string;
  args?: any[];
}

export interface EntidrValidationError {
  field: string;
  message: string;
  value: any;
  validator?: string;
  validatorKey?: string;
  validatorArgs?: any[];
}

// Types pour les agrégations
export interface EntidrAggregateOptions {
  attribute: string;
  type: 'count' | 'sum' | 'avg' | 'min' | 'max';
  distinct?: boolean;
  where?: Record<string, any>;
}

export interface EntidrAggregateResult {
  [key: string]: number | string;
}

// Types pour les transactions
export interface EntidrTransactionOptions {
  autocommit?: boolean;
  type?: string;
  isolationLevel?: string;
  deferrable?: string;
}

export interface EntidrTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  savepoint(): Promise<string>;
  rollbackToSavepoint(savepointName: string): Promise<void>;
}

// Types pour le schéma de base de données
export interface EntidrSchemaOptions {
  freezeTableName?: boolean;
  underscored?: boolean;
  paranoid?: boolean;
  timestamps?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  version?: boolean;
  validate?: boolean;
}

// Types pour les migrations
export interface EntidrMigration {
  up: (queryInterface: any, Sequelize: any) => Promise<void>;
  down: (queryInterface: any, Sequelize: any) => Promise<void>;
}

// Types pour les seeders
export interface EntidrSeeder {
  up: (queryInterface: any, Sequelize: any) => Promise<void>;
  down: (queryInterface: any, Sequelize: any) => Promise<void>;
}

// Types pour le registre de modèles
export interface EntidrModelRegistry {
  [modelName: string]: {
    model: EntidrModel;
    instance?: any; // Instance Sequelize
    relations: EntidrRelation[];
    indexes: EntidrModelIndex[];
  };
}

export interface EntidrModelIndex {
  name?: string;
  fields: string[];
  unique?: boolean;
  where?: Record<string, any>;
  type?: string;
  concurrently?: boolean;
  using?: string;
  operator?: string;
}

// Types pour les événements de modèle
export interface EntidrModelEvent {
  type: 'created' | 'updated' | 'deleted' | 'validated' | 'associated' | 'disassociated';
  modelName: string;
  recordId: string | number;
  timestamp: Date;
  userId?: string;
  changes?: Record<string, any>;
}

// Types pour les scopes de modèle
export interface EntidrModelScope {
  name: string;
  scope: (model: any, ...args: any[]) => any;
}

// Types pour les méthodes statiques de modèle
export interface EntidrStaticMethods {
  findAndCountAll?: (options: EntidrFindOptions) => Promise<EntidrModelResult>;
  findOne?: (options: EntidrFindOptions) => Promise<EntidrModelInstance | null>;
  findAll?: (options: EntidrFindOptions) => Promise<EntidrModelInstance[]>;
  create?: (values: Record<string, any>, options: EntidrCreateOptions) => Promise<EntidrModelInstance>;
  update?: (values: Record<string, any>, options: EntidrUpdateOptions) => Promise<[number, EntidrModelInstance[]]>;
  destroy?: (options: EntidrDestroyOptions) => Promise<number>;
  count?: (options: EntidrQueryOptions) => Promise<number>;
  aggregate?: (options: EntidrAggregateOptions) => Promise<EntidrAggregateResult>;
  build?: (values: Record<string, any>, options?: any) => EntidrModelInstance;
  save?: (options?: any) => Promise<EntidrModelInstance>;
  reload?: (options?: any) => Promise<EntidrModelInstance>;
  validate?: (options?: any) => Promise<boolean>;
  increment?: (fields: string[], options: EntidrUpdateOptions) => Promise<EntidrModelInstance>;
  decrement?: (fields: string[], options: EntidrUpdateOptions) => Promise<EntidrModelInstance>;
}
