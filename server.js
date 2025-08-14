
'use strict';

require('dotenv').config();

// Serveur Express pour l'API
const { startServer } = require('./src/server');

// Démarrer le serveur
startServer();
