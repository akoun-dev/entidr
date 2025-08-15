'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour la configuration de conformité
 * Stocke les paramètres liés à la conformité réglementaire
 */
module.exports = (sequelize, DataTypes) => {
  class ComplianceConfig extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  ComplianceConfig.init({
    // RGPD activé
    gdprEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Politique de conservation des données (en jours)
    dataRetentionPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 730 // 2 ans
    },
    // Anonymisation des données après la période de rétention
    anonymizeAfterRetention: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Consentement requis pour la collecte de données
    requireConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Texte de consentement
    consentText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // URL de la politique de confidentialité
    privacyPolicyUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Journalisation des accès aux données sensibles
    logSensitiveDataAccess: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Chiffrement des données sensibles
    encryptSensitiveData: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Notification des violations de données
    dataBreachNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Emails pour les notifications de violation
    dataBreachEmails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Conformité HIPAA (santé)
    hipaaCompliance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Conformité PCI DSS (paiement)
    pciDssCompliance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Conformité SOX (finance)
    soxCompliance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Paramètres avancés (JSON)
    advancedSettings: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ComplianceConfig',
  });
  
  return ComplianceConfig;
};
