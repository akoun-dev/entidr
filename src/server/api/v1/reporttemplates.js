'use strict';

const express = require('express');
const router = express.Router();
const reportTemplateController = require('../../controllers/reportTemplateController');

router.get('/', reportTemplateController.getAllReportTemplates);
router.post('/', reportTemplateController.createReportTemplate);
router.get('/:id', reportTemplateController.getReportTemplateById);
router.put('/:id', reportTemplateController.updateReportTemplate);
router.delete('/:id', reportTemplateController.deleteReportTemplate);

module.exports = router;
