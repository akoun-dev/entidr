import hrManifest, { hrManifest as manifest } from './manifest';
import hrRoutes from './routes';

// Export par défaut du module
export default {
  manifest: hrManifest,
  routes: hrRoutes
};

// Export nommés pour un accès direct
export { hrManifest as manifest };
export { hrRoutes as routes };
