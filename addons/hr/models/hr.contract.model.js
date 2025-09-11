'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrContract extends Model {
    static associate(models) {
      if (models.HrEmployee) {
        HrContract.belongsTo(models.HrEmployee, {
          foreignKey: 'employee_id',
          as: 'employee'
        });
      }
      if (models.HrDepartment) {
        HrContract.belongsTo(models.HrDepartment, {
          foreignKey: 'department_id',
          as: 'department'
        });
      }
    }
  }

  HrContract.init({
    name: { type: DataTypes.STRING, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    contract_type: { type: DataTypes.STRING, allowNull: false },
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    date_start: { type: DataTypes.DATEONLY, allowNull: false },
    date_end: { type: DataTypes.DATEONLY, allowNull: true },
    wage: { type: DataTypes.FLOAT, allowNull: true },
    state: { type: DataTypes.ENUM('draft', 'running', 'expired', 'cancelled'), allowNull: false, defaultValue: 'draft' },
    notes: { type: DataTypes.TEXT, allowNull: true },
    payroll_id: { type: DataTypes.STRING, allowNull: true },
    payroll_system: { type: DataTypes.STRING, allowNull: true },
    salary_currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'EUR' },
    payment_frequency: { type: DataTypes.ENUM('weekly','bi-weekly','monthly','quarterly'), allowNull: false, defaultValue: 'monthly' },
  }, {
    sequelize,
    modelName: 'HrContract',
    tableName: 'HrContracts',
  });

  return HrContract;
};
