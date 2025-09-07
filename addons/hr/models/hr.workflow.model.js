'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrWorkflow extends Model {
    static associate(models) {}
  }

  HrWorkflow.init({
    name: { type: DataTypes.STRING, allowNull: false },
    kind: { type: DataTypes.STRING, allowNull: false }, // e.g., onboarding/offboarding/contract/document
    config: { type: DataTypes.JSON, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    sequelize,
    modelName: 'HrWorkflow',
    tableName: 'HrWorkflows',
  });

  return HrWorkflow;
};

