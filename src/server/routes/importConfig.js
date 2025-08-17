const express = require('express');
const router = express.Router();
const ImportConfigController = require('../controllers/ImportConfigController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { importConfigSchema } = require('../validations/importConfig');

/**
 * @swagger
 * tags:
 *   name: ImportConfig
 *   description: Configuration des imports
 */

/**
 * @swagger
 * /api/import-configs:
 *   post:
 *     summary: Crée une nouvelle configuration d'import
 *     tags: [ImportConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImportConfig'
 *     responses:
 *       201:
 *         description: Configuration créée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 */
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validate(importConfigSchema),
  ImportConfigController.create
);

/**
 * @swagger
 * /api/import-configs:
 *   get:
 *     summary: Liste toutes les configurations d'import
 *     tags: [ImportConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des configurations
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, ImportConfigController.list);

/**
 * @swagger
 * /api/import-configs/{id}:
 *   get:
 *     summary: Récupère une configuration spécifique
 *     tags: [ImportConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Configuration trouvée
 *       404:
 *         description: Configuration non trouvée
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, ImportConfigController.get);

/**
 * @swagger
 * /api/import-configs/{id}:
 *   put:
 *     summary: Met à jour une configuration d'import
 *     tags: [ImportConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImportConfig'
 *     responses:
 *       200:
 *         description: Configuration mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Configuration non trouvée
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(importConfigSchema),
  ImportConfigController.update
);

/**
 * @swagger
 * /api/import-configs/{id}:
 *   delete:
 *     summary: Supprime une configuration d'import
 *     tags: [ImportConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Configuration supprimée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Configuration non trouvée
 */
router.delete('/:id', authenticate, authorize(['admin']), ImportConfigController.delete);

/**
 * @swagger
 * /api/import-configs/{id}/test:
 *   post:
 *     summary: Teste une configuration d'import
 *     tags: [ImportConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Test réussi
 *       400:
 *         description: Échec du test
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 */
router.post(
  '/:id/test',
  authenticate,
  authorize(['admin']),
  ImportConfigController.testImport
);

module.exports = router;
