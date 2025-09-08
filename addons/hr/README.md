#+ Module HR (Ressources Humaines)

Ce module fournit les fonctionnalités de base pour gérer les ressources humaines: employés, départements (directions), contrats, documents, tâches d’on/offboarding, workflows et signatures électroniques.

## Fonctionnalités
- Employés: CRUD, recherche par nom/poste/email
- Départements (Directions): CRUD, responsable (manager)
- Contrats: CRUD, filtrage par employé
- Documents: CRUD, attachement par employé
- On/Offboarding: tâches, assignations, suivi de statut
- Workflows: définition simple de workflows RH
- Signatures: demandes de signature électronique (interne)

## Endpoints API
Les routes sont montées sous l’API v1 par `moduleApiLoader`.

- Employés: `GET/POST/PUT/DELETE /hr/employees[:id]`
- Départements/Directions: `GET/POST/PUT/DELETE /hr/departments[:id]` et alias `/hr/directions`
- Contrats: `GET/POST/PUT/DELETE /hr/contracts[:id]`
- Documents: `GET/POST/PUT/DELETE /hr/documents[:id]`
- Tâches: `GET /hr/onboarding/tasks`, `GET /hr/offboarding/tasks`, `POST/PUT/DELETE /hr/tasks[:id]`
- Workflows: `GET/POST/PUT/DELETE /hr/workflows[:id]`
- Signatures: `GET /hr/signatures`, `POST /hr/signatures`, `POST /hr/signatures/:id/sign`

Détails complets dans `docs/hr-audit.md`.

## Modèles & Tables
- HrDepartments, HrEmployees, HrContracts, HrDocuments, HrTasks, HrWorkflows, HrSignatureRequests
- Les factories de modèles sont dans `addons/hr/models/*.js`

## Migrations
- Dossier: `addons/hr/migrations/`
- Exécution: `npx sequelize-cli db:migrate --migrations-path addons/hr/migrations`
- Recommandé: activer le mode strict en prod: `ADDONS_STRICT_MIGRATIONS=true`

Note: évitez les doublons de migration; conservez un ordre logique (départements → employés → …).

## Installation du module
1. Synchroniser les modules: `GET /api/v1/modules/sync`
2. Installer: `POST /api/v1/modules/hr/install`
   - En non-strict, les erreurs de migration sont journalisées et l’installation continue.
   - En strict (`ADDONS_STRICT_MIGRATIONS=true`), l’installation échoue en cas d’erreur.

## Sécurité
- Certaines routes sont protégées par un garde `allow(roles)`; intégrez un middleware auth global pour `req.user`.
- Recommandations détaillées: voir `docs/hr-audit.md` (section Sécurité).

## Frontend
- Routes: `addons/hr/routes.tsx`
- Vues: `addons/hr/views/pages`
- Services: `addons/hr/services/*`

## Développement
- DB par défaut: SQLite (`src/config/config.js`)
- Linter/formatting: utiliser la configuration du repo
- Tests API: à compléter (voir recommandations dans l’audit)

## Changelog
- 1.0.0: version initiale du noyau RH
