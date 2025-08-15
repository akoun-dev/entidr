'use strict';
const { Model } = require('sequelize');

/**
 * Modèle pour les imprimantes
 * Stocke les configurations des imprimantes pour l'impression des documents
 */
module.exports = (sequelize, DataTypes) => {
  class Printer extends Model {
    /**
     * Méthode d'aide pour définir les associations.
     * Cette méthode n'est pas une partie du cycle de vie de Sequelize.
     * Le modèle `models/index` l'appellera automatiquement.
     */
    static associate(models) {
      // définir les associations ici
    }
  }
  
  Printer.init({
    // Nom de l'imprimante
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type d'imprimante (Laser, Jet d'encre, Thermique, etc.)
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Type de connexion (Réseau, USB, WiFi, Bluetooth, etc.)
    connection: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Adresse IP ou chemin de l'imprimante
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Port de l'imprimante (pour les imprimantes réseau)
    port: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Pilote d'imprimante
    driver: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Paramètres supplémentaires (stockés sous forme de JSON)
    options: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Indique si cette imprimante est l'imprimante par défaut
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Statut de l'imprimante (active, inactive)
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    },
    // Capacités de l'imprimante (recto-verso, couleur, etc.)
    capabilities: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Printer',
    hooks: {
      // Avant de créer une nouvelle imprimante par défaut, désactiver les autres imprimantes par défaut
      beforeCreate: async (printer, options) => {
        if (printer.isDefault) {
          await sequelize.models.Printer.update(
            { isDefault: false },
            { 
              where: { isDefault: true },
              transaction: options.transaction
            }
          );
        }
      },
      // Avant de mettre à jour une imprimante, si on la définit comme imprimante par défaut, désactiver les autres imprimantes par défaut
      beforeUpdate: async (printer, options) => {
        if (printer.changed('isDefault') && printer.isDefault) {
          await sequelize.models.Printer.update(
            { isDefault: false },
            { 
              where: { 
                isDefault: true,
                id: { [sequelize.Sequelize.Op.ne]: printer.id }
              },
              transaction: options.transaction
            }
          );
        }
      }
    }
  });
  
  return Printer;
};
