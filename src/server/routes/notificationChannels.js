const express = require('express');
const router = express.Router();
const NotificationChannelController = require('../controllers/NotificationChannelController');
const { authenticate, authorize } = require('../middlewares/auth');

// Routes pour la gestion des canaux de notification
router.get('/',
  authenticate,
  authorize('admin'),
  NotificationChannelController.list
);

router.post('/',
  authenticate,
  authorize('admin'),
  NotificationChannelController.create
);

router.put('/:id',
  authenticate,
  authorize('admin'),
  NotificationChannelController.update
);

router.delete('/:id',
  authenticate,
  authorize('admin'),
  NotificationChannelController.delete
);

module.exports = router;
