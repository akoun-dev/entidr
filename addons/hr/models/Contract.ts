import { Model, DataTypes, Optional } from 'sequelize';

// Interface pour les attributs du modèle
interface ContractAttributes {
  id: number;
  employee_id: number;
  type: string;
  title: string;
  start_date: Date;
  end_date?: Date;
  salary?: number;
  currency?: string;
  working_hours?: number;
  status: string;
  description?: string;
  file_path?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interface pour la création d'un contrat (id optionnel)
interface ContractCreationAttributes extends Optional<ContractAttributes, 'id'> {}

/**
 * Modèle Contract pour la gestion des contrats des employés
 */
export class Contract extends Model<ContractAttributes, ContractCreationAttributes> implements ContractAttributes {
  public id!: number;
  public employee_id!: number;
  public type!: string;
  public title!: string;
  public start_date!: Date;
  public end_date!: Date;
  public salary!: number;
  public currency!: string;
  public working_hours!: number;
  public status!: string;
  public description!: string;
  public file_path!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Méthodes utilitaires
  isActive(): boolean {
    const now = new Date();
    const startDate = new Date(this.start_date);
    const endDate = this.end_date ? new Date(this.end_date) : null;

    return now >= startDate && (!endDate || now <= endDate) && this.status === 'active';
  }

  getDuration(): string {
    if (!this.end_date) return 'Indéterminé';

    const startDate = new Date(this.start_date);
    const endDate = new Date(this.end_date);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` et ${months} mois` : ''}`;
    }
    return `${months} mois`;
  }

  // Méthodes statiques
  static async findActive(): Promise<Contract[]> {
    return Contract.findAll({
      where: { status: 'active' },
      include: ['employee']
    });
  }

  static async findByEmployee(employeeId: number): Promise<Contract[]> {
    return Contract.findAll({
      where: { employee_id: employeeId },
      order: [['start_date', 'DESC']]
    });
  }

  static async findExpiringSoon(days: number = 30): Promise<Contract[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const { Op } = require('sequelize');

    return Contract.findAll({
      where: {
        end_date: {
          [Op.lte]: futureDate
        },
        status: 'active'
      },
      include: ['employee']
    });
  }
}

// Fonction d'initialisation du modèle
export function initContractModel(sequelize: any, Sequelize: any): typeof Contract {
  Contract.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identifiant unique du contrat'
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID de l\'employé associé au contrat'
      },
      type: {
        type: DataTypes.ENUM('cdi', 'cdd', 'stage', 'alternance', 'freelance', 'temps-partiel'),
        allowNull: false,
        comment: 'Type de contrat'
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Titre du contrat'
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date de début du contrat'
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de fin du contrat'
      },
      salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Salaire du contrat'
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: true,
        defaultValue: 'EUR',
        comment: 'Devise du salaire'
      },
      working_hours: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        comment: 'Nombre d\'heures de travail par semaine'
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'terminated', 'expired'),
        allowNull: false,
        defaultValue: 'draft',
        comment: 'Statut du contrat'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description du contrat'
      },
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Chemin vers le fichier du contrat'
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
      tableName: 'hr_contracts',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: 'hr_contracts_employee_id_idx',
          fields: ['employee_id']
        },
        {
          name: 'hr_contracts_type_idx',
          fields: ['type']
        },
        {
          name: 'hr_contracts_status_idx',
          fields: ['status']
        },
        {
          name: 'hr_contracts_dates_idx',
          fields: ['start_date', 'end_date']
        }
      ]
    }
  );

  return Contract;
}

// Export par défaut pour la compatibilité avec le système de modèles
export default function(sequelize: any, DataTypes: any) {
  return initContractModel(sequelize, DataTypes);
}
