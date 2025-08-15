'use strict';
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

class MigrationRunner {
  constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: false,
    });
    this.migrationsTable = 'SequelizeMeta';
  }

  async init() {
    await this.ensureMigrationsTable();
  }

  async ensureMigrationsTable() {
    const query = `CREATE TABLE IF NOT EXISTS "${this.migrationsTable}" (
      "name" VARCHAR(255) NOT NULL,
      PRIMARY KEY ("name")
    )`;
    await this.sequelize.query(query);
  }

  async getAppliedMigrations() {
    const [results] = await this.sequelize.query(
      `SELECT name FROM "${this.migrationsTable}" ORDER BY name ASC`,
    );
    return results.map(row => row.name);
  }

  async runPendingMigrations() {
    const applied = await this.getAppliedMigrations();
    const migrationFiles = fs.readdirSync(path.join(__dirname, '../src/migrations'))
      .filter(file => file.endsWith('.js'))
      .sort();

    const pending = migrationFiles.filter(file => !applied.includes(file));

    for (const file of pending) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(__dirname, `../src/migrations/${file}`));
      await migration.up(this.sequelize.getQueryInterface(), Sequelize);
      await this.sequelize.query(
        `INSERT INTO "${this.migrationsTable}" (name) VALUES ('${file}')`,
      );
    }

    console.log(`${pending.length} migrations executed successfully`);
  }
}

(async () => {
  try {
    const runner = new MigrationRunner();
    await runner.init();
    await runner.runPendingMigrations();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();
