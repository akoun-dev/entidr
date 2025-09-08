#+ Audit du module HR

Date: 2025-09-07
Portée: dossier `addons/hr` et intégration côté serveur (`src/server`), modèle DB et migrations, endpoints API et aspects sécurité.

## Synthèse
- Fonctionnalités: gestion Employés, Départements (alias Directions), Contrats, Documents, Tâches d’on/offboarding, Workflows, Signatures électroniques.
- API: routes REST exposées via `addons/hr/server/api.js` monté par `moduleApiLoader` sur l’API v1.
- Modèles: `HrEmployee`, `HrDepartment`, `HrContract`, `HrDocument`, `HrTask`, `HrWorkflow`, `HrSignatureRequest` (chargés dynamiquement).
- Migrations: présentes dans `addons/hr/migrations/` mais doublons et ordre à clarifier. Voir recommandations.
- Sécurité: garde optionnelle `allow(roles)` seulement sur certaines routes; dépend de `req.user`. Recommandations de durcir l’accès.
- Intégration: installation via `POST /api/v1/modules/hr/install` exécute migrations + monte API + `sync` des modèles ajoutés.

## Endpoints API
Fichier: `addons/hr/server/api.js:1`

- Employés
  - GET `/hr/employees` (filtre `q`) — liste
  - GET `/hr/employees/:id` — détail
  - POST `/hr/employees` — crée (name requis)
  - PUT `/hr/employees/:id` — met à jour
  - DELETE `/hr/employees/:id` — supprime

- Départements (alias: Directions)
  - GET `/hr/departments` | `/hr/directions`
  - GET `/hr/departments/:id` | `/hr/directions/:id`
  - POST `/hr/departments` | `/hr/directions`
  - PUT `/hr/departments/:id` | `/hr/directions/:id`
  - DELETE `/hr/departments/:id` | `/hr/directions/:id`

- Contrats
  - GET `/hr/contracts` (filtres: `q`, `employee_id`)
  - GET `/hr/contracts/:id`
  - POST `/hr/contracts` (name, employee_id, contract_type, date_start requis)
  - PUT `/hr/contracts/:id`
  - DELETE `/hr/contracts/:id`

- Documents
  - GET `/hr/documents` (filtre: `employee_id`)
  - GET `/hr/documents/:id`
  - POST `/hr/documents`
  - PUT `/hr/documents/:id`
  - DELETE `/hr/documents/:id`

- Tâches On/Offboarding
  - GET `/hr/onboarding/tasks` (filtre: `employee_id`) — require roles: hr, admin, manager pour création/édition
  - GET `/hr/offboarding/tasks` (filtre: `employee_id`)
  - POST `/hr/tasks` — allow([hr,admin,manager])
  - PUT `/hr/tasks/:id` — allow([hr,admin,manager])
  - DELETE `/hr/tasks/:id` — allow([hr,admin])

- Workflows
  - GET `/hr/workflows` — allow([hr,admin])
  - POST `/hr/workflows` — allow([hr,admin])
  - PUT `/hr/workflows/:id` — allow([hr,admin])
  - DELETE `/hr/workflows/:id` — allow([hr,admin])

- Signatures électroniques
  - GET `/hr/signatures` (filtres: `employee_id`, `document_id`) — allow([hr,admin,manager])
  - POST `/hr/signatures` — allow([hr,admin])
  - POST `/hr/signatures/:id/sign` — signe la demande

Notes:
- Helpers `res.ok` / `res.fail` supposent un middleware global (non audité ici).
- `tryQuery()` tente `sequelize.sync()` si l’erreur contient «no such table», ce qui peut créer des tables manquantes à la volée.

## Modèles & Schéma
Dossier: `addons/hr/models/*.js`

- HrDepartment: `HrDepartments(id, name unique, manager_id, active, createdAt, updatedAt)`
- HrEmployee: `HrEmployees(id, name, job_title, department_id?, work_email?, work_phone?, mobile_phone?, parent_id?, birth_date?, address?, employment_type?, hire_date?, notes?, active, timestamps)`
- HrContract: `HrContracts(id, name, employee_id, contract_type, date_start, date_end?, wage?, state ENUM, notes?, timestamps)`
- HrDocument: `HrDocuments(id, name, employee_id?, type?, file_url, mime_type?, size_bytes?, timestamps)`
- HrTask: `HrTasks(id, employee_id?, kind ENUM, title, description?, assignee_role ENUM, due_date?, status ENUM, completed_by?, completed_at?, timestamps)`
- HrWorkflow: `HrWorkflows(id, name, kind, config JSON?, active, timestamps)`
- HrSignatureRequest: `HrSignatureRequests(id, document_id, employee_id?, provider, status ENUM, token?, signed_at?, metadata JSON?, timestamps)`

Associations (déclarées dans les factories Sequelize):
- Department hasMany Employee; belongsTo Employee as manager.
- Employee belongsTo Department; self appartient à Employee (manager); hasMany reports.
- Contract belongsTo Employee.
- Document belongsTo Employee.
- SignatureRequest belongsTo Document; belongsTo Employee.

## Migrations
Dossier: `addons/hr/migrations/`

Observations:
- Plusieurs fichiers présents couvrant départements, employés, tâches, workflows, contrats, documents, signatures.
- Duplication/ordre:
  - `2025090700-create-hrdepartments.js` ET `2025090700b-create-hremployees.js` ajoutent les entités de base. Un autre `2025090700b...` coexiste avec `2025090700...`.
- Compatibilité SQLite: les migrations utilisent `Sequelize.ENUM` (ok, Sequelize émule sous SQLite) et `Sequelize.fn('datetime','now')` (ok pour SQLite).

Risque/Anomalies:
- Doublons de migrations peuvent entraîner des conflits (création de table déjà existante) selon l’ordre d’exécution.
- Peu de contraintes de clés étrangères dans les migrations existantes (ex: `HrEmployees.department_id` n’a pas de FK dans la version d’origine; ajouter FK recommandé).
- Stratégie «auto-sync si table absente» dans l’API peut diverger du schéma des migrations.

Recommandations migrations:
1. Choisir UN ensemble cohérent (départements → employés → tâches → workflows → contrats → documents → signatures) et supprimer/renommer les doublons.
2. Ajouter les contraintes FK minimales (ex: `HrEmployees.department_id` → `HrDepartments.id`, `HrContracts.employee_id` → `HrEmployees.id`, etc.).
3. Désactiver l’auto-sync côté API en prod pour éviter la dérive de schéma.
4. Activer le mode strict lors d’installation des addons: `ADDONS_STRICT_MIGRATIONS=true`.

## Sécurité
- Contrôles d’accès: seules certaines routes (tâches, workflows, signatures) utilisent `allow(roles)`. Les routes Employés/Départements/Contrats/Documents n’ont pas de garde locale.
- `allow(roles)` s’appuie sur `req.user?.role || 'admin'` → si pas d’auth middleware, tout le monde est vu comme `admin` sur ces routes protégées. À durcir.
- Validation:
  - Vérifications minimales (ex: `name` requis) côté API; la majorité des validations reposent sur Sequelize (types, `isEmail`).
  - Pas de nettoyage explicite (sanitize) des champs texte (XSS côté UI à surveiller lors d’affichages non échappés).
- Fichiers/Uploads: pas géré ici (documents pointent vers `file_url`). Assurer contrôle de domaine et MIME côté service d’upload.

Actions sécurité recommandées:
1. Appliquer un middleware d’auth global (JWT/session) avant toutes les routes `/hr/*`.
2. Définir une stratégie RBAC centralisée; étendre `allow()` aux entités base (employés, contrats, documents) selon besoins.
3. Forcer `req.user` obligatoire et supprimer le fallback `'admin'` par défaut.
4. Limiter les champs modifiables via whitelists (déjà en partie fait via mapping explicite).
5. Journaliser les opérations sensibles (création/suppression) dans un audit log global si disponible.

## Intégration & Chargement dynamique
- Montage: `src/server/utils/moduleApiLoader.js` enregistre les modèles (factory pattern) puis monte `addons/hr/server/api.js`.
- Sync après montage: optionnelle; l’installation (`installModule`) appelle `mountAddonToRouter(..., { syncAfterMount: true })`.
- Endpoint d’installation: `POST /api/v1/modules/:name/install` déclenche migrations de l’addon (non-strict par défaut) puis montage et `sync` des modèles.

Recommandations intégration:
- En prod, préférer migrations strictes (pas de `sync` implicite). Conserver `sync` uniquement en dev.
- Ajouter des tests d’API pour les principales routes HR (création employé, assignation département, contrat, etc.).

## UI (frontend)
- Routes React dans `addons/hr/routes.tsx` avec pages listées dans `addons/hr/views/pages`.
- Manifeste `addons/hr/manifest.ts` expose routes, menus et métadonnées.
- Services front: `addons/hr/services/*` consomment les endpoints ci-dessus.

## Points d’amélioration priorisés
1. Sécurité & Accès: middleware auth global, RBAC, suppression du fallback `'admin'` dans `allow()`.
2. Migrations: dédoublonner et ajouter FK; activer mode strict en CI/Prod.
3. Cohérence schéma: désactiver `sequelize.sync()` automatique en prod pour les erreurs «no such table».
4. Tests: ajouter tests API d’intégration pour HR.
5. Documentation: README du module (ajouté) + guide de migrations.

## Variables & Configuration utiles
- `ADDONS_STRICT_MIGRATIONS=true` pour échouer l’installation si migration invalide.
- Config DB: `src/config/config.js` (SQLite par défaut; fichiers sous `./src/database.sqlite`).

---
Ce document sera mis à jour selon les évolutions du module.
