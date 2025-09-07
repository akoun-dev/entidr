'use strict';

const express = require('express');
const router = express.Router();
const { LoggingSetting } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const KEYS = ['level', 'retentionDays', 'consoleOutput', 'fileOutput', 'filePath'];
const DEFAULTS = {
  level: 'info',
  retentionDays: '30',
  consoleOutput: 'true',
  fileOutput: 'false',
  filePath: ''
};

function toConfig(rows) {
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    level: (map.level || DEFAULTS.level),
    retentionDays: parseInt(map.retentionDays || DEFAULTS.retentionDays, 10),
    consoleOutput: (map.consoleOutput || DEFAULTS.consoleOutput) === 'true',
    fileOutput: (map.fileOutput || DEFAULTS.fileOutput) === 'true',
    filePath: map.filePath || DEFAULTS.filePath
  };
}

async function ensureDefaults() {
  const rows = await LoggingSetting.findAll({ where: { key: KEYS } });
  const existing = new Set(rows.map(r => r.key));
  const toCreate = KEYS.filter(k => !existing.has(k)).map(key => ({
    key,
    value: DEFAULTS[key],
    valueType: key.endsWith('Days') ? 'number' : (key.includes('Output') ? 'boolean' : 'string'),
    category: 'logging'
  }));
  if (toCreate.length) await LoggingSetting.bulkCreate(toCreate);
}

// GET /logging-settings
router.get('/logging-settings', asyncHandler(async (req, res) => {
  await ensureDefaults();
  const rows = await LoggingSetting.findAll({ where: { key: KEYS } });
  res.json(toConfig(rows));
}));

// PATCH /logging-settings
router.patch('/logging-settings', asyncHandler(async (req, res) => {
  await ensureDefaults();
  const payload = req.body || {};
  for (const key of KEYS) {
    if (payload[key] !== undefined) {
      const value = String(payload[key]);
      await LoggingSetting.upsert({ key, value, valueType: typeof payload[key], category: 'logging' });
    }
  }
  const rows = await LoggingSetting.findAll({ where: { key: KEYS } });
  res.json(toConfig(rows));
}));

module.exports = router;

