'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');
const { authorizeBpmn } = require('../../../addons/bpmn');

const router = express.Router();
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

module.exports = router;
