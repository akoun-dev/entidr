'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
    }
  }
  Country.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(2),
        allowNull: false,
        unique: true,
      },
      phone_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency_code: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      region: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    },
    {
      sequelize,
      modelName: 'Country',
    }
  );
  return Country;
};
