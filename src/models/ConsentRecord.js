'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les enregistrements de consentement
 * Stocke les consentements donnés par les utilisateurs
 */
module.exports = (sequelize, DataTypes) => {
  class ConsentRecord extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec l'utilisateur qui a donné son consentement
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  
  ConsentRecord.init({
    // ID de l'utilisateur
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Type de consentement (privacy_policy, cookies, marketing, etc.)
    consentType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Date et heure du consentement
    consentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Valeur du consentement (true/false)
    consentValue: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    // Version de la politique acceptée
    policyVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Adresse IP de l'utilisateur
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Agent utilisateur (navigateur)
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Méthode de collecte du consentement
    collectionMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Texte exact présenté à l'utilisateur
    consentText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Date d'expiration du consentement
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Métadonnées supplémentaires (JSON)
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ConsentRecord',
  });
  
  return ConsentRecord;
};
