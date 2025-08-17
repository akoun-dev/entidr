const express = require('express');
const router = express.Router();
const WorkflowDefinitionController = require('../controllers/WorkflowDefinitionController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { workflowDefinitionSchema } = require('../validations/workflowDefinition');

/**
 * @swagger
 * tags:
 *   name: WorkflowDefinition
 *   description: Gestion des définitions de workflows
 */

/**
 * @swagger
 * /api/workflow-definitions:
 *   post:
 *     summary: Crée une nouvelle définition de workflow
 *     tags: [WorkflowDefinition]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowDefinition'
 *     responses:
 *       201:
 *         description: Définition créée
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
  validate(workflowDefinitionSchema),
  WorkflowDefinitionController.create
);

/**
 * @swagger
 * /api/workflow-definitions:
 *   get:
 *     summary: Liste toutes les définitions de workflow
 *     tags: [WorkflowDefinition]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des définitions
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, WorkflowDefinitionController.list);

/**
 * @swagger
 * /api/workflow-definitions/{id}:
 *   get:
 *     summary: Récupère une définition spécifique
 *     tags: [WorkflowDefinition]
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
 *         description: Définition trouvée
 *       404:
 *         description: Définition non trouvée
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, WorkflowDefinitionController.get);

/**
 * @swagger
 * /api/workflow-definitions/{id}:
 *   put:
 *     summary: Met à jour une définition de workflow
 *     tags: [WorkflowDefinition]
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
 *             $ref: '#/components/schemas/WorkflowDefinition'
 *     responses:
 *       200:
 *         description: Définition mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Définition non trouvée
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(workflowDefinitionSchema),
  WorkflowDefinitionController.update
);

/**
 * @swagger
 * /api/workflow-definitions/{id}:
 *   delete:
 *     summary: Supprime une définition de workflow
 *     tags: [WorkflowDefinition]
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
 *         description: Définition supprimée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Définition non trouvée
 */
router.delete('/:id', authenticate, authorize(['admin']), WorkflowDefinitionController.delete);

/**
 * @swagger
 * /api/workflow-definitions/{id}/test:
 *   post:
 *     summary: Teste une définition de workflow
 *     tags: [WorkflowDefinition]
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
 *       404:
 *         description: Définition non trouvée
 */
router.post(
  '/:id/test',
  authenticate,
  authorize(['admin']),
  WorkflowDefinitionController.testWorkflow
);

module.exports = router;
