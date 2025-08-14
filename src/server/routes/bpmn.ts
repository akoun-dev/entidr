import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { authorizeBpmn } from '../../../addons/bpmn';

const router = Router();
const logFile = path.join(__dirname, '../../../addons/bpmn/bpmn.log');

router.post('/process/:id/publish', authorizeBpmn(['SuperAdmin', 'Administrateur']), (req, res) => {
  const { id } = req.params;
  fs.appendFileSync(logFile, `publish ${id} ${new Date().toISOString()}\n`);
  res.json({ message: `Process ${id} published` });
});

router.post('/process/:id/rollback', authorizeBpmn(['SuperAdmin', 'Administrateur']), (req, res) => {
  const { id } = req.params;
  fs.appendFileSync(logFile, `rollback ${id} ${new Date().toISOString()}\n`);
  res.json({ message: `Process ${id} rolled back` });
});

export default router;
