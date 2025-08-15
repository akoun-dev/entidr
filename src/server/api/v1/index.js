'use strict';

const express = require('express');
const router = express.Router();

const users = require('./users');
const groups = require('./groups');
const parameters = require('./parameters');
const modules = require('./modules');
const documentlayouts = require('./documentlayouts');
const reporttemplates = require('./reporttemplates');
const currencies = require('./currencies');
const countries = require('./countries');
const timeformats = require('./timeformats');
const dateformats = require('./dateformats');

router.use('/users', users);
router.use('/groups', groups);
router.use('/parameters', parameters);
router.use('/modules', modules);
router.use('/documentlayouts', documentlayouts);
router.use('/reporttemplates', reporttemplates);
router.use('/currencies', currencies);
router.use('/countries', countries);
router.use('/timeformats', timeformats);
router.use('/dateformats', dateformats);

module.exports = router;
