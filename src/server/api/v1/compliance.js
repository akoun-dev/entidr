'use strict';

const express = require('express');
const router = express.Router();
const { ComplianceConfig, ConsentRecord } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function getOrCreateCompliance() {
  let cfg = await ComplianceConfig.findOne();
  if (!cfg) {
    cfg = await ComplianceConfig.create({});
  }
  return cfg;
}

// GET /complianceconfig - get config
router.get('/complianceconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreateCompliance();
  res.json(cfg);
}));

// PUT /complianceconfig - update config
router.put('/complianceconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreateCompliance();
  await cfg.update(req.body || {});
  res.json(cfg);
}));

// GET /consentrecords - list consent records
router.get('/consentrecords', asyncHandler(async (req, res) => {
  const items = await ConsentRecord.findAll({ order: [['consentDate', 'DESC']] });
  res.json(items);
}));

module.exports = router;

