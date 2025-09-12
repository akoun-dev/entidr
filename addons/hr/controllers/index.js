// Contrôleur des employés
const employeeController = require('./EmployeeController');

// Contrôleur des départements
const departmentController = require('./DepartmentController');

// Contrôleur des contrats
const contractController = require('./ContractController');

// Contrôleur des documents
const documentController = require('./DocumentController');

// Contrôleur des statistiques HR
const hrStatsController = require('./HRStatsController');

module.exports = {
  // Employés
  ...employeeController,

  // Départements
  ...departmentController,

  // Contrats
  ...contractController,

  // Documents
  ...documentController,

  // Statistiques HR
  ...hrStatsController
};
