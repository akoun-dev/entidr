'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class HrRole extends Model {
    static associate(models) {
      // No explicit associations for now
    }
  }

  HrRole.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    // Store permissions as array of strings (JSON)
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      get() {
        const raw = this.getDataValue('permissions');
        if (Array.isArray(raw)) return raw;
        if (!raw) return [];
        try { return JSON.parse(raw); } catch { return []; }
      },
      set(val) {
        if (Array.isArray(val)) this.setDataValue('permissions', val);
        else if (val == null) this.setDataValue('permissions', []);
        else this.setDataValue('permissions', [String(val)]);
      }
    },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, {
    sequelize,
    modelName: 'HrRole',
    tableName: 'HrRoles',
    timestamps: true,
  });

  return HrRole;
};

