'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrEmployee extends Model {
    static associate(models) {
      if (models.HrDepartment) {
        HrEmployee.belongsTo(models.HrDepartment, {
          foreignKey: 'department_id',
          as: 'department'
        });
      }
      HrEmployee.belongsTo(models.HrEmployee, {
        foreignKey: 'parent_id',
        as: 'manager'
      });
      HrEmployee.hasMany(models.HrEmployee, {
        foreignKey: 'parent_id',
        as: 'reports'
      });
    }
  }

  HrEmployee.init({
    name: { type: DataTypes.STRING, allowNull: false },
    job_title: { type: DataTypes.STRING, allowNull: true },
    department_id: { type: DataTypes.INTEGER, allowNull: true },
    work_email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
    work_phone: { type: DataTypes.STRING, allowNull: true },
    mobile_phone: { type: DataTypes.STRING, allowNull: true },
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    birth_date: { type: DataTypes.DATEONLY, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    employment_type: { type: DataTypes.STRING, allowNull: true },
    hire_date: { type: DataTypes.DATEONLY, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    sequelize,
    modelName: 'HrEmployee',
    tableName: 'HrEmployees',
  });

  return HrEmployee;
};

