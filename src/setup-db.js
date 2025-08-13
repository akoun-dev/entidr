'use strict';

const { sequelize } = require('./models');
const { exec } = require('child_process');
const path = require('path');
const logger = require('./server/logger');

/**
 * Script pour initialiser la base de données
 * Exécute les migrations et les seeds
 */
async function setupDatabase() {
  try {
    logger.info("Démarrage de l'initialisation de la base de données...");
    
    // Vérifier la connexion à la base de données
    try {
      await sequelize.authenticate();
      logger.info('Connexion à la base de données établie avec succès.');
    } catch (error) {
      logger.error("Impossible de se connecter à la base de données");
      process.exit(1);
    }
    
    // Exécuter les migrations
    logger.info('Exécution des migrations...');
    await new Promise((resolve, reject) => {
      exec('npx sequelize-cli db:migrate --migrations-path=src/migrations', (error, stdout, stderr) => {
        if (error) {
          logger.error("Erreur lors de l'exécution des migrations");
          return reject(error);
        }
        resolve();
      });
    });
    
    // Exécuter les seeds
    logger.info('Exécution des seeds...');
    await new Promise((resolve, reject) => {
      exec('npx sequelize-cli db:seed:all --seeders-path=src/seeders', (error, stdout, stderr) => {
        if (error) {
          logger.error("Erreur lors de l'exécution des seeds");
          return reject(error);
        }
        resolve();
      });
    });
    
    logger.info('Initialisation de la base de données terminée avec succès!');
    process.exit(0);
  } catch (error) {
    logger.error("Erreur lors de l'initialisation de la base de données");
    process.exit(1);
  }
}

// Exécuter la fonction d'initialisation
setupDatabase();
