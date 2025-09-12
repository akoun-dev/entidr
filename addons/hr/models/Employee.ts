import { Model, DataTypes, Optional } from 'sequelize';

// Interface pour les attributs du modèle
interface EmployeeAttributes {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  department_id?: number;
  hire_date?: Date;
  salary?: number;
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Interface pour la création d'un employé (id optionnel)
interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'id' | 'active'> {}

/**
 * Modèle Employee pour la gestion des employés
 */
export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
  public id!: number;
  public name!: string;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public phone!: string;
  public job_title!: string;
  public department_id!: number;
  public hire_date!: Date;
  public salary!: number;
  public active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Méthodes utilitaires
  getFullName(): string {
    return `${this.first_name || ''} ${this.last_name || ''}`.trim() || this.name;
  }

  getEmploymentDuration(): string {
    if (!this.hire_date) return 'N/A';

    const hireDate = new Date(this.hire_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` et ${months} mois` : ''}`;
    }
    return `${months} mois`;
  }

  // Méthodes statiques
  static async findByEmail(email: string): Promise<Employee | null> {
    return Employee.findOne({ where: { email } });
  }

  static async findActive(): Promise<Employee[]> {
    return Employee.findAll({ where: { active: true } });
  }

  static async findByDepartment(departmentId: number): Promise<Employee[]> {
    return Employee.findAll({ where: { department_id: departmentId } });
  }
}

// Fonction d'initialisation du modèle
export function initEmployeeModel(sequelize: any): typeof Employee {
  Employee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identifiant unique de l\'employé'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nom complet de l\'employé'
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Prénom de l\'employé'
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Nom de famille de l\'employé'
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        },
        comment: 'Adresse email de l\'employé'
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Numéro de téléphone de l\'employé'
      },
      job_title: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Poste de l\'employé'
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du département de l\'employé'
      },
      hire_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date d\'embauche de l\'employé'
      },
      salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Salaire de l\'employé'
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Statut actif de l\'employé'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      tableName: 'hr_employees',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: 'hr_employees_email_idx',
          unique: true,
          fields: ['email']
        },
        {
          name: 'hr_employees_department_id_idx',
          fields: ['department_id']
        },
        {
          name: 'hr_employees_active_idx',
          fields: ['active']
        }
      ]
    }
  );

  return Employee;
}

// Export par défaut pour la compatibilité avec le système de modèles
export default function(sequelize: any, DataTypes: any) {
  return initEmployeeModel(sequelize);
}
