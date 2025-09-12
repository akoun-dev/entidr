# Analyse complète du processus d'installation des modules et de la logique de base de données

## 1. Processus d'installation des modules

### Étape 1: Découverte et génération du registre des modules
Le processus commence avec le script `scripts/generateModuleRegistry.js` qui :
- Scanne le dossier `addons/` pour trouver tous les modules valides
- Un module valide doit contenir `index.ts` et `manifest.ts`
- Lit les manifestes des modules pour extraire les métadonnées (nom, dépendances, modèles)
- Trie les modules en fonction de leurs dépendances (tri topologique)
- Génère automatiquement le fichier `src/core/ModuleRegistry.ts`

### Étape 2: Configuration des modules
Le script `scripts/setupModules.js` orchestre l'installation complète :
1. Génère le registre des modules
2. Exécute les migrations de base de données
3. Exécute les seeders pour insérer les données initiales
4. Vérifie l'état des modules dans la base de données

### Étape 3: Chargement dynamique des modules
Le système utilise :
- `src/core/ModuleRegistry.ts` pour charger dynamiquement les modules via `import()`
- `src/core/AddonManager.ts` pour gérer l'enregistrement et le cycle de vie des modules
- `src/utils/moduleApiLoader.js` pour monter les APIs des modules dans l'application Express

## 2. Création des tables en base de données

### Structure de la base de données
- **Dialecte**: SQLite (configurable via variables d'environnement)
- **Fichier de base de données**: `src/database.sqlite`
- **Configuration**: `src/config/config.js` avec différents environnements (dev, test, prod)

### Processus de migration
1. **Migration runner** (`scripts/migration-runner.js`):
   - Crée la table `SequelizeMeta` pour suivre les migrations exécutées
   - Exécute les migrations en attente dans l'ordre chronologique
   - Enregistre chaque migration exécutée dans `SequelizeMeta`

2. **Table des modules** (`src/migrations/20250511141718-create-module-table.js`):
   ```sql
   CREATE TABLE Modules (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name VARCHAR UNIQUE NOT NULL,
     displayName VARCHAR NOT NULL,
     version VARCHAR NOT NULL,
     summary VARCHAR,
     description TEXT,
     active BOOLEAN DEFAULT FALSE,
     installed BOOLEAN DEFAULT FALSE,
     installable BOOLEAN DEFAULT TRUE,
     application BOOLEAN DEFAULT TRUE,
     autoInstall BOOLEAN DEFAULT FALSE,
     dependencies TEXT,
     models TEXT,
     installedAt DATE,
     createdAt DATE DEFAULT CURRENT_TIMESTAMP,
     updatedAt DATE DEFAULT CURRENT_TIMESTAMP
   );
   ```

### Processus de seeding
Le seeder `src/seeders/20250511142000-default-modules.js` insère les modules par défaut :
- HR (Ressources Humaines)
- CRM (Gestion de la relation client)
- Finance (Gestion financière)
- Inventory (Gestion des stocks)
- Project (Gestion de projets)

## 3. Logique globale d'architecture des modules

### Structure d'un module (exemple: HR)
Chaque module dans `addons/` a une structure standardisée :

```
addons/hr/
├── index.ts              # Point d'entrée du module
├── manifest.ts           # Métadonnées et configuration
├── types.ts              # Définitions de types
├── controllers/          # Logique métier
│   ├── index.js
│   ├── EmployeeController.js
│   ├── DepartmentController.js
│   └── ...
├── models/               # Modèles de données
│   ├── index.js
│   ├── Employee.js
│   ├── Department.js
│   └── ...
├── routes/               # Définition des routes API
│   └── index.js
├── hooks/                # Points d'extension
├── services/             # Services métier
├── validations/          # Validation des données
└── views/                # Composants UI
```

### Manifeste du module
Le manifeste (`manifest.ts`) définit :
- Métadonnées (nom, version, description)
- Dépendances entre modules
- Modèles de données avec leurs champs
- Vues disponibles (LIST, FORM, KANBAN)
- Structure des menus
- Routes frontend
- Endpoints API

### Cycle de vie d'un module
1. **Découverte**: Le système scanne le dossier `addons/`
2. **Validation**: Vérifie que le module a les fichiers requis
3. **Enregistrement**: Enregistre le manifeste dans l'AddonManager
4. **Installation**: Crée les tables de données via les migrations
5. **Configuration**: Insère les données de base via les seeders
6. **Chargement**: Charge dynamiquement les routes et contrôleurs
7. **Exécution**: Le module est disponible dans l'application

### Gestion des dépendances
- Les modules peuvent déclarer des dépendances dans leur manifeste
- Le système effectue un tri topologique pour déterminer l'ordre de chargement
- Les dépendances sont résolues avant le chargement du module

## 4. Architecture technique

### Stack technique
- **Backend**: Node.js + Express.js
- **Base de données**: SQLite (configurable pour PostgreSQL/MySQL)
- **ORM**: Sequelize pour les migrations, Mongoose pour les modèles de modules
- **Frontend**: React + TypeScript
- **Gestion des modules**: Système de plugins dynamiques

### Points d'extension
- **Hooks**: Les modules peuvent enregistrer des hooks pour étendre la fonctionnalité
- **APIs**: Chaque module expose ses propres endpoints API
- **Composants**: Les modules peuvent fournir des composants React
- **Menus**: Les modules peuvent ajouter des éléments au menu de navigation

### Sécurité
- Middleware d'authentification pour les routes protégées
- Validation des données avec express-validator
- Gestion des permissions par module
- Upload de fichiers sécurisé avec Multer

## 5. Flux de données

1. **Requête client** → Route Express → Contrôleur de module
2. **Contrôleur** → Modèle Mongoose → Base de données MongoDB
3. **Réponse** → Formatage → Client

Le système utilise une architecture modulaire qui permet d'ajouter des fonctionnalités sans modifier le code core, en suivant les principes de l'architecture de plugins et de la conception orientée services.
