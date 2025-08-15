'use strict';

const express = require('express');
const router = express.Router();
const documentLayoutController = require('../../controllers/documentLayoutController');

router.get('/', documentLayoutController.getAllDocumentLayouts);
router.post('/', documentLayoutController.createDocumentLayout);
router.get('/:id', documentLayoutController.getDocumentLayoutById);
router.put('/:id', documentLayoutController.updateDocumentLayout);
router.delete('/:id', documentLayoutController.deleteDocumentLayout);

module.exports = router;
