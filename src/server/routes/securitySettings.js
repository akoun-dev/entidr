const express = require('express');
const router = express.Router();
const SecuritySettingController = require('../controllers/SecuritySettingController');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes pour la configuration de sécurité
// Lecture publique des paramètres (lecture seule)
router.get('/', SecuritySettingController.list);

router.get('/categories', SecuritySettingController.getCategories);

router.get('/:key', SecuritySettingController.getByKey);

router.put('/:key',
  authenticate,
  authorize('admin'),
  SecuritySettingController.update
);

module.exports = router;
