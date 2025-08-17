const express = require('express');
const router = express.Router();
const LoggingSettingController = require('../controllers/LoggingSettingController');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes pour la configuration des logs
router.get('/',
  authenticate,
  authorize('admin'),
  LoggingSettingController.list
);

router.get('/categories',
  authenticate,
  authorize('admin'),
  LoggingSettingController.getCategories
);

router.get('/:key',
  authenticate,
  authorize('admin'),
  LoggingSettingController.getByKey
);

router.put('/:key',
  authenticate,
  authorize('admin'),
  LoggingSettingController.update
);

module.exports = router;
