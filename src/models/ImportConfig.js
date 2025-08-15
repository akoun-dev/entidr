'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration des importations
 * Stocke les paramètres pour les importations de données
 */
module.exports = (sequelize, DataTypes) => {
  class ImportConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  ImportConfig.init({
    // Formats de fichiers autorisés (CSV, Excel, XML, JSON)
    allowedFormats: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['csv', 'xlsx', 'xml', 'json']
    },
    // Taille maximale de fichier (en octets)
    maxFileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10485760 // 10 MB
    },
    // Délimiteur par défaut pour CSV
    defaultDelimiter: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ','
    },
    // Encodage par défaut
    defaultEncoding: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'UTF-8'
    },
    // Validation des données avant import
    validateBeforeImport: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Ignorer les erreurs et continuer l'import
    ignoreErrors: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Nombre maximum de lignes par import
    maxRows: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Dossier temporaire pour les imports
    tempDirectory: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '/tmp/imports'
    },
    // Notifications par email des résultats d'import
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Emails pour les notifications
    notificationEmails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Paramètres avancés (JSON)
    advancedSettings: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ImportConfig',
  });
  
  return ImportConfig;
};
