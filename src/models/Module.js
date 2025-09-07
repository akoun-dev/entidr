const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Module = sequelize.define('Module', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    installed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    installable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    application: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    autoInstall: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dependencies: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    models: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    installedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Modules',
    timestamps: true
  });

  return Module;
};
