'use strict';

const express = require('express');
const UserController = require('../controllers/userController');
const { validateUserCreate, validateUserUpdate } = require('../utils/validators/userSchemas');
const { asyncHandler, validate } = require('../middlewares/apiHelpers');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste tous les utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', asyncHandler(async (req, res) => {
  const result = await UserController.listUsers(req, res);
  res.json(result);
}));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const result = await UserController.getUser(req, res);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}));

router.post('/', validate(validateUserCreate), asyncHandler(async (req, res) => {
  const result = await UserController.createUser(req, res);
  res.status(201).json(result);
}));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Met à jour un utilisateur existant
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       400:
 *         description: Données invalides
 */
router.put('/:id', validate(validateUserUpdate), asyncHandler(async (req, res) => {
  try {
    const result = await UserController.updateUser(req, res);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       204:
 *         description: Utilisateur supprimé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    await UserController.deleteUser(req, res);
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}));

module.exports = router;
