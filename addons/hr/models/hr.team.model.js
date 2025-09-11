'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HrTeam extends Model {
    static associate(models) {
      if (models.HrDepartment) {
        HrTeam.belongsTo(models.HrDepartment, { foreignKey: 'department_id', as: 'department' });
      }
      if (models.HrEmployee) {
        HrTeam.belongsTo(models.HrEmployee, { foreignKey: 'leader_id', as: 'leader' });
        HrTeam.hasMany(models.HrEmployee, { foreignKey: 'team_id', as: 'members' });
      }
    }
  }

  HrTeam.init({
    name: { type: DataTypes.STRING, allowNull: false },
    department_id: { type: DataTypes.INTEGER, allowNull: false },
    leader_id: { type: DataTypes.INTEGER, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    sequelize,
    modelName: 'HrTeam',
    tableName: 'HrTeams',
  });

  return HrTeam;
};

