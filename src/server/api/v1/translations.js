'use strict';

const express = require('express');
const router = express.Router();
const { Translation, sequelize } = require('../../../models');
const logger = require('../../../utils/logger.server');
const { Op } = require('sequelize');
const { authenticate, authorize } = require('../../middlewares/auth');
const { zodValidate, z } = require('../../middlewares/zodValidate');

const validateCreate = (req, res, next) => {
  const { key, locale, namespace, value } = req.body || {};
  if (!key || typeof key !== 'string') return res.fail(400, 'Validation error: key is required');
  if (!locale || !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) return res.fail(400, 'Validation error: locale must be like fr or fr-FR');
  if (namespace && typeof namespace !== 'string') return res.fail(400, 'Validation error: namespace must be a string');
  if (!value || typeof value !== 'string') return res.fail(400, 'Validation error: value is required');
  next();
};

const validateUpdate = (req, res, next) => {
  const { locale } = req.body || {};
  if (locale && !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) return res.fail(400, 'Validation error: locale must be like fr or fr-FR');
  next();
};

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /translations
router.get('/translations', asyncHandler(async (req, res) => {
  const items = await Translation.findAll({ order: [['key', 'ASC']] });
  res.ok(items);
}));

// GET /translations/:id
router.get('/translations/:id', asyncHandler(async (req, res) => {
  const item = await Translation.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Translation not found');
  res.ok(item);
}));

// GET /translations/locale/:locale
router.get('/translations/locale/:locale', asyncHandler(async (req, res) => {
  const { locale } = req.params;
  const items = await Translation.findAll({ where: { locale } });
  // Shape: { [namespace]: { [key]: value } }
  const map = {};
  for (const t of items) {
    const ns = t.namespace || 'common';
    map[ns] = map[ns] || {};
    map[ns][t.key] = t.value;
  }
  res.ok(map);
}));

// GET /translations/key/:key
router.get('/translations/key/:key', asyncHandler(async (req, res) => {
  const items = await Translation.findAll({ where: { key: req.params.key } });
  res.ok(items);
}));

// GET /translations/namespace/:namespace
router.get('/translations/namespace/:namespace', asyncHandler(async (req, res) => {
  const items = await Translation.findAll({ where: { namespace: req.params.namespace } });
  res.ok(items);
}));

// POST /translations
router.post(
  '/translations',
  authenticate, authorize(['admin']),
  zodValidate(z.object({
    key: z.string().min(1),
    locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/),
    namespace: z.string().min(1).optional(),
    value: z.string().min(1),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
    description: z.string().optional().nullable(),
  })),
  asyncHandler(async (req, res) => {
    const { key, locale, namespace = 'common', value, is_default = false, active = true, description = null } = req.body || {};
    const t = await sequelize.transaction();
    try {
      const created = await Translation.create({ key, locale, namespace, value, is_default, active, description }, { transaction: t });
      if (created.is_default) {
        await Translation.update({ is_default: false }, { where: { id: { [Op.ne]: created.id }, key: created.key, namespace: created.namespace }, transaction: t });
      }
      await t.commit();
      logger.info(`Translation created id=${created.id} key=${created.key} ns=${created.namespace}`);
      res.ok(created, 201);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  })
);

// PUT /translations/:id
router.put(
  '/translations/:id',
  authenticate, authorize(['admin']),
  zodValidate(z.object({
    key: z.string().min(1).optional(),
    locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/).optional(),
    namespace: z.string().min(1).optional(),
    value: z.string().min(1).optional(),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
    description: z.string().optional().nullable(),
  })),
  asyncHandler(async (req, res) => {
    const item = await Translation.findByPk(req.params.id);
    if (!item) return res.fail(404, 'Translation not found');
    const t = await sequelize.transaction();
    try {
      const { key, locale, namespace, value, is_default, active, description } = req.body || {};
      await item.update({
        key: key ?? item.key,
        locale: locale ?? item.locale,
        namespace: namespace ?? item.namespace,
        value: value ?? item.value,
        is_default: is_default !== undefined ? !!is_default : item.is_default,
        active: active !== undefined ? !!active : item.active,
        description: description !== undefined ? description : item.description
      }, { transaction: t });
      if (item.is_default) {
        await Translation.update({ is_default: false }, { where: { id: { [Op.ne]: item.id }, key: item.key, namespace: item.namespace }, transaction: t });
      }
      await t.commit();
      logger.info(`Translation updated id=${item.id}`);
      res.ok(item);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  })
);

// DELETE /translations/:id
router.delete('/translations/:id', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await Translation.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Translation not found');
  await item.destroy();
  logger.warn(`Translation deleted id=${item.id}`);
  res.ok(null, 204);
}));

// PATCH /translations/:id/toggle-status
router.patch('/translations/:id/toggle-status', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await Translation.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Translation not found');
  await item.update({ active: !item.active });
  logger.info(`Translation toggled id=${item.id} active=${item.active}`);
  res.ok(item);
}));

// PATCH /translations/:id/set-default
router.patch('/translations/:id/set-default', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await Translation.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Translation not found');
  await Translation.update({ is_default: false }, { where: { key: item.key, namespace: item.namespace } });
  await item.update({ is_default: true });
  logger.info(`Translation set-default id=${item.id}`);
  res.ok(item);
}));

module.exports = router;
