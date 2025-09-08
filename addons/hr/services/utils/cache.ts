'use strict';

export class TTLCache<T> {
  private store = new Map<string, { expires: number; value: T }>();
  constructor(private defaultTtlMs = 30000) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number) {
    this.store.set(key, { value, expires: Date.now() + (ttlMs ?? this.defaultTtlMs) });
  }

  clear(prefix?: string) {
    if (!prefix) this.store.clear();
    else {
      for (const k of this.store.keys()) if (k.startsWith(prefix)) this.store.delete(k);
    }
  }
}

