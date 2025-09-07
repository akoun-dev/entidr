'use strict';

const express = require('express');
const router = express.Router();
const { ExternalService } = require('../../../models');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function toDto(svc) {
  return {
    id: String(svc.id),
    name: svc.name,
    type: svc.type,
    apiKey: svc.apiKey,
    isActive: !!svc.isActive,
    mode: svc.mode,
    lastSyncStatus: svc.lastSyncStatus || null,
    lastSyncDate: svc.lastSyncDate || null,
    lastModified: svc.updatedAt
  };
}

// Public GET endpoints (no auth) returning raw arrays/objects
router.get('/', asyncHandler(async (req, res) => {
  const items = await ExternalService.findAll({ order: [['name', 'ASC']] });
  res.json(items.map(toDto));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const svc = await ExternalService.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ message: 'Service externe non trouvé' });
  res.json(toDto(svc));
}));

// Create (protected)
router.post('/', authenticate, authorize(['admin']), validate(), asyncHandler(async (req, res) => {
  const { name, type, apiKey, isActive, mode } = req.body;
  if (!name || !type || !apiKey) {
    return res.status(400).json({ message: 'name, type et apiKey sont requis' });
  }
  const svc = await ExternalService.create({
    name,
    type,
    apiKey,
    isActive: isActive !== undefined ? !!isActive : true,
    mode: mode || 'test'
  });
  res.status(201).json(toDto(svc));
}));

// Toggle active (public for settings use)
router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const svc = await ExternalService.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ message: 'Service externe non trouvé' });
  svc.isActive = !svc.isActive;
  await svc.save();
  res.json(toDto(svc));
}));

// Sync (stub) (public for settings use)
router.post('/:id/sync', asyncHandler(async (req, res) => {
  const svc = await ExternalService.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ message: 'Service externe non trouvé' });
  svc.lastSyncStatus = 'success';
  svc.lastSyncDate = new Date();
  await svc.save();
  res.json(toDto(svc));
}));

// Update (protected)
router.put('/:id', authenticate, authorize(['admin']), validate(), asyncHandler(async (req, res) => {
  const svc = await ExternalService.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ message: 'Service externe non trouvé' });
  const { name, type, apiKey, isActive, mode } = req.body;
  svc.name = name ?? svc.name;
  svc.type = type ?? svc.type;
  svc.apiKey = apiKey ?? svc.apiKey;
  if (isActive !== undefined) svc.isActive = !!isActive;
  if (mode) svc.mode = mode;
  await svc.save();
  res.json(toDto(svc));
}));

// Delete (protected)
router.delete('/:id', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const svc = await ExternalService.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ message: 'Service externe non trouvé' });
  await svc.destroy();
  res.status(204).end();
}));

module.exports = router;
