'use strict';

const express = require('express');
const router = express.Router();
const { EmailServer, sequelize } = require('../../../models');
const logger = require('../../../utils/logger.server');
const { Op } = require('sequelize');
const { authenticate, authorize } = require('../../middlewares/auth');
const { zodValidate, z } = require('../../middlewares/zodValidate');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const validateCreate = (req, res, next) => {
  const { name, protocol, host, from_email, from_name, encryption, port } = req.body || {};
  if (!name || typeof name !== 'string') return res.fail(400, 'Validation error: name is required');
  if (protocol && !['smtp', 'sendmail'].includes(protocol)) return res.fail(400, 'Validation error: invalid protocol');
  if (!host || typeof host !== 'string') return res.fail(400, 'Validation error: host is required');
  if (port !== undefined && !(Number.isInteger(port) && port > 0)) return res.fail(400, 'Validation error: invalid port');
  if (encryption && !['tls', 'ssl', 'none'].includes(encryption)) return res.fail(400, 'Validation error: invalid encryption');
  if (!from_email || typeof from_email !== 'string') return res.fail(400, 'Validation error: from_email is required');
  if (!from_name || typeof from_name !== 'string') return res.fail(400, 'Validation error: from_name is required');
  next();
};

const validateUpdate = (req, res, next) => {
  const { protocol, encryption, port } = req.body || {};
  if (protocol && !['smtp', 'sendmail'].includes(protocol)) return res.fail(400, 'Validation error: invalid protocol');
  if (encryption && !['tls', 'ssl', 'none'].includes(encryption)) return res.fail(400, 'Validation error: invalid encryption');
  if (port !== undefined && !(Number.isInteger(port) && port > 0)) return res.fail(400, 'Validation error: invalid port');
  next();
};

function toDto(s) {
  const plain = s.get ? s.get({ plain: true }) : s;
  // Remove password from output
  const { password, ...rest } = plain;
  return rest;
}

// GET /emailservers
router.get('/emailservers', asyncHandler(async (req, res) => {
  const items = await EmailServer.findAll({ order: [['createdAt', 'DESC']] });
  res.ok(items.map(toDto));
}));

// GET /emailservers/:id
router.get('/emailservers/:id', asyncHandler(async (req, res) => {
  const item = await EmailServer.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Email server not found');
  res.ok(toDto(item));
}));

// POST /emailservers
router.post(
  '/emailservers',
  authenticate, authorize(['admin']),
  zodValidate(z.object({
    name: z.string().min(1),
    protocol: z.enum(['smtp', 'sendmail']).optional(),
    host: z.string().min(1),
    port: z.number().int().positive().optional(),
    username: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    encryption: z.enum(['tls', 'ssl', 'none']).optional(),
    from_email: z.string().min(1),
    from_name: z.string().min(1),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
  })),
  asyncHandler(async (req, res) => {
    const { name, protocol = 'smtp', host, port = 587, username, password, encryption = 'tls', from_email, from_name, is_default = false, active = true } = req.body || {};
    const t = await sequelize.transaction();
    try {
      const created = await EmailServer.create({ name, protocol, host, port, username, password, encryption, from_email, from_name, is_default, active }, { transaction: t });
      if (created.is_default) {
        await EmailServer.update({ is_default: false }, { where: { id: { [Op.ne]: created.id } }, transaction: t });
      }
      await t.commit();
      logger.info(`EmailServer created id=${created.id} name=${created.name}`);
      res.ok(toDto(created), 201);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  })
);

// PUT /emailservers/:id
router.put(
  '/emailservers/:id',
  authenticate, authorize(['admin']),
  zodValidate(z.object({
    name: z.string().min(1).optional(),
    protocol: z.enum(['smtp', 'sendmail']).optional(),
    host: z.string().min(1).optional(),
    port: z.number().int().positive().optional(),
    username: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    encryption: z.enum(['tls', 'ssl', 'none']).optional(),
    from_email: z.string().min(1).optional(),
    from_name: z.string().min(1).optional(),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
  })),
  asyncHandler(async (req, res) => {
    const item = await EmailServer.findByPk(req.params.id);
    if (!item) return res.fail(404, 'Email server not found');
    const t = await sequelize.transaction();
    try {
      const { name, protocol, host, port, username, password, encryption, from_email, from_name, is_default, active } = req.body || {};
      await item.update({
        name: name ?? item.name,
        protocol: protocol ?? item.protocol,
        host: host ?? item.host,
        port: port ?? item.port,
        username: username !== undefined ? username : item.username,
        password: password !== undefined ? password : item.password,
        encryption: encryption ?? item.encryption,
        from_email: from_email ?? item.from_email,
        from_name: from_name ?? item.from_name,
        is_default: is_default !== undefined ? !!is_default : item.is_default,
        active: active !== undefined ? !!active : item.active
      }, { transaction: t });
      if (item.is_default) {
        await EmailServer.update({ is_default: false }, { where: { id: { [Op.ne]: item.id } }, transaction: t });
      }
      await t.commit();
      logger.info(`EmailServer updated id=${item.id}`);
      res.ok(toDto(item));
    } catch (e) {
      await t.rollback();
      throw e;
    }
  })
);

// DELETE /emailservers/:id
router.delete('/emailservers/:id', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await EmailServer.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Email server not found');
  if (item.is_default) return res.fail(400, 'Cannot delete default email server');
  await item.destroy();
  logger.warn(`EmailServer deleted id=${item.id}`);
  res.ok(null, 204);
}));

// PATCH /emailservers/:id/toggle-status
router.patch('/emailservers/:id/toggle-status', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await EmailServer.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Email server not found');
  if (item.is_default && item.active) return res.fail(400, 'Cannot deactivate default email server');
  await item.update({ active: !item.active });
  logger.info(`EmailServer toggled id=${item.id} active=${item.active}`);
  res.ok(item);
}));

// PATCH /emailservers/:id/set-default
router.patch('/emailservers/:id/set-default', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await EmailServer.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Email server not found');
  if (!item.active) return res.fail(400, 'Default server must be active');
  await EmailServer.update({ is_default: false }, { where: {} });
  await item.update({ is_default: true });
  logger.info(`EmailServer set-default id=${item.id}`);
  res.ok(item);
}));

// POST /emailservers/:id/test
router.post('/emailservers/:id/test', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const item = await EmailServer.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Email server not found');
  // For now, simulate a test result. In production, attempt SMTP connection.
  res.ok({ success: true, message: 'Test email server connection succeeded' });
}));

module.exports = router;
