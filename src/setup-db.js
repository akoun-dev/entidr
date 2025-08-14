'use strict';

const { sequelize } = require('./models');
const { exec } = require('child_process');
const path = require('path');

/**
 * Script pour initialiser la base de données
 * Exécute les migrations et les seeds
 */
async function setupDatabase() {
  try {
    // Vérifier la connexion à la base de données
    try {
      await sequelize.authenticate();
    } catch (error) {
      console.error('Impossible de se connecter à la base de données:', error);
      process.exit(1);
    }

    // Exécuter les migrations
    await new Promise((resolve, reject) => {
      exec('npx sequelize-cli db:migrate --migrations-path=src/migrations', (error, stdout, stderr) => {
        if (error) {
          console.error(`Erreur lors de l'exécution des migrations: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        resolve();
      });
    });

    // Exécuter les seeds
    await new Promise((resolve, reject) => {
      exec('npx sequelize-cli db:seed:all --seeders-path=src/seeders', (error, stdout, stderr) => {
        if (error) {
          console.error(`Erreur lors de l'exécution des seeds: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        resolve();
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter la fonction d'initialisation
setupDatabase();
