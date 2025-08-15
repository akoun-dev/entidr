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
     * Masque une clé API pour l'affichage
     * @param {string} key - La clé API complète
     * @returns {string} La clé API masquée (ex: sk_****1234)
     */
    static maskKey(key) {
      if (!key) return '';
      const prefix = key.substring(0, 3);
      const suffix = key.substring(key.length - 4);
      return `${prefix}****${suffix}`;
    }
  }
  
  ApiKey.init({
    // Nom de la clé API (ex: "Application mobile")
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Clé API (générée automatiquement)
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Clé API masquée pour l'affichage
    masked_key: {
      type: DataTypes.VIRTUAL,
      get() {
        return ApiKey.maskKey(this.key);
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
    modelName: 'ApiKey',
    hooks: {
      beforeCreate: (apiKey) => {
        if (!apiKey.key) {
          apiKey.key = ApiKey.generateKey();
        }
      }
    }
  });
  
  return ApiKey;
};
