'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TimeFormat extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
    }
  }
  TimeFormat.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      format: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      example: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      uses_24_hour: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    },
    {
      sequelize,
      modelName: 'TimeFormat',
    }
  );
  return TimeFormat;
};
