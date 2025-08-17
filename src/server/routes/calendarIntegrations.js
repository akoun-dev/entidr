const express = require('express');
const router = express.Router();
const CalendarIntegrationController = require('../controllers/CalendarIntegrationController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { calendarIntegrationSchema } = require('../validations/calendarIntegration');

/**
 * @swagger
 * tags:
 *   name: CalendarIntegrations
 *   description: Gestion des intégrations calendrier
 */

/**
 * @swagger
 * /api/calendar-integrations:
 *   post:
 *     summary: Crée une nouvelle intégration calendrier
 *     tags: [CalendarIntegrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarIntegration'
 *     responses:
 *       201:
 *         description: Intégration créée
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
  validate(calendarIntegrationSchema),
  CalendarIntegrationController.create
);

/**
 * @swagger
 * /api/calendar-integrations:
 *   get:
 *     summary: Liste toutes les intégrations calendrier
 *     tags: [CalendarIntegrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des intégrations
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, CalendarIntegrationController.list);

/**
 * @swagger
 * /api/calendar-integrations/{id}:
 *   get:
 *     summary: Récupère une intégration spécifique
 *     tags: [CalendarIntegrations]
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
 *         description: Intégration trouvée
 *       404:
 *         description: Intégration non trouvée
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, CalendarIntegrationController.get);

/**
 * @swagger
 * /api/calendar-integrations/{id}:
 *   put:
 *     summary: Met à jour une intégration
 *     tags: [CalendarIntegrations]
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
 *             $ref: '#/components/schemas/CalendarIntegration'
 *     responses:
 *       200:
 *         description: Intégration mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Intégration non trouvée
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(calendarIntegrationSchema),
  CalendarIntegrationController.update
);

/**
 * @swagger
 * /api/calendar-integrations/{id}:
 *   delete:
 *     summary: Supprime une intégration
 *     tags: [CalendarIntegrations]
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
 *         description: Intégration supprimée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Intégration non trouvée
 */
router.delete('/:id', authenticate, authorize(['admin']), CalendarIntegrationController.delete);

module.exports = router;
