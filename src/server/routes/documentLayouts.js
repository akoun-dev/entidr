const express = require('express');
const router = express.Router();
const DocumentLayoutController = require('../controllers/DocumentLayoutController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { documentLayoutSchema } = require('../validations/documentLayout');

/**
 * @swagger
 * tags:
 *   name: DocumentLayout
 *   description: Gestion des mises en page de documents
 */

/**
 * @swagger
 * /api/document-layouts:
 *   post:
 *     summary: Crée une nouvelle mise en page
 *     tags: [DocumentLayout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentLayout'
 *     responses:
 *       201:
 *         description: Mise en page créée
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
  validate(documentLayoutSchema),
  DocumentLayoutController.create
);

/**
 * @swagger
 * /api/document-layouts:
 *   get:
 *     summary: Liste toutes les mises en page
 *     tags: [DocumentLayout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des mises en page
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, DocumentLayoutController.list);

/**
 * @swagger
 * /api/document-layouts/{id}:
 *   get:
 *     summary: Récupère une mise en page spécifique
 *     tags: [DocumentLayout]
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
 *         description: Mise en page trouvée
 *       404:
 *         description: Mise en page non trouvée
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, DocumentLayoutController.get);

/**
 * @swagger
 * /api/document-layouts/{id}:
 *   put:
 *     summary: Met à jour une mise en page
 *     tags: [DocumentLayout]
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
 *             $ref: '#/components/schemas/DocumentLayout'
 *     responses:
 *       200:
 *         description: Mise en page mise à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Mise en page non trouvée
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(documentLayoutSchema),
  DocumentLayoutController.update
);

/**
 * @swagger
 * /api/document-layouts/{id}:
 *   delete:
 *     summary: Supprime une mise en page
 *     tags: [DocumentLayout]
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
 *         description: Mise en page supprimée
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Mise en page non trouvée
 */
router.delete('/:id', authenticate, authorize(['admin']), DocumentLayoutController.delete);

/**
 * @swagger
 * /api/document-layouts/{id}/set-default:
 *   post:
 *     summary: Définit une mise en page comme défaut
 *     tags: [DocumentLayout]
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
 *         description: Mise en page définie comme défaut
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Mise en page non trouvée
 */
router.post(
  '/:id/set-default',
  authenticate,
  authorize(['admin']),
  DocumentLayoutController.setAsDefault
);

module.exports = router;
