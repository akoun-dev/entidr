# Entidr Monorepo

Ce projet est maintenant configuré comme un monorepo utilisant pnpm workspaces pour gérer les packages `@entidr/*`.

## Structure du Projet

```
entidr-monorepo/
├── packages/
│   ├── @entidr/
│   │   ├── core/          # Fonctionnalités core d'Entidr
│   │   ├── ui/            # Composants UI d'Entidr
│   │   ├── hooks/         # Hooks React personnalisés
│   │   ├── security/      # Modules de sécurité
│   │   └── i18n/          # Internationalisation
│   └── ...                # Autres packages futurs
├── src/                   # Code principal de l'application
├── package.json          # Configuration racine du monorepo
├── pnpm-workspace.yaml   # Configuration des workspaces pnpm
└── README_MONOREPO.md    # Ce fichier
```

## Installation

1. **Installer pnpm** si ce n'est pas déjà fait :
   ```bash
   npm install -g pnpm
   ```

2. **Installer toutes les dépendances** :
   ```bash
   pnpm install
   ```

3. **Construire tous les packages** :
   ```bash
   pnpm run build:packages
   ```

## Scripts Disponibles

### Scripts Racine
- `pnpm install:all` - Installe les dépendances et construit les packages
- `pnpm build:packages` - Construit tous les packages du monorepo
- `pnpm dev:packages` - Lance le mode développement pour tous les packages
- `pnpm clean:packages` - Nettoie les fichiers de build de tous les packages
- `pnpm setup` - Installation complète + setup de la base de données

### Scripts par Package
Chaque package a ses propres scripts :
- `pnpm --filter @entidr/core build` - Construit uniquement le package core
- `pnpm --filter @entidr/ui dev` - Lance le mode dev pour le package UI

## Développement

### Travail sur un Package Spécifique
```bash
# Développement sur le package UI
cd packages/@entidr/ui
pnpm dev

# Développement sur le package core
cd packages/@entidr/core
pnpm dev
```

### Ajout d'un Nouveau Package
1. Créer le répertoire : `packages/@entidr/nouveau-package/`
2. Ajouter un `package.json` avec les métadonnées du package
3. Créer `src/index.ts` pour les exports
4. Ajouter `tsconfig.json` pour la configuration TypeScript
5. Le package sera automatiquement disponible dans le workspace

## Résolution du Problème Initial

Le problème initial (packages `@entidr/*` non trouvés lors de `npm install`) est maintenant résolu car :

1. **Les packages sont locaux** - Ils ne sont plus cherchés sur npm mais dans le workspace local
2. **Configuration des workspaces** - pnpm gère automatiquement les liens entre packages
3. **Structure correcte** - Chaque package a sa propre configuration et peut être développé indépendamment

## Prochaines Étapes

1. **Déplacer le code existant** - Organiser le code de `src/` dans les packages appropriés
2. **Créer les vrais modules** - Remplacer les fichiers temporaires par le code réel
3. **Configurer les builds** - Assurer que chaque package se compile correctement
4. **Tests** - Ajouter des tests pour chaque package
5. **Documentation** - Documenter chaque package et ses APIs

## Avantages de cette Structure

- **Développement modulaire** - Chaque package peut être développé et testé indépendamment
- **Réutilisation** - Les packages peuvent être publiés sur npm et utilisés dans d'autres projets
- **Gestion des dépendances** - pnpm gère automatiquement les liens et les versions
- **Build optimisé** - Seul le code modifié est reconstruit
- **Scalabilité** - Facile d'ajouter de nouveaux packages et fonctionnalités

## Dépannage

### Problèmes Communs

1. **Package non trouvé** :
   - Vérifier que `pnpm install` a été exécuté
   - Vérifier la structure des répertoires dans `packages/`

2. **Erreurs TypeScript** :
   - Exécuter `pnpm build:packages` pour construire les déclarations
   - Vérifier les configurations `tsconfig.json` dans chaque package

3. **Dépendances manquantes** :
   - Exécuter `pnpm install` à la racine
   - Vérifier les dépendances dans chaque `package.json`

### Commandes Utiles
```bash
# Voir l'état des workspaces
pnpm list --depth=0

# Nettoyer tout le projet
pnpm run clean:packages && pnpm store prune

# Reconstruire tout
pnpm run build:packages
