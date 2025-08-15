**ENTIDR - Système ERP Moderne**

**ENTIDR** est un système ERP (Enterprise Resource Planning) moderne et modulaire développé avec les technologies web les plus récentes. Voici les caractéristiques principales de votre projet :

### **Architecture Technique**

**Technologies principales :**
- **Frontend :** React 18.3.1 + TypeScript + Vite
- **UI Framework :** shadcn-ui + Tailwind CSS + Radix UI
- **Backend :** Node.js + Express + Sequelize ORM
- **Base de données :** SQLite (configurable pour PostgreSQL, MySQL)
- **State Management :** React Query (@tanstack/react-query)
- **Routing :** React Router DOM
- **Styling :** Tailwind CSS avec thème personnalisé inspiré de la Côte d'Ivoire

### **Architecture Modulaire**

Votre projet utilise une architecture de **modules/plugins** très avancée :

**1. Gestionnaire d'Addons ([`AddonManager.ts`](src/core/AddonManager.ts:1))**
- Singleton qui gère le chargement, l'enregistrement et la vie des modules
- Supporte l'initialisation et le nettoyage des modules
- Gestion centralisée des routes et des menus

**2. Registre des Modules ([`ModuleRegistry.ts`](src/core/ModuleRegistry.ts:1))**
- Généré automatiquement par le script [`generateModuleRegistry.js`](scripts/generateModuleRegistry.js:1)
- Découverte dynamique des modules dans le dossier `addons/`
- Tri topologique des modules en fonction des dépendances

**3. Structure des Modules**
Chaque module suit une structure cohérente :
- `manifest.ts` - Métadonnées et configuration
- `index.ts` - Point d'entrée du module
- `routes/` - Définition des routes
- `views/` - Composants React
- `models/` - Modèles de données (optionnel)
- `services/` - Services métier (optionnel)

### **Modules Disponibles**

**1. Ressources Humaines ([`addons/hr/`](addons/hr/))**
- Gestion des employés, départements, congés
- Contrats, formations, recrutement
- Modèles : `hr.employee`, `hr.department`, `hr.leave`

**2. CRM ([`addons/crm/`](addons/crm/))**
- Gestion des clients, leads, opportunités
- Activités et suivi commercial
- Modèles : `crm.lead`, `crm.opportunity`, `crm.customer`

**3. Finance ([`addons/finance/`](addons/finance/))**
- Comptabilité, facturation, paiements
- Rapports financiers
- Modèles : `finance.invoice`, `finance.payment`

**4. Autres modules :**
- **Inventaire** - Gestion des stocks
- **Projets** - Gestion de projet
- **BPMN** - Workflow et processus métier

### **Fonctionnalités Clés**

**1. Interface Utilisateur Moderne**
- Design responsive avec inspirations ivoiriennes (couleurs orange et verte)
- Thème clair/sombre avec [`next-themes`](package.json:62)
- Composants UI réutilisables basés sur shadcn-ui

**2. Système de Configuration Complet**
- Paramètres généraux, utilisateurs, groupes
- Localisation (langues, devises, pays, formats)
- Intégrations externes, API, sécurité
- Notifications, audit, sauvegardes

**3. Internationalisation**
- Support multi-langues
- Gestion des traductions
- Formats de date, heure, nombre personnalisables

**4. Architecture Extensible**
- Modules installables/désinstallables
- Boutique d'applications prévue
- Mises à jour de modules

### **Système de Base de Données**

**Modèle de données unifié :**
- Utilise Sequelize ORM avec SQLite par défaut
- Modèles centralisés dans [`src/models/`](src/models/)
- Support des relations (many2one, one2many, many2many)
- Migration et seeding via Sequelize CLI

### **Développement et Déploiement**

**Scripts disponibles :**
- `npm run dev` - Développement avec Vite
- `npm run build` - Build pour production
- `npm run server` - Démarrage du serveur backend
- `npm run setup-db` - Configuration de la base de données
- `npm run generate-modules` - Régénération du registre des modules

### **Architecture Scalable**

**1. Architecture Microservices :**
- Découpage des modules critiques en services indépendants
- Communication via bus d'événements
- Déploiement isolé possible

**2. Event Bus (Kafka) :**
- Système de messages asynchrones
- Topics par domaine métier
- Producteurs/Consommateurs isolés

**3. API Gateway Modulaire :**
- Agrégation des endpoints
- Routing intelligent
- Load balancing

**4. Points Forts :**
- Modularité extrême (chaque fonctionnalité est un module indépendant)
- Découverte automatique des modules
- Gestion des dépendances entre services
- Configuration centralisée
- Extensibilité simplifiée
- Design moderne et réactif

### **Potentiel d'Amélioration**

1. **Déploiement Kubernetes** - Orchestration des microservices
2. **Monitoring** - Observabilité des services
3. **Sécurité** - RBAC avancé et chiffrement
4. **Tests** - Couverture de tests étendue
5. **CI/CD** - Pipeline automatisé

C'est un projet ERP très bien structuré, moderne et extensible, avec une architecture de modules qui le rend particulièrement adaptable aux besoins des entreprises africaines et internationales.