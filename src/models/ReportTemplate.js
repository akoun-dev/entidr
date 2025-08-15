'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les modèles de rapports
 * Stocke les modèles de rapports analytiques (financiers, ventes, etc.)
 */
module.exports = (sequelize, DataTypes) => {
  class ReportTemplate extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  ReportTemplate.init({
    // Nom du modèle de rapport
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Catégorie du rapport (Finance, Ventes, RH, etc.)
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Description du rapport
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Contenu du modèle (structure JSON, SQL, etc.)
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    // Format de sortie (PDF, Excel, CSV, etc.)
    format: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PDF'
    },
    // Paramètres du rapport (stockés sous forme de JSON)
    parameters: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Requête SQL ou logique de génération du rapport
    query: {
      type: DataTypes.TEXT,
      allowNull: true
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
    },
    // Indique si ce modèle est partagé avec tous les utilisateurs
    isShared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Permissions requises pour utiliser ce modèle
    requiredPermissions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Fréquence d'exécution automatique (quotidien, hebdomadaire, mensuel, etc.)
    scheduleFrequency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Expression cron pour l'exécution automatique
    scheduleCron: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ReportTemplate',
  });
  
  return ReportTemplate;
};
