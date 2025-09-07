'use strict';

const express = require('express');
const { Group } = require('../../../models');

const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes for groups
router.get('/', asyncHandler(async (req, res) => {
  const groups = await Group.findAll();
  res.ok(groups);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.fail(404, 'Groupe non trouvé');
  }
  res.ok(group);
}));

module.exports = router;
