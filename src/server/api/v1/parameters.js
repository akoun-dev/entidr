'use strict';

const express = require('express');
const { Parameter } = require('../../../models');

const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes for parameters
router.get('/', asyncHandler(async (req, res) => {
  const parameters = await Parameter.findAll();
  res.ok(parameters);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const parameter = await Parameter.findByPk(req.params.id);
  if (!parameter) {
    return res.fail(404, 'Paramètre non trouvé');
  }
  res.ok(parameter);
}));

module.exports = router;
