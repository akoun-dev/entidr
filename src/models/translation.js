'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Translation extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
    }
  }
  Translation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      locale: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      namespace: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'common',
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Translation',
      tableName: 'Translations',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['key', 'locale', 'namespace']
        }
      ]
    }
  );
  return Translation;
};
