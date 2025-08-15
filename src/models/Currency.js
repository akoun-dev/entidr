'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
    }
  }
  Currency.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0,
      },
      position: {
        type: DataTypes.ENUM('before', 'after'),
        defaultValue: 'after',
      },
      decimal_places: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      rounding: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.01,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    },
    {
      sequelize,
      modelName: 'Currency',
    }
  );
  return Currency;
};
