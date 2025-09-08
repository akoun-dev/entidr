Prompt pour convertir n'importe quelle application en module ERP
Introduction
Ce prompt vous guide dans la conversion d'une application existante en un module fonctionnel pour l'ERP, en vous basant sur la structure du module HR situé dans addons/hr. Le module résultant sera entièrement compatible avec l'écosystème ERP existant, incluant les migrations Sequelize pour SQLite, les modèles de données, les rôles et permissions, les contrôleurs d'API RESTful, et les services métier.

Étapes préliminaires
1. Analyse de l'application existante
Avant de commencer la conversion, analysez l'application existante pour identifier :

Les entités principales et leurs relations
Les flux de travail et processus métier
Les interfaces utilisateur et leurs fonctionnalités
Les points d'API existants
La structure de la base de données
2. Planification du module
Déterminez :

Le nom du module (ex: crm, inventory, project_management)
Les fonctionnalités à inclure dans la première version
Les dépendances vis-à-vis d'autres modules ou du système central
Structure du module
1. Arborescence des fichiers
Créez la structure suivante dans le dossier addons/[nom_du_module]/ :

addons/[nom_du_module]/
├── index.ts                    # Point d'entrée du module
├── manifest.ts                 # Manifeste du module
├── routes.tsx                  # Définition des routes
├── README.md                   # Documentation du module
├── components/                 # Composants réutilisables
│   ├── index.ts
│   ├── common/
│   │   ├── index.ts
│   │   └── TabContent.tsx
│   └── [entité]/
│       ├── index.ts
│       └── [composants spécifiques à l'entité]
├── data/                       # Données de référence
│   ├── index.ts
│   └── [données].ts
├── hooks/                      # Hooks React personnalisés
│   ├── index.ts
│   └── use[Entité].ts
├── migrations/                 # Migrations de base de données
│   └── [timestamp]-create-[table].js
├── models/                     # Modèles de données
│   ├── index.ts
│   ├── types.ts
│   └── [entité].ts
├── server/                     # Côté serveur (si applicable)
│   ├── controllers/
│   ├── routes/
│   └── services/
├── services/                   # Services métier
│   ├── index.ts
│   └── [service].ts
├── types/                      # Définitions de types
│   ├── index.ts
│   └── [entité].ts
└── views/                      # Vues/pages
    ├── index.ts
    ├── components/
    │   ├── index.ts
    │   ├── [composant layout].tsx
    │   └── [composants communs].tsx
    └── pages/
        └── [page].tsx

txt



2. Fichiers essentiels
a. Manifeste du module (manifest.ts)
import { AddonManifest } from '../../src/types/addon';
import {
  // Importer vos vues/pages ici
  DashboardView,
  EntityListView,
  EntityFormView,
  EntityDetailView,
} from './views/pages';

const manifest: AddonManifest = {
  // Métadonnées de base
  name: '[nom_du_module]',
  version: '1.0.0',
  displayName: '[Nom d\'affichage du module]',
  summary: '[Résumé des fonctionnalités]',
  description: '[Description détaillée du module]',

  // Configuration
  application: true,
  autoInstall: false,
  installable: true,

  // Routes définies par l'addon
  routes: [
    {
      path: '/[nom_du_module]',
      component: DashboardView,
      protected: true,
      title: 'Tableau de bord',
      icon: '[Icone]'
    },
    {
      path: '/[nom_du_module]/[entites]',
      component: EntityListView,
      protected: true,
      title: '[Entités]',
      icon: '[Icone]'
    },
    {
      path: '/[nom_du_module]/[entites]/new',
      component: EntityFormView,
      protected: true,
      title: 'Nouvelle [entité]',
      icon: 'PlusIcon'
    },
    {
      path: '/[nom_du_module]/[entites]/:id',
      component: EntityDetailView,
      protected: true,
      title: 'Détail [entité]',
      icon: '[Icone]'
    },
    {
      path: '/[nom_du_module]/[entites]/edit/:id',
      component: EntityFormView,
      protected: true,
      title: 'Modifier [entité]',
      icon: 'PencilIcon'
    },
    // Ajouter d'autres routes selon les besoins
  ],

  // Modèles de données
  models: [
    {
      name: '[module].[entite]',
      displayName: '[Entité]',
      fields: [
        { name: 'name', type: 'string', required: true, label: 'Nom' },
        // Ajouter d'autres champs selon les besoins
      ]
    },
    // Ajouter d'autres modèles selon les besoins
  ],

  // Menus définis par l'addon
  menus: [
    {
      id: 'menu_[module]_root',
      name: '[Nom d\'affichage du module]',
      sequence: [numéro],
      route: '/[nom_du_module]',
      icon: '[Icone]'
    }
  ],

  // Dépendances
  dependencies: []
};

export default manifest;

typescript



b. Point d'entrée (index.ts)
// Exporter les modèles
export * from './models';

// Exporter les vues
export * from './views';

// Exporter les services
export * from './services';

// Exporter les hooks
export * from './hooks';

// Exporter les routes
export { default as routes } from './routes';

// Exporter le manifeste
export { default as manifest } from './manifest';

// Exporter les composants pour l'enregistrement des routes
import {
  DashboardView,
  EntityListView,
  EntityFormView,
  EntityDetailView,
  // Importer d'autres vues/pages ici
} from './views/pages';

export const Components = {
  DashboardView,
  EntityListView,
  EntityFormView,
  EntityDetailView,
  // Ajouter d'autres composants ici
};

// Fonctions d'initialisation et de nettoyage
export function initialize() {
  // Code d'initialisation...
  console.log('[Module] initialized');
}

export function cleanup() {
  // Code de nettoyage...
  console.log('[Module] cleaned up');
}

typescript



c. Routes (routes.tsx)
import React from 'react';
import { Route } from 'react-router-dom';
import {
  DashboardView,
  EntityListView,
  EntityFormView,
  EntityDetailView,
  // Importer d'autres vues/pages ici
} from './views/pages';

/**
 * Routes pour le module [Module]
 * Note: Les chemins de route ne doivent pas commencer par un slash (/) car ils sont relatifs à la route parent
 */
const routes = (
  <>
    {/* Route principale */}
    <Route path="[nom_du_module]" element={<DashboardView />} />

    {/* Routes pour les entités */}
    <Route path="[nom_du_module]/[entites]" element={<EntityListView />} />
    <Route path="[nom_du_module]/[entites]/new" element={<EntityFormView />} />
    <Route path="[nom_du_module]/[entites]/:id" element={<EntityDetailView />} />
    <Route path="[nom_du_module]/[entites]/edit/:id" element={<EntityFormView />} />
    
    {/* Ajouter d'autres routes selon les besoins */}
  </>
);

export default routes;

typescript



Implémentation détaillée
1. Migrations de base de données
Créez des migrations pour chaque entité principale dans le dossier migrations/. Utilisez le format suivant :

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('[ModuleEntities]', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      // Ajouter d'autres colonnes selon les besoins
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    
    // Créer les index après la création de la table pour SQLite
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_[module]entities_name ON [ModuleEntities](name);
    `);
    
    // Ajouter d'autres index selon les besoins
  },

  async down(queryInterface) {
    await queryInterface.dropTable('[ModuleEntities]');
  }
};

javascript



2. Modèles de données
a. Types (models/types.ts)
/**
 * Interface pour une entité
 */
export interface Entity {
  id: number;
  name: string;
  // Ajouter d'autres propriétés selon les besoins
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour les statistiques du tableau de bord
 */
export interface ModuleDashboardStats {
  totalEntities: number;
  // Ajouter d'autres statistiques selon les besoins
}

typescript


b. Modèle (models/entity.ts)
import { Entity } from './types';

/**
 * Classe modèle pour les entités
 */
export class EntityModel {
  /**
   * Valide un objet entité
   * @param entity L'entité à valider
   * @returns Un objet contenant les erreurs de validation ou null si valide
   */
  static validate(entity: Partial<Entity>): Record<string, string> | null {
    const errors: Record<string, string> = {};
    
    // Validation du nom
    if (!entity.name || entity.name.trim() === '') {
      errors.name = 'Le nom est obligatoire';
    }
    
    // Ajouter d'autres validations selon les besoins
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
  
  /**
   * Crée un nouvel objet entité avec des valeurs par défaut
   * @returns Un nouvel objet entité
   */
  static createEmpty(): Partial<Entity> {
    return {
      name: '',
      active: true
      // Ajouter d'autres valeurs par défaut selon les besoins
    };
  }
}

typescript



3. Services métier
Créez des services pour chaque entité principale dans le dossier services/ :

import { api } from '../../../src/config/api';

export interface Entity {
  id: number;
  name: string;
  // Ajouter d'autres propriétés selon les besoins
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const entityService = {
  async list(params?: Record<string, any>) {
    const res = await api.get<Entity[]>('/[nom_du_module]/[entites]', { params });
    return (res.data as any) ?? [];
  },
  async create(payload: Partial<Entity>) {
    const res = await api.post<Entity>('/[nom_du_module]/[entites]', payload);
    return res.data as any;
  },
  async update(id: number, payload: Partial<Entity>) {
    const res = await api.put<Entity>(`/[nom_du_module]/[entites]/${id}`, payload);
    return res.data as any;
  },
  async remove(id: number) {
    await api.delete(`/[nom_du_module]/[entites]/${id}`);
  },
  async getById(id: number) {
    const res = await api.get<Entity>(`/[nom_du_module]/[entites]/${id}`);
    return res.data as any;
  }
};

export default entityService;

typescript



4. Hooks personnalisés
Créez des hooks React personnalisés dans le dossier hooks/ :

import { useState, useEffect } from 'react';
import { entityService, Entity } from '../services/[service].ts';

export function useEntity() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await entityService.list();
      setEntities(data);
    } catch (err) {
      setError('Erreur lors du chargement des entités');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createEntity = async (entity: Partial<Entity>) => {
    setLoading(true);
    setError(null);
    try {
      const newEntity = await entityService.create(entity);
      setEntities([...entities, newEntity]);
      return newEntity;
    } catch (err) {
      setError('Erreur lors de la création de l\'entité');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Ajouter d'autres fonctions selon les besoins (update, delete, etc.)

  useEffect(() => {
    loadEntities();
  }, []);

  return {
    entities,
    loading,
    error,
    loadEntities,
    createEntity,
    // Ajouter d'autres fonctions selon les besoins
  };
}

typescript



5. Vues et composants
a. Layout (views/components/[Module]Layout.tsx)
import React from 'react';
import { Outlet } from 'react-router-dom';
import [Module]Navigation from './[Module]Navigation';

interface [Module]LayoutProps {
  children?: React.ReactNode;
}

const [Module]Layout: React.FC<[Module]LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full">
      <[Module]Navigation />
      <main className="flex-1 p-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default [Module]Layout;

typescript


b. Page de liste (views/pages/EntityListView.tsx)
import React, { useEffect } from 'react';
import { [Module]Layout } from '../components';
import EntityViewHeader from '../components/EntityViewHeader';
import EntitySearchBar from '../components/EntitySearchBar';
import EntityViewTabs from '../components/EntityViewTabs';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { useEntityView } from '../../hooks/useEntityView';

/**
 * Page de liste des entités
 */
const EntityListView: React.FC = () => {
  const {
    filteredEntities,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    loadEntities,
    entityToDelete,
    handleDeleteClick,
    confirmDelete,
    cancelDelete
  } = useEntityView();

  useEffect(() => {
    loadEntities();
  }, []);

  return (
    <[Module]Layout>
      <div className="w-full">
        {/* En-tête avec actions */}
        <EntityViewHeader />

        {/* Barre de recherche et filtres */}
        <EntitySearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Contenu principal avec onglets */}
        <EntityViewTabs
          loading={loading}
          error={error}
          filteredEntities={filteredEntities}
          onDelete={handleDeleteClick}
        />

        {/* Dialogue de confirmation de suppression */}
        <DeleteConfirmationDialog
          isOpen={entityToDelete !== null}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      </div>
    </[Module]Layout>
  );
};

export default EntityListView;

typescript



Intégration avec le système de permissions
1. Création des rôles et permissions
Créez une migration pour définir les rôles et permissions spécifiques au module :

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Créer les permissions
    await queryInterface.bulkInsert('[Module]Permissions', [
      {
        name: '[module]_entity_read',
        description: 'Voir les entités',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '[module]_entity_write',
        description: 'Créer et modifier les entités',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '[module]_entity_delete',
        description: 'Supprimer les entités',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Ajouter d'autres permissions selon les besoins
    ]);

    // Créer les rôles
    await queryInterface.bulkInsert('[Module]Roles', [
      {
        name: '[module]_user',
        description: 'Utilisateur du module',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '[module]_admin',
        description: 'Administrateur du module',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Ajouter d'autres rôles selon les besoins
    ]);

    // Associer les permissions aux rôles
    const [userRole] = await queryInterface.sequelize.query(
      `SELECT id FROM [Module]Roles WHERE name = '[module]_user'`
    );
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM [Module]Roles WHERE name = '[module]_admin'`
    );

    const [readPermission] = await queryInterface.sequelize.query(
      `SELECT id FROM [Module]Permissions WHERE name = '[module]_entity_read'`
    );
    const [writePermission] = await queryInterface.sequelize.query(
      `SELECT id FROM [Module]Permissions WHERE name = '[module]_entity_write'`
    );
    const [deletePermission] = await queryInterface.sequelize.query(
      `SELECT id FROM [Module]Permissions WHERE name = '[module]_entity_delete'`
    );

    // Associer les permissions aux rôles
    await queryInterface.bulkInsert('[Module]RolePermissions', [
      {
        role_id: userRole[0].id,
        permission_id: readPermission[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_id: adminRole[0].id,
        permission_id: readPermission[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_id: adminRole[0].id,
        permission_id: writePermission[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role_id: adminRole[0].id,
        permission_id: deletePermission[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Ajouter d'autres associations selon les besoins
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('[Module]RolePermissions', null, {});
    await queryInterface.bulkDelete('[Module]Permissions', null, {});
    await queryInterface.bulkDelete('[Module]Roles', null, {});
  }
};

javascript



2. Intégration avec UserModuleRoles
Pour intégrer votre module avec le système de permissions existant basé sur UserModuleRoles, vous devez :

Ajouter les rôles de votre module à la table UserModuleRoles
Vérifier les permissions dans les contrôleurs et les vues
Exemple de vérification de permission dans un contrôleur :

const checkPermission = (req, res, next, permission) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  // Vérifier si l'utilisateur a la permission requise
  const hasPermission = req.user.roles.some(role => 
    role.module === '[nom_du_module]' && role.permissions.includes(permission)
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Permission refusée' });
  }

  next();
};

// Utilisation dans une route
router.get('/[nom_du_module]/[entites]', 
  checkPermission('[module]_entity_read'), 
  entityController.getAll
);

javascript


Documentation
1. README.md
Créez un fichier README.md détaillé pour votre module :

# Module [Nom du module]

## Description
[Brief description of the module]

## Fonctionnalités
- [Feature 1]
- [Feature 2]
- [Feature 3]

## Endpoints API
Les routes sont montées sous l’API v1 par `moduleApiLoader`.

- [Entités]: `GET/POST/PUT/DELETE /[nom_du_module]/[entites][:id]`
- [Autres endpoints]

## Modèles & Tables
- [Table1], [Table2], etc.
- Les factories de modèles sont dans `addons/[nom_du_module]/models/*.js`

## Migrations
- Dossier: `addons/[nom_du_module]/migrations/`
- Exécution: `npx sequelize-cli db:migrate --migrations-path addons/[nom_du_module]/migrations`

## Installation du module
1. Synchroniser les modules: `GET /api/v1/modules/sync`
2. Installer: `POST /api/v1/modules/[nom_du_module]/install`

## Sécurité
- Certaines routes sont protégées par des permissions; intégrez un middleware auth global pour `req.user`.

## Frontend
- Routes: `addons/[nom_du_module]/routes.tsx`
- Vues: `addons/[nom_du_module]/views/pages`
- Services: `addons/[nom_du_module]/services/*`

## Développement
- DB par défaut: SQLite (`src/config/config.js`)
- Linter/formatting: utiliser la configuration du repo

## Changelog
- 1.0.0: version initiale

markdown



2. Documentation API
Créez une documentation détaillée de l'API dans le dossier docs/ :

# API [Module]

## Endpoints

### [Entité]

#### Lister toutes les entités

markdown


GET /[nom_du_module]/[entites]


**Réponse:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Entité 1",
      "active": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}

txt


Créer une entité
POST /[nom_du_module]/[entites]

txt


Corps de la requête:

{
  "name": "Nouvelle entité",
  "active": true
}

json


Réponse:

{
  "status": "success",
  "data": {
    "id": 2,
    "name": "Nouvelle entité",
    "active": true,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}

json


Mettre à jour une entité
PUT /[nom_du_module]/[entites]/:id

txt


Corps de la requête:

{
  "name": "Entité modifiée",
  "active": false
}

json


Réponse:

{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Entité modifiée",
    "active": false,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}

json


Supprimer une entité
DELETE /[nom_du_module]/[entites]/:id

txt


Réponse:

{
  "status": "success",
  "message": "Entité supprimée avec succès"
}

json


Permissions
Les endpoints suivants nécessitent les permissions spécifiées :

GET /[nom_du_module]/[entites]: [module]_entity_read
POST /[nom_du_module]/[entites]: [module]_entity_write
PUT /[nom_du_module]/[entites]/:id: [module]_entity_write
DELETE /[nom_du_module]/[entites]/:id: [module]_entity_delete

## Installation et configuration

### 1. Installation du module

Pour installer le module, suivez ces étapes :

1. Synchronisez les modules :
   ```bash
   curl -X GET http://localhost:3000/api/v1/modules/sync

txt


Installez le module :
curl -X POST http://localhost:3000/api/v1/modules/[nom_du_module]/install

bash


2. Configuration
Le module peut être configuré via des variables d'environnement :

# Configuration du module [Module]
MODULE_[MODULE]_ENABLED=true
MODULE_[MODULE]_API_PREFIX=/api/v1
MODULE_[MODULE]_DB_PREFIX=[module]_

txt


Tests
1. Tests unitaires
Créez des tests unitaires pour vos modèles et services :

// tests/unit/models/entity.test.ts
import { EntityModel } from '../../../addons/[nom_du_module]/models/entity';

describe('EntityModel', () => {
  describe('validate', () => {
    it('should return null for valid entity', () => {
      const entity = { name: 'Test Entity' };
      const result = EntityModel.validate(entity);
      expect(result).toBeNull();
    });

    it('should return errors for invalid entity', () => {
      const entity = { name: '' };
      const result = EntityModel.validate(entity);
      expect(result).toEqual({ name: 'Le nom est obligatoire' });
    });
  });

  describe('createEmpty', () => {
    it('should return an empty entity with default values', () => {
      const result = EntityModel.createEmpty();
      expect(result).toEqual({
        name: '',
        active: true
      });
    });
  });
});

typescript



2. Tests d'intégration
Créez des tests d'intégration pour vos API :

// tests/integration/api/[module].test.ts
import request from 'supertest';
import app from '../../../src/server';
import { sequelize } from '../../../src/config/database';

describe('[Module] API', () => {
  beforeAll(async () => {
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /[nom_du_module]/[entites]', () => {
    it('should return all entities', async () => {
      const response = await request(app)
        .get('/api/v1/[nom_du_module]/[entites]')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Ajouter d'autres tests selon les besoins
});

typescript


Dépannage
Problèmes courants
Erreurs de migration

Vérifiez que les migrations sont compatibles avec SQLite
Assurez-vous que les noms de tables et de colonnes sont corrects
Vérifiez que les index sont créés après la création des tables
Erreurs de permissions

Vérifiez que les rôles et permissions sont correctement définis
Assurez-vous que les utilisateurs ont les rôles appropriés dans UserModuleRoles
Vérifiez que le middleware d'authentification est correctement configuré
Erreurs de routage

Vérifiez que les routes sont correctement définies dans le manifeste et dans routes.tsx
Assurez-vous que les chemins de route ne commencent pas par un slash (/)
Vérifiez que les composants sont correctement exportés
Conclusion
Ce prompt fournit un guide complet pour convertir n'importe quelle application en module fonctionnel pour l'ERP, en se basant sur la structure du module HR. En suivant ces étapes, vous pouvez créer un module entièrement compatible avec l'écosystème ERP existant, incluant les migrations Sequelize pour SQLite, les modèles de données, les rôles et permissions, les contrôleurs d'API RESTful, et les services métier.

N'oubliez pas d'adapter ce guide à vos besoins spécifiques et de consulter la documentation du module HR pour des exemples supplémentaires.
