# Mises à jour des modules

Ce document explique comment déposer et appliquer des mises à jour de modules.

## Arborescence

Déposer les fichiers de mise à jour dans:

```
updates/
  modules/
    <module_name>/
      <version>/
        ... contenus de l’update (fichiers à copier dans addons/<module_name>) ...
        CHANGELOG.md (optionnel)
        migrations/ (optionnel)
```

Exemple:

```
updates/modules/hr/1.1.0/
  manifest.ts
  views/
  services/
  CHANGELOG.md
  migrations/
```

## Découverte

L’API `GET /api/v1/updates/modules` scanne `updates/modules` et retourne la liste des mises à jour disponibles (nom, version, taille, date, changelog, indicateur de sécurité si certains mots-clés sont détectés).

## Application

Appeler `POST /api/v1/updates/modules/:name/apply` avec le paramètre `version` (query ou body).

Processus:
- sauvegarde du dossier du module actuel dans `backups/modules/<name>-<timestamp>`
- copie des fichiers de l’update vers `addons/<name>`
- exécution éventuelle des migrations (non automatisée dans cette version; message de log)
- mise à jour de la version en base de données

## Bonnes pratiques

- Toujours tester la mise à jour en environnement de recette.
- Utiliser un versionnement sémantique (SemVer) pour les versions de modules.
- Documenter le changelog et les éventuelles étapes post-déploiement.
