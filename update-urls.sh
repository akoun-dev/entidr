#!/bin/bash

# Met à jour la variable VITE_API_BASE_URL dans le fichier .env
# Usage: ./update-urls.sh <nouveau_serveur>

NEW_SERVER="$1"

if [ -z "$NEW_SERVER" ]; then
  echo "Usage: $0 <nouveau_serveur>"
  exit 1
fi

echo "VITE_API_BASE_URL=http://$NEW_SERVER:3001/api" > .env
echo "VITE_API_BASE_URL mis à jour dans .env"

