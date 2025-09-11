# Entidr ORM - Système de Modèles de Données Avancé

## Overview

L'Entidr ORM est un système de mapping objet-relationnel (ORM) avancé conçu spécifiquement pour l'ERP Entidr. Il offre une approche moderne et flexible pour la gestion des données avec un support complet des relations, contraintes, validations et hooks.

## Features Principales

### 🚀 Système de Champs Avancé
- **25 types de champs supportés** : STRING, TEXT, INTEGER, BIGINT, FLOAT, DECIMAL, BOOLEAN, DATE, DATETIME, JSON, UUID, ENUM, ARRAY, GEOMETRY, etc.
- **Configuration complète** : Validation, widgets, hints, placeholders, valeurs par défaut
- **Champs virtuels et calculés** : Support des champs dérivés et calculés
- **Intégration Sequelize** : Mapping transparent avec les types de données Sequelize

### 🔗 Système de Relations Complet
- **Tous les types de relations** : 
  - `many2one` (belongsTo)
  - `one2many` (hasMany) 
  - `one2one` (hasOne)
  - `many2many` (belongsToMany)
- **Contraintes d'intégrité référentielle** : CASCADE, SET NULL, RESTRICT, NO ACTION
- **Hooks de relation** : beforeAssociate, afterAssociate, beforeCreate, etc.
- **Export/Import des relations** : Sérialisation des configurations

### 🛡️ Système de Contraintes SQL
- **7 types de contraintes** : PRIMARY_KEY, FOREIGN_KEY, UNIQUE, CHECK, NOT_NULL, DEFAULT, EXCLUSION
- **Validation au niveau applicatif** : Conversion des contraintes SQL en validations TypeScript
- **Messages d'erreur personnalisés** : Support pour les messages localisés
- **Génération SQL** : Export des contraintes en SQL natif
- **Configuration flexible** : Options avancées pour chaque type de contrainte

### ⚡ Méthodes Métier et Hooks
- **Méthodes d'instance et statiques** : Support complet avec décorateurs
- **Hooks de cycle de vie** : beforeCreate, afterUpdate, beforeDelete, etc.
- **Scopes de modèle** : Requêtes réutilisables avec paramètres
- **Validation personnalisée** : Système extensible de validation

## Architecture

```
src/core/orm/
├── EntidrModel.ts                 # Classe de base abstraite
├── relations/
│   └── EntidrRelations.ts         # Gestionnaire de relations
├── constraints/
│   └── EntidrConstraints.ts       # Gestionnaire de contraintes
└── examples/
    ├── UserModel.ts              # Exemple de modèle utilisateur
    └── ConstraintsExample.ts     # Exemple de contraintes
```

## Quick Start

### 1. Définir un modèle

```typescript
import { 
  EntidrBaseModel, 
  EntidrModelDecorator, 
  Field, 
  Method, 
  Hook, 
  Scope,
  AdvancedFieldType 
} from './EntidrModel';

@EntidrModelDecorator({
  tableName: 'users',
  timestamps: true,
  paranoid: true
})
export class UserModel extends EntidrBaseModel {
  @Field({
    type: AdvancedFieldType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    validate: [
      { validator: (value) => value.length >= 3, message: 'Minimum 3 caractères' }
    ]
  })
  username!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    widget: 'email'
  })
  email!: string;

  @Method({
    name: 'getFullName',
    description: 'Retourne le nom complet',
    api: true
  })
  getFullName(): string {
    return this.username;
  }
}
```

### 2. Ajouter des contraintes

```typescript
import { EntidrConstraintManager, ConstraintType, ForeignKeyAction } from './constraints/EntidrConstraints';

// Contrainte d'unicité
EntidrConstraintManager.createUnique('UserModel', ['email'], {
  errorMessages: {
    unique: 'Cet email est déjà utilisé'
  }
});

// Contrainte CHECK
EntidrConstraintManager.createCheck('UserModel', ['username'], 'length(username) >= 3', {
  errorMessages: {
    check: 'Le username doit contenir au moins 3 caractères'
  }
});
```

### 3. Définir des relations

```typescript
import { EntidrRelationManager, RelationType } from './relations/EntidrRelations';

// Relation many-to-one: User -> Profile
EntidrRelationManager.manyToOne(
  UserModel,
  ProfileModel,
  'profile',
  {
    foreignKey: 'profileId',
    onDelete: ForeignKeyAction.CASCADE
  }
);
```

## Types de Champs Supportés

### Texte
- `STRING` : Chaînes de caractères (longueur configurable)
- `TEXT` : Texte long
- `UUID` : Identifiants uniques universels
- `ENUM` : Énumérations avec valeurs prédéfinies

### Numériques
- `INTEGER` : Entiers 32 bits
- `BIGINT` : Entiers 64 bits
- `FLOAT` : Nombres à virgule flottante
- `DECIMAL` : Nombres décimaux précis (précision et échelle configurables)
- `MONEY` : Valeurs monétaires

### Date/Heure
- `DATE` : Dates (année, mois, jour)
- `TIME` : Heures (heures, minutes, secondes)
- `DATETIME` : Dates et heures complètes
- `DATEONLY` : Dates sans heure

### Booléens et Logiques
- `BOOLEAN` : Vrai/Faux

### Données Structurées
- `JSON` : Objets JSON
- `JSONB` : JSON binaire (indexable)
- `ARRAY` : Tableaux
- `HSTORE` : Paires clé-valeur

### Géospatiales
- `GEOMETRY` : Données géométriques
- `GEOGRAPHY` : Données géographiques

### Réseau
- `CIDR` : Blocs d'adresses réseau
- `INET` : Adresses IP
- `MACADDR` : Adresses MAC

### Avancés
- `RANGE` : Plages de valeurs
- `TSVECTOR` : Vecteurs de recherche texte
- `CITEXT` : Texte insensible à la casse

## Configuration des Champs

```typescript
@Field({
  type: AdvancedFieldType.STRING,
  allowNull: false,           // Champ obligatoire
  unique: true,              // Contrainte d'unicité
  primaryKey: false,         // Clé primaire
  autoIncrement: false,     // Auto-incrémentation
  defaultValue: 'default',   // Valeur par défaut
  comment: 'Description',    // Commentaire SQL
  
  // Validation
  validate: [
    { validator: (value) => value.length >= 3, message: 'Trop court' }
  ],
  
  // UI
  widget: 'text',            // Type de widget
  hint: 'Conseil',           // Texte d'aide
  placeholder: 'Entrez...',  // Placeholder
  
  // Métadonnées
  searchable: true,          // Champ recherchable
  sortable: true,           // Champ triable
  filterable: true,         // Champ filtrable
  exportable: true,         // Inclure dans les exports
  importable: true,         // Autoriser l'import
  
  // Sécurité
  sensitive: false,         // Donnée sensible
  encrypted: false,         // Chiffrer en base
  masked: false,           // Masquer dans l'UI
  
  // Audit
  audit: false,             // Suivre les modifications
  history: false,           // Historique des valeurs
  versioned: false          // Versionnement
})
```

## Système de Contraintes

### Types Disponibles

1. **PRIMARY_KEY** : Clé primaire
2. **FOREIGN_KEY** : Clé étrangère avec actions ON DELETE/UPDATE
3. **UNIQUE** : Contrainte d'unicité
4. **CHECK** : Contraintes conditionnelles complexes
5. **NOT_NULL** : Champ non nul
6. **DEFAULT** : Valeur par défaut
7. **EXCLUSION** : Contraintes d'exclusion

### Exemples d'utilisation

```typescript
// Contrainte de clé étrangère
EntidrConstraintManager.createForeignKey(
  'ProductModel', 
  'categoryId', 
  {
    table: 'CategoryModel',
    onDelete: ForeignKeyAction.SET_NULL,
    onUpdate: ForeignKeyAction.CASCADE,
    errorMessages: {
      foreignKey: 'Catégorie invalide'
    }
  }
);

// Contrainte CHECK complexe
EntidrConstraintManager.createCheck(
  'ProductModel', 
  ['price', 'stock'], 
  'price > 0 AND stock >= 0',
  {
    errorMessages: {
      check: 'Prix et stock doivent être positifs'
    }
  }
);

// Contrainte DEFAULT
EntidrConstraintManager.createDefault(
  'ProductModel', 
  'status', 
  'active'
);
```

## Système de Relations

### Configuration des Relations

```typescript
// Many-to-One (appartient à)
EntidrRelationManager.manyToOne(
  ProductModel,           // Modèle source
  CategoryModel,         // Modèle cible
  'category',            // Nom de la relation
  {
    foreignKey: 'categoryId',
    as: 'category',
    onDelete: ForeignKeyAction.SET_NULL,
    onUpdate: ForeignKeyAction.CASCADE,
    hooks: {
      beforeAssociate: (source, target) => {
        console.log('Association avant:', source, target);
      }
    }
  }
);

// One-to-Many (a plusieurs)
EntidrRelationManager.oneToMany(
  CategoryModel,
  ProductModel,
  'products',
  {
    foreignKey: 'categoryId',
    as: 'products'
  }
);

// Many-to-Many (plusieurs à plusieurs)
EntidrRelationManager.manyToMany(
  ProductModel,
  TagModel,
  'tags',
  'product_tags',        // Table de jonction
  {
    foreignKey: 'productId',
    otherKey: 'tagId'
  }
);
```

## Hooks et Méthodes

### Hooks de Cycle de Vie

```typescript
@Hook('beforeCreate')
static async beforeCreate(user: UserModel): Promise<void> {
  // Logique avant création
  user.password = await hashPassword(user.password);
}

@Hook('afterUpdate')
static async afterUpdate(user: UserModel): Promise<void> {
  // Logique après mise à jour
  if (user.changed('email')) {
    await sendVerificationEmail(user.email);
  }
}
```

### Méthodes Métier

```typescript
@Method({
  name: 'activateAccount',
  description: 'Active le compte utilisateur',
  api: true,
  permissions: ['user:activate']
})
async activateAccount(): Promise<void> {
  this.status = 'active';
  this.verified = true;
  await this.save();
}

@Method({
  name: 'changePassword',
  description: 'Change le mot de passe',
  parameters: [
    { name: 'oldPassword', type: 'string', required: true },
    { name: 'newPassword', type: 'string', required: true }
  ],
  returns: { type: 'boolean', description: 'True si succès' }
})
async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
  if (!(await this.verifyPassword(oldPassword))) {
    return false;
  }
  
  this.password = await hashPassword(newPassword);
  await this.save();
  return true;
}
```

### Scopes de Requête

```typescript
@Scope({
  name: 'active',
  scope: () => ({ where: { status: 'active' } })
})
static activeScope() {
  return this.scope({ where: { status: 'active' } });
}

@Scope({
  name: 'byRole',
  scope: (role: string) => ({
    where: { 
      preferences: {
        role: role
      }
    }
  })
})
static byRoleScope(role: string) {
  return this.scope({ 
    where: { 
      preferences: {
        role: role
      }
    }
  });
}

// Utilisation
const activeUsers = await UserModel.activeScope().findAll();
const adminUsers = await UserModel.byRoleScope('admin').findAll();
```

## Validation

### Validateurs Prédéfinis

```typescript
import { EntidrBaseModel } from './EntidrModel';

// Validateurs intégrés
const validators = EntidrBaseModel.validators;

// Required
validators.required(value)

// Email
validators.email(value)

// Length
validators.minLength(8)(value)
validators.maxLength(50)(value)

// Pattern
validators.pattern(/^[A-Z]/, 'Doit commencer par une majuscule')(value)

// Range
validators.range(0, 100)(value)

// Unique
validators.unique(value, 'email', UserModel)
```

### Validation Personnalisée

```typescript
@Field({
  type: AdvancedFieldType.STRING,
  validate: [
    EntidrBaseModel.createValidator(
      'strongPassword',
      (value) => {
        if (value.length < 8) return 'Minimum 8 caractères';
        if (!/[A-Z]/.test(value)) return 'Une majuscule requise';
        if (!/[0-9]/.test(value)) return 'Un chiffre requis';
        return true;
      },
      'Le mot de passe est trop faible'
    )
  ]
})
password!: string;
```

## Bonnes Pratiques

### 1. Organisation des Modèles
- Un modèle par fichier
- Utiliser des noms descriptifs (UserModel, ProductModel)
- Regrouper les modèles par domaine (crm/, sales/, inventory/)

### 2. Configuration des Champs
- Toujours définir `allowNull` explicitement
- Utiliser des commentaires pour la documentation
- Configurer la validation au niveau du champ

### 3. Relations
- Utiliser des noms de relation clairs et cohérents
- Définir les actions ON DELETE/UPDATE appropriées
- Ajouter des hooks pour la logique métier

### 4. Contraintes
- Préférer les contraintes de base de données aux validations applicatives
- Utiliser des messages d'erreur clairs et actionnables
- Documenter les contraintes complexes

### 5. Performance
- Utiliser des index pour les champs fréquemment recherchés
- Éviter les champs calculés complexes
- Utiliser les scopes pour les requêtes réutilisables

## Migration depuis Sequelize

L'Entidr ORM est basé sur Sequelize et offre une migration progressive :

```typescript
// Ancienne façon (Sequelize)
class User extends Model {
  static init(sequelize) {
    super.init({
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    }, { sequelize });
  }
}

// Nouvelle façon (Entidr ORM)
@EntidrModelDecorator({ tableName: 'users' })
class UserModel extends EntidrBaseModel {
  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true
  })
  username!: string;
}
```

## Contribuer

Pour contribuer au développement de l'Entidr ORM :

1. Suivre les conventions de codage établies
2. Ajouter des tests pour les nouvelles fonctionnalités
3. Mettre à jour la documentation
4. Respecter l'architecture modulaire

## License

MIT License - voir le fichier LICENSE pour les détails.
