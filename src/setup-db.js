'use strict';

require('dotenv').config();

const { sequelize } = require('./models');
const { exec } = require('child_process');
const path = require('path');
const logger = require('./utils/logger');

/**
 * Script pour initialiser la base de données
 * Exécute les migrations et les seeds
 */
async function setupDatabase() {
  try {
    logger.info('Démarrage de l\'initialisation de la base de données...');

    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    logger.info('Connexion à la base de données établie avec succès.');

    // Exécuter les migrations
    logger.info('Exécution des migrations...');
    await new Promise((resolve, reject) => {
      exec('npx sequelize-cli db:migrate --migrations-path=src/migrations', (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) logger.warn(stderr);
        logger.debug(stdout);
        resolve();
      });
    });

    // Exécuter les seeds
    logger.info('Exécution des seeds...');
    await new Promise((resolve, reject) => {
      exec('npx sequelize-cli db:seed:all --seeders-path=src/seeders', (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) logger.warn(stderr);
        logger.debug(stdout);
        resolve();
      });
    });

    logger.info('Initialisation de la base de données terminée avec succès!');
    process.exit(0);
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter la fonction d'initialisation
setupDatabase();
