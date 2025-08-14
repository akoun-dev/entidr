# Guide de Démarrage de l'Application

Ce document explique comment démarrer l'application avec toutes ses migrations et ses composants.

## Prérequis

- Node.js 18 (ou une version plus récente compatible avec les dépendances). L'utilisation d'une version antérieure n'est pas recommandée.
- npm (généralement installé avec Node.js)

## Scripts de Démarrage

Trois scripts de démarrage sont fournis pour différentes plateformes. Choisissez celui qui correspond à votre système d'exploitation :

### Pour Linux/macOS (Bash)

```bash
./start.sh
```

Si le script n'est pas exécutable, vous pouvez le rendre exécutable avec la commande :

```bash
chmod +x start.sh
```

### Pour Windows (Batch)

Double-cliquez sur le fichier `start.bat` ou exécutez-le depuis une invite de commande :

```cmd
start.bat
```

### Pour Toutes les Plateformes (Node.js)

```bash
node start.js
```

## Ce que font les scripts

Les scripts effectuent les opérations suivantes dans l'ordre :

1. **Vérification des prérequis** : Vérifie que Node.js et npm sont installés.
2. **Installation des dépendances** : Si les dépendances ne sont pas installées, les installe automatiquement.
3. **Libération des ports** : Vérifie si les ports 8080 et 3001 sont déjà utilisés et tente de libérer ces ports si nécessaire.
4. **Initialisation de la base de données** : Exécute les migrations et tente d'exécuter les seeds pour initialiser la base de données. Les erreurs de seeding sont ignorées pour permettre le démarrage de l'application.
5. **Démarrage du serveur API** : Lance le serveur API sur le port 3001.
6. **Démarrage de l'application frontend** : Lance l'application frontend sur le port 8080.
7. **Affichage des informations d'accès** : Affiche les URLs pour accéder à l'application et à l'API.

## Accès à l'Application

Une fois les scripts exécutés avec succès, vous pouvez accéder à :

- **Frontend** : [http://localhost:8080](http://localhost:8080)
- **API** : [http://localhost:3001](http://localhost:3001)

## Arrêt de l'Application

- **Pour les scripts Bash et Node.js** : Appuyez sur `Ctrl+C` dans le terminal où le script est en cours d'exécution.
- **Pour le script Windows** : Fermez les fenêtres de commande ou appuyez sur `Ctrl+C` dans chaque fenêtre.

## Dépannage

### Le script échoue lors de l'initialisation de la base de données

Vérifiez que :
- Le fichier de base de données SQLite n'est pas verrouillé par une autre application.
- Vous avez les permissions nécessaires pour écrire dans le répertoire de la base de données.

### Erreurs lors du seeding

Les scripts sont configurés pour ignorer les erreurs de seeding afin de permettre le démarrage de l'application même si certains seeds échouent. Si vous souhaitez résoudre ces erreurs :

1. Exécutez manuellement les seeds pour voir les erreurs détaillées :
   ```bash
   npx sequelize-cli db:seed:all --seeders-path=src/seeders
   ```

2. Causes courantes d'erreurs de seeding :
   - Contraintes d'unicité violées (tentative d'insertion de données dupliquées)
   - Références à des clés étrangères inexistantes
   - Problèmes de validation des données
   - Erreurs de syntaxe dans les fichiers de seed

3. Solutions possibles :
   - Réinitialiser la base de données : `npx sequelize-cli db:drop && npx sequelize-cli db:create`
   - Modifier les fichiers de seed pour corriger les erreurs
   - Exécuter les seeds individuellement : `npx sequelize-cli db:seed --seed nom-du-fichier.js`

### Les ports 8080 ou 3001 sont déjà utilisés

Si le script ne parvient pas à libérer les ports automatiquement :
1. Identifiez manuellement les processus utilisant ces ports :
   - Sur Linux/macOS : `lsof -i :8080` ou `lsof -i :3001`
   - Sur Windows : `netstat -ano | findstr :8080` ou `netstat -ano | findstr :3001`
2. Arrêtez ces processus manuellement :
   - Sur Linux/macOS : `kill -9 <PID>`
   - Sur Windows : `taskkill /F /PID <PID>`

### L'application frontend ne démarre pas

Vérifiez les erreurs dans la sortie du terminal. Les problèmes courants incluent :
- Conflits de dépendances
- Erreurs de syntaxe dans le code
- Problèmes de configuration Vite

### Le serveur API ne démarre pas

Vérifiez les erreurs dans la sortie du terminal. Les problèmes courants incluent :
- Erreurs de connexion à la base de données
- Conflits de port
- Erreurs dans les migrations ou les seeds

## Commandes Individuelles

Si vous préférez exécuter les commandes individuellement plutôt que d'utiliser les scripts :

1. **Initialiser la base de données** :
   ```bash
   npm run setup-db
   ```

2. **Démarrer le serveur API** :
   ```bash
   npm run server
   ```

3. **Démarrer l'application frontend** :
   ```bash
   npm run dev
   ```
