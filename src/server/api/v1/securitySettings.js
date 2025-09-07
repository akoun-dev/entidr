'use strict';

const express = require('express');
const router = express.Router();
const SecuritySettingController = require('../../controllers/SecuritySettingController');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: SecuritySettings
 *   description: Gestion des paramètres de sécurité
 */

/**
 * @swagger
 * /api/security-settings:
 *   get:
 *     summary: Récupère les paramètres de sécurité
 *     tags: [SecuritySettings]
 *     responses:
 *       200:
 *         description: Paramètres de sécurité récupérés
 *       401:
 *         description: Non autorisé
 */
router.get('/', SecuritySettingController.get);

// Catégories disponibles
router.get('/categories', SecuritySettingController.getCategories);

// Lecture par clé
router.get('/:key', SecuritySettingController.getByKey);

/**
 * @swagger
 * /api/security-settings:
 *   put:
 *     summary: Met à jour les paramètres de sécurité
 *     tags: [SecuritySettings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SecuritySetting'
 *     responses:
 *       200:
 *         description: Paramètres de sécurité mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Permission refusée
 */
// Mise à jour globale (body contient { key, value })
router.put('/', authenticate, authorize(['admin']), validate(), SecuritySettingController.update);

// Mise à jour par clé spécifique (PATCH)
router.patch(
  '/:key',
  authenticate,
  authorize(['admin']),
  validate(),
  (req, res, next) => {
    // Injecter la clé de l'URL dans le body pour réutiliser le contrôleur
    req.body.key = req.params.key;
    next();
  },
  SecuritySettingController.update
);

module.exports = router;
