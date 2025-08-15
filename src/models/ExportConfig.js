'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration des exportations
 * Stocke les paramètres pour les exportations de données
 */
module.exports = (sequelize, DataTypes) => {
  class ExportConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  ExportConfig.init({
    // Formats d'exportation disponibles (CSV, Excel, XML, JSON, PDF)
    availableFormats: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['csv', 'xlsx', 'xml', 'json', 'pdf']
    },
    // Format par défaut
    defaultFormat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'xlsx'
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
    // Inclure les en-têtes dans les exports CSV
    includeHeaders: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Nombre maximum de lignes par export
    maxRows: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 100000
    },
    // Dossier temporaire pour les exports
    tempDirectory: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '/tmp/exports'
    },
    // Compression des fichiers exportés
    compressExports: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Format de date par défaut pour les exports
    dateFormat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'YYYY-MM-DD'
    },
    // Notifications par email des exports terminés
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
    modelName: 'ExportConfig',
  });
  
  return ExportConfig;
};
