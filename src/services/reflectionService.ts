import { ModelStatic, Model } from 'sequelize';
import ModelRegistryService from './modelRegistryService';
import logger from '../utils/logger';

export interface ModelMetadata {
  name: string;
  tableName: string;
  attributes: {
    [key: string]: AttributeMetadata;
  };
  associations: {
    [key: string]: AssociationMetadata;
  };
  indexes?: IndexMetadata[];
  timestamps: boolean;
  paranoid: boolean;
}

export interface AttributeMetadata {
  type: string;
  allowNull: boolean;
  defaultValue: any;
  unique: boolean;
  primaryKey: boolean;
  autoIncrement: boolean;
  references?: {
    model: string;
    key: string;
  };
  onUpdate?: string;
  onDelete?: string;
  validate?: {
    [key: string]: any;
  };
  comment?: string;
}

export interface AssociationMetadata {
  type: 'BelongsTo' | 'HasOne' | 'HasMany' | 'BelongsToMany';
  target: string;
  foreignKey: string;
  foreignKeyConstraint?: string;
  foreignKeySource?: string;
  through?: string;
  otherKey?: string;
  scope?: any;
  as?: string;
  constraints?: boolean;
}

export interface IndexMetadata {
  name?: string;
  fields: string[];
  unique: boolean;
  using?: string;
  where?: any;
  concurrently?: boolean;
}

class ReflectionService {
  private modelRegistry: ModelRegistryService;

  constructor(modelRegistry: ModelRegistryService) {
    this.modelRegistry = modelRegistry;
  }

  /**
   * Réfléchit les métadonnées complètes d'un modèle
   */
  reflectModel(modelName: string): ModelMetadata {
    const model = this.modelRegistry.getRegisteredModels().get(modelName);
    if (!model) {
      throw new Error(`Model not found: ${modelName}`);
    }

    // Conversion explicite via unknown
    const modelStatic = model as unknown as ModelStatic<Model>;
    const modelOptions = modelStatic.options;
    
    return {
      name: modelStatic.name,
      tableName: modelStatic.tableName,
      attributes: this.reflectAttributes(modelStatic),
      associations: this.reflectAssociations(modelStatic),
      indexes: this.reflectIndexes(modelStatic),
      timestamps: modelOptions.timestamps || false,
      paranoid: modelOptions.paranoid || false
    };
  }

  /**
   * Réfléchit les attributs d'un modèle
   */
  private reflectAttributes(model: ModelStatic<Model>): { [key: string]: AttributeMetadata } {
    const attributes: { [key: string]: AttributeMetadata } = {};
    const rawAttributes = model.getAttributes();

    Object.entries(rawAttributes).forEach(([key, attribute]) => {
      const ref = attribute.references;
      const references = typeof ref === 'object' ? ref : undefined;
      
      attributes[key] = {
        type: this.getAttributeType(attribute.type),
        allowNull: attribute.allowNull,
        defaultValue: attribute.defaultValue,
        unique: !!attribute.unique,
        primaryKey: attribute.primaryKey,
        autoIncrement: attribute.autoIncrement,
        references: references ? {
          model: references.model.toString(),
          key: references.key
        } : undefined,
        onUpdate: attribute.onUpdate,
        onDelete: attribute.onDelete,
        validate: attribute.validate ? { ...attribute.validate } : undefined,
        comment: attribute.comment
      };
    });

    return attributes;
  }

  /**
   * Réfléchit les associations d'un modèle
   */
  private reflectAssociations(model: ModelStatic<Model>): { [key: string]: AssociationMetadata } {
    const associations: { [key: string]: AssociationMetadata } = {};
    const modelAssociations = model.associations || {};

    Object.entries(modelAssociations).forEach(([key, association]) => {
      const assocType = association.associationType;
      const validTypes = ['BelongsTo', 'HasOne', 'HasMany', 'BelongsToMany'];
      
      associations[key] = {
        type: validTypes.includes(assocType) ? assocType as 'BelongsTo' | 'HasOne' | 'HasMany' | 'BelongsToMany' : 'BelongsTo',
        target: association.target.name,
        foreignKey: association.foreignKey,
        through: (association as any).through?.name,
        otherKey: (association as any).otherKey,
        scope: (association as any).scope,
        as: (association as any).as
      };
    });

    return associations;
  }

  /**
   * Réfléchit les indexes d'un modèle
   */
  private reflectIndexes(model: ModelStatic<Model>): IndexMetadata[] {
    const indexes: IndexMetadata[] = [];
    const modelIndexes = model.options.indexes || [];

    modelIndexes.forEach((index: any) => {
      const fields = Array.isArray(index.fields)
        ? index.fields.map((f: any) => typeof f === 'string' ? f : f.name)
        : [typeof index.fields === 'string' ? index.fields : index.fields?.name];
      
      indexes.push({
        name: index.name || '',
        fields: fields.filter(Boolean) as string[],
        unique: !!index.unique,
        using: index.using,
        where: index.where,
        concurrently: index.concurrently
      });
    });

    return indexes;
  }

  /**
   * Convertit le type Sequelize en chaîne lisible
   */
  private getAttributeType(type: any): string {
    if (typeof type === 'string') {
      return type;
    }

    if (type.constructor && type.constructor.name) {
      return type.constructor.name;
    }

    return 'Unknown';
  }

  /**
   * Réfléchit tous les modèles enregistrés
   */
  reflectAllModels(): { [modelName: string]: ModelMetadata } {
    const models: { [modelName: string]: ModelMetadata } = {};
    const registeredModels = this.modelRegistry.getRegisteredModels();

    for (const [modelName, model] of registeredModels) {
      try {
        models[modelName] = this.reflectModel(modelName);
      } catch (error) {
        logger.error(`Error reflecting model ${modelName}:`, error);
      }
    }

    return models;
  }

  /**
   * Réfléchit les modèles d'un module spécifique
   */
  reflectModuleModels(moduleName: string): { [modelName: string]: ModelMetadata } {
    const models: { [modelName: string]: ModelMetadata } = {};
    const moduleModels = this.modelRegistry.getModuleModels(moduleName);

    for (const modelDef of moduleModels) {
      try {
        const fullModelName = `${moduleName}.${modelDef.name}`;
        models[modelDef.name] = this.reflectModel(fullModelName);
      } catch (error) {
        logger.error(`Error reflecting model ${modelDef.name} in module ${moduleName}:`, error);
      }
    }

    return models;
  }

  /**
   * Génère un schéma GraphQL à partir des métadonnées des modèles
   */
  generateGraphQLSchema(): string {
    const models = this.reflectAllModels();
    let schema = '';

    Object.entries(models).forEach(([modelName, model]) => {
      schema += `type ${modelName} {\n`;
      
      Object.entries(model.attributes).forEach(([attrName, attr]) => {
        const graphqlType = this.mapToGraphQLType(attr.type);
        const required = !attr.allowNull ? '!' : '';
        schema += `  ${attrName}: ${graphqlType}${required}\n`;
      });

      // Ajouter les relations
      Object.entries(model.associations).forEach(([assocName, assoc]) => {
        const graphqlType = this.mapAssociationToGraphQLType(assoc);
        const required = assoc.type === 'BelongsTo' ? '!' : '';
        schema += `  ${assocName}: ${graphqlType}${required}\n`;
      });

      schema += `}\n\n`;
    });

    // Ajouter les types d'entrée pour les mutations
    Object.entries(models).forEach(([modelName, model]) => {
      schema += `input Create${modelName}Input {\n`;
      Object.entries(model.attributes).forEach(([attrName, attr]) => {
        if (!attr.autoIncrement && !attr.primaryKey) {
          const graphqlType = this.mapToGraphQLType(attr.type);
          const required = !attr.allowNull && !attr.defaultValue ? '!' : '';
          schema += `  ${attrName}: ${graphqlType}${required}\n`;
        }
      });
      schema += `}\n\n`;

      schema += `input Update${modelName}Input {\n`;
      Object.entries(model.attributes).forEach(([attrName, attr]) => {
        if (!attr.autoIncrement && !attr.primaryKey) {
          const graphqlType = this.mapToGraphQLType(attr.type);
          schema += `  ${attrName}: ${graphqlType}\n`;
        }
      });
      schema += `}\n\n`;
    });

    return schema;
  }

  /**
   * Génère un schéma JSON Schema à partir des métadonnées des modèles
   */
  generateJSONSchema(): any {
    const models = this.reflectAllModels();
    const schema: any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'ENTIDR API Schema',
      description: 'Schema for ENTIDR application models',
      type: 'object',
      properties: {}
    };

    Object.entries(models).forEach(([modelName, model]) => {
      schema.properties[modelName] = {
        type: 'object',
        properties: {},
        required: []
      };

      Object.entries(model.attributes).forEach(([attrName, attr]) => {
        const attrSchema = this.mapToJSONSchema(attr);
        schema.properties[modelName].properties[attrName] = attrSchema;
        
        if (!attr.allowNull && !attr.defaultValue) {
          schema.properties[modelName].required.push(attrName);
        }
      });
    });

    return schema;
  }

  /**
   * Mappe un type Sequelize vers un type GraphQL
   */
  private mapToGraphQLType(sequelizeType: string): string {
    const typeMap: { [key: string]: string } = {
      'STRING': 'String',
      'TEXT': 'String',
      'INTEGER': 'Int',
      'BIGINT': 'Int',
      'FLOAT': 'Float',
      'DOUBLE': 'Float',
      'DECIMAL': 'Float',
      'BOOLEAN': 'Boolean',
      'DATE': 'String',
      'DATEONLY': 'String',
      'TIME': 'String',
      'JSON': 'JSON',
      'JSONB': 'JSON',
      'VIRTUAL': 'String',
      'ENUM': 'String',
      'BLOB': 'String',
      'UUID': 'ID',
      'UUIDV1': 'ID',
      'UUIDV4': 'ID'
    };

    return typeMap[sequelizeType] || 'String';
  }

  /**
   * Mappe une association vers un type GraphQL
   */
  private mapAssociationToGraphQLType(assoc: AssociationMetadata): string {
    switch (assoc.type) {
      case 'BelongsTo':
        return assoc.target;
      case 'HasOne':
        return assoc.target;
      case 'HasMany':
        return `[${assoc.target}]`;
      case 'BelongsToMany':
        return `[${assoc.target}]`;
      default:
        return 'String';
    }
  }

  /**
   * Mappe un attribut vers un schéma JSON
   */
  private mapToJSONSchema(attr: AttributeMetadata): any {
    const typeMap: { [key: string]: string } = {
      'STRING': 'string',
      'TEXT': 'string',
      'INTEGER': 'integer',
      'BIGINT': 'integer',
      'FLOAT': 'number',
      'DOUBLE': 'number',
      'DECIMAL': 'number',
      'BOOLEAN': 'boolean',
      'DATE': 'string',
      'DATEONLY': 'string',
      'TIME': 'string',
      'JSON': 'object',
      'JSONB': 'object',
      'VIRTUAL': 'string',
      'ENUM': 'string',
      'BLOB': 'string',
      'UUID': 'string',
      'UUIDV1': 'string',
      'UUIDV4': 'string'
    };

    const schema: any = {
      type: typeMap[attr.type] || 'string'
    };

    if (attr.allowNull === false) {
      schema.nullable = false;
    }

    if (attr.defaultValue !== undefined) {
      schema.default = attr.defaultValue;
    }

    if (attr.unique) {
      schema.unique = true;
    }

    if (attr.primaryKey) {
      schema.primaryKey = true;
    }

    if (attr.autoIncrement) {
      schema.autoIncrement = true;
    }

    if (attr.references) {
      schema.$ref = `#/definitions/${attr.references.model}`;
    }

    return schema;
  }
}

export default ReflectionService;