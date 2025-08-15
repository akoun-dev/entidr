const express = require('express');
const router = express.Router();
const Module = require('../../models/Module');
const logger = require('../../utils/logger.server');

/**
 * GET /api/modules
 * Récupère tous les modules
 */
router.get('/', async (req, res) => {
  try {
    const modules = await Module.findAll();
    res.json(modules);
  } catch (error) {
    logger.error('Erreur lors de la récupération des modules:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;