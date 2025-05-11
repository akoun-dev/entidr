/**
 * Script de démarrage de l'application avec migrations
 * Ce script initialise la base de données, lance le serveur API et l'application frontend
 */

const { spawn, exec } = require('child_process');
const readline = require('readline');
const path = require('path');
const os = require('os');

// Couleurs pour les messages
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Fonction pour afficher les messages avec un préfixe
function log(type, message) {
  let color = colors.green;
  let prefix = '[INFO]';

  switch (type) {
    case 'info':
      color = colors.blue;
      prefix = '[INFO]';
      break;
    case 'success':
      color = colors.green;
      prefix = '[SUCCÈS]';
      break;
    case 'warning':
      color = colors.yellow;
      prefix = '[ATTENTION]';
      break;
    case 'error':
      color = colors.red;
      prefix = '[ERREUR]';
      break;
  }

  console.log(`${color}${prefix} ${message}${colors.reset}`);
}

// Fonction pour exécuter une commande et retourner une promesse
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// Fonction pour vérifier si un port est utilisé
async function isPortInUse(port) {
  try {
    const command = os.platform() === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} -t`;

    const { stdout } = await execCommand(command);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// Fonction pour tuer un processus sur un port
async function killProcessOnPort(port) {
  try {
    if (os.platform() === 'win32') {
      const { stdout } = await execCommand(`netstat -ano | findstr :${port}`);
      const pid = stdout.trim().split(/\s+/).pop();
      if (pid) {
        await execCommand(`taskkill /F /PID ${pid}`);
      }
    } else {
      await execCommand(`kill $(lsof -t -i:${port}) 2>/dev/null || true`);
    }
    log('warning', `Processus sur le port ${port} arrêté.`);
  } catch (error) {
    log('warning', `Impossible d'arrêter le processus sur le port ${port}: ${error.message}`);
  }
}

// Fonction pour démarrer un processus
function startProcess(command, args, name) {
  const process = spawn(command, args, {
    stdio: 'pipe',
    shell: true
  });

  process.stdout.on('data', (data) => {
    console.log(`${colors.blue}[${name}]${colors.reset} ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`${colors.red}[${name} ERROR]${colors.reset} ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log('error', `Le processus ${name} s'est arrêté avec le code ${code}`);
    } else {
      log('info', `Le processus ${name} s'est arrêté`);
    }
  });

  return process;
}

// Fonction principale
async function main() {
  try {
    log('info', 'Démarrage de l\'application avec migrations...');

    // Vérifier si les ports sont déjà utilisés
    const port8080InUse = await isPortInUse(8080);
    const port3001InUse = await isPortInUse(3001);

    if (port8080InUse) {
      log('warning', 'Le port 8080 est déjà utilisé. Tentative d\'arrêt du processus...');
      await killProcessOnPort(8080);
      // Attendre un peu pour s'assurer que le port est libéré
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (port3001InUse) {
      log('warning', 'Le port 3001 est déjà utilisé. Tentative d\'arrêt du processus...');
      await killProcessOnPort(3001);
      // Attendre un peu pour s'assurer que le port est libéré
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Initialiser la base de données
    log('info', 'Initialisation de la base de données...');

    // Exécuter les migrations
    log('info', 'Exécution des migrations...');
    try {
      const { stdout, stderr } = await execCommand('npx sequelize-cli db:migrate --migrations-path=src/migrations');
      if (stderr && !stderr.includes('Executing')) {
        console.error(stderr);
      }
      log('success', 'Migrations exécutées avec succès.');
    } catch (error) {
      log('error', `Échec des migrations: ${error.message}`);
      return;
    }

    // Exécuter les seeds (ignorer les erreurs)
    log('info', 'Exécution des seeds (les erreurs seront ignorées)...');
    try {
      const { stdout, stderr } = await execCommand('npx sequelize-cli db:seed:all --seeders-path=src/seeders');
      if (stderr && !stderr.includes('Executing')) {
        console.error(stderr);
      }
    } catch (error) {
      log('warning', `Des erreurs se sont produites lors du seeding: ${error.message}`);
      log('warning', 'Ces erreurs sont ignorées pour permettre le démarrage de l\'application.');
    }

    log('success', 'Initialisation de la base de données terminée.');

    // Démarrer le serveur API
    log('info', 'Démarrage du serveur API...');
    const serverProcess = startProcess('npm', ['run', 'server'], 'SERVER');

    // Attendre que le serveur soit prêt
    log('info', 'Attente du démarrage du serveur API...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Vérifier si le serveur est en cours d'exécution
    if (!await isPortInUse(3001)) {
      log('error', 'Le serveur API n\'a pas pu démarrer. Veuillez vérifier les erreurs ci-dessus.');
      return;
    }

    log('success', 'Serveur API démarré avec succès.');

    // Démarrer l'application frontend
    log('info', 'Démarrage de l\'application frontend...');
    const frontendProcess = startProcess('npm', ['run', 'dev'], 'FRONTEND');

    // Attendre que l'application frontend soit prête
    log('info', 'Attente du démarrage de l\'application frontend...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Vérifier si l'application frontend est en cours d'exécution
    if (!await isPortInUse(8080)) {
      log('error', 'L\'application frontend n\'a pas pu démarrer. Veuillez vérifier les erreurs ci-dessus.');
      serverProcess.kill();
      return;
    }

    log('success', 'Application frontend démarrée avec succès.');

    // Afficher les informations d'accès
    log('info', 'L\'application est maintenant accessible aux adresses suivantes:');
    log('info', '- Frontend: http://localhost:8080');
    log('info', '- API: http://localhost:3001');

    log('warning', 'Appuyez sur Ctrl+C pour arrêter l\'application.');

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      log('info', 'Arrêt de l\'application...');
      frontendProcess.kill();
      serverProcess.kill();
      log('success', 'Application arrêtée avec succès.');
      process.exit(0);
    });

  } catch (error) {
    log('error', `Une erreur est survenue: ${error.message}`);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();
