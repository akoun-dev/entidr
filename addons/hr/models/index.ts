import { Sequelize } from 'sequelize';
import { initEmployeeModel, Employee } from './Employee';
import { initDepartmentModel, Department } from './Department';
import { initContractModel, Contract } from './Contract';
import { initDocumentModel, Document } from './Document';

// Initialiser tous les modèles
export function initModels(sequelize: Sequelize, DataTypes: any) {
  // Initialiser les modèles
  const EmployeeModel = initEmployeeModel(sequelize);
  const DepartmentModel = initDepartmentModel(sequelize);
  const ContractModel = initContractModel(sequelize, DataTypes);
  const DocumentModel = initDocumentModel(sequelize, DataTypes);

  // Définir les associations
  defineAssociations();

  return {
    Employee: EmployeeModel,
    Department: DepartmentModel,
    Contract: ContractModel,
    Document: DocumentModel
  };
}

// Définir les associations entre les modèles
function defineAssociations() {
  // Association Employee -> Department
  Employee.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department'
  });

  // Association Department -> Employee (manager)
  Department.belongsTo(Employee, {
    foreignKey: 'manager_id',
    as: 'manager'
  });

  // Association Department -> Employee (employés)
  Department.hasMany(Employee, {
    foreignKey: 'department_id',
    as: 'employees'
  });

  // Association Department -> Department (sous-départements)
  Department.hasMany(Department, {
    foreignKey: 'parent_id',
    as: 'sub_departments'
  });

  // Association Department -> Department (département parent)
  Department.belongsTo(Department, {
    foreignKey: 'parent_id',
    as: 'parent_department'
  });

  // Association Contract -> Employee
  Contract.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
  });

  // Association Employee -> Contract
  Employee.hasMany(Contract, {
    foreignKey: 'employee_id',
    as: 'contracts'
  });

  // Association Document -> Employee
  Document.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
  });

  // Association Employee -> Document
  Employee.hasMany(Document, {
    foreignKey: 'employee_id',
    as: 'documents'
  });

  // Association Document -> User (créateur)
  // Document.belongsTo(require('../../../src/models').User, {
  //   foreignKey: 'created_by',
  //   as: 'creator'
  // });
}

export {
  Employee,
  Department,
  Contract,
  Document
};
