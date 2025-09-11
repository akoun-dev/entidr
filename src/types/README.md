# Types et Interfaces pour l'ERP Entidr

Ce répertoire contient tous les types et interfaces TypeScript utilisés dans le système ERP Entidr.

## Structure des fichiers

### `entidr-addon.ts`
Types et interfaces pour le système de modules et d'extensions :
- `EntidrAddonManifest` - Manifeste des modules
- `EntidrModuleCategory` - Catégories de modules
- `EntidrRouteDefinition` - Définition des routes
- `EntidrModelDefinition` - Définition des modèles
- `EntidrFieldDefinition` - Définition des champs
- `EntidrConstraintDefinition` - Définition des contraintes
- `EntidrMenuDefinition` - Définition des menus
- `EntidrSecurityDefinition` - Définition de sécurité
- `EntidrPermissions` - Permissions des modules
- `EntidrModuleConfig` - Configuration des modules
- `EntidrHookDefinition` - Définition des hooks
- `EntidrModuleInfo` - Informations des modules
- `EntidrModuleRegistry` - Registre des modules
- `EntidrModuleEvent` - Événements des modules
- `EntidrDependencyGraph` - Graphe des dépendances
- `EntidrDependencyResult` - Résultat des dépendances
- `EntidrModuleSettings` - Paramètres des modules
- `EntidrGlobalSettings` - Paramètres globaux
- `EntidrMarketplaceModule` - Modules du marketplace
- `EntidrMarketplaceResponse` - Réponses du marketplace

### `entidr-model.ts`
Types et interfaces pour le système de modèles de données (ORM) :
- `EntidrModel` - Définition des modèles
- `EntidrModelField` - Champs des modèles
- `EntidrModelMethod` - Méthodes des modèles
- `EntidrMethodParameter` - Paramètres des méthodes
- `EntidrMethodReturn` - Retours des méthodes
- `EntidrModelHooks` - Hooks des modèles
- `EntidrModelConfig` - Configuration des modèles
- `EntidrRelation` - Relations entre modèles
- `EntidrQueryOptions` - Options de requête
- `EntidrIncludeOptions` - Options d'inclusion
- `EntidrIncludeThroughOptions` - Options d'inclusion via
- `EntidrFindOptions` - Options de recherche
- `EntidrCreateOptions` - Options de création
- `EntidrUpdateOptions` - Options de mise à jour
- `EntidrDestroyOptions` - Options de suppression
- `EntidrModelInstance` - Instance des modèles
- `EntidrModelResult` - Résultats des modèles
- `EntidrValidationRule` - Règles de validation
- `EntidrModelValidationError` - Erreurs de validation
- `EntidrAggregateOptions` - Options d'agrégation
- `EntidrAggregateResult` - Résultats d'agrégation
- `EntidrTransactionOptions` - Options de transaction
- `EntidrTransaction` - Transactions
- `EntidrSchemaOptions` - Options de schéma
- `EntidrMigration` - Migrations
- `EntidrSeeder` - Seeders
- `EntidrModelRegistry` - Registre des modèles
- `EntidrModelIndex` - Index des modèles
- `EntidrModelEvent` - Événements des modèles
- `EntidrModelScope` - Scopes des modèles
- `EntidrStaticMethods` - Méthodes statiques

### `entidr-security.ts`
Types et interfaces pour le système de sécurité :
- `EntidrSecurityRule` - Règles de sécurité
- `EntidrAccessControl` - Contrôle d'accès
- `EntidrPermissions` - Permissions
- `EntidrGroup` - Groupes d'utilisateurs
- `EntidrGroupPermission` - Permissions des groupes
- `EntidrUser` - Utilisateurs
- `EntidrUserPermission` - Permissions des utilisateurs
- `EntidrUserSettings` - Paramètres utilisateur
- `EntidrNotificationSettings` - Paramètres de notification
- `EntidrSecurityDashboardSettings` - Paramètres dashboard de sécurité
- `EntidrPrivacySettings` - Paramètres de confidentialité
- `EntidrUserSecurity` - Sécurité utilisateur
- `EntidrUserSession` - Sessions utilisateur
- `EntidrRole` - Rôles
- `EntidrRolePermission` - Permissions des rôles
- `EntidrApiKey` - Clés API
- `EntidrApiKeyPermission` - Permissions des clés API
- `EntidrSecurityPolicy` - Politiques de sécurité
- `EntidrAuditLog` - Journaux d'audit
- `EntidrSecurityEvent` - Événements de sécurité
- `EntidrSecurityEventType` - Types d'événements de sécurité
- `EntidrSecurityConfig` - Configuration de sécurité
- `EntidrPermissionMatrix` - Matrice des permissions
- `EntidrSecurityContext` - Contexte de sécurité
- `EntidrAccessResult` - Résultats d'accès
- `EntidrFieldSecurity` - Sécurité des champs
- `EntidrRecordSecurity` - Sécurité des enregistrements
- `EntidrSecurityFilter` - Filtres de sécurité
- `EntidrSecurityDomain` - Domaines de sécurité
- `EntidrSecurityMiddlewareOptions` - Options des middlewares de sécurité
- `EntidrRateLimitConfig` - Configuration du rate limiting
- `EntidrCSRFConfig` - Configuration CSRF
- `EntidrCORSConfig` - Configuration CORS
- `EntidrHelmetConfig` - Configuration Helmet

### `entidr-view.ts`
Types et interfaces pour le système de vues :
- `EntidrViewDefinition` - Définition des vues
- `EntidrViewType` - Types de vues
- `EntidrViewField` - Champs des vues
- `EntidrListViewConfig` - Configuration des vues liste
- `EntidrFormViewConfig` - Configuration des vues formulaire
- `EntidrFormGroup` - Groupes de formulaire
- `EntidrFormTab` - Onglets de formulaire
- `EntidrFormButton` - Boutons de formulaire
- `EntidrKanbanViewConfig` - Configuration des vues kanban
- `EntidrCalendarViewConfig` - Configuration des vues calendrier
- `EntidrGraphViewConfig` - Configuration des vues graphiques
- `EntidrPivotViewConfig` - Configuration des vues pivot
- `EntidrSearchViewConfig` - Configuration des vues recherche
- `EntidrSearchFilter` - Filtres de recherche
- `EntidrSearchFavorite` - Favoris de recherche
- `EntidrViewRenderer` - Moteur de rendu des vues
- `EntidrViewRendererProps` - Props du moteur de rendu
- `EntidrViewSwitcher` - Sélecteur de vues
- `EntidrViewFilter` - Filtres des vues
- `EntidrViewGroup` - Groupes des vues
- `EntidrViewSort` - Tri des vues
- `EntidrViewAction` - Actions des vues
- `EntidrViewToolbar` - Barre d'outils des vues
- `EntidrViewContext` - Contexte des vues
- `EntidrViewEvent` - Événements des vues
- `EntidrViewConfig` - Configuration des vues
- `EntidrViewRegistry` - Registre des vues

### `entidr-dashboard.ts`
Types et interfaces pour le système de dashboard :
- `EntidrDashboardConfig` - Configuration des dashboards
- `EntidrDashboardWidget` - Widgets des dashboards
- `EntidrWidgetType` - Types de widgets
- `EntidrWidgetPosition` - Position des widgets
- `EntidrWidgetSize` - Taille des widgets
- `EntidrWidgetConfig` - Configuration des widgets
- `EntidrKPIConfig` - Configuration des KPI
- `EntidrChartConfig` - Configuration des graphiques
- `EntidrListConfig` - Configuration des listes
- `EntidrListAction` - Actions des listes
- `EntidrListFilter` - Filtres des listes
- `EntidrListSort` - Tri des listes
- `EntidrTableConfig` - Configuration des tableaux
- `EntidrTableColumn` - Colonnes des tableaux
- `EntidrCalendarConfig` - Configuration des calendriers
- `EntidrMapConfig` - Configuration des cartes
- `EntidrGaugeConfig` - Configuration des jauges
- `EntidrProgressConfig` - Configuration des barres de progression
- `EntidrMetricConfig` - Configuration des métriques
- `EntidrActivityConfig` - Configuration des activités
- `EntidrActivityAction` - Actions des activités
- `EntidrNewsConfig` - Configuration des actualités
- `EntidrCustomConfig` - Configuration personnalisée
- `EntidrDashboardBuilder` - Constructeur de dashboards
- `EntidrAvailableWidget` - Widgets disponibles
- `EntidrDashboardTemplate` - Templates de dashboards
- `EntidrDashboardLayout` - Layouts de dashboards
- `EntidrDashboardWidgetRenderer` - Moteur de rendu des widgets
- `EntidrWidgetRendererProps` - Props du moteur de rendu des widgets
- `EntidrDashboardEvent` - Événements des dashboards
- `EntidrDashboardRegistry` - Registre des dashboards
- `EntidrDashboardSettings` - Paramètres des dashboards

### `entidr-index.ts`
Fichier d'index qui exporte tous les types et interfaces :
- Exportations explicites de tous les types des autres fichiers
- Types communs et utilitaires
- Constantes et énumérations
- Types pour les décorateurs, middlewares, services, contrôleurs, tests et documentation

## Utilisation

Pour utiliser les types dans votre projet, importez-les depuis le fichier d'index :

```typescript
import {
  EntidrModel,
  EntidrViewDefinition,
  EntidrDashboardConfig,
  EntidrPermissions,
  // ... autres types
} from './types/entidr-index';
```

Ou importez depuis des fichiers spécifiques :

```typescript
import { EntidrModel } from './types/entidr-model';
import { EntidrViewDefinition } from './types/entidr-view';
```

## Conventions

### Nommage
- Les interfaces commencent par `Entidr` suivi du nom descriptif
- Les types utilisent PascalCase
- Les énumérations utilisent PascalCase avec des valeurs en UPPER_SNAKE_CASE

### Documentation
- Chaque interface et type est documenté avec des commentaires JSDoc
- Les propriétés optionnelles sont marquées avec `?`
- Les valeurs par défaut sont indiquées quand applicable

### Typage
- Utilisation de types génériques pour la flexibilité
- Types d'union pour les propriétés pouvant avoir plusieurs types
- Types d'intersection pour combiner plusieurs types

## Extension

Pour ajouter de nouveaux types :
1. Créez un nouveau fichier de types si nécessaire
2. Définissez vos interfaces et types avec une documentation appropriée
3. Ajoutez les exportations dans le fichier d'index
4. Mettez à jour ce README si nécessaire

## Dépendances

Ces types dépendent de :
- TypeScript 4.5+
- React (pour les types de composants)
- Node.js (pour les types de serveur)

## Contribuer

Lors de l'ajout ou de la modification de types :
- Respectez les conventions de nommage
- Ajoutez une documentation complète
- Testez la compilation des types
- Mettez à jour le README si nécessaire
