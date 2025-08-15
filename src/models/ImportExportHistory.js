'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour l'historique des importations et exportations
 * Stocke les informations sur les opérations d'import/export effectuées
 */
module.exports = (sequelize, DataTypes) => {
  class ImportExportHistory extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // Association avec l'utilisateur qui a effectué l'opération
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  
  ImportExportHistory.init({
    // Type d'opération (import ou export)
    operationType: {
      type: DataTypes.ENUM('import', 'export'),
      allowNull: false
    },
    // Date et heure de l'opération
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // ID de l'utilisateur qui a effectué l'opération
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Type de données (users, products, etc.)
    dataType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Format du fichier (CSV, Excel, etc.)
    fileFormat: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Nom du fichier original
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Taille du fichier en octets
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Nombre d'enregistrements traités
    recordCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Statut de l'opération (success, partial, failed)
    status: {
      type: DataTypes.ENUM('success', 'partial', 'failed'),
      allowNull: false
    },
    // Détails des erreurs (le cas échéant)
    errorDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Durée de l'opération en secondes
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Paramètres utilisés pour l'opération (JSON)
    parameters: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Chemin du fichier sur le serveur (pour les exports)
    filePath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Date d'expiration du fichier (pour les exports)
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ImportExportHistory',
  });
  
  return ImportExportHistory;
};
