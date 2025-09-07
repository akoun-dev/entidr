'use strict';

const express = require('express');
const router = express.Router();
const { ApiKey } = require('../../../models');
const logger = require('../../../utils/logger.server');
const { authenticate, authorize } = require('../../middlewares/auth');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Helper: mask key
const mask = (key) => ApiKey.maskKey(key);

// GET /apikeys (masked keys)
const skipAuth = process.env.NODE_ENV !== 'production' && process.env.ALLOW_PUBLIC_APIKEYS !== 'false';
if (skipAuth) {
  router.get('/apikeys', asyncHandler(async (req, res) => {
    const items = await ApiKey.findAll({ order: [['createdAt', 'DESC']] });
    const masked = items.map(k => ({ ...k.get({ plain: true }), key: mask(k.key) }));
    res.ok(masked);
  }));
} else {
  router.get('/apikeys', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
    const items = await ApiKey.findAll({ order: [['createdAt', 'DESC']] });
    const masked = items.map(k => ({ ...k.get({ plain: true }), key: mask(k.key) }));
    res.ok(masked);
  }));
}

// POST /apikeys (returns full key once)
router.post('/apikeys', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const { name, permissions = ['read'], description = null, active = true, expires_at = null } = req.body || {};
  const created = await ApiKey.create({ name, permissions, description, active, expires_at });
  const plain = created.get({ plain: true });
  // Log sans afficher la clé complète
  logger.info(`API key created id=${plain.id} name=${plain.name}`);
  res.ok({ ...plain, key: created.key }, 201);
}));

// PATCH /apikeys/:id (partial update)
router.patch('/apikeys/:id', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await ApiKey.findByPk(req.params.id);
  if (!item) return res.fail(404, 'API Key not found');
  const { name, permissions, description, active, expires_at } = req.body || {};
  await item.update({
    name: name ?? item.name,
    permissions: permissions ?? item.permissions,
    description: description !== undefined ? description : item.description,
    active: active !== undefined ? !!active : item.active,
    expires_at: expires_at !== undefined ? expires_at : item.expires_at
  });
  const plain = item.get({ plain: true });
  res.ok({ ...plain, key: mask(item.key) });
}));

// DELETE /apikeys/:id
router.delete('/apikeys/:id', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await ApiKey.findByPk(req.params.id);
  if (!item) return res.fail(404, 'API Key not found');
  await item.destroy();
  logger.info(`API key deleted id=${req.params.id}`);
  res.ok(null, 204);
}));

// PATCH /apikeys/:id/toggle
router.patch('/apikeys/:id/toggle', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await ApiKey.findByPk(req.params.id);
  if (!item) return res.fail(404, 'API Key not found');
  await item.update({ active: !item.active });
  const plain = item.get({ plain: true });
  logger.info(`API key toggled id=${plain.id} active=${item.active}`);
  res.ok({ ...plain, active: item.active });
}));

// POST /apikeys/:id/regenerate (returns new full key once)
router.post('/apikeys/:id/regenerate', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await ApiKey.findByPk(req.params.id);
  if (!item) return res.fail(404, 'API Key not found');
  // regenerate
  const newKey = ApiKey.generateKey();
  await item.update({ key: newKey });
  const plain = item.get({ plain: true });
  logger.warn(`API key regenerated id=${plain.id}`);
  res.ok({ ...plain, key: newKey });
}));

module.exports = router;
