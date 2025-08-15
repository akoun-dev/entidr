import { Request, Response, NextFunction } from 'express';
import { requestCounter, responseTimeHistogram, errorCounter } from '../../config/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Incrémente le compteur de requêtes
  requestCounter.add(1, {
    route: req.path,
    method: req.method
  });

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // en secondes

    // Enregistre le temps de réponse
    responseTimeHistogram.record(duration, {
      route: req.path,
      method: req.method,
      status: res.statusCode
    });

    // Enregistre les erreurs
    if (res.statusCode >= 400) {
      errorCounter.add(1, {
        route: req.path,
        method: req.method,
        status: res.statusCode
      });
    }
  });

  next();
}
