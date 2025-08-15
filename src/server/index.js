'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
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
const { metricsMiddleware } = require('./middlewares/metricsMiddleware');
app.use(cors());
app.use(metricsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes API
const { metricExporter } = require('../../config/metrics');
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await metricExporter.getMetricsRequest();
    res.set('Content-Type', metricExporter.getContentType());
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err);
  }
});

app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/parameters', parameterRoutes);
app.use('/api/modules', moduleRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    logger.info('Connexion à la base de données établie avec succès.');

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
