'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrDocument extends Model {
    static associate(models) {
      if (models.HrEmployee) {
        HrDocument.belongsTo(models.HrEmployee, {
          foreignKey: 'employee_id',
          as: 'employee'
        });
      }
    }
  }

  HrDocument.init({
    name: { type: DataTypes.STRING, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: true },
    file_url: { type: DataTypes.STRING, allowNull: false },
    mime_type: { type: DataTypes.STRING, allowNull: true },
    size_bytes: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    sequelize,
    modelName: 'HrDocument',
    tableName: 'HrDocuments',
  });

  return HrDocument;
};

