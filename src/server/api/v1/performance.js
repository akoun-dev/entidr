'use strict';

const express = require('express');
const router = express.Router();
const { PerformanceConfig } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function getOrCreate() {
  let cfg = await PerformanceConfig.findOne();
  if (!cfg) cfg = await PerformanceConfig.create({});
  return cfg;
}

// GET /performanceconfig
router.get('/performanceconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate();
  res.json(cfg);
}));

// PUT /performanceconfig
router.put('/performanceconfig', asyncHandler(async (req, res) => {
  const cfg = await getOrCreate();
  await cfg.update(req.body || {});
  res.json(cfg);
}));

module.exports = router;

// Below: simple metrics endpoint for the settings UI
const os = require('os');

function buildMetrics() {
  const cores = os.cpus()?.length || 1;
  const load = os.loadavg();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = totalMem ? (usedMem / totalMem) * 100 : 0;

  return {
    cpu: {
      usage: Math.min(100, Math.max(0, (load[0] / cores) * 100)),
      cores,
      load
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usage: memUsage
    },
    disk: {
      total: 0,
      used: 0,
      free: 0,
      usage: 0
    },
    network: {
      inbound: 0,
      outbound: 0,
      connections: 0
    },
    database: {
      connections: 0,
      queryTime: 0,
      slowQueries: 0
    },
    api: {
      requests: 0,
      responseTime: 0,
      errors: 0
    },
    timestamp: new Date().toISOString()
  };
}

router.get('/performancemetrics', asyncHandler(async (req, res) => {
  res.json(buildMetrics());
}));
