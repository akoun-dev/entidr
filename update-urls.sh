#!/bin/bash

# Définir l'URL du serveur
NEW_SERVER="164.160.40.182"

# Rechercher et remplacer les URLs codées en dur
find ./src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|http://localhost:3001|http://$NEW_SERVER:3001|g"

# Mettre à jour les fichiers d'environnement
echo "VITE_API_BASE_URL=http://$NEW_SERVER:3001/api" > .env

echo "URLs mises à jour avec succès!"