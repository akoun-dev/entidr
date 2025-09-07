'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const http = require('http');
const { swaggerUi, specs } = require('../config/swagger');
const responseEnvelope = require('../middlewares/responseEnvelope');
const { Server } = require('ws');
const v1Routes = require('./api/v1');
const v2Routes = require('./api/v2');
// Explicit mount for printers to avoid 404 if v1 index isn't refreshed
const printersRouter = require('./api/v1/printers');
const paymentProvidersRouter = require('./api/v1/paymentproviders');
const shippingMethodsRouter = require('./api/v1/shippingmethods');
const automationRulesRouter = require('./api/v1/automationrules');
const sequencesRouter = require('./api/v1/sequences');
const backupsRouter = require('./api/v1/backups');
const complianceRouter = require('./api/v1/compliance');
const importExportRouter = require('./api/v1/importexport');
const performanceRouter = require('./api/v1/performance');
const appearanceRouter = require('./api/v1/appearance');
const referenceRouter = require('./api/v1/reference');
const loggingRouter = require('./api/v1/logging');
const dateFormatsRouter = require('./api/v1/dateformats');
const calendarIntegrationsRouter = require('./routes/calendarIntegrations');

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

// Attach request id for tracing
app.use((req, res, next) => {
  const id = (Math.random().toString(36).slice(2)) + Date.now().toString(36);
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
});

// Security & middleware
// Helmet: secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

// CORS: permissive in dev, restricted in prod via CORS_ORIGIN (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (process.env.NODE_ENV !== 'production') return cb(null, true);
    if (!origin) return cb(null, true); // allow non-browser clients
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiter (basic global limiter)
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Response envelope helpers
app.use(responseEnvelope);

// Access logs
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Import routes
const apiV1Router = require('./api/v1');

// Optional simple route log (kept minimal; morgan handles most)
// app.use((req, res, next) => { next(); });

app.use('/api/v1', apiV1Router);
app.use('/api', apiV1Router); // Compatibilité ascendante
// Direct mounts for critical resources (compatibility)
app.use('/api/printers', printersRouter);
app.use('/api/v1/printers', printersRouter);
app.use('/api/paymentproviders', paymentProvidersRouter);
app.use('/api/v1/paymentproviders', paymentProvidersRouter);
app.use('/api/shippingmethods', shippingMethodsRouter);
app.use('/api/v1/shippingmethods', shippingMethodsRouter);
app.use('/api/automationrules', automationRulesRouter);
app.use('/api/v1/automationrules', automationRulesRouter);
app.use('/api/sequences', sequencesRouter);
app.use('/api/v1/sequences', sequencesRouter);
app.use('/api/sequenceconfig', sequencesRouter);
app.use('/api/v1/sequenceconfig', sequencesRouter);
app.use('/api/backups', backupsRouter);
app.use('/api/v1/backups', backupsRouter);
app.use('/api/backupconfig', backupsRouter);
app.use('/api/v1/backupconfig', backupsRouter);
app.use('/api/complianceconfig', complianceRouter);
app.use('/api/v1/complianceconfig', complianceRouter);
app.use('/api/consentrecords', complianceRouter);
app.use('/api/v1/consentrecords', complianceRouter);
app.use('/api/importconfig', importExportRouter);
app.use('/api/v1/importconfig', importExportRouter);
app.use('/api/exportconfig', importExportRouter);
app.use('/api/v1/exportconfig', importExportRouter);
app.use('/api/importexporthistory', importExportRouter);
app.use('/api/v1/importexporthistory', importExportRouter);
app.use('/api/performanceconfig', performanceRouter);
app.use('/api/v1/performanceconfig', performanceRouter);
app.use('/api/themeconfig', appearanceRouter);
app.use('/api/v1/themeconfig', appearanceRouter);
app.use('/api/calendarconfig', appearanceRouter);
app.use('/api/v1/calendarconfig', appearanceRouter);
// Remove composite mounts that produced duplicate paths
app.use('/api/logging-settings', loggingRouter);
app.use('/api/v1/logging-settings', loggingRouter);
app.use('/api/dateformats', dateFormatsRouter);
app.use('/api/v1/dateformats', dateFormatsRouter);

// Calendar integrations: expose with and without hyphen for compatibility
app.use('/api/calendar-integrations', calendarIntegrationsRouter);
app.use('/api/v1/calendar-integrations', calendarIntegrationsRouter);
app.use('/api/calendarintegrations', calendarIntegrationsRouter);
app.use('/api/v1/calendarintegrations', calendarIntegrationsRouter);

console.log('Routes montées:');
console.log('- /api/v1');
console.log('- /api');


// Import middlewares
const { errorHandler, notFoundHandler } = require('../middlewares/errorMiddleware');

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
