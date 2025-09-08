'use strict';

const express = require('express');
const router = express.Router();
const { User, UserModuleRole, Module, sequelize } = require('../../../models');

async function tryQuery(fn) {
  try { return await fn(); }
  catch (e) {
    const msg = String(e?.message || '');
    if (/no such table/i.test(msg)) {
      await sequelize.sync({ force: false });
      return await fn();
    }
    throw e;
  }
}

// Helper: validate module exists by name (if Modules table filled), otherwise accept string
async function ensureModuleName(modName) {
  if (!modName) throw new Error('module requis');
  try {
    const m = await Module.findOne({ where: { name: modName } });
    return m ? m.name : modName;
  } catch {
    return modName;
  }
}

// GET roles for user across modules
router.get('/users/:userId/module-roles', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.fail(404, 'Utilisateur introuvable');
    const items = await tryQuery(() => UserModuleRole.findAll({ where: { user_id: user.id }, order: [['module','ASC']] }));
    res.ok(items.map(i => ({ id: i.id, user_id: i.user_id, module: i.module, role: i.role, created_at: i.createdAt, updated_at: i.updatedAt })));
  } catch (e) { next(e); }
});

// PUT set role for a user on a module (upsert)
router.put('/users/:userId/module-roles/:module', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.fail(404, 'Utilisateur introuvable');
    const moduleName = await ensureModuleName(req.params.module);
    const role = (req.body?.role || '').trim();
    if (!role) return res.fail(400, 'role requis');

    const [item, created] = await tryQuery(() => UserModuleRole.findOrCreate({
      where: { user_id: user.id, module: moduleName },
      defaults: { role }
    }));
    if (!created) await item.update({ role });
    res.ok({ id: item.id, user_id: item.user_id, module: item.module, role: item.role, created_at: item.createdAt, updated_at: item.updatedAt });
  } catch (e) { next(e); }
});

// DELETE assignment
router.delete('/users/:userId/module-roles/:module', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.fail(404, 'Utilisateur introuvable');
    const moduleName = await ensureModuleName(req.params.module);
    const item = await tryQuery(() => UserModuleRole.findOne({ where: { user_id: user.id, module: moduleName } }));
    if (!item) return res.fail(404, 'Affectation introuvable');
    await item.destroy();
    res.ok(null, 204);
  } catch (e) { next(e); }
});

module.exports = router;
