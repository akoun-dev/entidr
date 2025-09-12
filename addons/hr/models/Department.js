const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  active: {
    type: Boolean,
    default: true
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

// Virtual pour obtenir les sous-départements
departmentSchema.virtual('sub_departments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'parent_id'
});

// Virtual pour obtenir les employés du département
departmentSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department_id'
});

// Virtual pour obtenir le département parent
departmentSchema.virtual('parent_department', {
  ref: 'Department',
  localField: 'parent_id',
  foreignField: '_id',
  justOne: true
});

// Virtual pour obtenir le manager
departmentSchema.virtual('manager', {
  ref: 'Employee',
  localField: 'manager_id',
  foreignField: '_id',
  justOne: true
});

// Méthode statique pour obtenir les départements de premier niveau
departmentSchema.statics.getRootDepartments = async function() {
  return this.find({ parent_id: null, active: true })
    .populate('manager')
    .sort({ name: 1 });
};

// Méthode statique pour obtenir tous les départements dans une structure hiérarchique
departmentSchema.statics.getDepartmentHierarchy = async function() {
  const departments = await this.find({ active: true })
    .populate('manager')
    .sort({ name: 1 });

  // Créer une carte des départements par ID
  const departmentMap = {};
  departments.forEach(dept => {
    departmentMap[dept._id] = { ...dept.toObject(), children: [] };
  });

  // Construire la hiérarchie
  const hierarchy = [];
  departments.forEach(dept => {
    if (dept.parent_id && departmentMap[dept.parent_id]) {
      departmentMap[dept.parent_id].children.push(departmentMap[dept._id]);
    } else {
      hierarchy.push(departmentMap[dept._id]);
    }
  });

  return hierarchy;
};

// Méthode statique pour obtenir le chemin complet d'un département
departmentSchema.statics.getDepartmentPath = async function(departmentId) {
  const path = [];
  let currentDepartment = await this.findById(departmentId).populate('parent_department');

  while (currentDepartment) {
    path.unshift(currentDepartment);
    if (currentDepartment.parent_department) {
      currentDepartment = await this.findById(currentDepartment.parent_department._id).populate('parent_department');
    } else {
      currentDepartment = null;
    }
  }

  return path;
};

// Méthode pour obtenir le nombre d'employés dans le département et ses sous-départements
departmentSchema.methods.getEmployeeCount = async function() {
  const Employee = mongoose.model('Employee');

  // Obtenir tous les sous-départements de manière récursive
  const getAllSubDepartments = async (deptId, subDepts = []) => {
    const directSubs = await this.constructor.find({ parent_id: deptId, active: true });
    subDepts.push(...directSubs.map(sub => sub._id));

    for (const sub of directSubs) {
      await getAllSubDepartments(sub._id, subDepts);
    }

    return subDepts;
  };

  const subDepartmentIds = await getAllSubDepartments(this._id);
  const allDepartmentIds = [this._id, ...subDepartmentIds];

  return Employee.countDocuments({
    department_id: { $in: allDepartmentIds },
    active: true
  });
};

// Middleware pour s'assurer qu'un département ne peut pas être son propre parent
departmentSchema.pre('save', function(next) {
  if (this.parent_id) {
    // Vérifier si le parent_id est égal à l'ID du document
    if (this.parent_id.equals(this._id)) {
      return next(new Error('Un département ne peut pas être son propre parent'));
    }

    // Vérifier si le parent_id crée une boucle dans la hiérarchie
    const checkForLoop = async (deptId, parentId) => {
      if (!parentId) return false;

      if (parentId.equals(deptId)) return true;

      const parent = await this.constructor.findById(parentId);
      if (!parent) return false;

      return checkForLoop(deptId, parent.parent_id);
    };

    checkForLoop(this._id, this.parent_id)
      .then(hasLoop => {
        if (hasLoop) {
          return next(new Error('La hiérarchie des départements ne peut pas contenir de boucles'));
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
