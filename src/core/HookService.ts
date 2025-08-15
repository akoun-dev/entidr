import logger from '../utils/logger';

type HookCallback<T = any> = (data: T) => void | Promise<void>;

class HookService {
  private static instance: HookService;
  private hooks: Map<string, HookCallback[]> = new Map();

  private constructor() {}

  public static getInstance(): HookService {
    if (!HookService.instance) {
      HookService.instance = new HookService();
    }
    return HookService.instance;
  }

  public registerHook<T>(hookName: string, callback: HookCallback<T>): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName)!.push(callback);
  }

  public async triggerHook<T>(hookName: string, data: T): Promise<void> {
    const callbacks = this.hooks.get(hookName) || [];
    await Promise.all(
      callbacks.map(async callback => {
        try {
          await callback(data);
        } catch (error) {
          logger.error(`Error in hook ${hookName}:`, error);
        }
      })
    );
  }

  public getRegisteredHooks(): string[] {
    return Array.from(this.hooks.keys());
  }
}

export const { registerHook, triggerHook } = HookService.getInstance();