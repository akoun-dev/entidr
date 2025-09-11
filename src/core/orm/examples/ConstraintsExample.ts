import {
  EntidrBaseModel,
  EntidrModelDecorator,
  Field,
  Method,
  Hook,
  Scope,
  AdvancedFieldType
} from '../EntidrModel';
import {
  EntidrConstraintManager,
  ConstraintType,
  ForeignKeyAction
} from '../constraints/EntidrConstraints';
import { EntidrRelationManager, RelationType } from '../relations/EntidrRelations';
import { EntidrModelConfig } from '../../../../types/entidr-model';

/**
 * Modèle d'exemple pour démontrer les contraintes SQL
 */
@EntidrModelDecorator({
  tableName: 'products',
  timestamps: true,
  paranoid: true,
  underscored: true,
  freezeTableName: false
} as EntidrModelConfig)
export class ProductModel extends EntidrBaseModel {
  // Champ ID primaire
  @Field({
    type: AdvancedFieldType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Identifiant unique du produit'
  })
  id!: number;

  // Champ nom du produit
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    maxLength: 255,
    comment: 'Nom unique du produit'
  })
  name!: string;

  // Champ référence
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    maxLength: 50,
    comment: 'Référence unique du produit'
  })
  reference!: string;

  // Champ description
  @Field({
    type: AdvancedFieldType.TEXT,
    allowNull: true,
    comment: 'Description du produit'
  })
  description!: string;

  // Champ prix
  @Field({
    type: AdvancedFieldType.DECIMAL,
    allowNull: false,
    precision: 10,
    scale: 2,
    comment: 'Prix du produit'
  })
  price!: number;

  // Champ stock
  @Field({
    type: AdvancedFieldType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantité en stock'
  })
  stock!: number;

  // Champ seuil d'alerte stock
  @Field({
    type: AdvancedFieldType.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: 'Seuil d\'alerte pour le stock bas'
  })
  stockAlert!: number;

  // Champ statut
  @Field({
    type: AdvancedFieldType.ENUM,
    allowNull: false,
    defaultValue: 'active',
    values: ['active', 'inactive', 'discontinued'],
    comment: 'Statut du produit'
  })
  status!: string;

  // Champ ID de la catégorie
  @Field({
    type: AdvancedFieldType.INTEGER,
    allowNull: true,
    comment: 'ID de la catégorie associée'
  })
  categoryId!: number;

  // Champ poids
  @Field({
    type: AdvancedFieldType.FLOAT,
    allowNull: true,
    comment: 'Poids du produit en kg'
  })
  weight!: number;

  // Champ date de création
  @Field({
    type: AdvancedFieldType.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date de création du produit'
  })
  createdAt!: Date;

  // Méthode pour vérifier si le produit est en stock
  @Method({
    name: 'isInStock',
    description: 'Vérifie si le produit est en stock',
    returns: { type: 'boolean', description: 'True si en stock' }
  })
  isInStock(): boolean {
    return this.stock > 0;
  }

  // Méthode pour vérifier si le stock est bas
  @Method({
    name: 'isLowStock',
    description: 'Vérifie si le stock est bas',
    returns: { type: 'boolean', description: 'True si stock bas' }
  })
  isLowStock(): boolean {
    return this.stock <= this.stockAlert;
  }

  // Méthode pour calculer la valeur totale du stock
  @Method({
    name: 'getStockValue',
    description: 'Calcule la valeur totale du stock',
    returns: { type: 'number', description: 'Valeur totale du stock' }
  })
  getStockValue(): number {
    return this.stock * this.price;
  }

  // Hook avant création
  @Hook('beforeCreate')
  static async beforeCreate(product: ProductModel): Promise<void> {
    // Valider que le prix est positif
    if (product.price <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }

    // Valider que le stock est non négatif
    if (product.stock < 0) {
      throw new Error('Le stock ne peut pas être négatif');
    }
  }

  // Hook avant mise à jour
  @Hook('beforeUpdate')
  static async beforeUpdate(product: ProductModel): Promise<void> {
    // Mêmes validations que pour la création
    if (product.changed('price') && product.price <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }

    if (product.changed('stock') && product.stock < 0) {
      throw new Error('Le stock ne peut pas être négatif');
    }
  }

  // Scope pour les produits actifs
  @Scope({
    name: 'active',
    scope: () => ({ where: { status: 'active' } })
  })
  static activeScope() {
    return this.scope({ where: { status: 'active' } });
  }

  // Scope pour les produits en stock
  @Scope({
    name: 'inStock',
    scope: () => ({ where: { stock: { [Op.gt]: 0 } } })
  })
  static inStockScope() {
    return this.scope({ where: { stock: { [Op.gt]: 0 } } });
  }

  // Scope pour les produits stock bas
  @Scope({
    name: 'lowStock',
    scope: () => ({
      where: {
        stock: { [Op.lte]: this.sequelize!.col('stock_alert') }
      }
    })
  })
  static lowStockScope() {
    return this.scope({
      where: {
        stock: { [Op.lte]: this.sequelize!.col('stock_alert') }
      }
    });
  }
}

/**
 * Modèle de catégorie pour les relations
 */
@EntidrModelDecorator({
  tableName: 'categories',
  timestamps: true,
  paranoid: true,
  underscored: true
} as EntidrModelConfig)
export class CategoryModel extends EntidrBaseModel {
  @Field({
    type: AdvancedFieldType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  })
  id!: number;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    maxLength: 100
  })
  name!: string;

  @Field({
    type: AdvancedFieldType.TEXT,
    allowNull: true
  })
  description!: string;
}

/**
 * Fonction pour configurer les contraintes sur les modèles
 */
export function setupProductConstraints(): void {
  // Contraintes pour le modèle Product

  // 1. Contrainte de clé primaire (déjà gérée par le champ)
  EntidrConstraintManager.createPrimaryKey('ProductModel', 'id', {
    comment: 'Clé primaire du produit'
  });

  // 2. Contraintes d'unicité
  EntidrConstraintManager.createUnique('ProductModel', ['name'], {
    errorMessages: {
      unique: 'Un produit avec ce nom existe déjà'
    }
  });

  EntidrConstraintManager.createUnique('ProductModel', ['reference'], {
    errorMessages: {
      unique: 'Un produit avec cette référence existe déjà'
    }
  });

  // 3. Contrainte de clé étrangère pour la catégorie
  EntidrConstraintManager.createForeignKey('ProductModel', 'categoryId', {
    table: 'CategoryModel',
    onDelete: ForeignKeyAction.SET_NULL,
    onUpdate: ForeignKeyAction.CASCADE,
    errorMessages: {
      foreignKey: 'La catégorie spécifiée n\'existe pas'
    }
  });

  // 4. Contraintes CHECK
  EntidrConstraintManager.createCheck('ProductModel', ['price'], 'price > 0', {
    errorMessages: {
      check: 'Le prix doit être supérieur à 0'
    }
  });

  EntidrConstraintManager.createCheck('ProductModel', ['stock'], 'stock >= 0', {
    errorMessages: {
      check: 'Le stock ne peut pas être négatif'
    }
  });

  EntidrConstraintManager.createCheck('ProductModel', ['weight'], 'weight > 0 OR weight IS NULL', {
    errorMessages: {
      check: 'Le poids doit être positif ou non spécifié'
    }
  });

  // 5. Contrainte NOT NULL pour les champs obligatoires
  EntidrConstraintManager.createNotNull('ProductModel', 'name', {
    errorMessages: {
      notNull: 'Le nom du produit est obligatoire'
    }
  });

  EntidrConstraintManager.createNotNull('ProductModel', 'reference', {
    errorMessages: {
      notNull: 'La référence du produit est obligatoire'
    }
  });

  EntidrConstraintManager.createNotNull('ProductModel', 'price', {
    errorMessages: {
      notNull: 'Le prix du produit est obligatoire'
    }
  });

  // 6. Contraintes DEFAULT
  EntidrConstraintManager.createDefault('ProductModel', 'stock', 0);
  EntidrConstraintManager.createDefault('ProductModel', 'stockAlert', 10);
  EntidrConstraintManager.createDefault('ProductModel', 'status', 'active');

  // Contraintes pour le modèle Category
  EntidrConstraintManager.createPrimaryKey('CategoryModel', 'id');
  EntidrConstraintManager.createUnique('CategoryModel', ['name']);
  EntidrConstraintManager.createNotNull('CategoryModel', 'name');
}

/**
 * Fonction pour configurer les relations entre modèles
 */
export function setupProductRelations(): void {
  // Relation many-to-one: Product -> Category
  EntidrRelationManager.manyToOne(
    ProductModel,
    CategoryModel,
    'category',
    {
      foreignKey: 'categoryId',
      as: 'category',
      onDelete: ForeignKeyAction.SET_NULL,
      onUpdate: ForeignKeyAction.CASCADE
    }
  );

  // Relation one-to-many: Category -> Products
  EntidrRelationManager.oneToMany(
    CategoryModel,
    ProductModel,
    'products',
    {
      foreignKey: 'categoryId',
      as: 'products'
    }
  );
}

/**
 * Fonction d'exemple pour démontrer l'utilisation des contraintes
 */
export async function demonstrateConstraints(): Promise<void> {
  try {
    // Configurer les contraintes
    setupProductConstraints();
    setupProductRelations();

    console.log('Contraintes configurées avec succès !');

    // Exemple de création de produit valide
    const validProduct = await ProductModel.create({
      name: 'Produit Test',
      reference: 'TEST001',
      price: 99.99,
      stock: 50,
      stockAlert: 10,
      status: 'active',
      weight: 1.5
    });

    console.log('Produit valide créé:', validProduct.name);

    // Exemple de tentative de création de produit invalide (prix négatif)
    try {
      await ProductModel.create({
        name: 'Produit Invalide',
        reference: 'TEST002',
        price: -10,
        stock: 50
      });
    } catch (error) {
      console.log('Erreur attendue pour prix négatif:', error.message);
    }

    // Exemple de tentative de création de produit invalide (nom dupliqué)
    try {
      await ProductModel.create({
        name: 'Produit Test', // Nom déjà existant
        reference: 'TEST003',
        price: 99.99,
        stock: 50
      });
    } catch (error) {
      console.log('Erreur attendue pour nom dupliqué:', error.message);
    }

    // Exporter les contraintes pour la sérialisation
    const exportedConstraints = EntidrConstraintManager.exportConstraints();
    console.log('Contraintes exportées:', Object.keys(exportedConstraints));

  } catch (error) {
    console.error('Erreur lors de la démonstration des contraintes:', error);
  }
}

// Exporter les modèles et fonctions
export { ProductModel, CategoryModel };
export default { setupProductConstraints, setupProductRelations, demonstrateConstraints };
