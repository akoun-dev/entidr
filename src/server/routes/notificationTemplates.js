const express = require('express');
const router = express.Router();
const NotificationTemplateController = require('../controllers/NotificationTemplateController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { notificationTemplateSchema } = require('../validations/notificationTemplate');

/**
 * @swagger
 * tags:
 *   name: NotificationTemplates
 *   description: Gestion des modèles de notification
 */

/**
 * @swagger
 * /api/notification-templates:
 *   post:
 *     summary: Crée un nouveau modèle de notification
 *     tags: [NotificationTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationTemplate'
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
  validate(notificationTemplateSchema),
  NotificationTemplateController.create
);

/**
 * @swagger
 * /api/notification-templates:
 *   get:
 *     summary: Liste tous les modèles de notification
 *     tags: [NotificationTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtre par type de notification
 *     responses:
 *       200:
 *         description: Liste des modèles
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 */
router.get('/', authenticate, NotificationTemplateController.list);

/**
 * @swagger
 * /api/notification-templates/{id}:
 *   get:
 *     summary: Récupère un modèle spécifique
 *     tags: [NotificationTemplates]
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
router.get('/:id', authenticate, NotificationTemplateController.get);

/**
 * @swagger
 * /api/notification-templates/{id}:
 *   put:
 *     summary: Met à jour un modèle
 *     tags: [NotificationTemplates]
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
 *             $ref: '#/components/schemas/NotificationTemplate'
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
  validate(notificationTemplateSchema),
  NotificationTemplateController.update
);

/**
 * @swagger
 * /api/notification-templates/{id}:
 *   delete:
 *     summary: Supprime un modèle
 *     tags: [NotificationTemplates]
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
router.delete('/:id', authenticate, authorize(['admin']), NotificationTemplateController.delete);

module.exports = router;
