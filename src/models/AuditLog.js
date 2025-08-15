'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les journaux d'audit
 * Stocke les enregistrements d'activités et d'événements du système
 */
module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
      // Un journal d'audit peut être lié à un utilisateur
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  
  AuditLog.init({
    // Date et heure de l'événement
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // ID de l'utilisateur qui a déclenché l'événement (peut être null pour les événements système)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Type d'action (login, data_change, permission_change, etc.)
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Entité cible de l'action (utilisateur, document, paramètre, etc.)
    targetType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // ID de l'entité cible
    targetId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Description de l'entité cible
    targetDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Détails de l'action (peut contenir des données JSON)
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Niveau de sévérité (low, medium, high)
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'low'
    },
    // Adresse IP de l'utilisateur
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // User agent du navigateur
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Statut de l'action (success, failure)
    status: {
      type: DataTypes.ENUM('success', 'failure'),
      allowNull: false,
      defaultValue: 'success'
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    // Désactiver les timestamps automatiques car nous utilisons notre propre champ timestamp
    timestamps: false,
    // Ajouter des index pour améliorer les performances des requêtes
    indexes: [
      {
        name: 'audit_log_timestamp_idx',
        fields: ['timestamp']
      },
      {
        name: 'audit_log_user_id_idx',
        fields: ['userId']
      },
      {
        name: 'audit_log_action_idx',
        fields: ['action']
      },
      {
        name: 'audit_log_target_idx',
        fields: ['targetType', 'targetId']
      },
      {
        name: 'audit_log_severity_idx',
        fields: ['severity']
      }
    ]
  });
  
  return AuditLog;
};
