# Entidr

Application full‑stack (React + Express) avec gestion de modules, base de données Sequelize/SQLite et documentation Swagger.

## Aperçu
- Frontend: React 18 + Vite, UI Radix + tailwind.
- Backend: Express 5, routes REST `/api/v1`, WebSocket `/ws/analytics`.
- Base de données: Sequelize, dialecte SQLite (par défaut), migrations + seeders.
- Modules: registre en base et contenu optionnel dans `addons/<module>/` (migrations/seeders). Actions d’installation, activation, désinstallation.

## Prérequis
- Node.js 18+ (recommandé 20/22)
- npm 9+

## Installation
1. Installer les dépendances
   - `npm install`
2. Configurer l’environnement (défauts fournis)
   - Copier/adapter les fichiers d’exemple: `.env.development.example` → `.env.development`, `.env.production.example` → `.env.production`
   - Variables utiles:
     - `PORT`: port du backend (défaut 3001)
     - `VITE_API_BASE_URL`: URL de l’API côté front (ex: `http://localhost:3001/api/v1`)
     - `DB_DIALECT`, `DB_STORAGE` (SQLite par défaut, voir `src/config/config.js`)
3. Initialiser la base (Option A)
   - `npm run setup-db`
   - Cela exécute les migrations `src/migrations` puis les seeders `src/seeders` et crée `src/database.sqlite`.

## Démarrage
- Backend (API + WS):
  - `npm run server`
  - Expose: `http://localhost:3001/api/v1` et Swagger sur `http://localhost:3001/api-docs`
- Frontend (dev):
  - `npm run dev`
  - Vite démarre sur `http://localhost:3000` et consomme l’API définie par `VITE_API_BASE_URL`.

## Scripts NPM utiles
- `dev`: lance Vite (frontend)
- `server`: démarre le serveur Express (backend)
- `setup-db`: migrations + seeders (SQLite par défaut)
- `migrate`, `migrate:dev`, `migrate:prod`: exécution contrôlée des migrations
- `build`, `build:dev`, `preview`: build/preview du frontend
- `test`, `test:unit`, `test:api`: tests (vitest/jest)
- `lint`: ESLint

## Architecture
- Backend
  - Entrée: `server.js` → `src/server/index.js`
  - Routes v1: `src/server/api/v1` (ex: `modules.js`, `users.js`, `printers.js`, …)
  - Contrôleurs: `src/server/controllers` (ex: `moduleController.js`)
  - Middlewares/erreurs: `src/middlewares`
  - Swagger: `src/config/swagger`
  - Modèles Sequelize: `src/models` (+ `src/config/config.js`)
  - Migrations/Seeders: `src/migrations`, `src/seeders`
- Frontend
  - Code: `src/` (React + Vite)
  - Gestion des modules (UI): `src/components/settings/ModulesSettings.tsx`
  - Types: `src/types`
- Modules (fichiers additionnels)
  - Dossier: `addons/<nomModule>/`
  - Sous‑dossiers pris en charge: `migrations/`, `seeders/`

## Gestion des modules
- Endpoints principaux (v1):
  - `GET /api/v1/modules` : liste des modules
  - `GET /api/v1/modules/:name` : détail d’un module
  - `PUT /api/v1/modules/:name/status` : activer/désactiver (`{ "active": true|false }`)
  - `POST /api/v1/modules/:name/install` : installer (exécute migrations/seeders du module si présents)
  - `POST /api/v1/modules/:name/uninstall` : désinstaller (vérifie dépendances)
- UI
  - Onglets: “Installés”, “Disponibles”, “Tous”
  - Bouton “Rafraîchir” relit la liste depuis l’API
- Synchronisation avec le système de fichiers
  - L’API marque `installable=false` si le dossier `addons/<module>` est absent. Ces modules n’apparaissent pas en “Disponibles” ni en “Tous” s’ils ne sont pas installés.
  - Pour supprimer définitivement un module de la base, prévoir une opération de nettoyage (à venir) ou le retirer manuellement de la table `Modules`.

## Base de données
- Config: `src/config/config.js` (SQLite par défaut: `src/database.sqlite` en dev)
- Migrations: `src/migrations` (création des tables)
- Seeders: `src/seeders` (données de base, y compris modules par défaut)
- Commandes utiles:
  - `npx sequelize-cli db:migrate --migrations-path=src/migrations`
  - `npx sequelize-cli db:seed:all --seeders-path=src/seeders`

## Déploiement
- Construire le frontend: `npm run build` (dossier `dist/`)
- Lancer l’API: `npm run server` (derrière un reverse proxy recommandé)
- Variables à définir: `PORT`, `VITE_API_BASE_URL`, et paramètres DB (si autre que SQLite fichier)

## Dépannage
- 404 sur désinstallation d’un module
  - Vérifier les routes v1: `src/server/api/v1/modules.js` doit exposer `POST /:name/uninstall`.
- Vue “Aucun module disponible”
  - Exécuter `npm run setup-db` pour aligner le schéma et les données seed.
  - Vérifier `VITE_API_BASE_URL` (ex: `http://localhost:3001/api/v1`).
- Modules supprimés dans `addons/` encore visibles
  - Cliquer sur “Rafraîchir” dans l’UI; l’API marquera `installable=false` et ils ne seront plus listés en “Disponibles”/“Tous” s’ils ne sont pas installés. Pour un nettoyage total, supprimer l’entrée en DB.

## Licence
- À définir par le propriétaire du projet.
