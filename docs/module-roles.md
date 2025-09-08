Rôles par module (ERP)
=================================

Objectif: attribuer un rôle spécifique à chaque utilisateur pour chaque module installé.

Modèle
---------------------------------
- Table: `UserModuleRoles`
  - `user_id` (FK Users.id)
  - `module` (string, ex: `hr`)
  - `role` (string défini par le module, ex: `manager`, `hr`, `viewer`)
  - Contrainte unique: `(user_id, module)`

Endpoints (API v1)
---------------------------------
- GET `/api/v1/users/:userId/module-roles`
  - Réponse: `[{ id, user_id, module, role, created_at, updated_at }]`
- PUT `/api/v1/users/:userId/module-roles/:module`
  - Body: `{ role: string }`
  - Upsert de l'affectation
- DELETE `/api/v1/users/:userId/module-roles/:module`
  - Supprime l'affectation

Réponses enveloppées `{ data, error }`.

Service Front
---------------------------------
- `src/services/moduleRoles.service.ts`
  - `listForUser(userId)`
  - `setUserRole(userId, module, role)`
  - `removeUserRole(userId, module)`

Intégration RBAC
---------------------------------
- Chaque module peut définir ses rôles internes (ex: HR: `hr`, `manager`, `admin`).
- L'application peut combiner `User.role` (global) et `UserModuleRoles.role` (par module) dans l'autorisation.
- Next step: brancher un middleware d'auth qui vérifie la paire `(module, role)` selon la route.

Migrations
---------------------------------
- Fichier: `src/migrations/2025090801-create-usermoduleroles.js`

Remarques
---------------------------------
- Le nom de module correspond à `src/core/ModuleRegistry.ts` (ex: `hr`).
- Une interface d'administration peut être ajoutée dans Paramètres > Sécurité pour gérer ces rôles.

