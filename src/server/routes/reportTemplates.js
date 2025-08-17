const express = require('express');
const router = express.Router();
const ReportTemplateController = require('../controllers/ReportTemplateController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { reportTemplateSchema } = require('../validations/reportTemplate');

/**
 * @swagger
 * tags:
 *   name: ReportTemplate
 *   description: Gestion des modèles de rapport
 */

/**
 * @swagger
 * /api/report-templates:
 *   post:
 *     summary: Crée un nouveau modèle de rapport
 *     tags: [ReportTemplate]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportTemplate'
 *     responses:
 *       201:
 *         description: Modèle créé
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
  validate(reportTemplateSchema),
  ReportTemplateController.create
);

/**
 * @swagger
 * /api/report-templates:
 *   get:
 *     summary: Liste tous les modèles de rapport
 *     tags: [ReportTemplate]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des modèles
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, ReportTemplateController.list);

/**
 * @swagger
 * /api/report-templates/{id}:
 *   get:
 *     summary: Récupère un modèle spécifique
 *     tags: [ReportTemplate]
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
 *         description: Modèle trouvé
 *       404:
 *         description: Modèle non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, ReportTemplateController.get);

/**
 * @swagger
 * /api/report-templates/{id}:
 *   put:
 *     summary: Met à jour un modèle de rapport
 *     tags: [ReportTemplate]
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
 *             $ref: '#/components/schemas/ReportTemplate'
 *     responses:
 *       200:
 *         description: Modèle mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Modèle non trouvé
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(reportTemplateSchema),
  ReportTemplateController.update
);

/**
 * @swagger
 * /api/report-templates/{id}:
 *   delete:
 *     summary: Supprime un modèle de rapport
 *     tags: [ReportTemplate]
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
 *         description: Modèle supprimé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Modèle non trouvé
 */
router.delete('/:id', authenticate, authorize(['admin']), ReportTemplateController.delete);

/**
 * @swagger
 * /api/report-templates/{id}/generate:
 *   post:
 *     summary: Génère un rapport à partir du modèle
 *     tags: [ReportTemplate]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parameters:
 *                 type: object
 *                 description: Paramètres pour la génération du rapport
 *     responses:
 *       200:
 *         description: Rapport généré avec succès
 *       400:
 *         description: Échec de génération
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Modèle non trouvé
 */
router.post(
  '/:id/generate',
  authenticate,
  ReportTemplateController.generateReport
);

module.exports = router;
