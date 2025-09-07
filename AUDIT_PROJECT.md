# Audit Complet du Projet

Date: 2025‑09‑07

## Vue d’ensemble
- Stack: React + TypeScript (Vite), Tailwind/Shadcn UI, Axios, Express (Node.js), Sequelize (SQLite par défaut), Jest/Vitest, Supertest.
- Structure: `src/` monorepo léger (frontend + backend dans le même répertoire). API v1 sous `src/server/api/v1`, modèles sous `src/models`, migrations/seeders présents.
- Enveloppe API unifiée `{ data, error }` exposée via `res.ok / res.fail` (middleware) et intercepteur Axios qui aplatit `data` côté front.

## Architecture
- Backend
  - Express modulaire: routeurs v1 par domaine (users, groups, settings, sequences, etc.).
  - Réponse enveloppée via `src/middlewares/responseEnvelope.js`.
  - ORM: Sequelize; modèles nombreux (Language, Translation, EmailServer, ApiKey, etc.).
  - Swagger présent (config) mais partiel/incomplet pour les nouvelles routes.
- Frontend
  - Pages Settings riches (Languages/Translations/Countries/Currencies/Email/API Keys/Sequences/Performance/etc.).
  - Services centralisés sous `src/services`, unifiés sur l’instance Axios (`src/config/api.ts`).
  - Hooks `useReferenceData` pour données de référence avec unwrap de l’enveloppe.
- Tests
  - Tests Supertest ciblés pour vérifier l’enveloppe et quelques endpoints.

## Constats majeurs
- Incohérences d’enveloppe: corrigées et normalisées (intercepteur Axios + services unwrap).
- Routes manquantes: ajoutées pour Languages/Translations/EmailServers/API Keys (CRUD + actions). Montées dans v1 index.
- Sécurité
  - Auth dev permissive (token arbitraire) — OK pour dev, à verrouiller en prod.
  - API Keys: GET protégé en prod; bypass en dev configurable via `ALLOW_PUBLIC_APIKEYS`. Ecritures protégées (admin).
  - EmailServer.password chiffré au repos; password masqué des réponses.
- DX
  - Deux instances Axios existaient; unification effectuée. Quelques appels directs subsistent (HealthChecker, ExportService) — à isoler.
- Données
  - Sémantique “default” gérée via opérations globales; transactions ajoutées pour unicité dans les nouveaux routeurs.

## Qualité du code
- Points positifs
  - Bonne séparation des responsabilités et modularisation des routes.
  - Typage TS côté front; services dédiés et hooks clairs.
  - Intercepteurs Axios pour normaliser les réponses.
- Points à améliorer
  - Validation des payloads: validée minimalement (custom validators) — à renforcer (express-validator/Zod) avec messages homogènes.
  - Normalisation complète des clients HTTP (remplacer axios natif résiduel; clients séparés pour endpoints externes).
  - Swagger incomplet; manque de schémas et exemples.
  - Logs d’audit partiels (ajoutés pour API Keys seulement).

## Sécurité
- Auth/autorisation
  - Ecritures (POST/PUT/PATCH/DELETE) protégées sur apikeys/languages/translations/emailservers.
  - GET publics pour données de référence; OK. Confirmer besoin produit.
- Secrets
  - EmailServer.password chiffré (AES‑GCM). Clé dérivée d’`ENV SECRET_KEY` — documenter et renforcer la gestion de clé.
  - Ne pas journaliser de secrets; masquage déjà appliqué côté API Keys.
- Entêtes & Hardening
  - Helmet utilisé; CORS configurable par ENV.
  - Rate limiting global présent.

## Performance & Scalabilité
- SQLite en dev; prévoir Postgres/MySQL en prod. Vérifier les index sur tables volumineuses (Translations).
- Transactions ajoutées sur opérations critiques (set-default). Envisager contraintes DB pour unicité de “default” (selon moteur).
- WebSocket (`/ws/analytics`) minimal — vérifier pression mémoire et fréquence d’envoi.

## Observabilité
- Logger central présent. Alerter sur erreurs Express; enrichir logs (corrélation reqId). Ajouter métriques basiques HTTP (latence, 4xx/5xx) si besoin.

## Tests
- Présents mais partiels. Manquent de scénarios CRUD et d’erreur (401/403/404) sur nouvelles routes. Pas (encore) de tests front end‑to‑end.

## Accessibilité & i18n
- i18n: Translations/Language screens présents. Vérifier l’usage runtime des translations dans le front (non évalué ici).
- A11y: UI moderne; auditer contrastes et navigation clavier si cible large.

## CI/CD
- Non évalué (pas de config CI trouvée). Recommandé: GitHub Actions pour lint/test/build; lint-staged + pre-commit.

## Améliorations proposées (priorisées)
- P1 (Sécu & stabilité)
  - Renforcer validation: express-validator/Zod pour toutes routes d’écriture (schémas réutilisables); messages d’erreur standardisés.
  - Swagger: documenter toutes les nouvelles routes (schemas, params, exemples), publier UI.
  - Auth stricte en prod: vérifier que le dev bypass (API Keys GET) ne s’active jamais en prod; test d’ENV.
  - Constraints DB (si Postgres): unicité du “default” par domaine (EmailServer global, Language global, Translation par (key,namespace)).
- P2 (DX & cohérence)
  - Centraliser tous les appels via `api`: migrer `src/core/HealthChecker.ts` et `src/core/ExportService.ts` vers clients dédiés; supprimer imports axios directs.
  - Nettoyer imports `API_BASE_URL` résiduels dans composants; s’appuyer sur baseURL de l’instance.
  - Ajouter messages UX pour 401/403 (ex: ApiSettings: “Veuillez vous connecter”).
- P3 (Qualité & Observabilité)
  - Ajouter tests Supertest CRUD/actions (200/400/401/403/404) pour apikeys/languages/translations/emailservers.
  - Ajouter journaux d’audit pour languages/translations/emailservers (create/update/delete/toggle/set-default).
  - Ajouter reqId et logs structurés (JSON) optionnels en prod.

## Tâches détaillées suggérées
- Backend
  - [ ] Ajouter validations robustes (express-validator) et middleware d’agrégation d’erreurs.
  - [ ] Étendre Swagger (`src/config/swagger`) pour toutes nouvelles routes + schémas (Language, Translation, EmailServer, ApiKey).
  - [ ] Ajouter transactions et contraintes DB (si moteur supporté) pour “default”.
  - [ ] Clients externes: créer `src/server/clients/elk.ts`, `prometheus.ts`, `grafana.ts` avec timeouts/retries.
- Frontend
  - [ ] Migrer `WorkflowSettings` terminé (fait), puis `HealthChecker` et `ExportService` vers clients dédiés.
  - [ ] Harmoniser services pour supprimer tout `response.data?.data` restant (s’appuyer sur intercepteur).
  - [ ] Ajouter ErrorBoundary global + toasts pour 401/403.
- Tests
  - [ ] Supertest: suites CRUD/actions par ressource + auth checks.
  - [ ] Ajouter tests d’enveloppe sur nouvelles routes.

## Risques & dettes techniques
- Duplications historiques de routes (réduites) — veiller à ne pas réintroduire de montages `/api/*` parallèles.
- Runtime secrets (SECRET_KEY) — clarifier rotation et storage (KMS/HashiCorp Vault si besoin).

## Annexes
- Points déjà traités dans ce sprint:
  - Normalisation Axios (instance unique) et unwrap de l’enveloppe.
  - Ajout de routeurs complets: languages, translations, emailservers, apikeys.
  - Protection des écritures; chiffrement password EmailServer; audit logs API Keys.

---
Souhaitez‑vous que je commence par mettre à jour Swagger et ajouter une première vague de tests Supertest pour les nouvelles routes ?
