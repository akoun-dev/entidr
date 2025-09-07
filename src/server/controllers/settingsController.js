'use strict';

const { Country, Currency, PaymentProvider, Workflow, Company, SecuritySetting } = require('../../models');
const { Op } = require('sequelize');

// Récupérer la liste des pays
const getCountries = async (req, res) => {
  try {
    // Align with model/migration field name: 'phone_code'
    const countries = await Country.findAll({
      attributes: ['id', 'name', 'code', 'phone_code'],
      order: [['name', 'ASC']]
    });
    res.ok(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.fail(500, 'Internal server error');
  }
};

// Récupérer la liste des devises
const getCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.findAll({
      attributes: ['id', 'name', 'code', 'symbol'],
      order: [['name', 'ASC']]
    });
    res.ok(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.fail(500, 'Internal server error');
  }
};

// Récupérer les fournisseurs de paiement
const getPaymentProviders = async (req, res) => {
  try {
    const providers = await PaymentProvider.findAll({
      attributes: ['id', 'name', 'isActive'],
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.ok(providers);
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    res.fail(500, 'Internal server error');
  }
};

// Récupérer les workflows
const getWorkflows = async (req, res) => {
  try {
    // Align with model/migration field name: 'active' (not 'isActive')
    const workflows = await Workflow.findAll({
      attributes: ['id', 'name', 'description', 'active'],
      order: [['name', 'ASC']]
    });
    res.ok(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.fail(500, 'Internal server error');
  }
};

// Récupérer les paramètres de l'entreprise
const getCompanySettings = async (req, res) => {
  try {
    const settings = await Company.findOne({
      attributes: ['name', 'address', 'phone', 'email', 'logo']
    });
    res.ok(settings || {});
  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.fail(500, 'Internal server error');
  }
};

// Récupérer les paramètres de sécurité
const getSecuritySettings = async (req, res) => {
  try {
    // The SecuritySetting model stores key/value entries, not columns.
    const keys = ['passwordPolicy', 'loginAttempts', 'sessionTimeout'];
    const rows = await SecuritySetting.findAll({ where: { key: keys } });

    const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
    const payload = {
      passwordPolicy: map.passwordPolicy || null,
      loginAttempts: map.loginAttempts ? Number(map.loginAttempts) : null,
      sessionTimeout: map.sessionTimeout ? Number(map.sessionTimeout) : null
    };

    res.ok(payload);
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.fail(500, 'Internal server error');
  }
};

module.exports = {
  getCountries,
  getCurrencies,
  getPaymentProviders,
  getWorkflows,
  getCompanySettings,
  getSecuritySettings
};
