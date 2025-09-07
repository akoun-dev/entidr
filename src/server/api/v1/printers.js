'use strict';

const express = require('express');
const router = express.Router();
const { Printer } = require('../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function toDto(p) {
  return {
    id: p.id.toString(),
    name: p.name,
    type: p.type,
    connection: p.connection,
    address: p.address,
    port: p.port,
    driver: p.driver,
    isDefault: !!p.isDefault,
    status: p.status,
    options: p.options || null,
    capabilities: p.capabilities || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  };
}

// List printers
router.get('/', asyncHandler(async (req, res) => {
  const printers = await Printer.findAll({ order: [['name', 'ASC']] });
  res.ok(printers.map(toDto));
}));

// Create printer
router.post('/', asyncHandler(async (req, res) => {
  const { name, type, connection, address, port, driver, isDefault, status, options, capabilities } = req.body;
  if (!name || !type || !connection) {
    return res.fail(400, 'name, type et connection sont requis');
  }
  const printer = await Printer.create({
    name,
    type,
    connection,
    address: address || null,
    port: port ?? null,
    driver: driver || null,
    isDefault: !!isDefault,
    status: status || 'active',
    options: options || null,
    capabilities: capabilities || null
  });
  res.ok(toDto(printer), 201);
}));

// Set default printer
router.patch('/:id/setdefault', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const printer = await Printer.findByPk(id);
  if (!printer) return res.fail(404, 'Imprimante non trouvée');
  printer.isDefault = true;
  await printer.save();
  res.ok(toDto(printer));
}));

// Test print (stub)
router.post('/:id/test', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const printer = await Printer.findByPk(id);
  if (!printer) return res.fail(404, 'Imprimante non trouvée');
  res.ok({ success: true, message: "Test d'impression envoyé", printer: printer.name });
}));

// Delete printer
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const printer = await Printer.findByPk(id);
  if (!printer) return res.fail(404, 'Imprimante non trouvée');

  if (printer.isDefault) {
    const others = await Printer.count({ where: { isDefault: false } });
    if (others > 0) {
      return res.fail(400, "Impossible de supprimer l'imprimante par défaut");
    }
  }

  await printer.destroy();
  res.ok(null, 204);
}));

module.exports = router;
