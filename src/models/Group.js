'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // Association avec les utilisateurs (many-to-many)
      Group.belongsToMany(models.User, {
        through: 'UserGroups',
        foreignKey: 'groupId',
        otherKey: 'userId'
      });
    }
  }
  Group.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      permissions: {
        type: DataTypes.TEXT, // Stocké en JSON
        allowNull: true,
        get() {
          const value = this.getDataValue('permissions');
          return value ? JSON.parse(value) : [];
        },
        set(value) {
          this.setDataValue('permissions', JSON.stringify(value));
        }
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      }
    },
    {
      sequelize,
      modelName: 'Group',
    }
  );
  return Group;
};
