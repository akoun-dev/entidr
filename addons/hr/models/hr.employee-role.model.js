'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrEmployeeRole extends Model {
    static associate(models) {
      if (models.HrEmployee) {
        HrEmployeeRole.belongsTo(models.HrEmployee, { foreignKey: 'employee_id', as: 'employee' });
      }
      if (models.HrRole) {
        HrEmployeeRole.belongsTo(models.HrRole, { foreignKey: 'role_id', as: 'role' });
      }
    }
  }

  HrEmployeeRole.init({
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    assigned_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    assigned_by: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    sequelize,
    modelName: 'HrEmployeeRole',
    tableName: 'HrEmployeeRoles',
  });

  return HrEmployeeRole;
};

