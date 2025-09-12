import { Model, DataTypes, Optional } from 'sequelize';

// Interface pour les attributs du modèle
interface DepartmentAttributes {
  id: number;
  name: string;
  code?: string;
  description?: string;
  manager_id?: number;
  parent_id?: number;
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Interface pour la création d'un département (id optionnel)
interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, 'id' | 'active'> {}

/**
 * Modèle Department pour la gestion des départements
 */
export class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> implements DepartmentAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description!: string;
  public manager_id!: number;
  public parent_id!: number;
  public active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Méthodes statiques
  static async findActive(): Promise<Department[]> {
    return Department.findAll({ where: { active: true } });
  }

  static async findByCode(code: string): Promise<Department | null> {
    return Department.findOne({ where: { code } });
  }

  static async findSubDepartments(parentId: number): Promise<Department[]> {
    return Department.findAll({ where: { parent_id: parentId } });
  }
}

// Fonction d'initialisation du modèle
export function initDepartmentModel(sequelize: any): typeof Department {
  Department.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identifiant unique du département'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nom du département'
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Code unique du département'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description du département'
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du responsable du département'
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du département parent'
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Statut actif du département'
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
      tableName: 'hr_departments',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: 'hr_departments_code_idx',
          unique: true,
          fields: ['code']
        },
        {
          name: 'hr_departments_manager_id_idx',
          fields: ['manager_id']
        },
        {
          name: 'hr_departments_parent_id_idx',
          fields: ['parent_id']
        },
        {
          name: 'hr_departments_active_idx',
          fields: ['active']
        }
      ]
    }
  );

  return Department;
}

// Export par défaut pour la compatibilité avec le système de modèles
export default function(sequelize: any, DataTypes: any) {
  return initDepartmentModel(sequelize);
}
