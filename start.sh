#!/bin/bash

# Script de démarrage de l'application avec migrations
# Ce script initialise la base de données, lance le serveur API et l'application frontend

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration du serveur
SERVER_MODE=${1:-"local"} # Par défaut en mode local, peut être "server" en argument

# Fonction pour afficher les messages avec un préfixe
log() {
  local type=$1
  local message=$2
  local color=$GREEN
  local prefix="[INFO]"

  case $type in
    "info")
      color=$BLUE
      prefix="[INFO]"
      ;;
    "success")
      color=$GREEN
      prefix="[SUCCÈS]"
      ;;
    "warning")
      color=$YELLOW
      prefix="[ATTENTION]"
      ;;
    "error")
      color=$RED
      prefix="[ERREUR]"
      ;;
  esac

  echo -e "${color}${prefix} ${message}${NC}"
}

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
  log "error" "Node.js n'est pas installé. Veuillez installer Node.js pour continuer."
  exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
  log "error" "npm n'est pas installé. Veuillez installer npm pour continuer."
  exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
  log "warning" "Les dépendances ne semblent pas être installées. Installation en cours..."
  npm install
  if [ $? -ne 0 ]; then
    log "error" "Échec de l'installation des dépendances. Veuillez vérifier les erreurs ci-dessus."
    exit 1
  fi
  log "success" "Dépendances installées avec succès."
fi

# Fonction pour vérifier si un processus est en cours d'exécution sur un port
check_port() {
  local port=$1
  if lsof -i :$port -t &> /dev/null; then
    return 0 # Port est utilisé
  else
    return 1 # Port est libre
  fi
}

API_PORT=${PORT:-3001}
export PORT=$API_PORT

# Arrêter les processus existants si nécessaire
if check_port 8080; then
  log "warning" "Un processus est déjà en cours d'exécution sur le port 8080. Tentative d'arrêt..."
  kill $(lsof -t -i:8080) 2>/dev/null || true
  sleep 2
fi

if check_port "$API_PORT"; then
  log "warning" "Un processus est déjà en cours d'exécution sur le port $API_PORT. Tentative d'arrêt..."
  kill $(lsof -t -i:$API_PORT) 2>/dev/null || true
  sleep 2
fi

# Initialiser la base de données
log "info" "Initialisation de la base de données..."

# Exécuter les migrations
log "info" "Exécution des migrations..."
npx sequelize-cli db:migrate --migrations-path=src/migrations
if [ $? -ne 0 ]; then
  log "error" "Échec des migrations. Veuillez vérifier les erreurs ci-dessus."
  exit 1
fi
log "success" "Migrations exécutées avec succès."

# Exécuter les seeds (avec option pour ignorer les erreurs)
log "info" "Exécution des seeds (les erreurs seront ignorées)..."
npx sequelize-cli db:seed:all --seeders-path=src/seeders || true
log "warning" "Si des erreurs de seeding se sont produites, elles ont été ignorées pour permettre le démarrage de l'application."
log "success" "Initialisation de la base de données terminée."

# Démarrer le serveur API en arrière-plan
log "info" "Démarrage du serveur API..."
npm run server &
SERVER_PID=$!

# Attendre que le serveur soit prêt
log "info" "Attente du démarrage du serveur API..."
sleep 5

# Vérifier si le serveur est en cours d'exécution
if ! ps -p $SERVER_PID > /dev/null; then
  log "error" "Le serveur API n'a pas pu démarrer. Veuillez vérifier les erreurs ci-dessus."
  exit 1
fi

log "success" "Serveur API démarré avec succès (PID: $SERVER_PID)."

# Démarrer l'application frontend
log "info" "Démarrage de l'application frontend..."
npm run dev &
FRONTEND_PID=$!

# Attendre que l'application frontend soit prête
log "info" "Attente du démarrage de l'application frontend..."
sleep 5

# Vérifier si l'application frontend est en cours d'exécution
if ! ps -p $FRONTEND_PID > /dev/null; then
  log "error" "L'application frontend n'a pas pu démarrer. Veuillez vérifier les erreurs ci-dessus."
  kill $SERVER_PID
  exit 1
fi

log "success" "Application frontend démarrée avec succès (PID: $FRONTEND_PID)."

# Afficher les informations d'accès
log "info" "L'application est maintenant accessible aux adresses suivantes:"
log "info" "- Frontend: http://localhost:8080"
log "info" "- API: http://localhost:$API_PORT"

log "info" "- API: ${VITE_API_BASE_URL}"


log "warning" "Appuyez sur Ctrl+C pour arrêter l'application."

# Fonction pour arrêter proprement les processus
cleanup() {
  log "info" "Arrêt de l'application..."
  kill $FRONTEND_PID 2>/dev/null || true
  kill $SERVER_PID 2>/dev/null || true
  log "success" "Application arrêtée avec succès."
  exit 0
}

# Intercepter le signal d'interruption (Ctrl+C)
trap cleanup SIGINT

# Attendre que l'utilisateur arrête l'application
wait $FRONTEND_PID $SERVER_PID
