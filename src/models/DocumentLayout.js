'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les mises en page de documents
 * Stocke les modèles de documents (factures, devis, etc.)
 */
module.exports = (sequelize, DataTypes) => {
  class DocumentLayout extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  DocumentLayout.init({
    // Nom du modèle de document
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type de document (facture, devis, bon de commande, etc.)
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Contenu HTML/CSS du modèle
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    // Métadonnées du modèle (stockées sous forme de JSON)
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Indique si ce modèle est le modèle par défaut pour son type
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Orientation du document (portrait, landscape)
    orientation: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'portrait'
    },
    // Format du papier (A4, Letter, etc.)
    paperSize: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'A4'
    },
    // Marges du document (en mm, stockées sous forme de JSON)
    margins: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    // Aperçu du modèle (URL de l'image)
    previewUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Statut du modèle (active, archived)
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'DocumentLayout',
    hooks: {
      // Avant de créer un nouveau modèle par défaut, désactiver les autres modèles par défaut du même type
      beforeCreate: async (layout, options) => {
        if (layout.isDefault) {
          await sequelize.models.DocumentLayout.update(
            { isDefault: false },
            { 
              where: { 
                type: layout.type,
                isDefault: true
              },
              transaction: options.transaction
            }
          );
        }
      },
      // Avant de mettre à jour un modèle, si on le définit comme modèle par défaut, désactiver les autres modèles par défaut du même type
      beforeUpdate: async (layout, options) => {
        if (layout.changed('isDefault') && layout.isDefault) {
          await sequelize.models.DocumentLayout.update(
            { isDefault: false },
            { 
              where: { 
                type: layout.type,
                isDefault: true,
                id: { [sequelize.Sequelize.Op.ne]: layout.id }
              },
              transaction: options.transaction
            }
          );
        }
      }
    }
  });
  
  return DocumentLayout;
};
