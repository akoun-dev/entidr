'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NumberFormat extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
    }
  }
  NumberFormat.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      decimal_separator: {
        type: DataTypes.STRING(1),
        allowNull: false,
      },
      thousands_separator: {
        type: DataTypes.STRING(1),
        allowNull: true,
      },
      decimal_places: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      currency_display: {
        type: DataTypes.ENUM('symbol', 'code', 'name'),
        allowNull: false,
        defaultValue: 'symbol',
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
      modelName: 'NumberFormat',
    }
  );
  return NumberFormat;
};
