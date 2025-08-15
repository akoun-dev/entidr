const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// Route pour récupérer tous les modules
router.get('/', moduleController.getAllModules);

// Route pour activer/désactiver un module
router.put('/:name/status', moduleController.toggleModuleStatus);

// Route pour installer un module
router.post('/:name/install', moduleController.installModule);

// Route pour désinstaller un module
router.post('/:name/uninstall', moduleController.uninstallModule);

module.exports = router;
