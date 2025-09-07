'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Company.init({
    name: DataTypes.STRING,
    trading_name: DataTypes.STRING,
    description: DataTypes.TEXT,
    industry: DataTypes.STRING,
    foundation_date: DataTypes.DATEONLY,
    address: DataTypes.TEXT,
    postal_code: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    website: DataTypes.STRING,
    // Identité visuelle
    logo: DataTypes.STRING,
    // Informations légales
    legal_form: DataTypes.STRING,
    registration_number: DataTypes.STRING,
    vat_number: DataTypes.STRING,
    share_capital: DataTypes.STRING,
    legal_representative: DataTypes.STRING,
    legal_info: DataTypes.TEXT,
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'Companies',
    freezeTableName: true,
  });
  return Company;
};
