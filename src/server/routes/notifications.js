const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate } = require('../middlewares/auth');

// Routes pour les notifications
router.get('/',
  authenticate,
  NotificationController.list
);

router.get('/:id',
  authenticate,
  NotificationController.get
);

router.put('/:id/read',
  authenticate,
  NotificationController.markAsRead
);

module.exports = router;
