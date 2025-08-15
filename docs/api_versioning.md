# Documentation du Versioning d'API

## Structure mise en place
- `/api/v1` : Version actuelle de l'API (routes existantes migrées)
- `/api/v2` : Version future (vide pour l'instant)
- `/api` : Redirige vers `/api/v1` par défaut

## Changements effectués
1. Migration des routes existantes vers v1
2. Création de la structure v2
3. Mise à jour du serveur principal pour gérer :
   - Le routage versionné
   - La redirection par défaut
   - L'extensibilité pour les futures versions

## Bonnes pratiques
- Toujours utiliser les routes versionnées (`/api/v1/...`)
- Documenter les breaking changes entre versions
- Maintenir la compatibilité ascendante pendant 6 mois après sortie de v2
