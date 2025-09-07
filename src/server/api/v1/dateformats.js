'use strict';

const express = require('express');
const router = express.Router();
const { DateFormat } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function toDto(df) {
  return {
    id: String(df.id),
    name: df.name,
    format: df.format,
    description: df.description || '',
    type: df.type,
    is_default: !!df.is_default,
    active: !!df.active
  };
}

// GET /dateformats
router.get('/dateformats', asyncHandler(async (req, res) => {
  const items = await DateFormat.findAll({ order: [['type', 'ASC'], ['name', 'ASC']] });
  res.json(items.map(toDto));
}));

// GET /dateformats/:id
router.get('/dateformats/:id', asyncHandler(async (req, res) => {
  const item = await DateFormat.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Format introuvable' });
  res.json(toDto(item));
}));

// POST /dateformats
router.post('/dateformats', asyncHandler(async (req, res) => {
  const { name, format, description, type, is_default, active } = req.body || {};
  if (!name || !format) return res.status(400).json({ message: 'name et format sont requis' });
  const created = await DateFormat.create({
    name,
    format,
    description: description || null,
    type: type || 'date',
    is_default: !!is_default,
    active: active !== undefined ? !!active : true
  });
  // If set default, unset others of same type
  if (created.is_default) {
    await DateFormat.update({ is_default: false }, { where: { type: created.type, id: { [DateFormat.sequelize.Sequelize.Op.ne]: created.id } } });
  }
  res.status(201).json(toDto(created));
}));

// PUT /dateformats/:id
router.put('/dateformats/:id', asyncHandler(async (req, res) => {
  const item = await DateFormat.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Format introuvable' });
  const { name, format, description, type, is_default, active } = req.body || {};
  if (name !== undefined) item.name = name;
  if (format !== undefined) item.format = format;
  if (description !== undefined) item.description = description;
  if (type !== undefined) item.type = type;
  if (active !== undefined) item.active = !!active;
  if (is_default !== undefined) item.is_default = !!is_default;
  await item.save();
  if (item.is_default) {
    await DateFormat.update({ is_default: false }, { where: { type: item.type, id: { [DateFormat.sequelize.Sequelize.Op.ne]: item.id } } });
  }
  res.json(toDto(item));
}));

// DELETE /dateformats/:id
router.delete('/dateformats/:id', asyncHandler(async (req, res) => {
  const item = await DateFormat.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Format introuvable' });
  await item.destroy();
  res.status(204).end();
}));

// PATCH /dateformats/:id/toggle-status
router.patch('/dateformats/:id/toggle-status', asyncHandler(async (req, res) => {
  const item = await DateFormat.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Format introuvable' });
  item.active = !item.active;
  await item.save();
  res.json(toDto(item));
}));

// PATCH /dateformats/:id/set-default
router.patch('/dateformats/:id/set-default', asyncHandler(async (req, res) => {
  const item = await DateFormat.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Format introuvable' });
  item.is_default = true;
  await item.save();
  await DateFormat.update({ is_default: false }, { where: { type: item.type, id: { [DateFormat.sequelize.Sequelize.Op.ne]: item.id } } });
  res.json(toDto(item));
}));

module.exports = router;

