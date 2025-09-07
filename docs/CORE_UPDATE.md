# Mise à jour ERP Core (Socle)

Ce document décrit la procédure recommandée pour mettre à jour le socle (ERP Core) en environnement de développement et de production.

## Pré-requis
- Sauvegarde complète de la base de données et des fichiers (uploads, addons, etc.)
- Fenêtre de maintenance planifiée
- Accès au serveur et au dépôt

## Étapes
1. Basculer en mode maintenance
   - Désactiver l’accès utilisateur si nécessaire (bannière de maintenance)
2. Sauvegarde
   - Dump BDD (ex: `sqlite3 database.sqlite .backup backup.sqlite` ou `pg_dump`/`mysqldump`)
   - Archivage du dossier de l’application
3. Déploiement du core
   - Dev: `git pull` sur la branche cible (tag release conseillé)
   - Prod: déployer l’archive officielle (tar/zip)
4. Dépendances & build
   - `npm ci` (ou `npm install`)
   - `npm run build`
5. Migrations
   - `npm run migrate` (ou commande de migrations dédiée)
6. Redémarrage
   - Redémarrer les services (PM2/systemd/docker)
7. Vérification
   - Consulter les logs
   - Vérifier la santé (`/api/health` si disponible)

## Rollback
- Restaurer la sauvegarde BDD
- Restaurer l’archive du code précédent
- Re-déployer la version précédente

## Notes
- Tester d’abord en environnement de staging
- Documenter les changements breaking dans le CHANGELOG
