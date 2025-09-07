'use strict';

const express = require('express');
const router = express.Router();
const { HrEmployee, HrDepartment } = require('../../../../models');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------------- Employees ----------------

// Helper to ensure tables exist (auto-sync on first call if needed)
async function tryQuery(queryFn) {
  try {
    return await queryFn();
  } catch (e) {
    const msg = String(e?.message || '');
    if (/no such table/i.test(msg)) {
      const { sequelize } = require('../../../../models');
      await sequelize.sync({ force: false });
      return await queryFn();
    }
    throw e;
  }
}

// GET /hr/employees
router.get('/hr/employees', asyncHandler(async (req, res) => {
  const { q } = req.query;
  const where = {};
  if (q) {
    const { Op } = require('sequelize');
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { job_title: { [Op.like]: `%${q}%` } },
      { work_email: { [Op.like]: `%${q}%` } },
    ];
  }
  const items = await tryQuery(() => HrEmployee.findAll({ where, order: [['createdAt', 'DESC']] }));
  res.ok(items.map(e => ({
    id: e.id,
    name: e.name,
    job_title: e.job_title,
    department_id: e.department_id,
    work_email: e.work_email,
    work_phone: e.work_phone,
    mobile_phone: e.mobile_phone,
    parent_id: e.parent_id,
    active: !!e.active,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  })));
}));

// GET /hr/employees/:id
router.get('/hr/employees/:id', asyncHandler(async (req, res) => {
  const item = await tryQuery(() => HrEmployee.findByPk(req.params.id));
  if (!item) return res.fail(404, 'Employé introuvable');
  res.ok({
    id: item.id,
    name: item.name,
    job_title: item.job_title,
    department_id: item.department_id,
    work_email: item.work_email,
    work_phone: item.work_phone,
    mobile_phone: item.mobile_phone,
    parent_id: item.parent_id,
    birth_date: item.birth_date,
    address: item.address,
    employment_type: item.employment_type,
    hire_date: item.hire_date,
    notes: item.notes,
    active: !!item.active,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  });
}));

// POST /hr/employees
router.post('/hr/employees', asyncHandler(async (req, res) => {
  const payload = req.body || {};
  if (!payload.name) return res.fail(400, 'name requis');
  const created = await HrEmployee.create({
    name: payload.name,
    job_title: payload.job_title || null,
    department_id: payload.department_id || null,
    work_email: payload.work_email || payload.email || null,
    work_phone: payload.work_phone || payload.phone || null,
    mobile_phone: payload.mobile_phone || null,
    parent_id: payload.parent_id || null,
    birth_date: payload.birth_date || null,
    address: payload.address || null,
    employment_type: payload.employment_type || null,
    hire_date: payload.hire_date || null,
    notes: payload.notes || null,
    active: payload.active !== undefined ? !!payload.active : true,
  });
  res.ok(created, 201);
}));

// PUT /hr/employees/:id
router.put('/hr/employees/:id', asyncHandler(async (req, res) => {
  const item = await HrEmployee.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Employé introuvable');
  const p = req.body || {};
  await item.update({
    name: p.name ?? item.name,
    job_title: p.job_title ?? item.job_title,
    department_id: p.department_id ?? item.department_id,
    work_email: p.work_email ?? p.email ?? item.work_email,
    work_phone: p.work_phone ?? p.phone ?? item.work_phone,
    mobile_phone: p.mobile_phone ?? item.mobile_phone,
    parent_id: p.parent_id ?? item.parent_id,
    birth_date: p.birth_date ?? item.birth_date,
    address: p.address ?? item.address,
    employment_type: p.employment_type ?? item.employment_type,
    hire_date: p.hire_date ?? item.hire_date,
    notes: p.notes ?? item.notes,
    active: p.active !== undefined ? !!p.active : item.active,
  });
  res.ok(item);
}));

// DELETE /hr/employees/:id
router.delete('/hr/employees/:id', asyncHandler(async (req, res) => {
  const item = await HrEmployee.findByPk(req.params.id);
  if (!item) return res.fail(404, 'Employé introuvable');
  await item.destroy();
  res.ok(null, 204);
}));

// ---------------- Departments ----------------

// GET /hr/departments
router.get('/hr/departments', asyncHandler(async (req, res) => {
  const items = await tryQuery(() => HrDepartment.findAll({ order: [['name', 'ASC']] }));
  res.ok(items.map(d => ({
    id: d.id,
    name: d.name,
    manager_id: d.manager_id,
    active: !!d.active,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  })));
}));

// GET /hr/departments/:id
router.get('/hr/departments/:id', asyncHandler(async (req, res) => {
  const d = await tryQuery(() => HrDepartment.findByPk(req.params.id));
  if (!d) return res.fail(404, 'Département introuvable');
  res.ok({
    id: d.id,
    name: d.name,
    manager_id: d.manager_id,
    active: !!d.active,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  });
}));

// POST /hr/departments
router.post('/hr/departments', asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.name) return res.fail(400, 'name requis');
  const created = await HrDepartment.create({ name: p.name, manager_id: p.manager_id || null, active: p.active !== undefined ? !!p.active : true });
  res.ok(created, 201);
}));

// PUT /hr/departments/:id
router.put('/hr/departments/:id', asyncHandler(async (req, res) => {
  const d = await HrDepartment.findByPk(req.params.id);
  if (!d) return res.fail(404, 'Département introuvable');
  const p = req.body || {};
  await d.update({
    name: p.name ?? d.name,
    manager_id: p.manager_id ?? d.manager_id,
    active: p.active !== undefined ? !!p.active : d.active,
  });
  res.ok(d);
}));

// DELETE /hr/departments/:id
router.delete('/hr/departments/:id', asyncHandler(async (req, res) => {
  const d = await HrDepartment.findByPk(req.params.id);
  if (!d) return res.fail(404, 'Département introuvable');
  await d.destroy();
  res.ok(null, 204);
}));

module.exports = router;
