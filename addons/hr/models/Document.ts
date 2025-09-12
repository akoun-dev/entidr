import { Model, DataTypes, Optional } from 'sequelize';

// Interface pour les attributs du modèle
interface DocumentAttributes {
  id: number;
  employee_id: number;
  type: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: string;
  expiry_date?: Date;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

// Interface pour la création d'un document (id optionnel)
interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id'> {}

/**
 * Modèle Document pour la gestion des documents des employés
 */
export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: number;
  public employee_id!: number;
  public type!: string;
  public title!: string;
  public description!: string;
  public file_name!: string;
  public file_path!: string;
  public file_size!: number;
  public mime_type!: string;
  public status!: string;
  public expiry_date!: Date;
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Méthodes utilitaires
  isExpired(): boolean {
    if (!this.expiry_date) return false;
    return new Date() > new Date(this.expiry_date);
  }

  isExpiringSoon(days: number = 30): boolean {
    if (!this.expiry_date) return false;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const expiryDate = new Date(this.expiry_date);
    return expiryDate <= futureDate && expiryDate >= new Date();
  }

  getFileSizeFormatted(): string {
    if (!this.file_size) return 'N/A';

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.file_size === 0) return '0 Byte';
    const i = Math.floor(Math.log(this.file_size) / Math.log(1024));
    return Math.round(this.file_size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Méthodes statiques
  static async findActive(): Promise<Document[]> {
    return Document.findAll({
      where: { status: 'active' },
      include: ['employee']
    });
  }

  static async findByEmployee(employeeId: number): Promise<Document[]> {
    return Document.findAll({
      where: { employee_id: employeeId },
      order: [['created_at', 'DESC']]
    });
  }

  static async findExpiringSoon(days: number = 30): Promise<Document[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const { Op } = require('sequelize');

    return Document.findAll({
      where: {
        expiry_date: {
          [Op.lte]: futureDate,
          [Op.gte]: new Date()
        },
        status: 'active'
      },
      include: ['employee']
    });
  }

  static async findExpired(): Promise<Document[]> {
    const { Op } = require('sequelize');

    return Document.findAll({
      where: {
        expiry_date: {
          [Op.lt]: new Date()
        },
        status: 'active'
      },
      include: ['employee']
    });
  }
}

// Fonction d'initialisation du modèle
export function initDocumentModel(sequelize: any, Sequelize: any): typeof Document {
  Document.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Identifiant unique du document'
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID de l\'employé associé au document'
      },
      type: {
        type: DataTypes.ENUM('cv', 'diplome', 'certificat', 'contrat', 'carte_identite', 'passeport', 'permis', 'photo', 'autre'),
        allowNull: false,
        comment: 'Type de document'
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Titre du document'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description du document'
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nom du fichier'
      },
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Chemin vers le fichier'
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Taille du fichier en octets'
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Type MIME du fichier'
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'expired', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
        comment: 'Statut du document'
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date d\'expiration du document'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de l\'utilisateur qui a créé le document'
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
      tableName: 'hr_documents',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: 'hr_documents_employee_id_idx',
          fields: ['employee_id']
        },
        {
          name: 'hr_documents_type_idx',
          fields: ['type']
        },
        {
          name: 'hr_documents_status_idx',
          fields: ['status']
        },
        {
          name: 'hr_documents_expiry_date_idx',
          fields: ['expiry_date']
        }
      ]
    }
  );

  return Document;
}

// Export par défaut pour la compatibilité avec le système de modèles
export default function(sequelize: any, DataTypes: any) {
  return initDocumentModel(sequelize, DataTypes);
}
