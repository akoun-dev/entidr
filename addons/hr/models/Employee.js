const { DataTypes } = require('sequelize');
const sequelize = require('../../../src/models').sequelize;

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  job_title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Departments',
      key: 'id'
    }
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  hire_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    defaultValue: 'prefer_not_to_say'
  },
  photo_url: {
    type: DataTypes.STRING,
    allowNull: true
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
  tableName: 'hr_employees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: (employee) => {
      if (employee.first_name && employee.last_name) {
        employee.name = `${employee.first_name} ${employee.last_name}`;
      }
    }
  }
});

// Méthodes d'instance
Employee.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

Employee.prototype.getAge = function() {
  if (!this.birth_date) return null;
  const today = new Date();
  const birthDate = new Date(this.birth_date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

Employee.prototype.getEmploymentDuration = function() {
  if (!this.hire_date) return null;
  const today = new Date();
  const hireDate = new Date(this.hire_date);
  const years = today.getFullYear() - hireDate.getFullYear();
  const months = today.getMonth() - hireDate.getMonth();

  return { years, months };
};

// Méthodes statiques
Employee.getEmployeesByDepartment = async function(departmentId) {
  return this.findAll({
    where: { department_id: departmentId, active: true },
    include: ['department'],
    order: [['last_name', 'ASC'], ['first_name', 'ASC']]
  });
};

Employee.getSubordinates = async function(managerId) {
  return this.findAll({
    where: { manager_id: managerId, active: true },
    include: ['department'],
    order: [['last_name', 'ASC'], ['first_name', 'ASC']]
  });
};

module.exports = Employee;
