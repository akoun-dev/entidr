'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrSignatureRequest extends Model {
    static associate(models) {
      if (models.HrDocument) {
        HrSignatureRequest.belongsTo(models.HrDocument, { foreignKey: 'document_id', as: 'document' });
      }
      if (models.HrEmployee) {
        HrSignatureRequest.belongsTo(models.HrEmployee, { foreignKey: 'employee_id', as: 'employee' });
      }
    }
  }

  HrSignatureRequest.init({
    document_id: { type: DataTypes.INTEGER, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: true },
    provider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'internal' },
    status: { type: DataTypes.ENUM('pending','signed','declined'), allowNull: false, defaultValue: 'pending' },
    token: { type: DataTypes.STRING, allowNull: true },
    signed_at: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
  }, {
    sequelize,
    modelName: 'HrSignatureRequest',
    tableName: 'HrSignatureRequests',
  });

  return HrSignatureRequest;
};

