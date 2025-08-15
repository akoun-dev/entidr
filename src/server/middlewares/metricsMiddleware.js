'use strict';

const { info } = require('../../utils/logger.backend');

function metricsMiddleware(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
}

module.exports = { metricsMiddleware };
