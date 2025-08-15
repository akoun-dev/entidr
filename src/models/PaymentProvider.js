'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les fournisseurs de paiement
 * Stocke les configurations des méthodes de paiement disponibles
 */
module.exports = (sequelize, DataTypes) => {
  class PaymentProvider extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  PaymentProvider.init({
    // Nom du fournisseur de paiement
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type de paiement (Carte bancaire, Virement, Portefeuille électronique, etc.)
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Clé API du fournisseur (cryptée)
    apiKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Secret API du fournisseur (crypté)
    apiSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Configuration supplémentaire (stockée sous forme de JSON)
    config: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Frais de transaction (format: "1.4% + 0.25€")
    fees: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Indique si ce fournisseur est actif
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Mode de fonctionnement (test, production)
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'test'
    },
    // URL de callback pour les webhooks
    webhookUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Méthodes de paiement supportées (stockées sous forme de JSON)
    supportedMethods: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Devises supportées (stockées sous forme de JSON)
    supportedCurrencies: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Pays supportés (stockés sous forme de JSON)
    supportedCountries: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PaymentProvider',
  });
  
  return PaymentProvider;
};
