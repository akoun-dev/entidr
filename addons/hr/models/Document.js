const { DataTypes } = require('sequelize');
const sequelize = require('../../../src/models').sequelize;

const Document = sequelize.define('Document', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'id_card', 'passport', 'cv', 'diploma', 'certificate',
      'contract', 'pay_slip', 'medical_certificate', 'insurance',
      'tax_document', 'other'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size_bytes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isFuture(value) {
        if (value && value <= new Date()) {
          throw new Error('La date d\'expiration doit être postérieure à la date actuelle');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'expired'),
    defaultValue: 'draft'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'hr_documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeSave: (document) => {
      // Mettre à jour le statut du document en fonction de la date actuelle
      const today = new Date();
      if (document.status !== 'expired' && document.expiry_date && today > document.expiry_date) {
        document.status = 'expired';
      }
    }
  }
});

// Méthodes d'instance
Document.prototype.isExpired = function() {
  if (!this.expiry_date) return false;
  return new Date() > this.expiry_date;
};

Document.prototype.getDaysUntilExpiry = function() {
  if (!this.expiry_date) return null;
  const today = new Date();
  const diffTime = this.expiry_date - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Document.prototype.getSizeReadable = function() {
  const bytes = this.size_bytes;

  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

Document.prototype.updateStatus = async function() {
  const today = new Date();

  if (this.status !== 'expired' && this.expiry_date && today > this.expiry_date) {
    this.status = 'expired';
    await this.save();
  }

  return this;
};

// Méthodes statiques
Document.getDocumentsByEmployee = async function(employeeId) {
  return this.findAll({
    where: { employee_id: employeeId },
    include: ['employee'],
    order: [['created_at', 'DESC']]
  });
};

Document.getDocumentsByType = async function(type) {
  return this.findAll({
    where: { type },
    include: ['employee'],
    order: [['created_at', 'DESC']]
  });
};

Document.getDocumentsByStatus = async function(status) {
  return this.findAll({
    where: { status },
    include: ['employee'],
    order: [['created_at', 'DESC']]
  });
};

Document.getExpiringDocuments = async function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.findAll({
    where: {
      expiry_date: {
        [require('sequelize').Op.between]: [today, futureDate]
      },
      status: { [require('sequelize').Op.ne]: 'expired' }
    },
    include: ['employee'],
    order: [['expiry_date', 'ASC']]
  });
};

module.exports = Document;
