'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrCompliance extends Model {
    static associate(models) {
      if (models.HrEmployee) {
        HrCompliance.belongsTo(models.HrEmployee, { foreignKey: 'employee_id', as: 'employee' });
      }
      if (models.HrDocument) {
        HrCompliance.belongsTo(models.HrDocument, { foreignKey: 'document_id', as: 'document' });
      }
    }
  }

  HrCompliance.init({
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    requirement_type: { type: DataTypes.STRING, allowNull: false },
    requirement_name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    document_id: { type: DataTypes.INTEGER, allowNull: true },
    due_date: { type: DataTypes.DATEONLY, allowNull: true },
    completed_date: { type: DataTypes.DATEONLY, allowNull: true },
    status: { type: DataTypes.ENUM('pending','completed','overdue','exempt'), allowNull: false, defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'HrCompliance',
    tableName: 'HrCompliance',
  });

  return HrCompliance;
};

