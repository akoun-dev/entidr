'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Charge et monte dynamiquement les routeurs API fournis par les modules (addons).
 * Convention: chaque module peut exposer un fichier `addons/<module>/server/api.js`
 * qui exporte soit:
 *  - un express.Router (module.exports = router)
 *  - une fonction (routerFactory) qui reçoit { express } et retourne un router
 * Les routeurs sont montés sous la racine du router passé en paramètre.
 * @param {import('express').Router} router
 */
// Track already-mounted addons to avoid duplicates when called multiple times
const mountedAddons = new Set();
const registeredAddonModels = new Set();
// Keep track of models registered per addon for later cleanup (uninstall)
const addonModelsByModule = new Map();

function resolveAddonDirs() {
  const candidates = [
    path.resolve(__dirname, '../../../../', 'addons'),
    path.resolve(__dirname, '../../../', 'addons'),
    path.resolve(process.cwd(), 'addons'),
  ];
  const dirs = Array.from(new Set(candidates.map(p => {
    try {
      const ok = fs.existsSync(p) && fs.statSync(p).isDirectory();
      return ok ? fs.realpathSync(p) : null;
    } catch { return null; }
  }).filter(Boolean)));
  return dirs;
}

function registerModelsForAddon(ADDONS_DIR, modName, db) {
  const sequelize = db.sequelize;
  const DataTypes = db.Sequelize?.DataTypes || require('sequelize').DataTypes;
  const modelClasses = [];
  const registered = [];
  const modelDirs = [
    path.join(ADDONS_DIR, modName, 'models'),
    path.join(ADDONS_DIR, modName, 'server', 'models'), // optional fallback
  ];
  for (const mdir of modelDirs) {
    if (!fs.existsSync(mdir) || !fs.statSync(mdir).isDirectory()) continue;
    const files = fs.readdirSync(mdir).filter(f => f.endsWith('.js')).sort();
    for (const f of files) {
      const key = `${modName}/${f}`;
      // Avoid re-registering the same model file
      if (registeredAddonModels.has(key)) continue;
      const fpath = path.join(mdir, f);
      try {
        const factoryMod = require(fpath);
        const factory = typeof factoryMod === 'function'
          ? factoryMod
          : (factoryMod && typeof factoryMod.default === 'function' ? factoryMod.default : null);
        if (!factory) {
          console.warn(`[API v1] Ignored addon model (not a factory): ${modName}/models/${f}`);
          continue;
        }
        const ModelClass = factory(sequelize, DataTypes);
        if (ModelClass && ModelClass.name) {
          db[ModelClass.name] = ModelClass;
          modelClasses.push(ModelClass);
          console.log(`[API v1] Registered addon model: ${modName}/${f} -> ${ModelClass.name}`);
          registeredAddonModels.add(key);
          registered.push(ModelClass.name);
        } else {
          console.warn(`[API v1] Addon model did not return a class: ${modName}/models/${f}`);
        }
      } catch (e) {
        console.warn(`[API v1] Failed to register addon model ${modName}/models/${f}:`, e?.message || e);
      }
    }
  }
  // Run association pass after all models are registered to avoid order issues
  for (const ModelClass of modelClasses) {
    if (typeof ModelClass.associate === 'function') {
      try { ModelClass.associate(db); } catch (e) { console.warn(`[API v1] Associate failed for ${ModelClass.name}:`, e?.message || e); }
    }
  }
  // Track models per addon (merge without duplicates)
  const prev = addonModelsByModule.get(modName) || [];
  const merged = Array.from(new Set([...prev, ...registered]));
  addonModelsByModule.set(modName, merged);
  return { names: registered, classes: modelClasses };
}

function mountRouterForAddon(ADDONS_DIR, modName, router) {
  const apiPath = path.join(ADDONS_DIR, modName, 'server', 'api.js');
  if (!fs.existsSync(apiPath)) return false;
  try {
    const exp = require(apiPath);
    let modRouter = null;
    if (typeof exp === 'function' && typeof exp.use === 'function' && typeof exp.handle === 'function') {
      modRouter = exp;
    } else if (typeof exp === 'function') {
      const express = require('express');
      modRouter = exp({ express });
    } else if (exp && typeof exp.default === 'function') {
      const d = exp.default;
      if (typeof d.use === 'function' && typeof d.handle === 'function') modRouter = d;
      else if (typeof d === 'function') {
        const express = require('express');
        modRouter = d({ express });
      }
    }
    if (modRouter && typeof modRouter === 'function') {
      router.use('/', modRouter);
      console.log(`[API v1] Mounted addon router: ${modName}/server/api.js (${ADDONS_DIR})`);
      return true;
    } else {
      console.warn(`[API v1] Ignored addon router (invalid export): ${modName}/server/api.js`);
      return false;
    }
  } catch (e) {
    console.warn(`[API v1] Failed to mount addon router ${modName}:`, e?.message || e);
    return false;
  }
}

async function mountAddonToRouter(router, modName, options = {}) {
  const db = require(path.resolve(__dirname, '../../models'));
  const dirs = resolveAddonDirs();
  if (mountedAddons.has(modName)) return { mounted: false, models: [] };
  for (const dir of dirs) {
    const addonPath = path.join(dir, modName);
    if (!fs.existsSync(addonPath)) continue;
    const { names: modelNames, classes: modelClasses } = registerModelsForAddon(dir, modName, db);
    const mounted = mountRouterForAddon(dir, modName, router);
    if (mounted) {
      mountedAddons.add(modName);
      if (options.syncAfterMount) {
        try {
          // Only sync the addon models to avoid touching unrelated core tables
          for (const M of modelClasses) {
            if (M && typeof M.sync === 'function') {
              await M.sync({ alter: !!options.alterSchema });
            }
          }
        } catch (e) {
          console.warn(`[API v1] sequelize.sync failed after mounting ${modName}:`, e?.message || e);
        }
      }
      return { mounted, models: modelNames };
    }
  }
  return { mounted: false, models: [] };
}

function mountModuleApis(router) {
  try {
    const existingAddonDirs = resolveAddonDirs();

    if (existingAddonDirs.length === 0) return;

    // Load central DB (sequelize instance) for model registration
    const dbPath = path.resolve(__dirname, '../../models');
    const db = require(dbPath);

    for (const ADDONS_DIR of existingAddonDirs) {
      const entries = fs.readdirSync(ADDONS_DIR, { withFileTypes: true }).filter(e => e.isDirectory());
      for (const entry of entries) {
        const modName = entry.name;

        registerModelsForAddon(ADDONS_DIR, modName, db);
        if (!mountedAddons.has(modName)) {
          const mounted = mountRouterForAddon(ADDONS_DIR, modName, router);
          if (mounted) mountedAddons.add(modName);
        }
      }
    }
  } catch (e) {
    console.warn('[API v1] Module API loader error:', e?.message || e);
  }
}
module.exports = { mountModuleApis, mountAddonToRouter };

/**
 * Drop all DB tables for a given addon by using the set of registered models
 * captured at registration time. Attempts to drop in reverse order and retries
 * to handle FK dependencies gracefully.
 */
async function dropAddonModels(modName) {
  try {
    const db = require(path.resolve(__dirname, '../../models'));
    const modelNames = (addonModelsByModule.get(modName) || []).slice();
    if (modelNames.length === 0) return { dropped: [] };
    const namesToDrop = modelNames.slice().reverse();
    const dropped = new Set();
    let progress = true;
    // Retry loop to handle FK order
    while (progress) {
      progress = false;
      for (const name of namesToDrop) {
        if (dropped.has(name)) continue;
        const M = db[name];
        if (!M || typeof M.drop !== 'function') { dropped.add(name); progress = true; continue; }
        try {
          await M.drop();
          dropped.add(name);
          progress = true;
        } catch (e) {
          // Skip for this pass; will retry after others
        }
      }
    }
    // Cleanup registries so reinstall can re-register cleanly
    addonModelsByModule.delete(modName);
    // Remove registeredAddonModels keys for this module (allow re-register)
    try {
      const dirs = resolveAddonDirs();
      for (const dir of dirs) {
        const mdir = path.join(dir, modName, 'models');
        if (!fs.existsSync(mdir)) continue;
        const files = fs.readdirSync(mdir).filter(f => f.endsWith('.js'));
        for (const f of files) registeredAddonModels.delete(`${modName}/${f}`);
      }
    } catch {}
    return { dropped: Array.from(dropped) };
  } catch (e) {
    console.warn(`[API v1] dropAddonModels failed for ${modName}:`, e?.message || e);
    return { dropped: [] };
  }
}

module.exports.dropAddonModels = dropAddonModels;
