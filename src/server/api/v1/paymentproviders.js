'use strict';

const express = require('express');
const router = express.Router();
const { PaymentProvider } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function toDto(p) {
  return {
    id: String(p.id),
    name: p.name,
    type: p.type,
    fees: p.fees,
    isActive: !!p.isActive,
    mode: p.mode,
    apiKey: p.apiKey,
    apiSecret: p.apiSecret,
    supportedCountries: p.supportedCountries || [],
    supportedCurrencies: p.supportedCurrencies || [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  };
}

// GET /paymentproviders - list
router.get('/', asyncHandler(async (req, res) => {
  const providers = await PaymentProvider.findAll({ order: [['name', 'ASC']] });
  res.json(providers.map(toDto));
}));

// POST /paymentproviders - create
router.post('/', asyncHandler(async (req, res) => {
  const { name, type, fees, apiKey, apiSecret, supportedCountries, supportedCurrencies } = req.body;
  if (!name || !type || !fees) {
    return res.status(400).json({ message: 'name, type et fees sont requis' });
  }
  const provider = await PaymentProvider.create({
    name,
    type,
    fees,
    apiKey: apiKey || null,
    apiSecret: apiSecret || null,
    supportedCountries: supportedCountries || null,
    supportedCurrencies: supportedCurrencies || null,
    isActive: false,
    mode: 'test'
  });
  res.status(201).json(toDto(provider));
}));

// PATCH /paymentproviders/:id/toggle - toggle active
router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const provider = await PaymentProvider.findByPk(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Fournisseur non trouvé' });
  provider.isActive = !provider.isActive;
  await provider.save();
  res.json(toDto(provider));
}));

// DELETE /paymentproviders/:id - delete
router.delete('/:id', asyncHandler(async (req, res) => {
  const provider = await PaymentProvider.findByPk(req.params.id);
  if (!provider) return res.status(404).json({ message: 'Fournisseur non trouvé' });
  await provider.destroy();
  res.status(204).end();
}));

module.exports = router;

