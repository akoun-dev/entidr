const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/companyController');

// GET /api/v1/companies - Récupère les infos de l'entreprise
router.get('/', companyController.getCompany);

// PUT /api/v1/companies - Met à jour les infos de l'entreprise
router.put('/', companyController.updateCompany);

// GET /api/v1/companies/status - Récupère le statut
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    message: 'Company status retrieved successfully'
  });
});

module.exports = router;
