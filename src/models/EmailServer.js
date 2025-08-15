'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les serveurs de messagerie
 * Stocke les configurations SMTP et autres paramètres d'envoi d'emails
 */
module.exports = (sequelize, DataTypes) => {
  class EmailServer extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
    }
  }
  
  EmailServer.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    protocol: {
      type: DataTypes.ENUM('smtp', 'sendmail'),
      allowNull: false,
      defaultValue: 'smtp'
    },
    host: {
      type: DataTypes.STRING,
      allowNull: false
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 587
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    encryption: {
      type: DataTypes.ENUM('tls', 'ssl', 'none'),
      allowNull: false,
      defaultValue: 'tls'
    },
    from_email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    from_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'EmailServer',
    tableName: 'EmailServers'
  });
  
  return EmailServer;
};
