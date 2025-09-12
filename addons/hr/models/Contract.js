const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cdi', 'cdd', 'stage', 'alternance', 'freelance', 'internship', 'apprenticeship', 'other'],
    trim: true
  },
  reference: {
    type: String,
    trim: true,
    unique: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    validate: {
      validator: function(value) {
        // La date de fin doit être postérieure à la date de début si elle est définie
        return !value || value > this.start_date;
      },
      message: 'La date de fin doit être postérieure à la date de début'
    }
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR',
    trim: true
  },
  working_hours: {
    type: Number,
    default: 35,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'terminated', 'expired', 'renewed'],
    default: 'draft'
  },
  terms: {
    type: String,
    trim: true
  },
  file_url: {
    type: String,
    trim: true
  },
  file_name: {
    type: String,
    trim: true
  },
  mime_type: {
    type: String,
    trim: true
  },
  size_bytes: {
    type: Number,
    min: 0
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
contractSchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employee_id',
  foreignField: '_id',
  justOne: true
});

// Virtual pour obtenir la durée du contrat en jours
contractSchema.virtual('duration_days').get(function() {
  if (!this.end_date) return null;
  const diffTime = Math.abs(this.end_date - this.start_date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual pour vérifier si le contrat est expiré
contractSchema.virtual('is_expired').get(function() {
  if (!this.end_date) return false;
  return new Date() > this.end_date;
});

// Virtual pour obtenir le temps restant avant l'expiration en jours
contractSchema.virtual('days_until_expiry').get(function() {
  if (!this.end_date) return null;
  const today = new Date();
  const diffTime = this.end_date - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Méthode statique pour obtenir les contrats actifs d'un employé
contractSchema.statics.getActiveContractsByEmployee = async function(employeeId) {
  return this.find({
    employee_id: employeeId,
    status: 'active'
  })
    .populate('employee_id')
    .sort({ start_date: -1 });
};

// Méthode statique pour obtenir les contrats expirant bientôt
contractSchema.statics.getExpiringContracts = async function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return this.find({
    end_date: {
      $gte: today,
      $lte: futureDate
    },
    status: { $ne: 'terminated' }
  })
    .populate('employee_id')
    .sort({ end_date: 1 });
};

// Méthode statique pour obtenir les contrats par type
contractSchema.statics.getContractsByType = async function(type) {
  return this.find({ type })
    .populate('employee_id')
    .sort({ start_date: -1 });
};

// Méthode statique pour obtenir les contrats par statut
contractSchema.statics.getContractsByStatus = async function(status) {
  return this.find({ status })
    .populate('employee_id')
    .sort({ start_date: -1 });
};

// Méthode pour mettre à jour le statut du contrat en fonction de la date actuelle
contractSchema.methods.updateStatus = async function() {
  const today = new Date();

  if (this.status === 'active' && this.end_date && today > this.end_date) {
    this.status = 'expired';
    await this.save();
  }

  return this;
};

// Middleware pour générer une référence automatique si elle n'est pas fournie
contractSchema.pre('save', async function(next) {
  if (!this.reference) {
    const Contract = mongoose.model('Contract');
    const count = await Contract.countDocuments();
    const year = new Date().getFullYear();
    this.reference = `CONTR-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Middleware pour mettre à jour le statut du contrat lors de la sauvegarde
contractSchema.pre('save', function(next) {
  const today = new Date();

  if (this.isModified('end_date') || this.isModified('status')) {
    if (this.status === 'active' && this.end_date && today > this.end_date) {
      this.status = 'expired';
    }
  }

  next();
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
