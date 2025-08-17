const express = require('express');
const router = express.Router();
const EmailServerController = require('../controllers/EmailServerController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { emailServerSchema } = require('../validations/emailServer');

/**
 * @swagger
 * tags:
 *   name: EmailServer
 *   description: Gestion des serveurs email
 */

/**
 * @swagger
 * /api/email-servers:
 *   post:
 *     summary: Crée un nouveau serveur email
 *     tags: [EmailServer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailServer'
 *     responses:
 *       201:
 *         description: Serveur créé
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
  validate(emailServerSchema),
  EmailServerController.create
);

/**
 * @swagger
 * /api/email-servers:
 *   get:
 *     summary: Liste tous les serveurs email
 *     tags: [EmailServer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des serveurs
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, EmailServerController.list);

/**
 * @swagger
 * /api/email-servers/{id}:
 *   get:
 *     summary: Récupère un serveur spécifique
 *     tags: [EmailServer]
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
 *         description: Serveur trouvé
 *       404:
 *         description: Serveur non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, EmailServerController.get);

/**
 * @swagger
 * /api/email-servers/{id}:
 *   put:
 *     summary: Met à jour un serveur email
 *     tags: [EmailServer]
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
 *             $ref: '#/components/schemas/EmailServer'
 *     responses:
 *       200:
 *         description: Serveur mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Serveur non trouvé
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(emailServerSchema),
  EmailServerController.update
);

/**
 * @swagger
 * /api/email-servers/{id}:
 *   delete:
 *     summary: Supprime un serveur email
 *     tags: [EmailServer]
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
 *         description: Serveur supprimé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Serveur non trouvé
 */
router.delete('/:id', authenticate, authorize(['admin']), EmailServerController.delete);

/**
 * @swagger
 * /api/email-servers/{id}/test:
 *   post:
 *     summary: Teste la connexion au serveur email
 *     tags: [EmailServer]
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
 *         description: Connexion réussie
 *       400:
 *         description: Échec de connexion
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 */
router.post(
  '/:id/test',
  authenticate,
  authorize(['admin']),
  EmailServerController.testConnection
);

module.exports = router;
