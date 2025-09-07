'use strict';

const express = require('express');
const router = express.Router();
const { Sequence, SequenceConfig } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function sequenceDto(s) {
  return {
    id: String(s.id),
    name: s.name,
    prefix: s.prefix || '',
    suffix: s.suffix || '',
    nextNumber: s.nextNumber,
    padding: s.padding,
    resetFrequency: s.resetFrequency,
    documentType: s.documentType,
    lastReset: s.lastReset,
    active: !!s.active
  };
}

async function getOrCreateConfig() {
  let cfg = await SequenceConfig.findOne();
  if (!cfg) {
    cfg = await SequenceConfig.create({
      fiscalYearStart: '01-01',
      fiscalYearEnd: '12-31',
      defaultFormat: 'prefix-number-year',
      defaultPadding: 5,
      autoReset: true
    });
  }
  return cfg;
}

// GET /sequences - list all sequences
router.get('/sequences', asyncHandler(async (req, res) => {
  const items = await Sequence.findAll({ order: [['name', 'ASC']] });
  res.ok(items.map(sequenceDto));
}));

// POST /sequences/:id/reset - reset a sequence
router.post('/sequences/:id/reset', asyncHandler(async (req, res) => {
  const s = await Sequence.findByPk(req.params.id);
  if (!s) return res.fail(404, 'Séquence introuvable');

  s.nextNumber = 1;
  s.lastReset = new Date();
  await s.save();
  res.ok(sequenceDto(s));
}));

// GET /sequenceconfig - get global config (create default if missing)
router.get('/sequenceconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreateConfig();
  res.ok({
    fiscalYearStart: cfg.fiscalYearStart,
    fiscalYearEnd: cfg.fiscalYearEnd,
    defaultFormat: cfg.defaultFormat,
    defaultPadding: cfg.defaultPadding,
    autoReset: !!cfg.autoReset,
    advancedSettings: cfg.advancedSettings || null
  });
}));

// PUT /sequenceconfig - update global config
router.put('/sequenceconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreateConfig();
  const { fiscalYearStart, fiscalYearEnd, defaultFormat, defaultPadding, autoReset, advancedSettings } = req.body || {};
  if (fiscalYearStart !== undefined) cfg.fiscalYearStart = fiscalYearStart;
  if (fiscalYearEnd !== undefined) cfg.fiscalYearEnd = fiscalYearEnd;
  if (defaultFormat !== undefined) cfg.defaultFormat = defaultFormat;
  if (defaultPadding !== undefined) cfg.defaultPadding = defaultPadding;
  if (autoReset !== undefined) cfg.autoReset = !!autoReset;
  if (advancedSettings !== undefined) cfg.advancedSettings = advancedSettings;
  await cfg.save();
  res.ok({
    fiscalYearStart: cfg.fiscalYearStart,
    fiscalYearEnd: cfg.fiscalYearEnd,
    defaultFormat: cfg.defaultFormat,
    defaultPadding: cfg.defaultPadding,
    autoReset: !!cfg.autoReset,
    advancedSettings: cfg.advancedSettings || null
  });
}));

module.exports = router;
