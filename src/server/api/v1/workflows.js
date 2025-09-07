'use strict';

const express = require('express');
const router = express.Router();
const { Workflow, WorkflowStep, WorkflowCondition } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function workflowListDto(wf) {
  return {
    id: String(wf.id),
    name: wf.name,
    description: wf.description || '',
    entityType: wf.entityType,
    triggerEvent: wf.triggerEvent,
    active: !!wf.active,
    steps: []
  };
}

function workflowDetailDto(wf) {
  return {
    id: String(wf.id),
    name: wf.name,
    description: wf.description || '',
    entityType: wf.entityType,
    triggerEvent: wf.triggerEvent,
    active: !!wf.active,
    priority: wf.priority,
    steps: (wf.steps || wf.Steps || []).map(step => ({
      id: String(step.id),
      name: step.name,
      type: step.type,
      assignee: step.assignee || '',
      assigneeType: step.assigneeType || 'user',
      sequence: step.sequence,
      delay: step.delay || null,
      timeout: step.timeout || null,
      action: step.action || '',
      conditions: (step.conditions || step.Conditions || []).map(c => ({
        id: String(c.id),
        field: c.field,
        operator: c.operator,
        value: c.value,
        valueType: c.valueType,
        logicGroup: c.logicGroup
      }))
    }))
  };
}

// GET /workflows - public list (lightweight)
router.get('/', asyncHandler(async (req, res) => {
  const items = await Workflow.findAll({
    attributes: ['id', 'name', 'description', 'entityType', 'triggerEvent', 'active'],
    order: [['name', 'ASC']]
  });
  res.json(items.map(workflowListDto));
}));

// GET /workflows/:id - public detail with steps + conditions
router.get('/:id', asyncHandler(async (req, res) => {
  const wf = await Workflow.findByPk(req.params.id, {
    include: [{
      model: WorkflowStep,
      as: 'steps',
      separate: true,
      order: [['sequence', 'ASC']],
      include: [{
        model: WorkflowCondition,
        as: 'conditions',
        separate: true,
        order: [['sequence', 'ASC']]
      }]
    }]
  });
  if (!wf) return res.status(404).json({ message: 'Workflow non trouvé' });
  res.json(workflowDetailDto(wf));
}));

module.exports = router;

