'use strict';

const express = require('express');
const router = express.Router();
const { ThemeConfig, CalendarConfig } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function getOrCreate(model) {
  let cfg = await model.findOne();
  if (!cfg) cfg = await model.create({});
  return cfg;
}

// Theme config
router.get('/themeconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate(ThemeConfig);
  res.json(cfg);
}));

router.put('/themeconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate(ThemeConfig);
  await cfg.update(req.body || {});
  res.json(cfg);
}));

// Calendar config
router.get('/calendarconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate(CalendarConfig);
  res.json(cfg);
}));

router.put('/calendarconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate(CalendarConfig);
  await cfg.update(req.body || {});
  res.json(cfg);
}));

module.exports = router;

