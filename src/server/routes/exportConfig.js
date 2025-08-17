const express = require('express');
const router = express.Router();
const ExportConfigController = require('../controllers/ExportConfigController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { exportConfigSchema } = require('../validations/exportConfig');

/**
 * @swagger
 * tags:
 *   name: ExportConfig
 *   description: Configuration des exports
 */

/**
 * @swagger
 * /api/export-configs:
 *   post:
 *     summary: Crée une nouvelle configuration d'export
 *     tags: [ExportConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExportConfig'
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
  validate(exportConfigSchema),
  ExportConfigController.create
);

/**
 * @swagger
 * /api/export-configs:
 *   get:
 *     summary: Liste toutes les configurations d'export
 *     tags: [ExportConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des configurations
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, ExportConfigController.list);

/**
 * @swagger
 * /api/export-configs/{id}:
 *   get:
 *     summary: Récupère une configuration spécifique
 *     tags: [ExportConfig]
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
router.get('/:id', authenticate, ExportConfigController.get);

/**
 * @swagger
 * /api/export-configs/{id}:
 *   put:
 *     summary: Met à jour une configuration d'export
 *     tags: [ExportConfig]
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
 *             $ref: '#/components/schemas/ExportConfig'
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
  validate(exportConfigSchema),
  ExportConfigController.update
);

/**
 * @swagger
 * /api/export-configs/{id}:
 *   delete:
 *     summary: Supprime une configuration d'export
 *     tags: [ExportConfig]
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
router.delete('/:id', authenticate, authorize(['admin']), ExportConfigController.delete);

/**
 * @swagger
 * /api/export-configs/{id}/test:
 *   post:
 *     summary: Teste une configuration d'export
 *     tags: [ExportConfig]
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
  ExportConfigController.testExport
);

module.exports = router;
