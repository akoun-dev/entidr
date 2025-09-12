import {
  EntidrModel,
  EntidrModelField,
  EntidrModelMethod,
  EntidrMethodParameter,
  EntidrMethodReturn,
  EntidrModelHooks,
  EntidrModelConfig,
  EntidrRelation,
  EntidrValidationRule,
  EntidrValidationError,
  EntidrModelScope,
  EntidrStaticMethods
} from '../../types/entidr-model';

import { Model, DataTypes, Sequelize, Op, WhereOptions, IncludeOptions, ModelStatic, ModelAttributes } from 'sequelize';
import { EntidrError } from '../../types/entidr-index';

/**
 * Types de champs avancés
 */
export enum AdvancedFieldType {
  STRING = 'string',
  TEXT = 'text',
  INTEGER = 'integer',
  BIGINT = 'bigint',
  FLOAT = 'float',
  DECIMAL = 'decimal',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATEONLY = 'dateonly',
  TIME = 'time',
  DATETIME = 'datetime',
  JSON = 'json',
  JSONB = 'jsonb',
  UUID = 'uuid',
  ENUM = 'enum',
  ARRAY = 'array',
  GEOMETRY = 'geometry',
  GEOGRAPHY = 'geography',
  CIDR = 'cidr',
  INET = 'inet',
  MACADDR = 'macaddr',
  RANGE = 'range',
  HSTORE = 'hstore',
  TSVECTOR = 'tsvector',
  MONEY = 'money',
  CITEXT = 'citext'
}

/**
 * Configuration des champs avancés
 */
export interface AdvancedFieldConfig {
  type: AdvancedFieldType;
  allowNull?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  defaultValue?: any;
  comment?: string;
  validate?: ValidationRule[];
  index?: boolean | { name?: string; unique?: boolean; where?: any };
  references?: {
    model: string;
    key?: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
  get?: () => any;
  set?: (value: any) => any;
  virtual?: boolean;
  computed?: boolean;
  computedFrom?: string[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  importable?: boolean;
  sensitive?: boolean;
  encrypted?: boolean;
  masked?: boolean;
  audit?: boolean;
  history?: boolean;
  versioned?: boolean;
  multilingual?: boolean;
  translatable?: boolean;
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  group?: string;
  order?: number;
  widget?: string;
  widgetConfig?: Record<string, any>;
  hint?: string;
  placeholder?: string;
  help?: string;
  example?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  precision?: number;
  scale?: number;
  values?: any[];
  enumName?: string;
  collation?: string;
  charset?: string;
  unsigned?: boolean;
  zerofill?: boolean;
}

/**
 * Règles de validation avancées
 */
export interface ValidationRule {
  validator: (value: any) => boolean | string | Promise<boolean | string>;
  message?: string;
  args?: any[];
}

/**
 * Options de champ pour Sequelize
 */
export interface SequelizeFieldOptions {
  type: any;
  allowNull?: boolean;
  unique?: boolean | string | { name: string; msg?: string };
  primaryKey?: boolean;
  autoIncrement?: boolean;
  defaultValue?: any;
  comment?: string;
  validate?: Record<string, any>;
  references?: {
    model: string | Model;
    key: string;
    deferrable?: any;
  };
  onDelete?: string;
  onUpdate?: string;
  get?: () => any;
  set?: (value: any) => void;
}

/**
 * Classe de base pour les modèles Entidr avancés
 */
export abstract class EntidrBaseModel extends Model {
  // Métadonnées du modèle
  public static metadata: EntidrModel;
  public static fields: Map<string, AdvancedFieldConfig> = new Map();
  public static methods: Map<string, EntidrModelMethod> = new Map();
  public static hooks: EntidrModelHooks = {};
  public static scopes: Map<string, EntidrModelScope> = new Map();
  public static relations: Map<string, EntidrRelation> = new Map();
  public static validationRules: Map<string, ValidationRule[]> = new Map();
  public static staticMethods: EntidrStaticMethods = {};

  /**
   * Définit un champ avancé
   */
  public static defineField(name: string, config: AdvancedFieldConfig): void {
    this.fields.set(name, config);

    // Convertir la configuration en options Sequelize
    const sequelizeOptions = this.convertToSequelizeOptions(config);

    // Ajouter le champ au modèle
    (this.rawAttributes as any)[name] = sequelizeOptions;

    // Ajouter les règles de validation
    if (config.validate) {
      this.validationRules.set(name, config.validate);
    }
  }

  /**
   * Définit une méthode de modèle
   */
  public static defineMethod(name: string, method: EntidrModelMethod): void {
    this.methods.set(name, method);

    // Ajouter la méthode comme méthode d'instance
    if (method.api) { // Utiliser api comme indicateur pour les méthodes d'instance
      (this.prototype as any)[name] = function(...args: any[]) {
        return (method.body as Function).call(this, this, ...args);
      };
    } else {
      // Méthode statique
      (this as any)[name] = function(...args: any[]) {
        return (method.body as Function).call(this, this, ...args);
      };
    }
  }

  /**
   * Définit une relation
   */
  public static defineRelation(name: string, relation: EntidrRelation): void {
    this.relations.set(name, relation);

    // Implémenter la relation avec Sequelize
    const targetModel = (global as any)[relation.target];
    if (!targetModel) {
      console.warn(`Target model ${relation.target} not found for relation ${name}`);
      return;
    }

    switch (relation.type) {
      case 'belongsTo':
        this.belongsTo(targetModel, {
          foreignKey: relation.foreignKey,
          as: relation.as,
          onDelete: relation.onDelete,
          onUpdate: relation.onUpdate,
          constraints: relation.foreignKeyConstraint
        });
        break;
      case 'hasOne':
        this.hasOne(targetModel, {
          foreignKey: relation.foreignKey,
          as: relation.as,
          onDelete: relation.onDelete,
          onUpdate: relation.onUpdate,
          constraints: relation.foreignKeyConstraint
        });
        break;
      case 'hasMany':
        this.hasMany(targetModel, {
          foreignKey: relation.foreignKey,
          as: relation.as,
          onDelete: relation.onDelete,
          onUpdate: relation.onUpdate,
          constraints: relation.foreignKeyConstraint
        });
        break;
      case 'belongsToMany':
        this.belongsToMany(targetModel, relation.through || {
          model: `${this.name}_${name}`,
        }, {
          foreignKey: relation.foreignKey,
          otherKey: relation.otherKey,
          as: relation.as
        });
        break;
    }
  }

  /**
   * Définit un scope
   */
  public static defineScope(name: string, scope: EntidrModelScope): void {
    this.scopes.set(name, scope);

    // Ajouter le scope à Sequelize
    (this as any).addScope(name, scope.scope);
  }

  /**
   * Définit un hook
   */
  public static defineHook(hookName: keyof EntidrModelHooks, handler: Function): void {
    if (!this.hooks[hookName]) {
      (this.hooks as any)[hookName] = [];
    }
    (this.hooks as any)[hookName].push(handler);

    // Ajouter le hook à Sequelize
    this.addHook(hookName as any, handler);
  }

  /**
   * Valide un modèle
   */
  public async validateModel(): Promise<EntidrValidationError[]> {
    const errors: EntidrValidationError[] = [];
    const constructor = this.constructor as typeof EntidrBaseModel;

    for (const [fieldName, rules] of constructor.validationRules) {
      const value = this.get(fieldName);

      for (const rule of rules) {
        try {
          const result = await rule.validator(value);
          if (result !== true) {
            errors.push({
              field: fieldName,
              message: typeof result === 'string' ? result : rule.message || 'Validation failed',
              value,
              validator: rule.validator.name || 'custom'
            });
          }
        } catch (error) {
          errors.push({
            field: fieldName,
            message: rule.message || 'Validation error',
            value,
            validator: rule.validator.name || 'custom'
          });
        }
      }
    }

    return errors;
  }

  /**
   * Convertit la configuration de champ en options Sequelize
   */
  private static convertToSequelizeOptions(config: AdvancedFieldConfig): SequelizeFieldOptions {
    const options: SequelizeFieldOptions = {
      type: this.convertToSequelizeType(config.type),
      allowNull: config.allowNull ?? true,
      unique: config.unique,
      primaryKey: config.primaryKey,
      autoIncrement: config.autoIncrement,
      defaultValue: config.defaultValue,
      comment: config.comment
    };

    // Validation
    if (config.validate) {
      options.validate = {};
      for (const rule of config.validate) {
        if (rule.validator.name) {
          options.validate[rule.validator.name] = {
            msg: rule.message,
            args: rule.args
          };
        }
      }
    }

    // Références
    if (config.references) {
      options.references = {
        model: config.references.model,
        key: config.references.key || 'id'
      };
      options.onDelete = config.references.onDelete;
      options.onUpdate = config.references.onUpdate;
    }

    // Getters/Setters
    if (config.get) {
      options.get = config.get;
    }
    if (config.set) {
      options.set = config.set;
    }

    return options;
  }

  /**
   * Convertit le type de champ avancé en type Sequelize
   */
  private static convertToSequelizeType(type: AdvancedFieldType): any {
    switch (type) {
      case AdvancedFieldType.STRING:
        return DataTypes.STRING;
      case AdvancedFieldType.TEXT:
        return DataTypes.TEXT;
      case AdvancedFieldType.INTEGER:
        return DataTypes.INTEGER;
      case AdvancedFieldType.BIGINT:
        return DataTypes.BIGINT;
      case AdvancedFieldType.FLOAT:
        return DataTypes.FLOAT;
      case AdvancedFieldType.DECIMAL:
        return DataTypes.DECIMAL;
      case AdvancedFieldType.BOOLEAN:
        return DataTypes.BOOLEAN;
      case AdvancedFieldType.DATE:
        return DataTypes.DATE;
      case AdvancedFieldType.DATEONLY:
        return DataTypes.DATEONLY;
      case AdvancedFieldType.TIME:
        return DataTypes.TIME;
      case AdvancedFieldType.DATETIME:
        return DataTypes.DATE;
      case AdvancedFieldType.JSON:
        return DataTypes.JSON;
      case AdvancedFieldType.JSONB:
        return DataTypes.JSONB;
      case AdvancedFieldType.UUID:
        return DataTypes.UUID;
      case AdvancedFieldType.ENUM:
        return DataTypes.ENUM;
      case AdvancedFieldType.ARRAY:
        return DataTypes.ARRAY(DataTypes.TEXT);
      case AdvancedFieldType.GEOMETRY:
        return DataTypes.GEOMETRY;
      case AdvancedFieldType.GEOGRAPHY:
        return DataTypes.GEOGRAPHY;
      case AdvancedFieldType.CIDR:
        return DataTypes.CIDR;
      case AdvancedFieldType.INET:
        return DataTypes.INET;
      case AdvancedFieldType.MACADDR:
        return DataTypes.MACADDR;
      case AdvancedFieldType.RANGE:
        return DataTypes.RANGE(DataTypes.INTEGER);
      case AdvancedFieldType.HSTORE:
        return DataTypes.HSTORE;
      case AdvancedFieldType.TSVECTOR:
        return DataTypes.TSVECTOR;
      case AdvancedFieldType.MONEY:
        return DataTypes.DECIMAL(10, 2);
      case AdvancedFieldType.CITEXT:
        return DataTypes.CITEXT;
      default:
        return DataTypes.STRING;
    }
  }

  /**
   * Méthode utilitaire pour créer des validateurs personnalisés
   */
  public static createValidator(
    name: string,
    validator: (value: any) => boolean | string | Promise<boolean | string>,
    message?: string
  ): ValidationRule {
    return {
      validator: function(value: any) {
        return validator.call(this, value);
      },
      message
    };
  }

  /**
   * Validateurs prédéfinis
   */
  public static validators = {
    required: (value: any) => {
      if (value === null || value === undefined || value === '') {
        return 'This field is required';
      }
      return true;
    },

    email: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email format';
      }
      return true;
    },

    minLength: (min: number) => (value: string) => {
      if (value && value.length < min) {
        return `Minimum length is ${min} characters`;
      }
      return true;
    },

    maxLength: (max: number) => (value: string) => {
      if (value && value.length > max) {
        return `Maximum length is ${max} characters`;
      }
      return true;
    },

    pattern: (regex: RegExp, message: string) => (value: string) => {
      if (value && !regex.test(value)) {
        return message;
      }
      return true;
    },

    range: (min: number, max: number) => (value: number) => {
      if (value !== undefined && (value < min || value > max)) {
        return `Value must be between ${min} and ${max}`;
      }
      return true;
    },

    unique: async (value: any, fieldName: string, model: any) => {
      if (!value) return true;

      const existing = await model.findOne({
        where: { [fieldName]: value }
      });

      if (existing) {
        return 'This value must be unique';
      }
      return true;
    }
  };
}

/**
 * Décorateur pour définir un modèle Entidr
 */
export function EntidrModelDecorator(config: EntidrModelConfig) {
  return function <T extends typeof EntidrBaseModel>(constructor: T) {
    // Définir les métadonnées du modèle
    (constructor as any).metadata = {
      _name: constructor.name,
      _description: (config as any).description,
      _table: (config as any).tableName,
      config: config
    };

    return constructor;
  };
}

/**
 * Décorateur pour définir un champ
 */
export function Field(config: AdvancedFieldConfig) {
  return function (target: any, propertyName: string) {
    const constructor = target.constructor;

    if (!constructor.fields) {
      constructor.fields = new Map();
    }

    constructor.fields.set(propertyName, config);
  };
}

/**
 * Décorateur pour définir une méthode
 */
export function Method(config: EntidrModelMethod) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const constructor = target.constructor;

    if (!constructor.methods) {
      constructor.methods = new Map();
    }

    constructor.methods.set(propertyName, {
      ...config,
      body: descriptor.value
    });
  };
}

/**
 * Décorateur pour définir une relation
 */
export function Relation(config: EntidrRelation) {
  return function (target: any, propertyName: string) {
    const constructor = target.constructor;

    if (!constructor.relations) {
      constructor.relations = new Map();
    }

    constructor.relations.set(propertyName, config);
  };
}

/**
 * Décorateur pour définir un hook
 */
export function Hook(hookName: keyof EntidrModelHooks) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const constructor = target.constructor;

    if (!constructor.hooks) {
      constructor.hooks = {};
    }

    if (!constructor.hooks[hookName]) {
      (constructor.hooks as any)[hookName] = [];
    }

    (constructor.hooks as any)[hookName].push(descriptor.value);
  };
}

/**
 * Décorateur pour définir un scope
 */
export function Scope(config: EntidrModelScope) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const constructor = target.constructor;

    if (!constructor.scopes) {
      constructor.scopes = new Map();
    }

    constructor.scopes.set(propertyName, {
      ...config,
      scope: descriptor.value
    });
  };
}

export default EntidrBaseModel;
