'use strict';

const express = require('express');
const router = express.Router();
const { ShippingMethod } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function toDto(m) {
  return {
    id: String(m.id),
    name: m.name,
    carrier: m.carrier,
    deliveryTime: m.deliveryTime,
    price: m.price,
    isActive: !!m.isActive,
    displayOrder: m.displayOrder,
    supportedCountries: m.availableCountries || [],
    createdAt: m.createdAt,
    updatedAt: m.updatedAt
  };
}

// GET /shippingmethods - list
router.get('/', asyncHandler(async (req, res) => {
  const methods = await ShippingMethod.findAll({ order: [['displayOrder', 'ASC'], ['name', 'ASC']] });
  res.ok(methods.map(toDto));
}));

// POST /shippingmethods - create
router.post('/', asyncHandler(async (req, res) => {
  const { name, carrier, deliveryTime, price, supportedCountries, isActive, displayOrder } = req.body;
  if (!name || !carrier || !deliveryTime || !price) {
    return res.fail(400, 'name, carrier, deliveryTime et price sont requis');
  }
  const method = await ShippingMethod.create({
    name,
    carrier,
    deliveryTime,
    price,
    availableCountries: supportedCountries || null,
    isActive: isActive !== undefined ? !!isActive : true,
    displayOrder: displayOrder ?? 0
  });
  res.ok(toDto(method), 201);
}));

// PATCH /shippingmethods/:id/toggle - toggle active
router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const method = await ShippingMethod.findByPk(req.params.id);
  if (!method) return res.fail(404, "Méthode d'expédition non trouvée");
  method.isActive = !method.isActive;
  await method.save();
  res.ok(toDto(method));
}));

// DELETE /shippingmethods/:id - delete
router.delete('/:id', asyncHandler(async (req, res) => {
  const method = await ShippingMethod.findByPk(req.params.id);
  if (!method) return res.fail(404, "Méthode d'expédition non trouvée");
  await method.destroy();
  res.ok(null, 204);
}));

module.exports = router;
