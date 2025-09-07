'use strict';

const express = require('express');
const router = express.Router();
const { Backup, BackupConfig } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function backupDto(b) {
  return {
    id: String(b.id),
    type: b.type || 'full',
    status: b.status || 'completed',
    timestamp: b.timestamp || b.createdAt,
    size: b.size || null,
    location: b.location || null,
    error: b.error || null
  };
}

async function getOrCreateConfig() {
  let cfg = await BackupConfig.findOne();
  if (!cfg) {
    cfg = await BackupConfig.create({});
  }
  return cfg;
}

// GET /backups - list backups
router.get('/backups', asyncHandler(async (req, res) => {
  const items = await Backup.findAll({ order: [['timestamp', 'DESC']] });
  res.json(items.map(backupDto));
}));

// GET /backupconfig - get config
router.get('/backupconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreateConfig();
  res.json(cfg);
}));

// PUT /backupconfig - update config
router.put('/backupconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreateConfig();
  await cfg.update(req.body || {});
  res.json(cfg);
}));

module.exports = router;
