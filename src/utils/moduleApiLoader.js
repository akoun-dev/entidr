'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Charge dynamiquement les APIs des modules depuis le système de fichiers
 * @param {express.Router} router - Le routeur Express principal auquel ajouter les routes des modules
 */
function mountModuleApis(router) {
  try {
    const addonsDir = path.join(process.cwd(), 'addons');

    // Vérifier si le répertoire des addons existe
    if (!fs.existsSync(addonsDir)) {
      logger.warn('Le répertoire des addons n\'existe pas:', addonsDir);
      return;
    }

    // Lister tous les modules (addons) disponibles
    const modules = fs.readdirSync(addonsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    logger.info(`Modules trouvés: ${modules.join(', ')}`);

    // Pour chaque module, essayer de charger son API
    modules.forEach(moduleName => {
      try {
        const moduleApiPath = path.join(addonsDir, moduleName, 'server', 'api.js');

        // Vérifier si le fichier API du module existe
        if (fs.existsSync(moduleApiPath)) {
          logger.info(`Chargement de l'API du module: ${moduleName}`);

          // Charger le routeur du module
          const moduleRouter = require(moduleApiPath);

          // Monter les routes du module sous le préfixe /api/v1/:moduleName
          router.use(`/${moduleName}`, moduleRouter);

          logger.info(`API du module ${moduleName} chargée avec succès`);
        } else {
          logger.debug(`Le module ${moduleName} n'a pas d'API serveur`);
        }
      } catch (error) {
        logger.error(`Erreur lors du chargement de l'API du module ${moduleName}:`, error);
      }
    });
  } catch (error) {
    logger.error('Erreur lors du chargement des APIs des modules:', error);
  }
}

module.exports = {
  mountModuleApis
};
