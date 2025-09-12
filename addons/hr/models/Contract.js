const { DataTypes } = require('sequelize');
const sequelize = require('../../../src/models').sequelize;

const Contract = sequelize.define('Contract', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('cdi', 'cdd', 'stage', 'alternance', 'freelance', 'internship', 'apprenticeship', 'other'),
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isAfterStart(value) {
        if (value && value <= this.start_date) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
      }
    }
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'EUR'
  },
  working_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 35,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'terminated', 'expired', 'renewed'),
    defaultValue: 'draft'
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  size_bytes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'hr_contracts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: async (contract) => {
      // Générer une référence automatique si elle n'est pas fournie
      if (!contract.reference) {
        const Contract = require('./Contract');
        const count = await Contract.count();
        const year = new Date().getFullYear();
        contract.reference = `CONTR-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    },
    beforeSave: (contract) => {
      // Mettre à jour le statut du contrat en fonction de la date actuelle
      const today = new Date();
      if (contract.status === 'active' && contract.end_date && today > contract.end_date) {
        contract.status = 'expired';
      }
    }
  }
});

// Méthodes d'instance
Contract.prototype.getDurationDays = function() {
  if (!this.end_date) return null;
  const diffTime = Math.abs(this.end_date - this.start_date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Contract.prototype.isExpired = function() {
  if (!this.end_date) return false;
  return new Date() > this.end_date;
};

Contract.prototype.getDaysUntilExpiry = function() {
  if (!this.end_date) return null;
  const today = new Date();
  const diffTime = this.end_date - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Contract.prototype.updateStatus = async function() {
  const today = new Date();

  if (this.status === 'active' && this.end_date && today > this.end_date) {
    this.status = 'expired';
    await this.save();
  }

  return this;
};

// Méthodes statiques
Contract.getActiveContractsByEmployee = async function(employeeId) {
  return this.findAll({
    where: { employee_id: employeeId, status: 'active' },
    include: ['employee'],
    order: [['start_date', 'DESC']]
  });
};

Contract.getExpiringContracts = async function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.findAll({
    where: {
      end_date: {
        [require('sequelize').Op.between]: [today, futureDate]
      },
      status: { [require('sequelize').Op.ne]: 'terminated' }
    },
    include: ['employee'],
    order: [['end_date', 'ASC']]
  });
};

Contract.getContractsByType = async function(type) {
  return this.findAll({
    where: { type },
    include: ['employee'],
    order: [['start_date', 'DESC']]
  });
};

Contract.getContractsByStatus = async function(status) {
  return this.findAll({
    where: { status },
    include: ['employee'],
    order: [['start_date', 'DESC']]
  });
};

module.exports = Contract;
