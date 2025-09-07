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

// Languages
router.get('/languages', asyncHandler(async (req, res) => {
  const items = await Language.findAll({ order: [['name', 'ASC']] });
  res.ok(items);
}));

// Translations
router.get('/translations', asyncHandler(async (req, res) => {
  const items = await Translation.findAll({ order: [['key', 'ASC']] });
  res.ok(items);
}));

// API Keys (read-only for settings screen)
router.get('/apikeys', asyncHandler(async (req, res) => {
  const items = await ApiKey.findAll({ order: [['createdAt', 'DESC']] });
  // Mask key if present
  const masked = items.map(k => ({
    ...k.get({ plain: true }),
    key: k.key ? `${k.key.slice(0,4)}****${k.key.slice(-4)}` : ''
  }));
  res.ok(masked);
}));

// Email servers (read-only list)
router.get('/emailservers', asyncHandler(async (req, res) => {
  const items = await EmailServer.findAll({ order: [['createdAt', 'DESC']] });
  res.ok(items);
}));

module.exports = router;
