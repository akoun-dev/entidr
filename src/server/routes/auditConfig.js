const express = require('express');
const router = express.Router();
const AuditConfigController = require('../controllers/AuditConfigController');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes pour la configuration d'audit
router.get('/',
  authenticate,
  authorize('admin'),
  AuditConfigController.get
);

router.put('/',
  authenticate,
  authorize('admin'),
  AuditConfigController.update
);

module.exports = router;
