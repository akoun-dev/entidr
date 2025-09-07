const express = require('express');
const router = express.Router();
const ExternalServiceController = require('../controllers/ExternalServiceController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: ExternalServices
 *   description: Gestion des services externes
 */

/**
 * @swagger
 * /api/external-services:
 *   post:
 *     summary: Crée un nouveau service externe
 *     tags: [ExternalServices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExternalService'
 *     responses:
 *       201:
 *         description: Service créé
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
  validate(),
  ExternalServiceController.create
);

/**
 * @swagger
 * /api/external-services:
 *   get:
 *     summary: Liste tous les services externes
 *     tags: [ExternalServices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtre par type de service
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtre par statut actif/inactif
 *     responses:
 *       200:
 *         description: Liste des services
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, ExternalServiceController.list);

/**
 * @swagger
 * /api/external-services/{id}:
 *   get:
 *     summary: Récupère un service spécifique
 *     tags: [ExternalServices]
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
 *         description: Service trouvé
 *       404:
 *         description: Service non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, ExternalServiceController.get);

/**
 * @swagger
 * /api/external-services/{id}:
 *   put:
 *     summary: Met à jour un service
 *     tags: [ExternalServices]
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
 *             $ref: '#/components/schemas/ExternalService'
 *     responses:
 *       200:
 *         description: Service mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Service non trouvé
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(),
  ExternalServiceController.update
);

/**
 * @swagger
 * /api/external-services/{id}:
 *   delete:
 *     summary: Supprime un service
 *     tags: [ExternalServices]
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
 *         description: Service supprimé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Service non trouvé
 */
router.delete('/:id', authenticate, authorize(['admin']), ExternalServiceController.delete);

module.exports = router;
