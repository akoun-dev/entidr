const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Gestion des modules système
 */

/**
 * @swagger
 * /modules:
 *   get:
 *     summary: Liste tous les modules disponibles
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 */

// Route pour récupérer tous les modules
router.get('/', moduleController.getAllModules);

/**
 * @swagger
 * /modules/{name}/status:
 *   put:
 *     summary: Active ou désactive un module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom du module
 *     responses:
 *       200:
 *         description: Statut du module mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module non trouvé
 */

// Route pour activer/désactiver un module
router.put('/:name/status', moduleController.toggleModuleStatus);

/**
 * @swagger
 * /modules/{name}/install:
 *   post:
 *     summary: Installe un module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom du module à installer
 *     responses:
 *       201:
 *         description: Module installé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       400:
 *         description: Module déjà installé ou erreur d'installation
 *       404:
 *         description: Module non trouvé
 */

// Route pour installer un module
router.post('/:name/install', moduleController.installModule);

/**
 * @swagger
 * /modules/{name}/uninstall:
 *   post:
 *     summary: Désinstalle un module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom du module à désinstaller
 *     responses:
 *       200:
 *         description: Module désinstallé avec succès
 *       400:
 *         description: Module non installé ou erreur de désinstallation
 *       404:
 *         description: Module non trouvé
 */

// Route pour désinstaller un module
router.post('/:name/uninstall', moduleController.uninstallModule);

module.exports = router;
