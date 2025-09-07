'use strict';

const express = require('express');
const router = express.Router();
const { Holiday, Language, Translation, ApiKey, EmailServer } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Holidays
router.get('/holidays', asyncHandler(async (req, res) => {
  const items = await Holiday.findAll({ order: [['date', 'ASC']] });
  res.ok(items);
}));

// Note: GET endpoints for languages, translations, apikeys, emailservers
// are now handled by dedicated routers under /api/v1. Keeping only holidays here.

module.exports = router;
