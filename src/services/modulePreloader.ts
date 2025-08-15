import { useEffect } from 'react';
import { debug } from '../utils/logger';

const CRITICAL_MODULES = ['core', 'auth', 'ui'];
const PRIORITY_MODULES = ['finance', 'hr'];

export function useModulePreloader() {
  useEffect(() => {
    // Preload critical modules
    CRITICAL_MODULES.forEach(module => {
      debug(`Preloading critical module: ${module}`);
      import(`../core/${module}`).catch(e => 
        debug(`Preload failed for ${module}:`, e)
      );
    });

    // Preload priority modules after critical
    const priorityTimer = setTimeout(() => {
      PRIORITY_MODULES.forEach(module => {
        debug(`Preloading priority module: ${module}`);
        import(`../../addons/${module}/index.ts`).catch(e =>
          debug(`Preload failed for ${module}:`, e)
        );
      });
    }, 1000);

    return () => clearTimeout(priorityTimer);
  }, []);
}