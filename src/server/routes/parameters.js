'use strict';

const express = require('express');
const { Parameter } = require('../../models');

const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @swagger
 * tags:
 *   name: Parameters
 *   description: Gestion des paramètres système
 */

/**
 * @swagger
 * /parameters:
 *   get:
 *     summary: Liste tous les paramètres
 *     tags: [Parameters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paramètres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Parameter'
 */

// Routes for parameters
router.get('/', asyncHandler(async (req, res) => {
  const parameters = await Parameter.findAll();

  const transformedParameters = parameters.map(param => ({
    id: param.id.toString(),
    key: param.key,
    value: param.value,
    category: param.category,
    description: param.description || ''
  }));

  res.json(transformedParameters);
}));

/**
 * @swagger
 * /parameters/category/{category}:
 *   get:
 *     summary: Récupère les paramètres par catégorie
 *     tags: [Parameters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Catégorie des paramètres
 *     responses:
 *       200:
 *         description: Liste des paramètres de la catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Parameter'
 *       404:
 *         description: Catégorie non trouvée
 */
router.get('/category/:category', asyncHandler(async (req, res) => {
  const parameters = await Parameter.findAll({
    where: { category: req.params.category }
  });

  const transformedParameters = parameters.map(param => ({
    id: param.id.toString(),
    key: param.key,
    value: param.value,
    category: param.category,
    description: param.description || ''
  }));

  res.json(transformedParameters);
}));

/**
 * @swagger
 * /parameters/key/{key}:
 *   get:
 *     summary: Récupère un paramètre par sa clé
 *     tags: [Parameters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clé du paramètre
 *     responses:
 *       200:
 *         description: Détails du paramètre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Parameter'
 *       404:
 *         description: Paramètre non trouvé
 */
router.get('/key/:key', asyncHandler(async (req, res) => {
  const parameter = await Parameter.findOne({
    where: { key: req.params.key }
  });

  if (!parameter) {
    return res.status(404).json({ message: 'Paramètre non trouvé' });
  }

  const transformedParameter = {
    id: parameter.id.toString(),
    key: parameter.key,
    value: parameter.value,
    category: parameter.category,
    description: parameter.description || ''
  };

  res.json(transformedParameter);
}));

/**
 * @swagger
 * /parameters/key/{key}:
 *   put:
 *     summary: Met à jour un paramètre
 *     tags: [Parameters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clé du paramètre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: Nouvelle valeur du paramètre
 *             required:
 *               - value
 *     responses:
 *       200:
 *         description: Paramètre mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Parameter'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Paramètre non trouvé
 */
router.put('/key/:key', asyncHandler(async (req, res) => {
  const { value } = req.body;

  const parameter = await Parameter.findOne({
    where: { key: req.params.key }
  });

  if (!parameter) {
    return res.status(404).json({ message: 'Paramètre non trouvé' });
  }

  parameter.value = value;
  await parameter.save();

  const transformedParameter = {
    id: parameter.id.toString(),
    key: parameter.key,
    value: parameter.value,
    category: parameter.category,
    description: parameter.description || ''
  };

  res.json(transformedParameter);
}));

/**
 * @swagger
 * /parameters/batch:
 *   put:
 *     summary: Met à jour plusieurs paramètres en lot
 *     tags: [Parameters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parameters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     value:
 *                       type: string
 *                   required:
 *                     - key
 *                     - value
 *             required:
 *               - parameters
 *     responses:
 *       200:
 *         description: Paramètres mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Parameter'
 *       400:
 *         description: Données invalides
 */
router.put('/batch', asyncHandler(async (req, res) => {
  const { parameters } = req.body;

  const updatedParameters = [];

  for (const param of parameters) {
    const parameter = await Parameter.findOne({
      where: { key: param.key }
    });

    if (parameter) {
      parameter.value = param.value;
      await parameter.save();

      updatedParameters.push({
        id: parameter.id.toString(),
        key: parameter.key,
        value: parameter.value,
        category: parameter.category,
        description: parameter.description || ''
      });
    }
  }

  res.json(updatedParameters);
}));

module.exports = router;

