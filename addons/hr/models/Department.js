const { DataTypes } = require('sequelize');
const sequelize = require('../../../src/models').sequelize;

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Departments',
      key: 'id'
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'hr_departments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Méthodes statiques
Department.getRootDepartments = async function() {
  return this.findAll({
    where: { parent_id: null, active: true },
    include: ['manager'],
    order: [['name', 'ASC']]
  });
};

Department.getDepartmentHierarchy = async function() {
  const departments = await this.findAll({
    where: { active: true },
    include: ['manager'],
    order: [['name', 'ASC']]
  });

  // Créer une carte des départements par ID
  const departmentMap = {};
  departments.forEach(dept => {
    departmentMap[dept.id] = { ...dept.toJSON(), children: [] };
  });

  // Construire la hiérarchie
  const hierarchy = [];
  departments.forEach(dept => {
    if (dept.parent_id && departmentMap[dept.parent_id]) {
      departmentMap[dept.parent_id].children.push(departmentMap[dept.id]);
    } else {
      hierarchy.push(departmentMap[dept.id]);
    }
  });

  return hierarchy;
};

Department.getDepartmentPath = async function(departmentId) {
  const path = [];
  let currentDepartment = await this.findByPk(departmentId, {
    include: ['parent_department']
  });

  while (currentDepartment) {
    path.unshift(currentDepartment);
    if (currentDepartment.parent_department) {
      currentDepartment = await this.findByPk(currentDepartment.parent_department.id, {
        include: ['parent_department']
      });
    } else {
      currentDepartment = null;
    }
  }

  return path;
};

// Méthodes d'instance
Department.prototype.getEmployeeCount = async function() {
  const Employee = require('./Employee');

  // Obtenir tous les sous-départements de manière récursive
  const getAllSubDepartments = async (deptId, subDepts = []) => {
    const directSubs = await Department.findAll({
      where: { parent_id: deptId, active: true }
    });
    subDepts.push(...directSubs.map(sub => sub.id));

    for (const sub of directSubs) {
      await getAllSubDepartments(sub.id, subDepts);
    }

    return subDepts;
  };

  const subDepartmentIds = await getAllSubDepartments(this.id);
  const allDepartmentIds = [this.id, ...subDepartmentIds];

  return Employee.count({
    where: {
      department_id: { [require('sequelize').Op.in]: allDepartmentIds },
      active: true
    }
  });
};

// Validation pour éviter les boucles dans la hiérarchie
Department.beforeValidate(async (department) => {
  if (department.parent_id) {
    // Vérifier si le parent_id est égal à l'ID du département
    if (department.parent_id === department.id) {
      throw new Error('Un département ne peut pas être son propre parent');
    }

    // Vérifier si le parent_id crée une boucle dans la hiérarchie
    const checkForLoop = async (deptId, parentId) => {
      if (!parentId) return false;

      if (parentId === deptId) return true;

      const parent = await Department.findByPk(parentId);
      if (!parent) return false;

      return checkForLoop(deptId, parent.parent_id);
    };

    const hasLoop = await checkForLoop(department.id, department.parent_id);
    if (hasLoop) {
      throw new Error('La hiérarchie des départements ne peut pas contenir de boucles');
    }
  }
});

module.exports = Department;
