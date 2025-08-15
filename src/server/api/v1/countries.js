'use strict';

const express = require('express');
const router = express.Router();
const countryController = require('../../controllers/countryController');

router.get('/', countryController.getAllCountries);
router.post('/', countryController.createCountry);
router.get('/:id', countryController.getCountryById);
router.put('/:id', countryController.updateCountry);
router.delete('/:id', countryController.deleteCountry);

module.exports = router;
