'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les méthodes d'expédition
 * Stocke les configurations des options de livraison disponibles
 */
module.exports = (sequelize, DataTypes) => {
  class ShippingMethod extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  ShippingMethod.init({
    // Nom de la méthode d'expédition
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Transporteur (La Poste, UPS, etc.)
    carrier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Délai de livraison estimé
    deliveryTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Prix de la livraison
    price: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Indique si cette méthode est active
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Description de la méthode d'expédition
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Règles de tarification (stockées sous forme de JSON)
    pricingRules: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Pays disponibles (stockés sous forme de JSON)
    availableCountries: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Poids maximum autorisé (en kg)
    maxWeight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    // Dimensions maximales autorisées (stockées sous forme de JSON)
    maxDimensions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Informations de suivi (stockées sous forme de JSON)
    trackingInfo: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Ordre d'affichage
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ShippingMethod',
  });
  
  return ShippingMethod;
};
