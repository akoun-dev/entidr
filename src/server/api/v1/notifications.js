'use strict';

const express = require('express');
const router = express.Router();
const { NotificationConfig } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function getOrCreateConfig() {
  let config = await NotificationConfig.findOne();
  if (!config) {
    config = await NotificationConfig.create({
      emailEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
      webhookEnabled: false,
      maxRetries: 3,
      retryDelay: 15,
      retentionPeriod: 90,
      maxNotificationsPerDay: 50,
      batchingEnabled: true,
      batchingInterval: 15
    });
  }
  return config;
}

function asItems(config) {
  return [
    {
      id: 'email',
      name: 'Notifications Email',
      type: 'email',
      isActive: !!config.emailEnabled,
      channels: ['email'],
      lastModified: config.updatedAt
    },
    {
      id: 'sms',
      name: 'Notifications SMS',
      type: 'sms',
      isActive: !!config.smsEnabled,
      channels: ['sms'],
      lastModified: config.updatedAt
    },
    {
      id: 'inapp',
      name: 'Notifications In-App',
      type: 'in-app',
      isActive: !!config.inAppEnabled,
      channels: ['in-app'],
      lastModified: config.updatedAt
    },
    {
      id: 'webhook',
      name: 'Notifications Webhook',
      type: 'webhook',
      isActive: !!config.webhookEnabled,
      channels: ['webhook'],
      lastModified: config.updatedAt
    }
  ];
}

// GET /notifications/settings - list projected settings
router.get('/settings', asyncHandler(async (req, res) => {
  const config = await getOrCreateConfig();
  res.ok(asItems(config));
}));

// PATCH /notifications/settings/:id/toggle - toggle one channel
router.patch('/settings/:id/toggle', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const config = await getOrCreateConfig();

  const mapping = {
    email: 'emailEnabled',
    sms: 'smsEnabled',
    inapp: 'inAppEnabled',
    'in-app': 'inAppEnabled',
    webhook: 'webhookEnabled'
  };

  const field = mapping[id];
  if (!field) return res.fail(400, 'Type de paramètre invalide');

  config[field] = !config[field];
  await config.save();

  const item = asItems(config).find(i => i.id === (id === 'in-app' ? 'inapp' : id));
  res.ok(item);
}));

// DELETE /notifications/settings/:id - disable channel (soft delete)
router.delete('/settings/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const config = await getOrCreateConfig();
  const mapping = {
    email: 'emailEnabled',
    sms: 'smsEnabled',
    inapp: 'inAppEnabled',
    'in-app': 'inAppEnabled',
    webhook: 'webhookEnabled'
  };
  const field = mapping[id];
  if (!field) return res.fail(400, 'Type de paramètre invalide');

  config[field] = false;
  await config.save();
  return res.ok(null, 204);
}));

module.exports = router;
