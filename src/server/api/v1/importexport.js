'use strict';

const express = require('express');
const router = express.Router();
const { ImportConfig, ExportConfig, ImportExportHistory } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function getOrCreate(model, defaults = {}) {
  let cfg = await model.findOne();
  if (!cfg) cfg = await model.create(defaults);
  return cfg;
}

// GET /importconfig
router.get('/importconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate(ImportConfig);
  res.json(cfg);
}));

// PUT /importconfig
router.put('/importconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate(ImportConfig);
  await cfg.update(req.body || {});
  res.json(cfg);
}));

// GET /exportconfig
router.get('/exportconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate(ExportConfig);
  res.json(cfg);
}));

// PUT /exportconfig
router.put('/exportconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate(ExportConfig);
  await cfg.update(req.body || {});
  res.json(cfg);
}));

// GET /importexporthistory
router.get('/importexporthistory', asyncHandler(async (req, res) => {
  const items = await ImportExportHistory.findAll({ order: [['timestamp', 'DESC']] });
  res.json(items);
}));

module.exports = router;

