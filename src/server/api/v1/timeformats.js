'use strict';

const express = require('express');
const router = express.Router();
const timeFormatController = require('../../controllers/timeFormatController');

router.get('/', timeFormatController.getAllTimeFormats);
router.post('/', timeFormatController.createTimeFormat);
router.get('/:id', timeFormatController.getTimeFormatById);
router.put('/:id', timeFormatController.updateTimeFormat);
router.delete('/:id', timeFormatController.deleteTimeFormat);

module.exports = router;
