# ENTIDR - Système ERP Moderne

## Présentation

ENTIDR est un système ERP (Enterprise Resource Planning) moderne développé avec les technologies web les plus récentes. Il offre une interface utilisateur intuitive et des fonctionnalités complètes pour la gestion d'entreprise.

## Fonctionnalités principales

- **Interface utilisateur moderne** - Basée sur React et Tailwind CSS
- **Architecture modulaire** - Chargement dynamique des modules
- **Personnalisation avancée** - Nombreuses options de configuration
- **Multi-langues** - Support complet de l'internationalisation
- **Responsive design** - Fonctionne sur tous les appareils

## Modules disponibles

- Ressources Humaines (HR)
- CRM
- Comptabilité
- Ventes
- Achats
- Inventaire
- Et plus encore...

## Section Paramètres

Le système dispose d'une section de paramètres complète permettant une personnalisation poussée :

### Paramètres généraux
- Société
- Utilisateurs
- Groupes d'utilisateurs

### Localisation
- Langues
- Devises
- Pays
- Traductions
- Formats de date
- Formats d'heure
- Formats de nombre

### Technique
- Base de données
- Serveurs de messagerie
- Sécurité
- Actions automatisées
- API & Intégrations
- Journalisation

### Modules
- Modules installés
- Boutique d'applications
- Mises à jour

### Documents
- Mise en page des documents
- Modèles de rapport
- Imprimantes

### Intégrations
- Fournisseurs de paiement
- Méthodes d'expédition
- Services externes

### Nouvelles configurations
- Notifications
- Audit et traçabilité
- Sauvegarde et restauration
- Apparence et thème
- Workflows
- Conformité et RGPD
- Importation/Exportation
- Calendrier et planification
- Numération et séquences
- Performance

## Technologies utilisées

Ce projet est construit avec :

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Installation et démarrage

```sh
# Cloner le dépôt
git clone https://github.com/akoun-dev/entidr.git

# Naviguer vers le répertoire du projet
cd entidr

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Variables d'environnement

Le projet nécessite certaines variables d'environnement pour fonctionner correctement. Vous pouvez utiliser le fichier `.env.example` comme base.

- **VITE_API_BASE_URL** : URL de base de l'API utilisée par le front-end.
- **PORT** : Port d'écoute du serveur backend (optionnel, `3001` par défaut).
- **DB_USERNAME** : Nom d'utilisateur de la base de données.
- **DB_PASSWORD** : Mot de passe de la base de données.
- **DB_NAME** : Nom de la base de données.
- **DB_HOST** : Hôte de la base de données.
- **DB_DIALECT** : Dialecte Sequelize (ex. `sqlite`).
- **DB_STORAGE** : Chemin du fichier de base de données pour SQLite.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à soumettre des pull requests ou à ouvrir des issues pour améliorer le projet.

## Licence

Ce projet est sous licence [MIT](LICENSE).
