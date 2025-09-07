'use strict';

const express = require('express');
const router = express.Router();
const {
  getCountries,
  getCurrencies,
  getPaymentProviders,
  getWorkflows,
  getCompanySettings,
  getSecuritySettings
} = require('../../controllers/settingsController');

// Routes pour les paramètres
router.get('/countries', getCountries);
router.get('/currencies', getCurrencies);
router.get('/paymentproviders', getPaymentProviders);
router.get('/workflows', getWorkflows);
router.get('/company', getCompanySettings);
router.get('/security-settings', getSecuritySettings);

module.exports = router;
