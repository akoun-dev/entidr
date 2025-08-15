'use strict';

const express = require('express');
const router = express.Router();

const users = require('./users');
const groups = require('./groups');
const parameters = require('./parameters');
const modules = require('./modules');

router.use('/users', users);
router.use('/groups', groups);
router.use('/parameters', parameters);
router.use('/modules', modules);

module.exports = router;
