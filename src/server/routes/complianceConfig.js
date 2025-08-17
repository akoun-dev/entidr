const express = require('express');
const router = express.Router();
const ComplianceConfigController = require('../controllers/ComplianceConfigController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { complianceConfigSchema } = require('../validations/complianceConfig');

/**
 * @swagger
 * tags:
 *   name: ComplianceConfig
 *   description: Configuration de conformité
 */

/**
 * @swagger
 * /api/compliance-config:
 *   get:
 *     summary: Récupère la configuration de conformité
 *     tags: [ComplianceConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration de conformité
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticate, authorize(['admin']), ComplianceConfigController.get);

/**
 * @swagger
 * /api/compliance-config:
 *   put:
 *     summary: Met à jour la configuration de conformité
 *     tags: [ComplianceConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComplianceConfig'
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
  validate(complianceConfigSchema),
  ComplianceConfigController.update
);

/**
 * @swagger
 * /api/compliance-config/check:
 *   post:
 *     summary: Vérifie la conformité actuelle
 *     tags: [ComplianceConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut de conformité
 *       400:
 *         description: Échec de vérification
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 */
router.post(
  '/check',
  authenticate,
  authorize(['admin']),
  ComplianceConfigController.checkCompliance
);

module.exports = router;
