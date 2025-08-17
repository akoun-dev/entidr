const express = require('express');
const router = express.Router();
const AutomationRuleController = require('../controllers/AutomationRuleController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { automationRuleSchema } = require('../validations/automationRule');

/**
 * @swagger
 * tags:
 *   name: AutomationRule
 *   description: Gestion des règles d'automatisation
 */

/**
 * @swagger
 * /api/automation-rules:
 *   post:
 *     summary: Crée une nouvelle règle d'automatisation
 *     tags: [AutomationRule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutomationRule'
 *     responses:
 *       201:
 *         description: Règle créée
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
  validate(automationRuleSchema),
  AutomationRuleController.create
);

/**
 * @swagger
 * /api/automation-rules:
 *   get:
 *     summary: Liste toutes les règles d'automatisation
 *     tags: [AutomationRule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des règles
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, AutomationRuleController.list);

/**
 * @swagger
 * /api/automation-rules/{id}:
 *   get:
 *     summary: Récupère une règle spécifique
 *     tags: [AutomationRule]
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
 *         description: Règle trouvée
 *       404:
 *         description: Règle non trouvée
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, AutomationRuleController.get);

/**
 * @swagger
 * /api/automation-rules/{id}:
 *   put:
 *     summary: Met à jour une règle d'automatisation
 *     tags: [AutomationRule]
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
 *             $ref: '#/components/schemas/AutomationRule'
 *     responses:
 *       200:
 *         description: Règle mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Règle non trouvée
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(automationRuleSchema),
  AutomationRuleController.update
);

/**
 * @swagger
 * /api/automation-rules/{id}:
 *   delete:
 *     summary: Supprime une règle d'automatisation
 *     tags: [AutomationRule]
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
 *         description: Règle supprimée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Règle non trouvée
 */
router.delete('/:id', authenticate, authorize(['admin']), AutomationRuleController.delete);

/**
 * @swagger
 * /api/automation-rules/{id}/test:
 *   post:
 *     summary: Teste une règle d'automatisation
 *     tags: [AutomationRule]
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
  AutomationRuleController.testRule
);

module.exports = router;
