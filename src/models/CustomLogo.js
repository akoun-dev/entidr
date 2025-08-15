'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les logos personnalisés de l'application
 * Stocke les différentes versions des logos
 */
module.exports = (sequelize, DataTypes) => {
  class CustomLogo extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  CustomLogo.init({
    // Type de logo (main, small, favicon, login, etc.)
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Chemin du fichier
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Nom du fichier original
    originalFilename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type MIME
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Taille du fichier en octets
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Dimensions (largeur x hauteur)
    dimensions: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Actif ou non
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Métadonnées supplémentaires (JSON)
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'CustomLogo',
  });
  
  return CustomLogo;
};
