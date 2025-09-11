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
      if (models.HrTeam) {
        HrEmployee.belongsTo(models.HrTeam, {
          foreignKey: 'team_id',
          as: 'team'
        });
      }
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
    team_id: { type: DataTypes.INTEGER, allowNull: true },
    is_department_manager: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    sequelize,
    modelName: 'HrEmployee',
    tableName: 'HrEmployees',
    hooks: {
      async beforeSave(emp) {
        const models = sequelize.models;
        if (emp.is_department_manager && emp.department_id) {
          const dept = await models.HrDepartment.findByPk(emp.department_id);
          if (dept && dept.manager_id && dept.manager_id !== emp.id) {
            throw new Error('Incohérence: un responsable de département doit correspondre au manager du département');
          }
        }
        if (emp.changed && emp.changed('department_id') && emp.department_id && !emp.parent_id) {
          const dept = await models.HrDepartment.findByPk(emp.department_id);
          if (dept && dept.manager_id) {
            emp.parent_id = dept.manager_id;
          }
        }
      }
    }
  });

  return HrEmployee;
};
