'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DateFormat extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
    }
  }
  DateFormat.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      format: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('date', 'time', 'datetime'),
        defaultValue: 'date',
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
      modelName: 'DateFormat',
    }
  );
  return DateFormat;
};
