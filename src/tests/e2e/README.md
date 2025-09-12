# Guide des Tests End-to-End pour le Système de Vues Entidr

Ce guide explique comment exécuter les tests E2E pour le système de vues Entidr en utilisant Playwright.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

1. **Node.js** (version 16 ou supérieure)
2. **npm** ou **yarn**
3. **Playwright** (installé automatiquement avec les dépendances)

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/entidr/entidr-views.git
cd entidr-views
```

2. Installez les dépendances :
```bash
npm install
```

3. Installez les navigateurs Playwright :
```bash
npx playwright install
```

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# URL de base pour les tests
BASE_URL=http://localhost:3000

# Identifiants de test
TEST_ADMIN_USER=admin
TEST_ADMIN_PASSWORD=admin123
TEST_MANAGER_USER=manager
TEST_MANAGER_PASSWORD=manager123
TEST_USER=user
TEST_USER_PASSWORD=user123
```

### Démarrer l'application de test

Avant d'exécuter les tests, assurez-vous que l'application est démarrée :

```bash
npm start
```

L'application sera disponible à l'adresse `http://localhost:3000`.

## Exécution des Tests

### 1. Exécution Standard

Pour exécuter tous les tests E2E :
```bash
npm run test:e2e
```

### 2. Exécution en Mode Visible

Pour voir les tests s'exécuter dans un navigateur visible :
```bash
npm run test:e2e:headed
```

### 3. Mode Debug

Pour déboguer les tests avec le mode debug de Playwright :
```bash
npm run test:e2e:debug
```

### 4. Interface Utilisateur Playwright

Pour exécuter les tests avec l'interface utilisateur interactive :
```bash
npm run test:e2e:ui
```

Cela ouvrira une interface web où vous pouvez :
- Voir les tests s'exécuter en temps réel
- Sélectionner des tests spécifiques à exécuter
- Voir les captures d'écran et vidéos
- Déboguer pas à pas

### 5. Exécution de Tests Spécifiques

Pour exécuter un fichier de test spécifique :
```bash
npx playwright test src/tests/e2e/ViewE2ETests.ts
```

Pour exécuter un test spécifique :
```bash
npx playwright test src/tests/e2e/ViewE2ETests.ts --grep "devrait naviguer"
```

### 6. Exécution sur des Navigateurs Spécifiques

Pour exécuter les tests uniquement sur Chrome :
```bash
npx playwright test --project=chromium
```

Pour exécuter les tests sur Firefox :
```bash
npx playwright test --project=firefox
```

Pour exécuter les tests sur Safari :
```bash
npx playwright test --project=webkit
```

### 7. Tests Mobiles

Pour exécuter les tests sur des émulateurs mobiles :
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## Rapports de Test

### Visualisation des Rapports

Pour visualiser les rapports HTML après l'exécution des tests :
```bash
npm run test:e2e:report
```

Cela ouvrira un rapport interactif dans votre navigateur.

### Emplacement des Artefacts

Les artefacts de test sont générés dans le dossier `test-results/` :
- **Captures d'écran** : `test-results/screenshots/`
- **Vidéos** : `test-results/videos/`
- **Traces** : `test-results/traces/`
- **Rapports** : `test-results/report.html`
- **Résultats JSON** : `test-results/test-results.json`

## Structure des Tests

### Organisation des Fichiers

```
src/tests/e2e/
├── ViewE2ETests.ts          # Tests E2E principaux
├── helpers/
│   └── ViewTestHelper.ts     # Helper pour les tests
├── playwright.config.ts     # Configuration Playwright
└── README.md               # Ce guide
```

### Catégories de Tests

Les tests sont organisés en plusieurs catégories :

1. **Navigation entre les vues**
   - Navigation ListView ↔ FormView
   - Navigation ListView ↔ KanbanView
   - Navigation ListView ↔ CalendarView
   - Conservation de l'état

2. **Workflows complets**
   - CRUD utilisateurs
   - Gestion des tâches (Kanban)
   - Gestion des événements (Calendar)

3. **Intégration avec le backend**
   - Synchronisation des données
   - Gestion des erreurs
   - Conflits de concurrence

4. **Scénarios utilisateur réels**
   - Manager (gestion d'équipe)
   - Admin (configuration des vues)
   - Utilisateur normal (tableau de bord)
   - Mobile (responsive)

5. **Performance et fiabilité**
   - Grands datasets
   - Erreurs réseau
   - Maintien de l'état

## Débogage

### Points d'arrêt

Vous pouvez ajouter des points d'arrêt dans vos tests :

```typescript
test('exemple de test', async ({ page }) => {
  // Votre code de test
  await page.pause(); // Pause le test pour inspection
  // Suite du test
});
```

### Console du Navigateur

Pour accéder à la console du navigateur pendant les tests :
1. Exécutez en mode UI : `npm run test:e2e:ui`
2. Cliquez sur le test en cours d'exécution
3. Utilisez les outils de développement du navigateur

### Mode Debug Avancé

Pour un débogage plus approfondi :
```bash
npm run test:e2e:debug
```

Cela ouvrira une instance de VS Code avec le débogueur Playwright.

## Bonnes Pratiques

### 1. Préparation de l'Environnement

- Toujours nettoyer les données de test avant et après les tests
- Utiliser des données de test reproductibles
- Vérifier que l'application est bien démarrée avant les tests

### 2. Écriture des Tests

- Utiliser des sélecteurs stables (`data-testid` plutôt que des classes CSS)
- Écrire des tests indépendants les uns des autres
- Utiliser des attentes explicites plutôt que des temps d'attente fixes

### 3. Gestion des Échecs

- Utiliser les captures d'écran et vidéos pour comprendre les échecs
- Vérifier les logs de la console et du réseau
- Utiliser le mode debug pour inspecter l'état de l'application

### 4. Performance

- Éviter les temps d'attente inutiles
- Utiliser les méthodes de Playwright pour attendre les éléments
- Limiter le nombre de tests pour accélérer l'exécution

## Dépannage

### Problèmes Courants

1. **Tests qui échouent aléatoirement**
   - Augmenter les timeouts dans `playwright.config.ts`
   - Utiliser des attentes plus robustes
   - Vérifier la stabilité du réseau

2. **Application non démarrée**
   - Vérifier que `npm start` fonctionne
   - Confirmer que le port 3000 est disponible
   - Vérifier les logs de l'application

3. **Navigateurs non installés**
   - Exécuter `npx playwright install`
   - Vérifier les permissions système
   - Réessayer l'installation

4. **Tests lents**
   - Utiliser le mode parallèle
   - Exécuter uniquement les tests nécessaires
   - Optimiser les temps d'attente

### Messages d'Erreur Courants

```
Error: Target page, context or browser has been closed
```
- L'application s'est arrêtée pendant le test
- Vérifiez les logs de l'application

```
Error: page.waitForSelector: Timeout 30000ms exceeded
```
- L'élément n'est pas apparu dans le temps imparti
- Vérifiez que l'application fonctionne correctement

```
Error: net::ERR_CONNECTION_REFUSED
```
- L'application n'est pas accessible
- Vérifiez que `npm start` fonctionne

## Contribution

### Ajout de Nouveaux Tests

1. Créez un nouveau fichier de test dans `src/tests/e2e/`
2. Utilisez `ViewTestHelper` pour les fonctionnalités communes
3. Suivez la structure de tests existante
4. Ajoutez des tests pour les nouvelles fonctionnalités

### Meilleures Pratiques

- Utilisez des noms de test descriptifs
- Commentez les tests complexes
- Utilisez les helpers pour éviter la duplication
- Testez à la fois les cas nominaux et les cas d'erreur

## Ressources

- [Documentation Playwright](https://playwright.dev/docs/intro)
- [API Reference Playwright](https://playwright.dev/docs/api/class-playwright)
- [Best Practices Playwright](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

## Support

Si vous rencontrez des problèmes :

1. Consultez les logs dans `test-results/`
2. Vérifiez la console du navigateur
3. Utilisez le mode debug pour inspecter
4. Contactez l'équipe de développement

---

Ce guide devrait vous aider à exécuter et déboguer efficacement les tests E2E pour le système de vues Entidr.
