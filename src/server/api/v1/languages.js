'use strict';

const express = require('express');
const router = express.Router();
const languageController = require('../../controllers/languageController');

router.get('/', languageController.getAllLanguages);
router.post('/', languageController.createLanguage);
router.get('/:id', languageController.getLanguageById);
router.put('/:id', languageController.updateLanguage);
router.delete('/:id', languageController.deleteLanguage);
router.post('/:id/toggle-status', languageController.toggleStatus);
router.post('/:id/set-default', languageController.setDefault);

module.exports = router;
