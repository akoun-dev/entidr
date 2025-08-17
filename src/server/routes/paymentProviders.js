const express = require('express');
const router = express.Router();
const PaymentProviderController = require('../controllers/PaymentProviderController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { paymentProviderSchema } = require('../validations/paymentProvider');

/**
 * @swagger
 * tags:
 *   name: PaymentProviders
 *   description: Gestion des fournisseurs de paiement
 */

/**
 * @swagger
 * /api/payment-providers:
 *   post:
 *     summary: Crée un nouveau fournisseur de paiement
 *     tags: [PaymentProviders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentProvider'
 *     responses:
 *       201:
 *         description: Fournisseur créé
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
  validate(paymentProviderSchema),
  PaymentProviderController.create
);

/**
 * @swagger
 * /api/payment-providers:
 *   get:
 *     summary: Liste tous les fournisseurs de paiement
 *     tags: [PaymentProviders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtre par type de fournisseur
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtre par statut actif/inactif
 *     responses:
 *       200:
 *         description: Liste des fournisseurs
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, PaymentProviderController.list);

/**
 * @swagger
 * /api/payment-providers/{id}:
 *   get:
 *     summary: Récupère un fournisseur spécifique
 *     tags: [PaymentProviders]
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
 *         description: Fournisseur trouvé
 *       404:
 *         description: Fournisseur non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, PaymentProviderController.get);

/**
 * @swagger
 * /api/payment-providers/{id}:
 *   put:
 *     summary: Met à jour un fournisseur
 *     tags: [PaymentProviders]
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
 *             $ref: '#/components/schemas/PaymentProvider'
 *     responses:
 *       200:
 *         description: Fournisseur mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Fournisseur non trouvé
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(paymentProviderSchema),
  PaymentProviderController.update
);

/**
 * @swagger
 * /api/payment-providers/{id}:
 *   delete:
 *     summary: Supprime un fournisseur
 *     tags: [PaymentProviders]
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
 *         description: Fournisseur supprimé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Fournisseur non trouvé
 */
router.delete('/:id', authenticate, authorize(['admin']), PaymentProviderController.delete);

module.exports = router;
