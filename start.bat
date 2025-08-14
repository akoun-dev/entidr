@echo off
setlocal enabledelayedexpansion

:: Script de démarrage de l'application avec migrations
:: Ce script initialise la base de données, lance le serveur API et l'application frontend

:: Couleurs pour les messages (Windows)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

:: Fonction pour afficher les messages avec un préfixe
:log
set "type=%~1"
set "message=%~2"
set "color=%GREEN%"
set "prefix=[INFO]"

if "%type%"=="info" (
  set "color=%BLUE%"
  set "prefix=[INFO]"
)
if "%type%"=="success" (
  set "color=%GREEN%"
  set "prefix=[SUCCÈS]"
)
if "%type%"=="warning" (
  set "color=%YELLOW%"
  set "prefix=[ATTENTION]"
)
if "%type%"=="error" (
  set "color=%RED%"
  set "prefix=[ERREUR]"
)

echo %color%%prefix% %message%%NC%
exit /b

:: Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  call :log "error" "Node.js n'est pas installé. Veuillez installer Node.js pour continuer."
  exit /b 1
)

:: Vérifier si npm est installé
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  call :log "error" "npm n'est pas installé. Veuillez installer npm pour continuer."
  exit /b 1
)

:: Vérifier si les dépendances sont installées
if not exist "node_modules" (
  call :log "warning" "Les dépendances ne semblent pas être installées. Installation en cours..."
  npm install
  if %ERRORLEVEL% neq 0 (
    call :log "error" "Échec de l'installation des dépendances. Veuillez vérifier les erreurs ci-dessus."
    exit /b 1
  )
  call :log "success" "Dépendances installées avec succès."
)

:: Fonction pour vérifier si un processus est en cours d'exécution sur un port
:check_port
set "port=%~1"
netstat -ano | findstr ":%port% " >nul
if %ERRORLEVEL% equ 0 (
  exit /b 0
) else (
  exit /b 1
)

:: Arrêter les processus existants si nécessaire
call :check_port 8080
if %ERRORLEVEL% equ 0 (
  call :log "warning" "Un processus est déjà en cours d'exécution sur le port 8080. Tentative d'arrêt..."
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do (
    taskkill /F /PID %%a >nul 2>nul
  )
  timeout /t 2 >nul
)

call :check_port 3001
if %ERRORLEVEL% equ 0 (
  call :log "warning" "Un processus est déjà en cours d'exécution sur le port 3001. Tentative d'arrêt..."
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
    taskkill /F /PID %%a >nul 2>nul
  )
  timeout /t 2 >nul
)

:: Initialiser la base de données
call :log "info" "Initialisation de la base de données..."

:: Exécuter les migrations
call :log "info" "Exécution des migrations..."
call npx sequelize-cli db:migrate --migrations-path=src/migrations
if %ERRORLEVEL% neq 0 (
  call :log "error" "Échec des migrations. Veuillez vérifier les erreurs ci-dessus."
  exit /b 1
)
call :log "success" "Migrations exécutées avec succès."

:: Exécuter les seeds (avec option pour ignorer les erreurs)
call :log "info" "Exécution des seeds (les erreurs seront ignorées)..."
call npx sequelize-cli db:seed:all --seeders-path=src/seeders
:: Ignorer les erreurs de seeding
call :log "warning" "Si des erreurs de seeding se sont produites, elles ont été ignorées pour permettre le démarrage de l'application."
call :log "success" "Initialisation de la base de données terminée."

:: Démarrer le serveur API dans une nouvelle fenêtre
call :log "info" "Démarrage du serveur API..."
start "Serveur API" cmd /c "npm run server"

:: Attendre que le serveur soit prêt
call :log "info" "Attente du démarrage du serveur API..."
timeout /t 5 >nul

:: Vérifier si le serveur est en cours d'exécution
call :check_port 3001
if %ERRORLEVEL% neq 0 (
  call :log "error" "Le serveur API n'a pas pu démarrer. Veuillez vérifier les erreurs dans la fenêtre du serveur."
  exit /b 1
)

call :log "success" "Serveur API démarré avec succès."

:: Démarrer l'application frontend dans une nouvelle fenêtre
call :log "info" "Démarrage de l'application frontend..."
start "Application Frontend" cmd /c "npm run dev"

:: Attendre que l'application frontend soit prête
call :log "info" "Attente du démarrage de l'application frontend..."
timeout /t 5 >nul

:: Vérifier si l'application frontend est en cours d'exécution
call :check_port 8080
if %ERRORLEVEL% neq 0 (
  call :log "error" "L'application frontend n'a pas pu démarrer. Veuillez vérifier les erreurs dans la fenêtre frontend."
  exit /b 1
)

call :log "success" "Application frontend démarrée avec succès."

:: Afficher les informations d'accès
call :log "info" "L'application est maintenant accessible aux adresses suivantes:"
call :log "info" "- Frontend: http://localhost:8080"
call :log "info" "- API: %VITE_API_BASE_URL%"

call :log "warning" "Pour arrêter l'application, fermez les fenêtres de commande ou appuyez sur Ctrl+C dans chaque fenêtre."

:: Attendre que l'utilisateur appuie sur une touche pour quitter
echo.
echo Appuyez sur une touche pour fermer cette fenêtre (cela n'arrêtera pas l'application)...
pause >nul
