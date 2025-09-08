'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class HrPermission extends Model {
    static associate(models) {
      // No explicit associations for now
    }
  }

  HrPermission.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    resource: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'HrPermission',
    tableName: 'HrPermissions',
    timestamps: true,
  });

  return HrPermission;
};

