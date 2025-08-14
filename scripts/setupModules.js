/**
 * Script pour configurer les modules dans la base de données
 * 
 * Ce script exécute les migrations et les seeders pour les modules
 * et met à jour le registre des modules
 * 
 * Usage: node scripts/setupModules.js
 */

require('dotenv').config();

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../src/config/config.js')[env];
const logger = require('../src/utils/logger');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Fonction pour afficher un message avec une couleur
function log(type, message) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  
  switch (type) {
    case 'info':
      logger.info(`${colors.fg.blue}[${timestamp}] [INFO]${colors.reset} ${message}`);
      break;
    case 'success':
      logger.info(`${colors.fg.green}[${timestamp}] [SUCCESS]${colors.reset} ${message}`);
      break;
    case 'warning':
      logger.warn(`${colors.fg.yellow}[${timestamp}] [WARNING]${colors.reset} ${message}`);
      break;
    case 'error':
      logger.error(`${colors.fg.red}[${timestamp}] [ERROR]${colors.reset} ${message}`);
      break;
    default:
      logger.info(`[${timestamp}] ${message}`);
  }
}

// Fonction pour exécuter une commande
function execute(command) {
  try {
    log('info', `Exécution de la commande: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    return output;
  } catch (error) {
    log('error', `Erreur lors de l'exécution de la commande: ${command}`);
    log('error', error.message);
    throw error;
  }
}

// Fonction principale
async function main() {
  try {
    log('info', 'Démarrage de la configuration des modules...');
    
    // Générer le registre des modules
    log('info', 'Génération du registre des modules...');
    execute('node scripts/generateModuleRegistry.js');
    log('success', 'Registre des modules généré avec succès.');
    
    // Exécuter les migrations
    log('info', 'Exécution des migrations...');
    execute('npx sequelize-cli db:migrate');
    log('success', 'Migrations exécutées avec succès.');
    
    // Exécuter les seeders
    log('info', 'Exécution des seeders...');
    execute('npx sequelize-cli db:seed:all');
    log('success', 'Seeders exécutés avec succès.');
    
    // Vérifier les modules dans la base de données
    log('info', 'Vérification des modules dans la base de données...');
    
    // Créer une connexion à la base de données
    const sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      storage: config.storage,
      logging: false
    });
    
    try {
      // Vérifier la connexion
      await sequelize.authenticate();
      log('success', 'Connexion à la base de données établie avec succès.');
      
      // Vérifier si la table Modules existe
      const [results] = await sequelize.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='Modules'
      `);
      
      if (results.length === 0) {
        log('warning', 'La table Modules n\'existe pas encore. Exécutez les migrations pour la créer.');
      } else {
        // Récupérer les modules
        const [modules] = await sequelize.query('SELECT * FROM Modules');
        log('info', `${modules.length} modules trouvés dans la base de données.`);
        
        // Afficher les modules
        modules.forEach(module => {
          log('info', `- ${module.name} (${module.displayName}): ${module.active ? 'actif' : 'inactif'}`);
        });
      }
      
      // Fermer la connexion
      await sequelize.close();
    } catch (error) {
      log('error', 'Impossible de se connecter à la base de données:');
      log('error', error.message);
    }
    
    log('success', 'Configuration des modules terminée avec succès.');
  } catch (error) {
    log('error', 'Erreur lors de la configuration des modules:');
    log('error', error.message);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();
