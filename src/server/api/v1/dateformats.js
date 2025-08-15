'use strict';

const express = require('express');
const router = express.Router();
const dateFormatController = require('../../controllers/dateFormatController');

router.get('/', dateFormatController.getAllDateFormats);
router.post('/', dateFormatController.createDateFormat);
router.get('/:id', dateFormatController.getDateFormatById);
router.put('/:id', dateFormatController.updateDateFormat);
router.delete('/:id', dateFormatController.deleteDateFormat);

module.exports = router;
