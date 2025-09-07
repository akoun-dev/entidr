'use strict';

const express = require('express');
const router = express.Router();
const { HrEmployee, HrDepartment, HrContract, HrDocument, HrTask, HrWorkflow, HrSignatureRequest, sequelize } = require('../../../src/models');
// Optional role-based guard (non-breaking if auth not enabled)
function allow(roles = []) {
  return (req, res, next) => {
    const role = req.user?.role || 'admin';
    if (roles.length && !roles.includes(role)) return res.fail(403, 'Permissions insuffisantes');
    next();
  };
}

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function tryQuery(queryFn) {
  try {
    return await queryFn();
  } catch (e) {
    const msg = String(e?.message || '');
    if (/no such table/i.test(msg)) {
      await sequelize.sync({ force: false });
      return await queryFn();
    }
    throw e;
  }
}

// Employees
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

router.post('/hr/employees', asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.name) return res.fail(400, 'name requis');
  const created = await HrEmployee.create({
    name: p.name,
    job_title: p.job_title || null,
    department_id: p.department_id || null,
    work_email: p.work_email || p.email || null,
    work_phone: p.work_phone || p.phone || null,
    mobile_phone: p.mobile_phone || null,
    parent_id: p.parent_id || null,
    birth_date: p.birth_date || null,
    address: p.address || null,
    employment_type: p.employment_type || null,
    hire_date: p.hire_date || null,
    notes: p.notes || null,
    active: p.active !== undefined ? !!p.active : true,
  });
  res.ok(created, 201);
}));

router.put('/hr/employees/:id', asyncHandler(async (req, res) => {
  const item = await tryQuery(() => HrEmployee.findByPk(req.params.id));
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

router.delete('/hr/employees/:id', asyncHandler(async (req, res) => {
  const item = await tryQuery(() => HrEmployee.findByPk(req.params.id));
  if (!item) return res.fail(404, 'Employé introuvable');
  await item.destroy();
  res.ok(null, 204);
}));

// Departments
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

router.post('/hr/departments', asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.name) return res.fail(400, 'name requis');
  const created = await HrDepartment.create({ name: p.name, manager_id: p.manager_id || null, active: p.active !== undefined ? !!p.active : true });
  res.ok(created, 201);
}));

router.put('/hr/departments/:id', asyncHandler(async (req, res) => {
  const d = await tryQuery(() => HrDepartment.findByPk(req.params.id));
  if (!d) return res.fail(404, 'Département introuvable');
  const p = req.body || {};
  await d.update({
    name: p.name ?? d.name,
    manager_id: p.manager_id ?? d.manager_id,
    active: p.active !== undefined ? !!p.active : d.active,
  });
  res.ok(d);
}));

router.delete('/hr/departments/:id', asyncHandler(async (req, res) => {
  const d = await tryQuery(() => HrDepartment.findByPk(req.params.id));
  if (!d) return res.fail(404, 'Département introuvable');
  await d.destroy();
  res.ok(null, 204);
}));

// Alias: Directions (synonyme de départements)
router.get('/hr/directions', asyncHandler(async (req, res) => {
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

router.get('/hr/directions/:id', asyncHandler(async (req, res) => {
  const d = await tryQuery(() => HrDepartment.findByPk(req.params.id));
  if (!d) return res.fail(404, 'Direction introuvable');
  res.ok({
    id: d.id,
    name: d.name,
    manager_id: d.manager_id,
    active: !!d.active,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  });
}));

router.post('/hr/directions', asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.name) return res.fail(400, 'name requis');
  const created = await HrDepartment.create({ name: p.name, manager_id: p.manager_id || null, active: p.active !== undefined ? !!p.active : true });
  res.ok(created, 201);
}));

router.put('/hr/directions/:id', asyncHandler(async (req, res) => {
  const d = await tryQuery(() => HrDepartment.findByPk(req.params.id));
  if (!d) return res.fail(404, 'Direction introuvable');
  const p = req.body || {};
  await d.update({
    name: p.name ?? d.name,
    manager_id: p.manager_id ?? d.manager_id,
    active: p.active !== undefined ? !!p.active : d.active,
  });
  res.ok(d);
}));

router.delete('/hr/directions/:id', asyncHandler(async (req, res) => {
  const d = await tryQuery(() => HrDepartment.findByPk(req.params.id));
  if (!d) return res.fail(404, 'Direction introuvable');
  await d.destroy();
  res.ok(null, 204);
}));

// Contracts
router.get('/hr/contracts', asyncHandler(async (req, res) => {
  const { q, employee_id } = req.query;
  const where = {};
  if (employee_id) where.employee_id = employee_id;
  if (q) {
    const { Op } = require('sequelize');
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { contract_type: { [Op.like]: `%${q}%` } },
      { state: { [Op.like]: `%${q}%` } },
    ];
  }
  const items = await tryQuery(() => HrContract.findAll({ where, order: [['createdAt', 'DESC']] }));
  res.ok(items.map(c => ({
    id: c.id,
    name: c.name,
    employee_id: c.employee_id,
    contract_type: c.contract_type,
    date_start: c.date_start,
    date_end: c.date_end,
    wage: c.wage,
    state: c.state,
    notes: c.notes,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  })));
}));

router.get('/hr/contracts/:id', asyncHandler(async (req, res) => {
  const c = await tryQuery(() => HrContract.findByPk(req.params.id));
  if (!c) return res.fail(404, 'Contrat introuvable');
  res.ok({
    id: c.id,
    name: c.name,
    employee_id: c.employee_id,
    contract_type: c.contract_type,
    date_start: c.date_start,
    date_end: c.date_end,
    wage: c.wage,
    state: c.state,
    notes: c.notes,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  });
}));

router.post('/hr/contracts', asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.name || !p.employee_id || !p.contract_type || !p.date_start) {
    return res.fail(400, 'name, employee_id, contract_type, date_start requis');
  }
  const created = await HrContract.create({
    name: p.name,
    employee_id: p.employee_id,
    contract_type: p.contract_type,
    date_start: p.date_start,
    date_end: p.date_end || null,
    wage: p.wage || null,
    state: p.state || 'running',
    notes: p.notes || null,
  });
  res.ok(created, 201);
}));

router.put('/hr/contracts/:id', asyncHandler(async (req, res) => {
  const item = await tryQuery(() => HrContract.findByPk(req.params.id));
  if (!item) return res.fail(404, 'Contrat introuvable');
  const p = req.body || {};
  await item.update({
    name: p.name ?? item.name,
    employee_id: p.employee_id ?? item.employee_id,
    contract_type: p.contract_type ?? item.contract_type,
    date_start: p.date_start ?? item.date_start,
    date_end: p.date_end ?? item.date_end,
    wage: p.wage ?? item.wage,
    state: p.state ?? item.state,
    notes: p.notes ?? item.notes,
  });
  res.ok(item);
}));

router.delete('/hr/contracts/:id', asyncHandler(async (req, res) => {
  const item = await tryQuery(() => HrContract.findByPk(req.params.id));
  if (!item) return res.fail(404, 'Contrat introuvable');
  await item.destroy();
  res.ok(null, 204);
}));

// Documents
router.get('/hr/documents', asyncHandler(async (req, res) => {
  const { employee_id } = req.query;
  const where = {};
  if (employee_id) where.employee_id = employee_id;
  const items = await tryQuery(() => HrDocument.findAll({ where, order: [['createdAt', 'DESC']] }));
  res.ok(items.map(d => ({
    id: d.id,
    name: d.name,
    employee_id: d.employee_id,
    type: d.type,
    file_url: d.file_url,
    mime_type: d.mime_type,
    size_bytes: d.size_bytes,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  })));
}));

router.get('/hr/documents/:id', asyncHandler(async (req, res) => {
  const d = await tryQuery(() => HrDocument.findByPk(req.params.id));
  if (!d) return res.fail(404, 'Document introuvable');
  res.ok({
    id: d.id,
    name: d.name,
    employee_id: d.employee_id,
    type: d.type,
    file_url: d.file_url,
    mime_type: d.mime_type,
    size_bytes: d.size_bytes,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  });
}));

router.post('/hr/documents', asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.name || !p.file_url) return res.fail(400, 'name et file_url requis');
  const created = await HrDocument.create({
    name: p.name,
    employee_id: p.employee_id || null,
    type: p.type || null,
    file_url: p.file_url,
    mime_type: p.mime_type || null,
    size_bytes: p.size_bytes || null,
  });
  res.ok(created, 201);
}));

router.put('/hr/documents/:id', asyncHandler(async (req, res) => {
  const item = await tryQuery(() => HrDocument.findByPk(req.params.id));
  if (!item) return res.fail(404, 'Document introuvable');
  const p = req.body || {};
  await item.update({
    name: p.name ?? item.name,
    employee_id: p.employee_id ?? item.employee_id,
    type: p.type ?? item.type,
    file_url: p.file_url ?? item.file_url,
    mime_type: p.mime_type ?? item.mime_type,
    size_bytes: p.size_bytes ?? item.size_bytes,
  });
  res.ok(item);
}));

router.delete('/hr/documents/:id', asyncHandler(async (req, res) => {
  const item = await tryQuery(() => HrDocument.findByPk(req.params.id));
  if (!item) return res.fail(404, 'Document introuvable');
  await item.destroy();
  res.ok(null, 204);
}));
module.exports = router;
// ---------------- On/Offboarding Tasks ----------------
router.get('/hr/onboarding/tasks', asyncHandler(async (req, res) => {
  const where = { kind: 'onboarding' };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  const items = await tryQuery(() => HrTask.findAll({ where, order: [['createdAt','DESC']] }));
  res.ok(items);
}));

router.get('/hr/offboarding/tasks', asyncHandler(async (req, res) => {
  const where = { kind: 'offboarding' };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  const items = await tryQuery(() => HrTask.findAll({ where, order: [['createdAt','DESC']] }));
  res.ok(items);
}));

router.post('/hr/tasks', allow(['hr','admin','manager']), asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.title || !p.kind) return res.fail(400, 'title et kind requis');
  const created = await HrTask.create({
    employee_id: p.employee_id || null,
    kind: p.kind,
    title: p.title,
    description: p.description || null,
    assignee_role: p.assignee_role || null,
    due_date: p.due_date || null,
    status: p.status || 'pending',
  });
  res.ok(created, 201);
}));

router.put('/hr/tasks/:id', allow(['hr','admin','manager']), asyncHandler(async (req, res) => {
  const t = await tryQuery(() => HrTask.findByPk(req.params.id));
  if (!t) return res.fail(404, 'Tâche introuvable');
  const p = req.body || {};
  await t.update({
    employee_id: p.employee_id ?? t.employee_id,
    title: p.title ?? t.title,
    description: p.description ?? t.description,
    assignee_role: p.assignee_role ?? t.assignee_role,
    due_date: p.due_date ?? t.due_date,
    status: p.status ?? t.status,
    completed_by: p.completed_by ?? t.completed_by,
    completed_at: p.completed_at ?? t.completed_at,
  });
  res.ok(t);
}));

router.delete('/hr/tasks/:id', allow(['hr','admin']), asyncHandler(async (req, res) => {
  const t = await tryQuery(() => HrTask.findByPk(req.params.id));
  if (!t) return res.fail(404, 'Tâche introuvable');
  await t.destroy();
  res.ok(null, 204);
}));

// ---------------- Workflows ----------------
router.get('/hr/workflows', allow(['hr','admin']), asyncHandler(async (req, res) => {
  const items = await tryQuery(() => HrWorkflow.findAll({ order: [['createdAt','DESC']] }));
  res.ok(items);
}));

router.post('/hr/workflows', allow(['hr','admin']), asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.name || !p.kind) return res.fail(400, 'name et kind requis');
  const created = await HrWorkflow.create({ name: p.name, kind: p.kind, config: p.config || null, active: p.active !== undefined ? !!p.active : true });
  res.ok(created, 201);
}));

router.put('/hr/workflows/:id', allow(['hr','admin']), asyncHandler(async (req, res) => {
  const w = await tryQuery(() => HrWorkflow.findByPk(req.params.id));
  if (!w) return res.fail(404, 'Workflow introuvable');
  const p = req.body || {};
  await w.update({ name: p.name ?? w.name, kind: p.kind ?? w.kind, config: p.config ?? w.config, active: p.active !== undefined ? !!p.active : w.active });
  res.ok(w);
}));

router.delete('/hr/workflows/:id', allow(['hr','admin']), asyncHandler(async (req, res) => {
  const w = await tryQuery(() => HrWorkflow.findByPk(req.params.id));
  if (!w) return res.fail(404, 'Workflow introuvable');
  await w.destroy();
  res.ok(null, 204);
}));

// ---------------- Electronic Signatures ----------------
router.get('/hr/signatures', allow(['hr','admin','manager']), asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.document_id) where.document_id = req.query.document_id;
  const items = await tryQuery(() => HrSignatureRequest.findAll({ where, order: [['createdAt','DESC']] }));
  res.ok(items);
}));

router.post('/hr/signatures', allow(['hr','admin']), asyncHandler(async (req, res) => {
  const p = req.body || {};
  if (!p.document_id) return res.fail(400, 'document_id requis');
  const created = await HrSignatureRequest.create({ document_id: p.document_id, employee_id: p.employee_id || null, provider: p.provider || 'internal', status: 'pending', token: Math.random().toString(36).slice(2) });
  res.ok(created, 201);
}));

router.post('/hr/signatures/:id/sign', asyncHandler(async (req, res) => {
  const s = await tryQuery(() => HrSignatureRequest.findByPk(req.params.id));
  if (!s) return res.fail(404, 'Demande introuvable');
  await s.update({ status: 'signed', signed_at: new Date() });
  res.ok(s);
}));
