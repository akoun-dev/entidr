import { EntidrBaseModel } from '../EntidrModel';
import { EntidrRelation } from '../../../types/entidr-model';
import { Model, ModelStatic } from 'sequelize';

/**
 * Types de relations supportées
 */
export enum RelationType {
  BELONGS_TO = 'belongsTo',
  HAS_ONE = 'hasOne',
  HAS_MANY = 'hasMany',
  BELONGS_TO_MANY = 'belongsToMany'
}

/**
 * Configuration de relation avancée
 */
export interface RelationConfig {
  type: RelationType;
  target: ModelStatic<Model> | string;
  foreignKey?: string;
  otherKey?: string;
  as?: string;
  through?: string | ModelStatic<Model>;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  constraints?: boolean;
  scope?: Record<string, any>;
  hooks?: {
    beforeAssociate?: Function;
    afterAssociate?: Function;
    beforeCreate?: Function;
    afterCreate?: Function;
    beforeUpdate?: Function;
    afterUpdate?: Function;
    beforeDestroy?: Function;
    afterDestroy?: Function;
  };
}

/**
 * Classe pour gérer les relations entre modèles
 */
export class EntidrRelationManager {
  private static relations: Map<string, Map<string, RelationConfig>> = new Map();

  /**
   * Définit une relation entre deux modèles
   */
  public static defineRelation(
    sourceModel: typeof EntidrBaseModel,
    relationName: string,
    config: RelationConfig
  ): void {
    const modelName = sourceModel.name;

    if (!this.relations.has(modelName)) {
      this.relations.set(modelName, new Map());
    }

    this.relations.get(modelName)!.set(relationName, config);

    // Implémenter la relation avec Sequelize
    this.implementSequelizeRelation(sourceModel, config);
  }

  /**
   * Implémente une relation avec Sequelize
   */
  private static implementSequelizeRelation(
    sourceModel: typeof EntidrBaseModel,
    config: RelationConfig
  ): void {
    const targetModel = this.resolveTargetModel(config.target);

    if (!targetModel) {
      console.warn(`Target model not found for relation: ${config.target}`);
      return;
    }

    const relationOptions: any = {
      foreignKey: config.foreignKey,
      as: config.as,
      onDelete: config.onDelete,
      onUpdate: config.onUpdate,
      constraints: config.constraints,
      scope: config.scope
    };

    switch (config.type) {
      case RelationType.BELONGS_TO:
        sourceModel.belongsTo(targetModel, relationOptions);
        break;

      case RelationType.HAS_ONE:
        sourceModel.hasOne(targetModel, relationOptions);
        break;

      case RelationType.HAS_MANY:
        sourceModel.hasMany(targetModel, relationOptions);
        break;

      case RelationType.BELONGS_TO_MANY:
        const throughOptions = typeof config.through === 'string'
          ? { model: config.through }
          : config.through;

        sourceModel.belongsToMany(targetModel, throughOptions, {
          foreignKey: config.foreignKey,
          otherKey: config.otherKey,
          as: config.as
        });
        break;
    }

    // Ajouter les hooks si définis
    if (config.hooks) {
      this.addRelationHooks(sourceModel, targetModel, config.hooks);
    }
  }

  /**
   * Résout le modèle cible
   */
  private static resolveTargetModel(target: ModelStatic<Model> | string): ModelStatic<Model> | null {
    if (typeof target === 'object') {
      return target;
    }

    // Chercher dans les modèles globaux ou enregistrés
    return (global as any)[target] || null;
  }

  /**
   * Ajoute les hooks de relation
   */
  private static addRelationHooks(
    sourceModel: typeof EntidrBaseModel,
    targetModel: ModelStatic<Model>,
    hooks: any
  ): void {
    if (hooks.beforeAssociate) {
      sourceModel.beforeAssociate(hooks.beforeAssociate);
    }
    if (hooks.afterAssociate) {
      sourceModel.afterAssociate(hooks.afterAssociate);
    }

    // Hooks spécifiques aux opérations
    if (hooks.beforeCreate) {
      sourceModel.beforeCreate(hooks.beforeCreate);
    }
    if (hooks.afterCreate) {
      sourceModel.afterCreate(hooks.afterCreate);
    }
    if (hooks.beforeUpdate) {
      sourceModel.beforeUpdate(hooks.beforeUpdate);
    }
    if (hooks.afterUpdate) {
      sourceModel.afterUpdate(hooks.afterUpdate);
    }
    if (hooks.beforeDestroy) {
      sourceModel.beforeDestroy(hooks.beforeDestroy);
    }
    if (hooks.afterDestroy) {
      sourceModel.afterDestroy(hooks.afterDestroy);
    }
  }

  /**
   * Récupère toutes les relations d'un modèle
   */
  public static getModelRelations(modelName: string): Map<string, RelationConfig> {
    return this.relations.get(modelName) || new Map();
  }

  /**
   * Récupère une relation spécifique
   */
  public static getRelation(
    modelName: string,
    relationName: string
  ): RelationConfig | undefined {
    const modelRelations = this.relations.get(modelName);
    return modelRelations?.get(relationName);
  }

  /**
   * Vérifie si une relation existe
   */
  public static hasRelation(modelName: string, relationName: string): boolean {
    const modelRelations = this.relations.get(modelName);
    return modelRelations?.has(relationName) || false;
  }

  /**
   * Supprime une relation
   */
  public static removeRelation(modelName: string, relationName: string): boolean {
    const modelRelations = this.relations.get(modelName);
    if (modelRelations && modelRelations.has(relationName)) {
      modelRelations.delete(relationName);
      return true;
    }
    return false;
  }

  /**
   * Crée une relation many-to-one (belongsTo)
   */
  public static manyToOne(
    sourceModel: typeof EntidrBaseModel,
    targetModel: ModelStatic<Model> | string,
    relationName: string,
    options: Partial<RelationConfig> = {}
  ): void {
    this.defineRelation(sourceModel, relationName, {
      type: RelationType.BELONGS_TO,
      target: targetModel,
      as: relationName,
      ...options
    });
  }

  /**
   * Crée une relation one-to-many (hasMany)
   */
  public static oneToMany(
    sourceModel: typeof EntidrBaseModel,
    targetModel: ModelStatic<Model> | string,
    relationName: string,
    options: Partial<RelationConfig> = {}
  ): void {
    this.defineRelation(sourceModel, relationName, {
      type: RelationType.HAS_MANY,
      target: targetModel,
      as: relationName,
      ...options
    });
  }

  /**
   * Crée une relation one-to-one (hasOne)
   */
  public static oneToOne(
    sourceModel: typeof EntidrBaseModel,
    targetModel: ModelStatic<Model> | string,
    relationName: string,
    options: Partial<RelationConfig> = {}
  ): void {
    this.defineRelation(sourceModel, relationName, {
      type: RelationType.HAS_ONE,
      target: targetModel,
      as: relationName,
      ...options
    });
  }

  /**
   * Crée une relation many-to-many (belongsToMany)
   */
  public static manyToMany(
    sourceModel: typeof EntidrBaseModel,
    targetModel: ModelStatic<Model> | string,
    relationName: string,
    through: string | ModelStatic<Model>,
    options: Partial<RelationConfig> = {}
  ): void {
    this.defineRelation(sourceModel, relationName, {
      type: RelationType.BELONGS_TO_MANY,
      target: targetModel,
      as: relationName,
      through: through,
      ...options
    });
  }

  /**
   * Valide une configuration de relation
   */
  public static validateRelation(config: RelationConfig): string[] {
    const errors: string[] = [];

    if (!config.type) {
      errors.push('Relation type is required');
    }

    if (!config.target) {
      errors.push('Target model is required');
    }

    if (config.type === RelationType.BELONGS_TO_MANY && !config.through) {
      errors.push('Through model is required for many-to-many relations');
    }

    if (config.type === RelationType.BELONGS_TO_MANY && !config.otherKey) {
      errors.push('Other key is required for many-to-many relations');
    }

    return errors;
  }

  /**
   * Génère le nom de la table de jonction pour une relation many-to-many
   */
  public static generateJoinTableName(
    sourceModel: string,
    targetModel: string
  ): string {
    const names = [sourceModel, targetModel].sort();
    return `${names[0]}_${names[1]}`;
  }

  /**
   * Exporte toutes les relations au format pour la sérialisation
   */
  public static exportRelations(): Record<string, Record<string, EntidrRelation>> {
    const exported: Record<string, Record<string, EntidrRelation>> = {};

    for (const [modelName, relations] of this.relations) {
      exported[modelName] = {};

      for (const [relationName, config] of relations) {
        exported[modelName][relationName] = {
          type: config.type as any,
          target: typeof config.target === 'string' ? config.target : config.target.name,
          foreignKey: config.foreignKey,
          otherKey: config.otherKey,
          as: config.as,
          through: typeof config.through === 'string' ? config.through : undefined,
          onDelete: config.onDelete,
          onUpdate: config.onUpdate,
          constraints: config.constraints,
          scope: config.scope
        };
      }
    }

    return exported;
  }

  /**
   * Importe des relations depuis un format sérialisé
   */
  public static importRelations(
    relations: Record<string, Record<string, EntidrRelation>>,
    models: Record<string, typeof EntidrBaseModel>
  ): void {
    for (const [modelName, modelRelations] of Object.entries(relations)) {
      const sourceModel = models[modelName];
      if (!sourceModel) {
        console.warn(`Source model ${modelName} not found during import`);
        continue;
      }

      for (const [relationName, relationConfig] of Object.entries(modelRelations)) {
        const targetModel = models[relationConfig.target];
        if (!targetModel) {
          console.warn(`Target model ${relationConfig.target} not found for relation ${relationName}`);
          continue;
        }

        this.defineRelation(sourceModel, relationName, {
          type: relationConfig.type as RelationType,
          target: targetModel,
          foreignKey: relationConfig.foreignKey,
          otherKey: relationConfig.otherKey,
          as: relationConfig.as,
          through: relationConfig.through,
          onDelete: relationConfig.onDelete,
          onUpdate: relationConfig.onUpdate,
          constraints: relationConfig.constraints,
          scope: relationConfig.scope
        });
      }
    }
  }
}

export default EntidrRelationManager;
