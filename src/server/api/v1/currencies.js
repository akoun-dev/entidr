'use strict';

const express = require('express');
const router = express.Router();
const currencyController = require('../../controllers/currencyController');

router.get('/', currencyController.getAllCurrencies);
router.post('/', currencyController.createCurrency);
router.get('/:id', currencyController.getCurrencyById);
router.put('/:id', currencyController.updateCurrency);
router.delete('/:id', currencyController.deleteCurrency);

module.exports = router;
