const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/AuditLogController');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes pour les logs d'audit (lecture seule)
router.get('/',
  authenticate,
  authorize('admin'),
  AuditLogController.list
);

router.get('/:id',
  authenticate,
  authorize('admin'),
  AuditLogController.get
);

module.exports = router;
