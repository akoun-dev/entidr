'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrWorkflow extends Model {
    static associate(models) {
      if (models.HrTask) {
        HrWorkflow.hasMany(models.HrTask, { foreignKey: 'workflow_id', as: 'tasks' });
      }
      if (models.HrDepartment) {
        HrWorkflow.belongsTo(models.HrDepartment, { foreignKey: 'target_department_id', as: 'target_department' });
      }
      if (models.HrEmployee) {
        HrWorkflow.belongsTo(models.HrEmployee, { foreignKey: 'target_employee_id', as: 'target_employee' });
      }
    }
  }

  HrWorkflow.init({
    name: { type: DataTypes.STRING, allowNull: false },
    kind: { type: DataTypes.STRING, allowNull: false }, // e.g., onboarding/offboarding/contract/document
    config: { type: DataTypes.JSON, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    target_employee_id: { type: DataTypes.INTEGER, allowNull: true },
    target_department_id: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    sequelize,
    modelName: 'HrWorkflow',
    tableName: 'HrWorkflows',
  });

  return HrWorkflow;
};
