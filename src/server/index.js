'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const parameterRoutes = require('./routes/parameters');
const { sequelize } = require('../models');

// Créer l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/parameters', parameterRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
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
    console.log('Connexion à la base de données établie avec succès.');
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
    process.exit(1);
  }
}

// Exporter pour les tests
module.exports = { app, startServer };

// Si ce fichier est exécuté directement, démarrer le serveur
if (require.main === module) {
  startServer();
}
