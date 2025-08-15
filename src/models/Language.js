'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Language extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
    }
  }
  Language.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true,
      },
      native_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      direction: {
        type: DataTypes.ENUM('ltr', 'rtl'),
        defaultValue: 'ltr',
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
      modelName: 'Language',
    }
  );
  return Language;
};
