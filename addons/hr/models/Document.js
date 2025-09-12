const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'id_card', 'passport', 'cv', 'diploma', 'certificate',
      'contract', 'pay_slip', 'medical_certificate', 'insurance',
      'tax_document', 'other'
    ],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  file_url: {
    type: String,
    required: true,
    trim: true
  },
  file_name: {
    type: String,
    required: true,
    trim: true
  },
  mime_type: {
    type: String,
    required: true,
    trim: true
  },
  size_bytes: {
    type: Number,
    required: true,
    min: 0
  },
  expiry_date: {
    type: Date,
    validate: {
      validator: function(value) {
        // La date d'expiration doit être postérieure à la date actuelle si elle est définie
        return !value || value > new Date();
      },
      message: 'La date d\'expiration doit être postérieure à la date actuelle'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending', 'approved', 'rejected', 'expired'],
    default: 'draft'
  },
  notes: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Virtual pour obtenir l'employé
documentSchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employee_id',
  foreignField: '_id',
  justOne: true
});

// Virtual pour vérifier si le document est expiré
documentSchema.virtual('is_expired').get(function() {
  if (!this.expiry_date) return false;
  return new Date() > this.expiry_date;
});

// Virtual pour obtenir le temps restant avant l'expiration en jours
documentSchema.virtual('days_until_expiry').get(function() {
  if (!this.expiry_date) return null;
  const today = new Date();
  const diffTime = this.expiry_date - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual pour obtenir la taille du fichier en format lisible
documentSchema.virtual('size_readable').get(function() {
  const bytes = this.size_bytes;

  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Méthode statique pour obtenir les documents d'un employé
documentSchema.statics.getDocumentsByEmployee = async function(employeeId) {
  return this.find({ employee_id: employeeId })
    .populate('employee_id')
    .sort({ created_at: -1 });
};

// Méthode statique pour obtenir les documents par type
documentSchema.statics.getDocumentsByType = async function(type) {
  return this.find({ type })
    .populate('employee_id')
    .sort({ created_at: -1 });
};

// Méthode statique pour obtenir les documents par statut
documentSchema.statics.getDocumentsByStatus = async function(status) {
  return this.find({ status })
    .populate('employee_id')
    .sort({ created_at: -1 });
};

// Méthode statique pour obtenir les documents expirant bientôt
documentSchema.statics.getExpiringDocuments = async function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.find({
    expiry_date: {
      $gte: today,
      $lte: futureDate
    },
    status: { $ne: 'expired' }
  })
    .populate('employee_id')
    .sort({ expiry_date: 1 });
};

// Méthode pour mettre à jour le statut du document en fonction de la date actuelle
documentSchema.methods.updateStatus = async function() {
  const today = new Date();

  if (this.status !== 'expired' && this.expiry_date && today > this.expiry_date) {
    this.status = 'expired';
    await this.save();
  }

  return this;
};

// Middleware pour mettre à jour le statut du document lors de la sauvegarde
documentSchema.pre('save', function(next) {
  const today = new Date();

  if (this.isModified('expiry_date') || this.isModified('status')) {
    if (this.status !== 'expired' && this.expiry_date && today > this.expiry_date) {
      this.status = 'expired';
    }
  }

  next();
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
