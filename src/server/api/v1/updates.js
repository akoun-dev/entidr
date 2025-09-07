'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const { Module } = require('../../../models');
const { authenticate, authorize } = require('../../middlewares/auth');
const logger = require('../../../utils/logger.server');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Folders
const ROOT = path.resolve(__dirname, '../../../../');
const MODULES_DIR = path.join(ROOT, 'addons');
const UPDATES_DIR = path.join(ROOT, 'updates', 'modules');
const BACKUPS_DIR = path.join(ROOT, 'backups', 'modules');

function bytesToSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Execute a shell command (used for running migrations)
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const child = spawn(command, args, { shell: false, cwd: options.cwd || ROOT });
    let stderr = '';
    let stdout = '';
    if (child.stdout) child.stdout.on('data', d => { stdout += d.toString(); });
    if (child.stderr) child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) {
        const err = new Error(`Command failed: ${command} ${args.join(' ')} (code ${code})`);
        err.code = code;
        err.stderr = stderr;
        err.stdout = stdout;
        return reject(err);
      }
      resolve({ code, stdout, stderr });
    });
  });
}

function dirSize(p) {
  let size = 0;
  if (!fs.existsSync(p)) return 0;
  const entries = fs.readdirSync(p, { withFileTypes: true });
  for (const e of entries) {
    const ep = path.join(p, e.name);
    if (e.isDirectory()) size += dirSize(ep);
    else size += fs.statSync(ep).size;
  }
  return size;
}

/**
 * @swagger
 * /updates/modules:
 *   get:
 *     summary: Liste les mises à jour de modules disponibles
 *     tags: [Updates]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ModuleUpdate'
 *                 error:
 *                   nullable: true
 */
// GET /updates/modules - list available module updates in updates/modules/<module>/<version>
router.get('/updates/modules', asyncHandler(async (req, res) => {
  const items = [];
  if (!fs.existsSync(UPDATES_DIR)) {
    return res.ok(items);
  }

  const moduleFolders = fs.readdirSync(UPDATES_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  const dbModules = await Module.findAll();
  const byName = new Map(dbModules.map(m => [m.name, m]));

  for (const modName of moduleFolders) {
    const modPath = path.join(UPDATES_DIR, modName);
    const versionDirs = fs.readdirSync(modPath, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    for (const ver of versionDirs) {
      const updatePath = path.join(modPath, ver);
      const size = bytesToSize(dirSize(updatePath));
      const stats = fs.statSync(updatePath);
      const releaseDate = stats.mtime.toISOString().slice(0,10);
      // Try to read changelog
      let changelog = [];
      const clFiles = ['CHANGELOG.md', 'changelog.md', 'changelog.txt'];
      for (const f of clFiles) {
        const fp = path.join(updatePath, f);
        if (fs.existsSync(fp)) {
          const content = fs.readFileSync(fp, 'utf8');
          changelog = content.split(/\r?\n/).filter(Boolean).slice(0, 20);
          break;
        }
      }
      const m = byName.get(modName);
      const currentVersion = m ? (m.version || '0.0.0') : '0.0.0';
      items.push({
        id: `${modName}@${ver}`,
        type: 'module',
        name: m ? (m.displayName || m.name) : modName,
        module: modName,
        currentVersion,
        newVersion: ver,
        size,
        releaseDate,
        changelog,
        security: changelog.some(l => /security|securit|cve|vuln/i.test(l)),
      });
    }
  }
  res.ok(items);
}));

/**
 * @swagger
 * /updates/modules/{name}/apply:
 *   post:
 *     summary: Applique une mise à jour de module
 *     tags: [Updates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom technique du module (ex. hr)
 *       - in: query
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *         description: Version à appliquer (ex. 1.1.0)
 *     responses:
 *       200:
 *         description: Mise à jour appliquée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     version: { type: string }
 *                     backup: { type: string }
 *                 error:
 *                   nullable: true
 */
// POST /updates/modules/:name/apply?version=1.2.3 - apply selected version update
router.post('/updates/modules/:name/apply', authenticate, authorize(['admin']), asyncHandler(async (req, res) => {
  const name = req.params.name;
  const version = req.query.version || req.body.version;
  if (!version) return res.fail(400, 'Paramètre version manquant');
  const updatePath = path.join(UPDATES_DIR, name, String(version));
  if (!fs.existsSync(updatePath)) return res.fail(404, 'Mise à jour introuvable');

  // Ensure addon exists
  const addonPath = path.join(MODULES_DIR, name);
  if (!fs.existsSync(addonPath)) return res.fail(400, `Le module ${name} n'existe pas dans addons/`);

  // Backup current addon
  fse.ensureDirSync(BACKUPS_DIR);
  const backupPath = path.join(BACKUPS_DIR, `${name}-${Date.now()}`);
  await fse.copy(addonPath, backupPath);

  // Apply update (copy over files)
  await fse.copy(updatePath, addonPath, { overwrite: true });

  // Run migrations if present
  const migrationsPath = path.join(updatePath, 'migrations');
  if (fs.existsSync(migrationsPath)) {
    logger.info(`Migrations détectées pour ${name} (${version}) dans ${migrationsPath}`);
    try {
      const result = await runCommand('npx', ['sequelize-cli', 'db:migrate', '--migrations-path', migrationsPath], { cwd: ROOT });
      logger.info(`Migrations ${name}@${version} exécutées avec succès.`);
      if (result && result.stdout) logger.debug?.(result.stdout);
    } catch (e) {
      logger.error(`Échec des migrations pour ${name}@${version}: ${e.message}`);
      return res.fail(500, `Échec des migrations pour ${name}@${version}`, { details: e.stderr || e.message, backup: backupPath });
    }
  }

  // Update DB version and keep installed/active flags
  const mod = await Module.findOne({ where: { name } });
  if (mod) {
    mod.version = String(version);
    await mod.save();
  }

  res.ok({ name, version, backup: backupPath });
}));

module.exports = router;
