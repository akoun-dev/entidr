import { Sequelize, DataTypes, ModelStatic, Model } from 'sequelize';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

export interface ModelDefinition {
  name: string;
  path: string;
  associations?: any;
  tableName?: string;
}

export interface ModuleModelRegistry {
  [moduleName: string]: ModelDefinition[];
}

class ModelRegistryService {
  private sequelize: Sequelize;
  private registeredModels: Map<string, ModelStatic<Model>> = new Map();
  private moduleModels: ModuleModelRegistry = {};

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  /**
   * Enregistre les modèles d'un module spécifique
   * @param moduleName Nom du module
   * @param modelPaths Chemins vers les fichiers de modèle
   */
  async registerModuleModels(moduleName: string, modelPaths: string[]): Promise<void> {
    try {
      const modelDefinitions: ModelDefinition[] = [];

      for (const modelPath of modelPaths) {
        if (!fs.existsSync(modelPath)) {
          logger.warn(`Model file not found: ${modelPath}`);
          continue;
        }

        const modelModule = await import(modelPath);
        const modelFactory = modelModule.default;
        
        if (typeof modelFactory !== 'function') {
          logger.warn(`Invalid model factory in ${modelPath}`);
          continue;
        }

        const model = modelFactory(this.sequelize, DataTypes);
        const modelName = model.name;

        // Enregistrer le modèle
        this.registeredModels.set(`${moduleName}.${modelName}`, model);
        modelDefinitions.push({
          name: modelName,
          path: modelPath,
          associations: model.associations
        });

        logger.info(`Model registered: ${moduleName}.${modelName}`);
      }

      this.moduleModels[moduleName] = modelDefinitions;
      
      // Exécuter les associations après tous les modèles enregistrés
      await this.executeAssociations(moduleName);
      
    } catch (error) {
      logger.error(`Error registering models for module ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Exécute les associations pour un module spécifique
   * @param moduleName Nom du module
   */
  private async executeAssociations(moduleName: string): Promise<void> {
    const modelDefinitions = this.moduleModels[moduleName];
    
    for (const modelDef of modelDefinitions) {
      const model = this.registeredModels.get(`${moduleName}.${modelDef.name}`);
      if (model && typeof model.associate === 'function') {
        // Créer un objet models avec tous les modèles enregistrés
        const models: any = {};
        for (const [key, value] of this.registeredModels) {
          const [_, modelName] = key.split('.');
          models[modelName] = value;
        }
        
        model.associate(models);
        logger.debug(`Associations executed for: ${moduleName}.${modelDef.name}`);
      }
    }
  }

  /**
   * Désenregistre tous les modèles d'un module
   * @param moduleName Nom du module
   */
  async unregisterModuleModels(moduleName: string): Promise<void> {
    const modelDefinitions = this.moduleModels[moduleName];
    
    for (const modelDef of modelDefinitions) {
      const key = `${moduleName}.${modelDef.name}`;
      this.registeredModels.delete(key);
      logger.info(`Model unregistered: ${key}`);
    }
    
    delete this.moduleModels[moduleName];
  }

  /**
   * Récupère tous les modèles enregistrés
   */
  getRegisteredModels(): Map<string, Model> {
    return new Map(this.registeredModels);
  }

  /**
   * Récupère les modèles d'un module spécifique
   * @param moduleName Nom du module
   */
  getModuleModels(moduleName: string): ModelDefinition[] {
    return this.moduleModels[moduleName] || [];
  }

  /**
   * Découvre automatiquement les modèles dans un module
   * @param modulePath Chemin vers le module
   */
  discoverModuleModels(modulePath: string): string[] {
    const modelsDir = path.join(modulePath, 'models');
    const modelFiles: string[] = [];

    if (!fs.existsSync(modelsDir)) {
      logger.warn(`Models directory not found: ${modelsDir}`);
      return modelFiles;
    }

    const files = fs.readdirSync(modelsDir);
    
    for (const file of files) {
      if (file.endsWith('.js') && !file.includes('.test.js')) {
        const modelPath = path.join(modelsDir, file);
        modelFiles.push(modelPath);
      }
    }

    return modelFiles;
  }

  /**
   * Exécute les migrations pour un module
   * @param moduleName Nom du module
   * @param migrationsPath Chemin vers les migrations
   */
  async runModuleMigrations(moduleName: string, migrationsPath: string): Promise<void> {
    try {
      if (!fs.existsSync(migrationsPath)) {
        logger.info(`No migrations directory found for module ${moduleName}`);
        return;
      }

      const migrationFiles = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith('.js'))
        .sort();

      for (const migrationFile of migrationFiles) {
        const migrationPath = path.join(migrationsPath, migrationFile);
        const migration = await import(migrationPath);
        
        if (typeof migration.up === 'function') {
          await migration.up(this.sequelize);
          logger.info(`Migration executed: ${migrationFile}`);
        }
      }
    } catch (error) {
      logger.error(`Error running migrations for module ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Crée une migration pour un modèle spécifique
   * @param moduleName Nom du module
   * @param modelName Nom du modèle
   * @param schema Schéma du modèle
   */
  async createModelMigration(moduleName: string, modelName: string, schema: any): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const migrationName = `create-${modelName}-table-${timestamp}`;
    const migrationsPath = path.join(process.cwd(), 'src', 'migrations', moduleName);
    
    // Créer le répertoire des migrations si nécessaire
    if (!fs.existsSync(migrationsPath)) {
      fs.mkdirSync(migrationsPath, { recursive: true });
    }

    const migrationContent = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('${modelName}', ${JSON.stringify(schema, null, 2)});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('${modelName}');
  }
};`;

    const migrationPath = path.join(migrationsPath, `${migrationName}.js`);
    fs.writeFileSync(migrationPath, migrationContent);
    
    logger.info(`Migration created: ${migrationPath}`);
    return migrationPath;
  }

  /**
   * Réfléchit les métadonnées d'un modèle
   * @param modelName Nom du modèle
   */
  reflectModel(modelName: string): any {
    const model = this.registeredModels.get(modelName);
    if (!model) {
      throw new Error(`Model not found: ${modelName}`);
    }

    return {
      name: model.name,
      tableName: model.tableName,
      attributes: Object.keys(model.rawAttributes).reduce((acc, key) => {
        const attribute = model.rawAttributes[key];
        acc[key] = {
          type: attribute.type.constructor.name,
          allowNull: attribute.allowNull,
          defaultValue: attribute.defaultValue,
          unique: attribute.unique,
          primaryKey: attribute.primaryKey,
          autoIncrement: attribute.autoIncrement,
          references: attribute.references,
          onUpdate: attribute.onUpdate,
          onDelete: attribute.onDelete
        };
        return acc;
      }, {}),
      associations: Object.keys(model.associations || {}).reduce((acc, key) => {
        const association = model.associations[key];
        acc[key] = {
          type: association.associationType,
          target: association.target.name,
          foreignKey: association.foreignKey,
          through: association.through ? association.through.name : null
        };
        return acc;
      }, {})
    };
  }
}

export default ModelRegistryService;