const express = require('express');
const router = express.Router();
const BackupConfigController = require('../controllers/BackupConfigController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { backupConfigSchema } = require('../validations/backupConfig');

/**
 * @swagger
 * tags:
 *   name: BackupConfig
 *   description: Configuration des sauvegardes
 */

/**
 * @swagger
 * /api/backup-config:
 *   get:
 *     summary: Récupère la configuration des sauvegardes
 *     tags: [BackupConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration des sauvegardes
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticate, authorize(['admin']), BackupConfigController.get);

/**
 * @swagger
 * /api/backup-config:
 *   put:
 *     summary: Met à jour la configuration des sauvegardes
 *     tags: [BackupConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BackupConfig'
 *     responses:
 *       200:
 *         description: Configuration mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 */
router.put(
  '/',
  authenticate,
  authorize(['admin']),
  validate(backupConfigSchema),
  BackupConfigController.update
);

/**
 * @swagger
 * /api/backup-config/test-connection:
 *   post:
 *     summary: Teste la connexion au stockage de sauvegarde
 *     tags: [BackupConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Échec de connexion
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 */
router.post(
  '/test-connection',
  authenticate,
  authorize(['admin']),
  BackupConfigController.testConnection
);

module.exports = router;
