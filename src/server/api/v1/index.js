'use strict';

const express = require('express');
const router = express.Router();

const users = require('./users');
const groups = require('./groups');
const parameters = require('./parameters');
const modules = require('./modules');
const documentlayouts = require('./documentlayouts');
const reporttemplates = require('./reporttemplates');
const printers = require('./printers');
const paymentproviders = require('./paymentproviders');
const shippingmethods = require('./shippingmethods');
const company = require('./company');
const settings = require('./settings');
const settingsCtrl = require('../../controllers/settingsController');
// Use v1 external services router with public GETs
const externalServicesV1 = require('./externalservices');
const workflowDefinitions = require('../../routes/workflowDefinitions');
const workflowsV1 = require('./workflows');
const securitySettings = require('./securitySettings');
const notifications = require('./notifications');
const automationrules = require('./automationrules');
const sequences = require('./sequences');
const backups = require('./backups');
const compliance = require('./compliance');
const importexport = require('./importexport');
const performance = require('./performance');
const appearance = require('./appearance');
const reference = require('./reference');
const logging = require('./logging');
const dateformats = require('./dateformats');

router.use('/users', users);
router.use('/groups', groups);
router.use('/parameters', parameters);
router.use('/modules', modules);
router.use('/documentlayouts', documentlayouts);
router.use('/reporttemplates', reporttemplates);
router.use('/printers', printers);
router.use('/paymentproviders', paymentproviders);
router.use('/shippingmethods', shippingmethods);
router.use('/companies', company);
router.use('/company', company); // Route alternative pour compatibilité
router.use('/settings', settings);
// Aliases for reference data (front expects top-level)
router.get('/countries', settingsCtrl.getCountries);
router.get('/currencies', settingsCtrl.getCurrencies);
router.use('/external-services', externalServicesV1);
router.use('/workflow-definitions', workflowDefinitions);
router.use('/security-settings', securitySettings);
router.use('/notifications', notifications);
router.use('/automationrules', automationrules);
router.use('/', sequences);
router.use('/', backups);
router.use('/', compliance);
router.use('/', importexport);
router.use('/', performance);
router.use('/', appearance);
router.use('/', reference);
router.use('/', logging);
router.use('/', dateformats);

// Routes alternatives pour compatibilité
router.use('/externalservices', externalServicesV1);
// Expose public GETs for workflows
router.use('/workflows', workflowsV1);

module.exports = router;
