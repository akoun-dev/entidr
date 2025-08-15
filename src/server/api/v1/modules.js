'use strict';

const express = require('express');
const router = express.Router();
const moduleController = require('../../controllers/moduleController');

// Route pour récupérer tous les modules
router.get('/', moduleController.getAllModules);

// Route pour récupérer un module par son nom
router.get('/:name', moduleController.getModuleByName);

module.exports = router;
