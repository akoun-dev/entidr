'use strict';

const express = require('express');
const { Parameter } = require('../../models');

const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes for parameters
router.get('/', asyncHandler(async (req, res) => {
  const parameters = await Parameter.findAll();

  const transformedParameters = parameters.map(param => ({
    id: param.id.toString(),
    key: param.key,
    value: param.value,
    category: param.category,
    description: param.description || ''
  }));

  res.json(transformedParameters);
}));

router.get('/category/:category', asyncHandler(async (req, res) => {
  const parameters = await Parameter.findAll({
    where: { category: req.params.category }
  });

  const transformedParameters = parameters.map(param => ({
    id: param.id.toString(),
    key: param.key,
    value: param.value,
    category: param.category,
    description: param.description || ''
  }));

  res.json(transformedParameters);
}));

router.get('/key/:key', asyncHandler(async (req, res) => {
  const parameter = await Parameter.findOne({
    where: { key: req.params.key }
  });

  if (!parameter) {
    return res.status(404).json({ message: 'Paramètre non trouvé' });
  }

  const transformedParameter = {
    id: parameter.id.toString(),
    key: parameter.key,
    value: parameter.value,
    category: parameter.category,
    description: parameter.description || ''
  };

  res.json(transformedParameter);
}));

router.put('/key/:key', asyncHandler(async (req, res) => {
  const { value } = req.body;

  const parameter = await Parameter.findOne({
    where: { key: req.params.key }
  });

  if (!parameter) {
    return res.status(404).json({ message: 'Paramètre non trouvé' });
  }

  parameter.value = value;
  await parameter.save();

  const transformedParameter = {
    id: parameter.id.toString(),
    key: parameter.key,
    value: parameter.value,
    category: parameter.category,
    description: parameter.description || ''
  };

  res.json(transformedParameter);
}));

router.put('/batch', asyncHandler(async (req, res) => {
  const { parameters } = req.body;

  const updatedParameters = [];

  for (const param of parameters) {
    const parameter = await Parameter.findOne({
      where: { key: param.key }
    });

    if (parameter) {
      parameter.value = param.value;
      await parameter.save();

      updatedParameters.push({
        id: parameter.id.toString(),
        key: parameter.key,
        value: parameter.value,
        category: parameter.category,
        description: parameter.description || ''
      });
    }
  }

  res.json(updatedParameters);
}));

module.exports = router;

