const express = require('express');
const router = express.Router();
const ApiKeyController = require('../controllers/ApiKeyController');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes pour la gestion des API Keys
router.get('/',
  authenticate,
  authorize('admin'),
  ApiKeyController.list
);

router.post('/',
  authenticate,
  authorize('admin'),
  ApiKeyController.create
);

router.get('/:id',
  authenticate,
  authorize('admin'),
  ApiKeyController.get
);

router.put('/:id',
  authenticate,
  authorize('admin'),
  ApiKeyController.update
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  ApiKeyController.delete
);

module.exports = router;
