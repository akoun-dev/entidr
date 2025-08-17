const express = require('express');
const router = express.Router();
const DataMappingController = require('../controllers/DataMappingController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { dataMappingSchema } = require('../validations/dataMapping');

/**
 * @swagger
 * tags:
 *   name: DataMapping
 *   description: Gestion des mappings de données
 */

/**
 * @swagger
 * /api/data-mappings:
 *   post:
 *     summary: Crée un nouveau mapping de données
 *     tags: [DataMapping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DataMapping'
 *     responses:
 *       201:
 *         description: Mapping créé
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
  validate(dataMappingSchema),
  DataMappingController.create
);

/**
 * @swagger
 * /api/data-mappings:
 *   get:
 *     summary: Liste tous les mappings de données
 *     tags: [DataMapping]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des mappings
 *       401:
 *         description: Non autorisé
 */
router.get('/', authenticate, DataMappingController.list);

/**
 * @swagger
 * /api/data-mappings/{id}:
 *   get:
 *     summary: Récupère un mapping spécifique
 *     tags: [DataMapping]
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
 *         description: Mapping trouvé
 *       404:
 *         description: Mapping non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', authenticate, DataMappingController.get);

/**
 * @swagger
 * /api/data-mappings/{id}:
 *   put:
 *     summary: Met à jour un mapping de données
 *     tags: [DataMapping]
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
 *             $ref: '#/components/schemas/DataMapping'
 *     responses:
 *       200:
 *         description: Mapping mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Mapping non trouvé
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(dataMappingSchema),
  DataMappingController.update
);

/**
 * @swagger
 * /api/data-mappings/{id}:
 *   delete:
 *     summary: Supprime un mapping de données
 *     tags: [DataMapping]
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
 *         description: Mapping supprimé
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Mapping non trouvé
 */
router.delete('/:id', authenticate, authorize(['admin']), DataMappingController.delete);

/**
 * @swagger
 * /api/data-mappings/{id}/test:
 *   post:
 *     summary: Teste un mapping de données
 *     tags: [DataMapping]
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
 *               sampleData:
 *                 type: object
 *                 description: Données d'exemple pour tester le mapping
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
 *         description: Mapping non trouvé
 */
router.post(
  '/:id/test',
  authenticate,
  DataMappingController.testMapping
);

module.exports = router;
