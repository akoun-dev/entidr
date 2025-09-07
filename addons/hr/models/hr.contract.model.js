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
    }
  }

  HrContract.init({
    name: { type: DataTypes.STRING, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    contract_type: { type: DataTypes.STRING, allowNull: false },
    date_start: { type: DataTypes.DATEONLY, allowNull: false },
    date_end: { type: DataTypes.DATEONLY, allowNull: true },
    wage: { type: DataTypes.FLOAT, allowNull: true },
    state: { type: DataTypes.ENUM('draft', 'running', 'expired', 'cancelled'), allowNull: false, defaultValue: 'draft' },
    notes: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'HrContract',
    tableName: 'HrContracts',
  });

  return HrContract;
};

