'use strict';

const express = require('express');
const GroupController = require('../controllers/groupController');
const { validateGroupCreate, validateGroupUpdate } = require('../utils/validators/groupSchemas');
const { asyncHandler, validate } = require('../middlewares/apiHelpers');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Gestion des groupes d'utilisateurs
 */

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Liste tous les groupes
 *     tags: [Groups]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des groupes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *                 meta:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', asyncHandler(async (req, res) => {
  const result = await GroupController.listGroups(req, res);
  res.json(result);
}));

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Récupère un groupe par son ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du groupe
 *     responses:
 *       200:
 *         description: Détails du groupe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Groupe non trouvé
 */
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const result = await GroupController.getGroup(req, res);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}));

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Crée un nouveau groupe
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupCreate'
 *     responses:
 *       201:
 *         description: Groupe créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Données invalides
 */
router.post('/', validate(validateGroupCreate), asyncHandler(async (req, res) => {
  const result = await GroupController.createGroup(req, res);
  res.status(201).json(result);
}));

/**
 * @swagger
 * /groups/{id}:
 *   put:
 *     summary: Met à jour un groupe existant
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du groupe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupUpdate'
 *     responses:
 *       200:
 *         description: Groupe mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Groupe non trouvé
 */
router.put('/:id', validate(validateGroupUpdate), asyncHandler(async (req, res) => {
  try {
    const result = await GroupController.updateGroup(req, res);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}));

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Supprime un groupe
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du groupe
 *     responses:
 *       204:
 *         description: Groupe supprimé
 *       404:
 *         description: Groupe non trouvé
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    await GroupController.deleteGroup(req, res);
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}));

module.exports = router;
