const express = require('express');
const router = express.Router();
const NotificationConfigController = require('../controllers/NotificationConfigController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { notificationConfigSchema } = require('../validations/notificationConfig');

/**
 * @swagger
 * tags:
 *   name: NotificationConfig
 *   description: Configuration des notifications
 */

/**
 * @swagger
 * /api/notification-config:
 *   get:
 *     summary: Récupère la configuration des notifications
 *     tags: [NotificationConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration des notifications
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticate, authorize(['admin']), NotificationConfigController.get);

/**
 * @swagger
 * /api/notification-config:
 *   put:
 *     summary: Met à jour la configuration des notifications
 *     tags: [NotificationConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationConfig'
 *     responses:
 *       200:
 *         description: Configuration mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       500:
 *         description: Erreur serveur
 */
router.put(
  '/',
  authenticate,
  authorize(['admin']),
  validate(notificationConfigSchema),
  NotificationConfigController.update
);

module.exports = router;
