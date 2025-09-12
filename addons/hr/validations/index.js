// Validations pour les employés
const employeeValidation = require('./employeeValidation');

// Validations pour les départements
const departmentValidation = require('./departmentValidation');

// Validations pour les contrats
const contractValidation = require('./contractValidation');

// Validations pour les documents
const documentValidation = require('./documentValidation');

module.exports = {
  ...employeeValidation,
  ...departmentValidation,
  ...contractValidation,
  ...documentValidation
};
