// Modèle Employee
const Employee = require('./Employee');

// Modèle Department
const Department = require('./Department');

// Modèle Contract
const Contract = require('./Contract');

// Modèle Document
const Document = require('./Document');

// Définir les associations
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Employee.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
Employee.hasMany(Employee, { foreignKey: 'manager_id', as: 'subordinates' });
Employee.hasMany(Contract, { foreignKey: 'employee_id', as: 'contracts' });
Employee.hasMany(Document, { foreignKey: 'employee_id', as: 'documents' });

Department.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
Department.belongsTo(Department, { foreignKey: 'parent_id', as: 'parent_department' });
Department.hasMany(Department, { foreignKey: 'parent_id', as: 'sub_departments' });
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });

Contract.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

Document.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

module.exports = {
  Employee,
  Department,
  Contract,
  Document
};
