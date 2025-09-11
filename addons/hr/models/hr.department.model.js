'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrDepartment extends Model {
    static associate(models) {
      if (models.HrEmployee) {
        HrDepartment.hasMany(models.HrEmployee, {
          foreignKey: 'department_id',
          as: 'employees'
        });
        HrDepartment.belongsTo(models.HrEmployee, {
          foreignKey: 'manager_id',
          as: 'manager'
        });
      }
    }
  }

  HrDepartment.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    manager_id: { type: DataTypes.INTEGER, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    sequelize,
    modelName: 'HrDepartment',
    tableName: 'HrDepartments',
    hooks: {
      async afterUpdate(dept) {
        const models = sequelize.models;
        if (dept.changed('manager_id')) {
          const managerId = dept.manager_id;
          // Flag new manager as department manager
          if (managerId) {
            try { await models.HrEmployee.update({ is_department_manager: true }, { where: { id: managerId } }); } catch {}
          }
        }
      }
    }
  });

  return HrDepartment;
};
