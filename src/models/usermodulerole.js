'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserModuleRole extends Model {
    static associate(models) {
      if (models.User) {
        UserModuleRole.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      }
    }
  }

  UserModuleRole.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    module: { type: DataTypes.STRING, allowNull: false, field: 'module_name' },
    role: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: 'UserModuleRole',
    tableName: 'UserModuleRoles',
    indexes: [
      { unique: true, fields: ['user_id', 'module_name'] },
      { fields: ['module_name'] },
    ]
  });

  return UserModuleRole;
};
