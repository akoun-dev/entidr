# Audit Technique – ENTIDR (07/09/2025)

Ce document synthétise l’état technique du projet, les points forts, les risques, ainsi que des recommandations concrètes et priorisées. Il s’appuie sur la base de code telle qu’examinée dans ce dépôt.

## Résumé Exécutif
- Stack saine et moderne (React 18 + Vite, Express 5, Sequelize, Tailwind, Radix, Swagger).
- Architecture claire front/back, conventions correctes, nombreux modules de configuration prêts à l’emploi.
- Points d’attention principaux:
  - Schéma DB « Modules »: écarts historiques corrigés, à verrouiller par migrations.
  - Sécurité: authentification existante, mais pas de protections HTTP génériques (Helmet, rate‑limit) ni CORS restreint.
  - Cohérence API v1: quelques doublons/variantes de montages (« direct mounts ») à rationaliser.
  - Tests: présents mais peu couvrants côté backend métier.

## Priorités (P0 → P2)
- P0 Sécurité et robustesse
  - Ajouter Helmet et un rate limiter global (+ limiter CORS en prod).
  - Activer logs d’accès HTTP et niveaux de logs cohérents.
  - Finaliser la normalisation des réponses API (modules, company) et garantir les codes HTTP.
- P1 Données et migrations
  - Geler le schéma « Modules » (table `Modules`) et supprimer l’ancienne variante si existante.
  - Écrire une migration de nettoyage pour les entrées Modules « orphelines » (sans dossier dans `addons/`).
- P2 DX, observabilité et QA
  - Étendre les tests d’API (happy/edge cases) et ajouter quelques tests d’intégration front via Playwright/Vitest UI.
  - Ajouter un guide de contribution (conventions commit, branches, CI locale) et un script de lint+test pré‑push.

## Détails par couche

### Backend (Express)
- Entrée serveur: `src/server/index.js:1`
  - Montages API: `app.use('/api/v1', apiV1Router)` et alias `/api`.
  - Expose Swagger: `/api-docs`.
  - WebSocket analytics: `/ws/analytics`.
  - Gestion d’erreurs centralisée: `src/middlewares/errorMiddleware.js:1`.
- Routes v1: `src/server/api/v1/index.js:1`
  - Inclut: users, groups, parameters, modules, printers, paymentproviders, shippingmethods, company, settings, etc.
- Modules API:
  - Routes v1: `src/server/api/v1/modules.js:1` (GET, GET/:name, PUT status, POST install/uninstall).
  - Contrôleur: `src/server/controllers/moduleController.js:1`.
    - Normalisation des réponses (valeurs par défaut, parsing deps/models, détection dossier `addons/<module>` → `installable`).
- Company API:
  - Routes: `src/server/api/v1/company.js:1` (GET/PUT).
  - Contrôleur: `src/server/controllers/companyController.js:1` (création auto id=1 si absent, champs légaux/visuels inclus).
- Sécurité:
  - Middleware JWT: `src/server/middlewares/auth.js:4` (utilisé sur plusieurs routes spécifiques).
  - Manquants recommandés: Helmet, rate‑limit, validation stricte input (Joi/Zod) pour toutes les routes sensibles.

### Base de données
- Config Sequelize: `src/config/config.js:1` (SQLite par défaut, fichiers `src/database.sqlite` en dev).
- Migrations majeures:
  - Modules: `src/migrations/20250511141718-create-module-table.js:1` (table `Modules`).
  - Company: `src/migrations/20250817035406-create-company.js:1`.
  - Ajout champs légaux/visuels: `src/migrations/20250907034500-add-legal-visual-fields-to-company.js:1`.
- Modèles:
  - Module: `src/models/Module.js:1` (tableName `Modules`, champs normalisés).
  - Company: `src/models/company.js:1` (inclut `legal_form`, `registration_number`, `vat_number`, `share_capital`, `legal_representative`, `legal_info`, `logo`).
- Initialisation DB: `src/setup-db.js:1` (migrate + seed, script simplifié/fiabilisé).

### Frontend (React + Vite)
- Entrée: `src/main.tsx:1`, CSS global Tailwind: `src/index.css:1`.
- Layout principal: `src/components/layouts/MainLayout.tsx:1`.
- Header responsive: `src/components/layouts/Header.tsx:1`.
- Sidebar dynamique (menus depuis addons): `src/components/layouts/DynamicSidebar.tsx:1`.
- Gestion modules (UI): `src/components/settings/ModulesSettings.tsx:1`.
- Paramètres Société: `src/pages/settings/CompanySettings.tsx:1` (onglets Général/Contact/Légal/Identité visuelle fonctionnels, mapping id→clé corrigé).
- Services API: `src/config/api.ts:1` (`VITE_API_BASE_URL`) + services dédiés (ex: `src/services/companyService.ts:1`).

### Responsivité & UX
- Header: recherche mobile en overlay, toggles accessibles, fond blur.
- Sidebar: off‑canvas sur mobile avec overlay; compact/large sur desktop.
- Contenu: padding responsive global et `overflow-x-hidden` pour éviter les scrolls horizontaux intempestifs.
- Tables: `overflow-auto` + `break-words` dans les cellules pour éviter les débordements.

## Sécurité
- Auth
  - JWT prévu et utilisé sur des routes sensibles (ex: `externalservices`, `security-settings`, etc.).
  - Recommandé: forcer l’auth ou lecture‑seule sur endpoints restants, clarifier exceptions publiques.
- Protections HTTP manquantes
  - Helmet (en‐têtes de sécurité), limiter CORS en production, rate limiting global.
- Validation d’entrée
  - Plusieurs routes valident déjà (ex: controllers + quelques validators). Généraliser via un middleware unique (Joi/Zod) avec schémas.
- Logs & secrets
  - Variables `.env` présentes. Recommander: ne pas logguer les stacks en prod (`NODE_ENV=production`), vérifier que les tokens ne sont jamais journalisés.

## Observabilité
- Logger: `src/utils/logger.server` utilisé au serveur; niveau configurable via `.env` (`LOG_LEVEL`).
- WebSocket analytics `/ws/analytics` envoi périodique de métriques (à compléter par un collecteur côté client si nécessaire).
- Recommandé: ajouter morgan/pino-http pour logs d’accès, corrélations reqId.

## Performance
- Front
  - Vite configuration standard; tree‑shaking/production ok.
  - Recommandé: code‑splitting supplémentaire si certaines pages grossissent, et `React.Suspense` plus ciblé.
- Back
  - SQLite pour dev: suffisant. Pour prod, prévoir Postgres/MySQL et options pool Sequelize.
  - Indices ajoutés sur `Modules` (name, active) – OK. Vérifier indices sur tables volumineuses si usage réel.

## Qualité / Tests
- Outils: Vitest/Jest présents (`package.json: scripts`).
- Tests existants: basiques (unitaires + quelques endpoints users/groups).
- Recommandations:
  - Ajouter tests API pour modules (install/uninstall/status) et company (GET/PUT, validations).
  - Ajouter snapshot tests UI essentiels (paramètres, modules) et tests d’accessibilité minimum.

## Risques / Dettes techniques
- Historique schéma « Modules »: table `Modules` + anciennes attentes côté modèle/côté UI. Corrigé, mais verrouiller l’avenir par migrations dédiées.
- Duplication des montages routes (v1 + direct mounts) dans `src/server/index.js:1`: alourdit la surface. À rationaliser pour éviter des divergences futures.
- Normalisation de réponses API: mixture `{ message, data }` vs objet brut; aligner sur un seul format par ressource.

## Actions Recommandées (Checklist)
- Sécurité (P0)
  - Ajouter Helmet et rate‑limit middleware; restreindre CORS en prod.
  - Couvrir toutes les routes par auth/autorisation ou expliciter les exceptions publiques.
- API/Back (P1)
  - Créer endpoint « Sync modules »: détecter/supprimer les modules orphelins (DB sans dossier addons) ou les marquer `installable=false` + option purge.
  - Unifier format API: par ex. `{ data, error }` systématique.
  - Nettoyer les « direct mounts » en doublon pour éviter la confusion avec `/api/v1`.
- Données (P1)
  - Migration de nettoyage « Modules » et suppression d’anciennes colonnes si présentes.
- Front (P2)
  - Ajouter tests UI essentiels et un guide d’accessibilité rapide.
  - Ajouter un composant d’upload pour le logo (au lieu d’URL), avec stockage local + validation MIME.
- DX / CI (P2)
  - Script pré‑commit: `eslint --fix`, `vitest -r` ciblé, `jest` API léger.
  - Documentation Contrib (conventions, review, release).

## Annexes (Références rapides)
- Routes principales
  - `/api/v1/modules`, `/api/v1/modules/:name/{status|install|uninstall}`
  - `/api/v1/company` (GET/PUT)
  - Swagger: `/api-docs`
- Variables clés
  - `VITE_API_BASE_URL`, `PORT`, `DB_*`, `LOG_LEVEL`
- Commandes utiles
  - `npm run server` (API), `npm run dev` (front), `npm run setup-db` (migrate + seed)

— Fin de l’audit —
