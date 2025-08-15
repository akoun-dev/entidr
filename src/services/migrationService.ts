import path from 'path';
import fs from 'fs';
import { Sequelize } from 'sequelize';
import logger from '../utils/logger';

export interface Migration {
  name: string;
  up: (queryInterface: any, Sequelize: any) => Promise<void>;
  down: (queryInterface: any, Sequelize: any) => Promise<void>;
}

export interface MigrationOptions {
  migrationsDir: string;
  tableName?: string;
  schema?: any;
}

class MigrationService {
  private sequelize: Sequelize;
  private migrationsDir: string;
  private executedMigrations: Set<string> = new Set();

  constructor(sequelize: Sequelize, migrationsDir: string = 'src/migrations') {
    this.sequelize = sequelize;
    this.migrationsDir = migrationsDir;
  }

  /**
   * Exécute toutes les migrations non exécutées
   */
  async runPendingMigrations(): Promise<void> {
    try {
      await this.ensureMigrationsTable();
      
      const pendingMigrations = await this.getPendingMigrations();
      
      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations');
        return;
      }

      logger.info(`Running ${pendingMigrations.length} pending migrations...`);
      
      for (const migration of pendingMigrations) {
        const migrationPath = await this.getMigrationPath(migration.name);
        await this.executeMigration(migrationPath);
      }
      
      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Error running migrations:', error);
      throw error;
    }
  }

  /**
   * Exécute une migration spécifique
   */
  async executeMigration(migrationPath: string): Promise<void> {
    try {
      const migration = await this.loadMigration(migrationPath);
      const queryInterface = this.sequelize.getQueryInterface();
      
      logger.info(`Running migration: ${migration.name}`);
      await migration.up(queryInterface, this.sequelize.Sequelize);
      
      await this.markMigrationAsExecuted(migration.name);
      logger.info(`Migration completed: ${migration.name}`);
    } catch (error) {
      logger.error(`Error executing migration ${migrationPath}:`, error);
      throw error;
    }
  }

  /**
   * Annule une migration spécifique
   */
  async rollbackMigration(migrationName: string): Promise<void> {
    try {
      const migrationPath = await this.getMigrationPath(migrationName);
      const migration = await this.loadMigration(migrationPath);
      const queryInterface = this.sequelize.getQueryInterface();
      
      logger.info(`Rolling back migration: ${migration.name}`);
      await migration.down(queryInterface, this.sequelize.Sequelize);
      
      await this.markMigrationAsPending(migration.name);
      logger.info(`Migration rolled back: ${migration.name}`);
    } catch (error) {
      logger.error(`Error rolling back migration ${migrationName}:`, error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle migration
   */
  async createMigration(name: string, options: MigrationOptions): Promise<string> {
    if (!options.migrationsDir) {
      options.migrationsDir = this.migrationsDir;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const migrationName = `${timestamp}-${name}`;
    const migrationPath = path.join(this.migrationsDir, `${migrationName}.js`);
    
    // Créer le répertoire des migrations si nécessaire
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
    }

    const migrationContent = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    ${options.schema ? `// Migration pour ${name}
    await queryInterface.createTable('${options.tableName || name}', ${JSON.stringify(options.schema, null, 2)});` : `
    // Migration pour ${name}
    // Ajoutez vos changements de schéma ici
    // Exemple: await queryInterface.addColumn('table_name', 'new_column', { type: Sequelize.STRING });`}
  },
  down: async (queryInterface, Sequelize) => {
    ${options.schema ? `await queryInterface.dropTable('${options.tableName || name}');` : `
    // Annulez les changements de schéma ici
    // Exemple: await queryInterface.removeColumn('table_name', 'new_column');`}
  }
};`;

    fs.writeFileSync(migrationPath, migrationContent);
    
    logger.info(`Migration created: ${migrationPath}`);
    return migrationPath;
  }

  /**
   * Crée une migration pour un module spécifique
   */
  async createModuleMigration(moduleName: string, modelName: string, schema: any): Promise<string> {
    const moduleMigrationsDir = path.join(this.migrationsDir, moduleName);
    
    // Créer le répertoire des migrations du module si nécessaire
    if (!fs.existsSync(moduleMigrationsDir)) {
      fs.mkdirSync(moduleMigrationsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const migrationName = `create-${modelName}-table-${timestamp}`;
    const migrationPath = path.join(moduleMigrationsDir, `${migrationName}.js`);

    const migrationContent = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('${modelName}', ${JSON.stringify(schema, null, 2)});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('${modelName}');
  }
};`;

    fs.writeFileSync(migrationPath, migrationContent);
    
    logger.info(`Module migration created: ${migrationPath}`);
    return migrationPath;
  }

  /**
   * Récupère toutes les migrations disponibles
   */
  async getAllMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = [];
    
    if (!fs.existsSync(this.migrationsDir)) {
      return migrations;
    }

    const migrationFiles = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    for (const file of migrationFiles) {
      const migrationPath = path.join(this.migrationsDir, file);
      const migration = await this.loadMigration(migrationPath);
      migrations.push(migration);
    }

    return migrations;
  }

  /**
   * Récupère les migrations en attente d'exécution
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const allMigrations = await this.getAllMigrations();
    const executedMigrations = await this.getExecutedMigrations();
    
    return allMigrations.filter(migration => !executedMigrations.has(migration.name));
  }

  /**
   * Vérifie si une migration a été exécutée
   */
  async isMigrationExecuted(migrationName: string): Promise<boolean> {
    const executedMigrations = await this.getExecutedMigrations();
    return executedMigrations.has(migrationName);
  }

  /**
   * Marque une migration comme exécutée
   */
  private async markMigrationAsExecuted(migrationName: string): Promise<void> {
    const query = `
      INSERT INTO ${this.getMigrationsTableName()} (name, executed_at)
      VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET executed_at = ?
    `;
    
    await this.sequelize.query(query, {
      replacements: [migrationName, new Date(), new Date()]
    });
    
    this.executedMigrations.add(migrationName);
  }

  /**
   * Marque une migration comme non exécutée (pour rollback)
   */
  private async markMigrationAsPending(migrationName: string): Promise<void> {
    const query = `
      DELETE FROM ${this.getMigrationsTableName()}
      WHERE name = ?
    `;
    
    await this.sequelize.query(query, {
      replacements: [migrationName]
    });
    
    this.executedMigrations.delete(migrationName);
  }

  /**
   * Récupère les migrations déjà exécutées
   */
  private async getExecutedMigrations(): Promise<Set<string>> {
    if (this.executedMigrations.size === 0) {
      await this.ensureMigrationsTable();
      
      const [results] = await this.sequelize.query(`
        SELECT name FROM ${this.getMigrationsTableName()}
        ORDER BY executed_at DESC
      `);
      
      this.executedMigrations = new Set(results.map((row: any) => row.name));
    }
    
    return this.executedMigrations;
  }

  /**
   * S'assure que la table des migrations existe
   */
  private async ensureMigrationsTable(): Promise<void> {
    const tableName = this.getMigrationsTableName();
    
    try {
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          name VARCHAR(255) PRIMARY KEY,
          executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      logger.error(`Error creating migrations table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Charge une migration depuis un fichier
   */
  private async loadMigration(migrationPath: string): Promise<Migration> {
    try {
      const migrationModule = await import(migrationPath);
      return migrationModule.default;
    } catch (error) {
      logger.error(`Error loading migration ${migrationPath}:`, error);
      throw error;
    }
  }

  /**
   * Récupère le chemin d'une migration par son nom
   */
  private async getMigrationPath(migrationName: string): Promise<string> {
    const migrationFiles = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.js'));
    
    for (const file of migrationFiles) {
      if (file.includes(migrationName)) {
        return path.join(this.migrationsDir, file);
      }
    }
    
    throw new Error(`Migration not found: ${migrationName}`);
  }

  /**
   * Récupère le nom de la table des migrations
   */
  private getMigrationsTableName(): string {
    return 'sequelize_migrations';
  }
}

export default MigrationService;