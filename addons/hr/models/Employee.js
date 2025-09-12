const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  job_title: {
    type: String,
    trim: true
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  hire_date: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    default: 0
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postal_code: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  emergency_contact: {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  birth_date: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  photo_url: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  contracts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
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

// Middleware pour générer le nom complet avant la sauvegarde
employeeSchema.pre('save', function(next) {
  if (this.isModified('first_name') || this.isModified('last_name')) {
    this.name = `${this.first_name} ${this.last_name}`;
  }
  next();
});

// Méthode pour comparer les mots de passe
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir le nom complet
employeeSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Méthode pour obtenir l'âge
employeeSchema.virtual('age').get(function() {
  if (!this.birth_date) return null;
  const today = new Date();
  const birthDate = new Date(this.birth_date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

// Méthode pour obtenir la durée d'emploi
employeeSchema.virtual('employment_duration').get(function() {
  if (!this.hire_date) return null;
  const today = new Date();
  const hireDate = new Date(this.hire_date);
  const years = today.getFullYear() - hireDate.getFullYear();
  const months = today.getMonth() - hireDate.getMonth();

  return { years, months };
});

// Méthode statique pour obtenir les employés par département
employeeSchema.statics.getEmployeesByDepartment = async function(departmentId) {
  return this.find({ department_id: departmentId, active: true })
    .populate('department_id')
    .sort({ last_name: 1, first_name: 1 });
};

// Méthode statique pour obtenir les subordonnés d'un manager
employeeSchema.statics.getSubordinates = async function(managerId) {
  return this.find({ manager_id: managerId, active: true })
    .populate('department_id')
    .sort({ last_name: 1, first_name: 1 });
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
