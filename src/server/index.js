'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { swaggerUi, specs } = require('../config/swagger');
const { Server } = require('ws');
const v1Routes = require('./api/v1');
const v2Routes = require('./api/v2');

const { sequelize } = require('../models');
const logger = require('../utils/logger.server');

// Créer l'application Express
const app = express();
const server = http.createServer(app);
const wss = new Server({ server, path: '/ws/analytics' });

wss.on('connection', ws => {
  const interval = setInterval(sendMetrics, 5000);
  ws.on('close', () => clearInterval(interval));
  sendMetrics();
});

// Middleware

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Import routes
const apiV1Router = require('./api/v1');
app.use('/api', apiV1Router);


// Import middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');

// Routes non trouvées
app.use(notFoundHandler);

// Gestion des erreurs centralisée
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    logger.info('Connexion à la base de données établie avec succès.');

    // Synchroniser les modèles
    await sequelize.sync({ force: false, logging: console.log });
    logger.info('Modèles synchronisés avec la base de données');

    // Démarrer le serveur HTTP et WebSocket
    server.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error('Impossible de se connecter à la base de données:', error);
    process.exit(1);
  }
}

// Exporter pour les tests
module.exports = { app, startServer };

// Si ce fichier est exécuté directement, démarrer le serveur
if (require.main === module) {
  startServer();
}
