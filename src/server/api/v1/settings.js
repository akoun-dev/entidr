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
// Wrap to enforce { data, error }
const wrap = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    // If controller wrote the response, skip
    if (res.headersSent) return;
    res.ok(result);
  } catch (e) { next(e); }
};

router.get('/countries', wrap(getCountries));
router.get('/currencies', wrap(getCurrencies));
router.get('/paymentproviders', wrap(getPaymentProviders));
router.get('/workflows', wrap(getWorkflows));
router.get('/company', wrap(getCompanySettings));
router.get('/security-settings', wrap(getSecuritySettings));

module.exports = router;
