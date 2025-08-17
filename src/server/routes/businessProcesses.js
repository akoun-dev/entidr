const express = require('express');
const router = express.Router();
const BusinessProcessController = require('../controllers/BusinessProcessController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { businessProcessSchema } = require('../validations/businessProcess');

/**
 * @swagger
 * tags:
 *   name: BusinessProcess
 *   description: Gestion des processus métiers
 */

/**
 * @swagger
 * /api/business-processes:
 *   post:
 *     summary: Crée un nouveau processus métier
 *     tags: [BusinessProcess]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessProcess'
 *     responses:
 *       201:
 *         description: Processus créé
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
  validate(businessProcessSchema),
  BusinessProcessController.create
);

/**
 * @swagger
 * /api/business-processes:
 *   get:
 *     summary: Liste tous les processus métiers
 *     tags: [BusinessProcess]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des processus
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, BusinessProcessController.list);

/**
 * @swagger
 * /api/business-processes/{id}:
 *   get:
 *     summary: Récupère un processus spécifique
 *     tags: [BusinessProcess]
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
 *         description: Processus trouvé
 *       404:
 *         description: Processus non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, BusinessProcessController.get);

/**
 * @swagger
 * /api/business-processes/{id}:
 *   put:
 *     summary: Met à jour un processus métier
 *     tags: [BusinessProcess]
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
 *             $ref: '#/components/schemas/BusinessProcess'
 *     responses:
 *       200:
 *         description: Processus mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Processus non trouvé
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(businessProcessSchema),
  BusinessProcessController.update
);

/**
 * @swagger
 * /api/business-processes/{id}:
 *   delete:
 *     summary: Supprime un processus métier
 *     tags: [BusinessProcess]
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
 *         description: Processus supprimé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Processus non trouvé
 */
router.delete('/:id', authenticate, authorize(['admin']), BusinessProcessController.delete);

/**
 * @swagger
 * /api/business-processes/{id}/execute:
 *   post:
 *     summary: Exécute un processus métier
 *     tags: [BusinessProcess]
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
 *               inputData:
 *                 type: object
 *                 description: Données d'entrée pour l'exécution
 *     responses:
 *       200:
 *         description: Exécution réussie
 *       400:
 *         description: Échec de l'exécution
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Processus non trouvé
 */
router.post(
  '/:id/execute',
  authenticate,
  BusinessProcessController.execute
);

module.exports = router;
