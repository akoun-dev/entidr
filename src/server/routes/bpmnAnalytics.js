'use strict';

const express = require('express');
const router = express.Router();

function generateMetrics() {
  return {
    activeInstances: Math.floor(Math.random() * 20),
    averageDuration: Math.floor(Math.random() * 100),
    slaCompliance: Math.floor(Math.random() * 100)
  };
}

router.get('/', (req, res) => {
  res.json(generateMetrics());
});

module.exports = { router, generateMetrics };
