import { ModuleConfig } from './ModuleConfig';
import { debug, error } from '../utils/logger';

export function createSandbox(config: ModuleConfig) {
  return {
    execute: (code: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        try {
          // Restrict access to only allowed APIs
          const allowedGlobals = {
            console: Object.freeze({
              log: console.log,
              warn: console.warn,
              error: console.error
            }),
            module: Object.freeze({
              name: config.name,
              version: config.version
            })
          };

          const sandboxFunc = new Function('global', `with(global) { ${code} }`);
          resolve(sandboxFunc.call({}, Object.freeze(allowedGlobals)));
        } catch (err) {
          error(`Sandbox execution error in module ${config.name}:`, err);
          reject(err);
        }
      });
    },
    destroy: () => {
      debug(`Destroyed sandbox for module ${config.name}`);
    }
  };
}