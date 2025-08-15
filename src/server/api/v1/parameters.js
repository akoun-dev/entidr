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
  res.json(parameters);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const parameter = await Parameter.findByPk(req.params.id);
  if (!parameter) {
    return res.status(404).json({ message: 'Paramètre non trouvé' });
  }
  res.json(parameter);
}));

module.exports = router;
