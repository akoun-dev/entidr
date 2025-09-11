import { EntidrBaseModel } from '../EntidrModel';
import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Types de contraintes SQL supportées
 */
export enum ConstraintType {
  PRIMARY_KEY = 'primaryKey',
  FOREIGN_KEY = 'foreignKey',
  UNIQUE = 'unique',
  CHECK = 'check',
  NOT_NULL = 'notNull',
  DEFAULT = 'default',
  EXCLUSION = 'exclusion'
}

/**
 * Types d'actions pour les contraintes de clé étrangère
 */
export enum ForeignKeyAction {
  CASCADE = 'CASCADE',
  SET_NULL = 'SET NULL',
  SET_DEFAULT = 'SET DEFAULT',
  RESTRICT = 'RESTRICT',
  NO_ACTION = 'NO ACTION'
}

/**
 * Configuration d'une contrainte
 */
export interface ConstraintConfig {
  name: string;
  type: ConstraintType;
  fields: string[];
  table?: string;
  references?: {
    table: string;
    fields: string[];
    onDelete?: ForeignKeyAction;
    onUpdate?: ForeignKeyAction;
  };
  check?: string;
  defaultValue?: any;
  deferrable?: {
    type: 'INITIALLY DEFERRED' | 'INITIALLY IMMEDIATE';
    deferred: boolean;
  };
  comment?: string;
  validate?: boolean;
  errorMessages?: {
    unique?: string;
    foreignKey?: string;
    check?: string;
    notNull?: string;
  };
}

/**
 * Options pour l'ajout de contraintes
 */
export interface AddConstraintOptions {
  ifNotExists?: boolean;
  validate?: boolean;
  transaction?: any;
  logging?: boolean;
}

/**
 * Options pour la suppression de contraintes
 */
export interface DropConstraintOptions {
  ifExists?: boolean;
  cascade?: boolean;
  transaction?: any;
  logging?: boolean;
}

/**
 * Classe pour gérer les contraintes SQL
 */
export class EntidrConstraintManager {
  private static constraints: Map<string, Map<string, ConstraintConfig>> = new Map();
  private static modelConstraints: Map<string, string[]> = new Map();

  /**
   * Définit une contrainte pour un modèle
   */
  public static defineConstraint(
    modelName: string,
    constraintName: string,
    config: ConstraintConfig
  ): void {
    // Valider la configuration
    const errors = this.validateConstraint(config);
    if (errors.length > 0) {
      throw new Error(`Invalid constraint configuration: ${errors.join(', ')}`);
    }

    // Stocker la contrainte
    if (!this.constraints.has(modelName)) {
      this.constraints.set(modelName, new Map());
    }
    this.constraints.get(modelName)!.set(constraintName, config);

    // Associer la contrainte au modèle
    if (!this.modelConstraints.has(modelName)) {
      this.modelConstraints.set(modelName, []);
    }
    this.modelConstraints.get(modelName)!.push(constraintName);

    // Appliquer la contrainte au niveau du modèle
    this.applyModelConstraint(modelName, config);
  }

  /**
   * Applique une contrainte au niveau du modèle
   */
  private static applyModelConstraint(modelName: string, config: ConstraintConfig): void {
    const model = (global as any)[modelName] as typeof EntidrBaseModel;
    if (!model) {
      console.warn(`Model ${modelName} not found for constraint ${config.name}`);
      return;
    }

    switch (config.type) {
      case ConstraintType.PRIMARY_KEY:
        this.applyPrimaryKeyConstraint(model, config);
        break;
      case ConstraintType.UNIQUE:
        this.applyUniqueConstraint(model, config);
        break;
      case ConstraintType.FOREIGN_KEY:
        this.applyForeignKeyConstraint(model, config);
        break;
      case ConstraintType.CHECK:
        this.applyCheckConstraint(model, config);
        break;
      case ConstraintType.NOT_NULL:
        this.applyNotNullConstraint(model, config);
        break;
      case ConstraintType.DEFAULT:
        this.applyDefaultConstraint(model, config);
        break;
    }
  }

  /**
   * Applique une contrainte de clé primaire
   */
  private static applyPrimaryKeyConstraint(model: typeof EntidrBaseModel, config: ConstraintConfig): void {
    // Sequelize gère les clés primaires via les options de champ
    // On ajoute juste une validation supplémentaire
    this.addValidationHook(model, config.fields[0], (value: any) => {
      if (value === null || value === undefined) {
        return config.errorMessages?.notNull || 'Primary key cannot be null';
      }
      return true;
    });
  }

  /**
   * Applique une contrainte d'unicité
   */
  private static applyUniqueConstraint(model: typeof EntidrBaseModel, config: ConstraintConfig): void {
    // Pour les contraintes d'unicité sur un seul champ
    if (config.fields.length === 1) {
      const fieldName = config.fields[0];
      this.addValidationHook(model, fieldName, async (value: any, instance: any) => {
        if (value === null || value === undefined) return true;

        const where: any = { [fieldName]: value };
        if (instance.id) {
          where.id = { [model.sequelize!.Op.ne]: instance.id };
        }

        const existing = await model.findOne({ where });
        if (existing) {
          return config.errorMessages?.unique || `This ${fieldName} must be unique`;
        }
        return true;
      });
    }
  }

  /**
   * Applique une contrainte de clé étrangère
   */
  private static applyForeignKeyConstraint(model: typeof EntidrBaseModel, config: ConstraintConfig): void {
    if (!config.references) return;

    const fieldName = config.fields[0];
    const targetModel = (global as any)[config.references.table] as typeof EntidrBaseModel;

    if (!targetModel) {
      console.warn(`Target model ${config.references.table} not found for foreign key constraint`);
      return;
    }

    this.addValidationHook(model, fieldName, async (value: any) => {
      if (value === null || value === undefined) return true;

      const existing = await targetModel.findByPk(value);
      if (!existing) {
        return config.errorMessages?.foreignKey || 'Invalid foreign key reference';
      }
      return true;
    });
  }

  /**
   * Applique une contrainte CHECK
   */
  private static applyCheckConstraint(model: typeof EntidrBaseModel, config: ConstraintConfig): void {
    if (!config.check) return;

    // Pour les contraintes CHECK simples, on peut les convertir en validation
    const fieldNames = config.fields;

    this.addValidationHook(model, fieldNames[0], (value: any, instance: any) => {
      try {
        // Créer un contexte pour évaluer l'expression CHECK
        const context: any = { [fieldNames[0]]: value };
        fieldNames.slice(1).forEach(field => {
          context[field] = instance.get(field);
        });

        // Évaluer l'expression (simplifié - en production on utiliserait un parser SQL)
        const result = this.evaluateCheckExpression(config.check!, context);
        if (!result) {
          return config.errorMessages?.check || 'Check constraint failed';
        }
        return true;
      } catch (error) {
        return config.errorMessages?.check || 'Invalid check constraint';
      }
    });
  }

  /**
   * Applique une contrainte NOT NULL
   */
  private static applyNotNullConstraint(model: typeof EntidrBaseModel, config: ConstraintConfig): void {
    const fieldName = config.fields[0];
    this.addValidationHook(model, fieldName, (value: any) => {
      if (value === null || value === undefined) {
        return config.errorMessages?.notNull || `${fieldName} cannot be null`;
      }
      return true;
    });
  }

  /**
   * Applique une contrainte DEFAULT
   */
  private static applyDefaultConstraint(model: typeof EntidrBaseModel, config: ConstraintConfig): void {
    const fieldName = config.fields[0];
    const defaultValue = config.defaultValue;

    this.addHook(model, 'beforeCreate', (instance: any) => {
      if (instance.get(fieldName) === undefined || instance.get(fieldName) === null) {
        instance.set(fieldName, defaultValue);
      }
    });

    this.addHook(model, 'beforeUpdate', (instance: any) => {
      if (instance.changed(fieldName) && (instance.get(fieldName) === undefined || instance.get(fieldName) === null)) {
        instance.set(fieldName, defaultValue);
      }
    });
  }

  /**
   * Ajoute un hook de validation
   */
  private static addValidationHook(
    model: typeof EntidrBaseModel,
    fieldName: string,
    validator: (value: any, instance: any) => any
  ): void {
    model.addHook('beforeValidate', async (instance: any) => {
      const value = instance.get(fieldName);
      const result = await validator(value, instance);

      if (result !== true) {
        throw new Error(typeof result === 'string' ? result : 'Validation failed');
      }
    });
  }

  /**
   * Ajoute un hook
   */
  private static addHook(
    model: typeof EntidrBaseModel,
    hookName: string,
    handler: Function
  ): void {
    model.addHook(hookName as any, handler);
  }

  /**
   * Évalue une expression CHECK (simplifié)
   */
  private static evaluateCheckExpression(expression: string, context: any): boolean {
    // Cette implémentation est très simplifiée
    // En production, on utiliserait un vrai parser SQL

    // Exemples simples d'expressions
    if (expression.includes('>')) {
      const [field, value] = expression.split('>').map(s => s.trim());
      return context[field] > parseFloat(value);
    }

    if (expression.includes('<')) {
      const [field, value] = expression.split('<').map(s => s.trim());
      return context[field] < parseFloat(value);
    }

    if (expression.includes('=')) {
      const [field, value] = expression.split('=').map(s => s.trim());
      return context[field] === value;
    }

    if (expression.includes('!=')) {
      const [field, value] = expression.split('!=').map(s => s.trim());
      return context[field] !== value;
    }

    return true;
  }

  /**
   * Valide une configuration de contrainte
   */
  public static validateConstraint(config: ConstraintConfig): string[] {
    const errors: string[] = [];

    if (!config.name) {
      errors.push('Constraint name is required');
    }

    if (!config.type) {
      errors.push('Constraint type is required');
    }

    if (!config.fields || config.fields.length === 0) {
      errors.push('Constraint fields are required');
    }

    if (config.type === ConstraintType.FOREIGN_KEY && !config.references) {
      errors.push('References are required for foreign key constraints');
    }

    if (config.type === ConstraintType.CHECK && !config.check) {
      errors.push('Check expression is required for check constraints');
    }

    if (config.type === ConstraintType.DEFAULT && config.defaultValue === undefined) {
      errors.push('Default value is required for default constraints');
    }

    return errors;
  }

  /**
   * Crée une contrainte de clé primaire
   */
  public static createPrimaryKey(
    modelName: string,
    fieldName: string,
    options: Partial<ConstraintConfig> = {}
  ): void {
    this.defineConstraint(modelName, `pk_${modelName}_${fieldName}`, {
      name: `pk_${modelName}_${fieldName}`,
      type: ConstraintType.PRIMARY_KEY,
      fields: [fieldName],
      ...options
    });
  }

  /**
   * Crée une contrainte d'unicité
   */
  public static createUnique(
    modelName: string,
    fields: string[],
    options: Partial<ConstraintConfig> = {}
  ): void {
    const constraintName = `uk_${modelName}_${fields.join('_')}`;
    this.defineConstraint(modelName, constraintName, {
      name: constraintName,
      type: ConstraintType.UNIQUE,
      fields,
      ...options
    });
  }

  /**
   * Crée une contrainte de clé étrangère
   */
  public static createForeignKey(
    modelName: string,
    fieldName: string,
    references: {
      table: string;
      field?: string;
      onDelete?: ForeignKeyAction;
      onUpdate?: ForeignKeyAction;
    },
    options: Partial<ConstraintConfig> = {}
  ): void {
    const constraintName = `fk_${modelName}_${fieldName}_${references.table}`;
    this.defineConstraint(modelName, constraintName, {
      name: constraintName,
      type: ConstraintType.FOREIGN_KEY,
      fields: [fieldName],
      references: {
        table: references.table,
        fields: [references.field || 'id'],
        onDelete: references.onDelete,
        onUpdate: references.onUpdate
      },
      ...options
    });
  }

  /**
   * Crée une contrainte CHECK
   */
  public static createCheck(
    modelName: string,
    fields: string[],
    check: string,
    options: Partial<ConstraintConfig> = {}
  ): void {
    const constraintName = `ck_${modelName}_${fields.join('_')}`;
    this.defineConstraint(modelName, constraintName, {
      name: constraintName,
      type: ConstraintType.CHECK,
      fields,
      check,
      ...options
    });
  }

  /**
   * Crée une contrainte NOT NULL
   */
  public static createNotNull(
    modelName: string,
    fieldName: string,
    options: Partial<ConstraintConfig> = {}
  ): void {
    const constraintName = `nn_${modelName}_${fieldName}`;
    this.defineConstraint(modelName, constraintName, {
      name: constraintName,
      type: ConstraintType.NOT_NULL,
      fields: [fieldName],
      ...options
    });
  }

  /**
   * Crée une contrainte DEFAULT
   */
  public static createDefault(
    modelName: string,
    fieldName: string,
    defaultValue: any,
    options: Partial<ConstraintConfig> = {}
  ): void {
    const constraintName = `df_${modelName}_${fieldName}`;
    this.defineConstraint(modelName, constraintName, {
      name: constraintName,
      type: ConstraintType.DEFAULT,
      fields: [fieldName],
      defaultValue,
      ...options
    });
  }

  /**
   * Récupère toutes les contraintes d'un modèle
   */
  public static getModelConstraints(modelName: string): Map<string, ConstraintConfig> {
    return this.constraints.get(modelName) || new Map();
  }

  /**
   * Récupère une contrainte spécifique
   */
  public static getConstraint(
    modelName: string,
    constraintName: string
  ): ConstraintConfig | undefined {
    const modelConstraints = this.constraints.get(modelName);
    return modelConstraints?.get(constraintName);
  }

  /**
   * Supprime une contrainte
   */
  public static removeConstraint(modelName: string, constraintName: string): boolean {
    const modelConstraints = this.constraints.get(modelName);
    if (modelConstraints && modelConstraints.has(constraintName)) {
      modelConstraints.delete(constraintName);

      // Retirer de la liste des contraintes du modèle
      const constraints = this.modelConstraints.get(modelName);
      if (constraints) {
        const index = constraints.indexOf(constraintName);
        if (index > -1) {
          constraints.splice(index, 1);
        }
      }

      return true;
    }
    return false;
  }

  /**
   * Exporte toutes les contraintes au format pour la sérialisation
   */
  public static exportConstraints(): Record<string, Record<string, ConstraintConfig>> {
    const exported: Record<string, Record<string, ConstraintConfig>> = {};

    for (const [modelName, constraints] of this.constraints) {
      exported[modelName] = {};

      for (const [constraintName, config] of constraints) {
        exported[modelName][constraintName] = config;
      }
    }

    return exported;
  }

  /**
   * Importe des contraintes depuis un format sérialisé
   */
  public static importConstraints(
    constraints: Record<string, Record<string, ConstraintConfig>>,
    models: Record<string, typeof EntidrBaseModel>
  ): void {
    for (const [modelName, modelConstraints] of Object.entries(constraints)) {
      if (!models[modelName]) {
        console.warn(`Model ${modelName} not found during constraint import`);
        continue;
      }

      for (const [constraintName, config] of Object.entries(modelConstraints)) {
        try {
          this.defineConstraint(modelName, constraintName, config);
        } catch (error) {
          console.error(`Failed to import constraint ${constraintName} for model ${modelName}:`, error);
        }
      }
    }
  }

  /**
   * Génère le SQL pour créer une contrainte
   */
  public static generateConstraintSQL(config: ConstraintConfig): string {
    switch (config.type) {
      case ConstraintType.PRIMARY_KEY:
        return `ALTER TABLE ${config.table} ADD CONSTRAINT ${config.name} PRIMARY KEY (${config.fields.join(', ')})`;

      case ConstraintType.UNIQUE:
        return `ALTER TABLE ${config.table} ADD CONSTRAINT ${config.name} UNIQUE (${config.fields.join(', ')})`;

      case ConstraintType.FOREIGN_KEY:
        if (!config.references) return '';
        return `ALTER TABLE ${config.table} ADD CONSTRAINT ${config.name} FOREIGN KEY (${config.fields.join(', ')}) REFERENCES ${config.references.table} (${config.references.fields.join(', ')}) ON DELETE ${config.references.onDelete || 'NO ACTION'} ON UPDATE ${config.references.onUpdate || 'NO ACTION'}`;

      case ConstraintType.CHECK:
        return `ALTER TABLE ${config.table} ADD CONSTRAINT ${config.name} CHECK (${config.check})`;

      case ConstraintType.NOT_NULL:
        return `ALTER TABLE ${config.table} ADD CONSTRAINT ${config.name} CHECK (${config.fields[0]} IS NOT NULL)`;

      default:
        return '';
    }
  }
}

export default EntidrConstraintManager;
