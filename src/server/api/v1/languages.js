'use strict';

const express = require('express');
const router = express.Router();
const { Language, sequelize } = require('../../../models');
const logger = require('../../../utils/logger.server');
const { Op } = require('sequelize');
const { authenticate, authorize } = require('../../middlewares/auth');
const { zodValidate, z } = require('../../middlewares/zodValidate');

const validateCreate = (req, res, next) => {
  const { name, code, direction } = req.body || {};
  if (!name || typeof name !== 'string') return res.fail(400, 'Validation error: name is required');
  if (!code || !/^[a-z]{2}(-[A-Z]{2})?$/.test(code)) return res.fail(400, 'Validation error: code must be like fr or fr-FR');
  if (direction && !['ltr', 'rtl'].includes(direction)) return res.fail(400, 'Validation error: direction must be ltr or rtl');
  next();
};

const validateUpdate = (req, res, next) => {
  const { direction } = req.body || {};
  if (direction && !['ltr', 'rtl'].includes(direction)) return res.fail(400, 'Validation error: direction must be ltr or rtl');
  next();
};

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @swagger
 * /languages:
 *   get:
 *     summary: Liste des langues
 *     tags: [Languages]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Language'
 *                 error:
 *                   nullable: true
 */
// GET /languages
router.get('/languages', asyncHandler(async (req, res) => {
  const items = await Language.findAll({ order: [['name', 'ASC']] });
  res.ok(items);
}));

// GET /languages/:id
router.get('/languages/:id', asyncHandler(async (req, res) => {
  const item = await Language.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Language not found');
  res.ok(item);
}));

// POST /languages
router.post(
  '/languages',
  authenticate, authorize(['admin']),
  zodValidate(z.object({
    name: z.string().min(1),
    code: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/),
    native_name: z.string().optional().nullable(),
    direction: z.enum(['ltr', 'rtl']).optional(),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
  })),
  asyncHandler(async (req, res) => {
    const payload = (({ name, code, native_name, direction, is_default, active }) => ({ name, code, native_name, direction, is_default, active }))(req.body || {});
    const t = await sequelize.transaction();
    try {
      const created = await Language.create({
        name: payload.name,
        code: payload.code,
        native_name: payload.native_name || null,
        direction: payload.direction || 'ltr',
        is_default: !!payload.is_default,
        active: payload.active !== undefined ? !!payload.active : true
      }, { transaction: t });

      if (created.is_default) {
        await Language.update({ is_default: false }, { where: { id: { [Op.ne]: created.id } }, transaction: t });
      }

      await t.commit();
      logger.info(`Language created id=${created.id} code=${created.code}`);
      res.ok(created, 201);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  })
);

// PUT /languages/:id
router.put(
  '/languages/:id',
  authenticate, authorize(['admin']),
  zodValidate(z.object({
    name: z.string().min(1).optional(),
    code: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/).optional(),
    native_name: z.string().optional().nullable(),
    direction: z.enum(['ltr', 'rtl']).optional(),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
  })),
  asyncHandler(async (req, res) => {
    const item = await Language.findByPk(req.params.id);
    if (!item) return res.fail(404, 'Language not found');

    const t = await sequelize.transaction();
    try {
      const { name, code, native_name, direction, is_default, active } = req.body || {};
      await item.update({
        name: name ?? item.name,
        code: code ?? item.code,
        native_name: native_name !== undefined ? native_name : item.native_name,
        direction: direction ?? item.direction,
        is_default: is_default !== undefined ? !!is_default : item.is_default,
        active: active !== undefined ? !!active : item.active
      }, { transaction: t });

      if (item.is_default) {
        await Language.update({ is_default: false }, { where: { id: { [Op.ne]: item.id } }, transaction: t });
      }

      await t.commit();
      logger.info(`Language updated id=${item.id}`);
      res.ok(item);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  })
);

// DELETE /languages/:id
router.delete('/languages/:id', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await Language.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Language not found');
  if (item.is_default) return res.fail(400, 'Cannot delete default language');
  await item.destroy();
  logger.warn(`Language deleted id=${item.id}`);
  res.ok(null, 204);
}));

// PATCH /languages/:id/toggle-status
router.patch('/languages/:id/toggle-status', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await Language.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Language not found');
  if (item.is_default && item.active) {
    return res.fail(400, 'Cannot deactivate default language');
  }
  await item.update({ active: !item.active });
  logger.info(`Language toggled id=${item.id} active=${item.active}`);
  res.ok(item);
}));

// PATCH /languages/:id/set-default
router.patch('/languages/:id/set-default', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await Language.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Language not found');
  if (!item.active) return res.fail(400, 'Default language must be active');
  const t = await sequelize.transaction();
  try {
    await Language.update({ is_default: false }, { where: {}, transaction: t });
  await item.update({ is_default: true }, { transaction: t });
  await t.commit();
  logger.info(`Language set-default id=${item.id}`);
  res.ok(item);
  } catch (e) {
    await t.rollback();
    throw e;
  }
}));

module.exports = router;
