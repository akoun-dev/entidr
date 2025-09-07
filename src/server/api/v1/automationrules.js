'use strict';

const express = require('express');
const router = express.Router();
const { AutomationRule } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function toDto(r) {
  return {
    id: String(r.id),
    name: r.name,
    description: r.description || '',
    trigger_type: r.trigger_type,
    trigger_value: r.trigger_value,
    action_type: r.action_type,
    action_params: r.action_params || null,
    enabled: !!r.enabled,
    priority: r.priority,
    last_run: r.last_run ? new Date(r.last_run).toISOString() : null,
    last_status: r.last_status || null,
    success_count: r.success_count,
    failure_count: r.failure_count,
    createdAt: r.createdAt
  };
}

// GET /automationrules - list (public)
router.get('/', asyncHandler(async (req, res) => {
  const items = await AutomationRule.findAll({ order: [['priority', 'ASC'], ['name', 'ASC']] });
  res.ok(items.map(toDto));
}));

// PATCH /automationrules/:id/toggle - toggle enabled (public for settings)
router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByPk(req.params.id);
  if (!rule) return res.fail(404, 'Règle introuvable');
  rule.enabled = !rule.enabled;
  await rule.save();
  res.ok(toDto(rule));
}));

// POST /automationrules/:id/run - simulate run (public for settings)
router.post('/:id/run', asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByPk(req.params.id);
  if (!rule) return res.fail(404, 'Règle introuvable');
  const ts = new Date();
  // Simple stub execution as success
  rule.last_run = ts;
  rule.last_status = 'success';
  rule.success_count = (rule.success_count || 0) + 1;
  await rule.save();
  res.ok({
    rule: toDto(rule),
    execution: { success: true, message: 'Exécution simulée avec succès', timestamp: ts.toISOString() }
  });
}));

// DELETE /automationrules/:id - delete (public for settings)
router.delete('/:id', asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByPk(req.params.id);
  if (!rule) return res.fail(404, 'Règle introuvable');
  await rule.destroy();
  res.ok(null, 204);
}));

module.exports = router;
