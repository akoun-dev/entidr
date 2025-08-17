const express = require('express');
const router = express.Router();
const SecuritySettingController = require('../controllers/SecuritySettingController');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes pour la configuration de sécurité
router.get('/',
  authenticate,
  authorize('admin'),
  SecuritySettingController.list
);

router.get('/categories',
  authenticate,
  authorize('admin'),
  SecuritySettingController.getCategories
);

router.get('/:key',
  authenticate,
  authorize('admin'),
  SecuritySettingController.getByKey
);

router.put('/:key',
  authenticate,
  authorize('admin'),
  SecuritySettingController.update
);

module.exports = router;
