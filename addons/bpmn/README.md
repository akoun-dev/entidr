# Module BPMN - Cahier des charges

## 1. Contexte & objectifs

Permettre aux équipes métier et techniques de modéliser, exécuter et superviser des processus métiers via le standard **BPMN 2.0** sans écrire de code. Le module doit offrir un moteur d'exécution robuste, traçable et facilement intégrable avec le système d'information (paiements, signature électronique, notifications, etc.).

**Objectifs clés**
- Modélisation visuelle conforme BPMN 2.0 avec bibliothèque de modèles.
- Exécution fiable (états, timers, messages, erreurs, compensation).
- Automatisation via règles, formulaires et intégrations.
- Gouvernance : versioning, cycle de vie, audit, rôles et permissions.
- Pilotage : indicateurs KPI, SLA, analytics et tableaux de bord.

## 2. Périmètre

**In scope** : éditeur BPMN, moteur d'exécution, formulaires, connecteurs, notifications, génération de documents, signature électronique, paiements optionnels, import/export BPMN, API et webhooks, monitoring, audit, gestion des versions et environnements.

**Out of scope** : RPA desktop, ETL volumineux (délégué à des services tiers).

## 3. Acteurs & rôles (RBAC)

| Rôle | Responsabilités principales |
|------|-----------------------------|
| SuperAdmin | configuration globale, tenants, quotas, sécurité |
| Administrateur Fonctionnel | gouvernance des processus, rôles, catalogues, SLA |
| Concepteur | crée/modifie diagrammes, formulaires, règles, connecteurs |
| Éditeur | modifie métadonnées, contenus descriptifs, templates |
| Validateur | relit et approuve avant publication |
| Opérateur | déclenche et suit les instances, gère les tâches humaines |
| Auditeur | accès lecture aux journaux et pistes d'audit |
| Utilisateur final | soumet des demandes via formulaires |

## 4. Cas d'usage représentatifs

- **Demande d'identité** : formulaire → vérification des pièces → validation multi-niveaux → génération PDF → notification → archivage.
- **Permis de construire** : instruction avec passerelles (complet/incomplet), paiements, avis techniques parallèles, délais et escalades.
- **Aide sociale** : collecte justificatifs, scoring (DMN), commission, décision, versement, suivi.

## 5. Fonctionnalités détaillées

### 5.1 Modélisation (Éditeur BPMN)
- Palette BPMN 2.0 : événements, tâches (user, service, script), passerelles XOR/OR/AND, sous-processus, timers, messages, signaux, compensation, erreurs et escalades.
- Lanes/pools, objets de données, artefacts.
- Validation syntaxique et sémantique.
- Gestion des propriétés par élément : assignee, SLA, scripts, mappages I/O.
- Form builder lié aux tâches humaines.
- Règles DMN ou expressions (JavaScript/JSONata) pour le routage.
- Versioning, import/export BPMN 2.0, bibliothèque de templates.

### 5.2 Formulaires & données
- Form builder avec champs textes, nombres, dates, pièces jointes, validations et conditionnels.
- Variables de processus, masquage PII, chiffrement sélectif.
- Pré-remplissage via contexte utilisateur ou APIs externes.
- Gestion des états de formulaires et pièces jointes.

### 5.3 Exécution (Moteur BPMN)
- Cycle de vie des instances : Created → Running → Suspended → Completed → Canceled → Failed.
- Gestion des jobs avec retries et idempotence.
- Timers (delays, cron, échéances SLA, escalades).
- Handlers pour tâches utilisateur, service (HTTP, gRPC, SQL, message bus), script JS sandbox, call activity.
- Événements message/signal/erreur/escalade, limites d'interruption.
- Parallélisme via passerelles et synchronisation.
- Transactions & compensation.

### 5.4 Intégrations & connecteurs
- Connecteurs natifs : HTTP/REST, SOAP, GraphQL, emails, SMS, stockage objet, bases de données, solutions de paiement (Stripe, PayGate), e-signature (DocuSign), queues (Kafka, NATS), SSO.
- Catalogue extensible et SDK.
- Coffre-fort pour secrets et credentials.
- Mappage de données avec transformations JSONata.

## 6. Critères d'acceptation
- Conformité avec BPMN 2.0 pour l'import/export.
- Exécution fiable avec suivi des états et des timers.
- Traçabilité complète : audit, logs, métriques.
- RBAC appliqué sur toutes les opérations sensibles.
- APIs documentées et stables pour intégration externe.

