'use strict';
const { Model } = require('sequelize');
const crypto = require('crypto');

/**
 * Modèle pour les clés API
 * Stocke les clés API utilisées pour l'authentification des applications externes
 */
module.exports = (sequelize, DataTypes) => {
  class ApiKey extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
      // Potentiellement une association avec User pour savoir qui a créé la clé
    }

    /**
     * Génère une nouvelle clé API
     * @returns {string} La clé API générée
     */
    static generateKey() {
      return 'sk_' + crypto.randomBytes(24).toString('hex');
    }

    /**
     * Hache une clé API
     * @param {string} key - La clé API en clair
     * @returns {string} Le hash SHA-256 de la clé
     */
    static hashKey(key) {
      return crypto.createHash('sha256').update(key).digest('hex');
    }

    /**
     * Masque une clé API pour l'affichage
     * @param {string} last4 - Les 4 derniers caractères de la clé
     * @returns {string} La clé API masquée (ex: sk_****1234)
     */
    static maskKey(last4) {
      if (!last4) return '';
      return `sk_****${last4}`;
    }

    /**
     * Vérifie si la clé fournie correspond au hash stocké
     * @param {string} key - La clé API en clair
     * @returns {boolean} Vrai si la clé correspond
     */
    verifyKey(key) {
      return ApiKey.hashKey(key) === this.key_hash;
    }
  }
  
  ApiKey.init({
    // Nom de la clé API (ex: "Application mobile")
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Hash de la clé API
    key_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Derniers caractères de la clé pour l'affichage
    key_last4: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    // Clé API masquée pour l'affichage
    masked_key: {
      type: DataTypes.VIRTUAL,
      get() {
        return ApiKey.maskKey(this.key_last4);
      }
    },
    // Permissions de la clé API (stockées sous forme de tableau JSON)
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['read']
    },
    // Statut de la clé API (active ou inactive)
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Date d'expiration de la clé API (null = pas d'expiration)
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Dernière utilisation de la clé API
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Description de la clé API
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ApiKey'
  });
  
  return ApiKey;
};
