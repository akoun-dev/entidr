'use strict';

const logger = require('../utils/logger.server');

// Handler pour les routes non trouvées
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Handler centralisé pour les erreurs
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  res.status(statusCode).json({
    data: null,
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    }
  });
};

module.exports = { errorHandler, notFoundHandler };
