'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrTask extends Model {
    static associate(models) {
      if (models.HrEmployee) {
        HrTask.belongsTo(models.HrEmployee, { foreignKey: 'employee_id', as: 'employee' });
      }
    }
  }

  HrTask.init({
    employee_id: { type: DataTypes.INTEGER, allowNull: true },
    kind: { type: DataTypes.ENUM('onboarding', 'offboarding'), allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    assignee_role: { type: DataTypes.ENUM('employee','manager','hr','admin','it','security'), allowNull: true },
    due_date: { type: DataTypes.DATEONLY, allowNull: true },
    status: { type: DataTypes.ENUM('pending','in_progress','done'), allowNull: false, defaultValue: 'pending' },
    completed_by: { type: DataTypes.INTEGER, allowNull: true },
    completed_at: { type: DataTypes.DATE, allowNull: true },
  }, {
    sequelize,
    modelName: 'HrTask',
    tableName: 'HrTasks',
  });

  return HrTask;
};

