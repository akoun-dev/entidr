import { EventEmitter } from 'events';

/**
 * Interface pour les options de cache
 */
export interface ViewCacheOptions {
  maxSize?: number; // Taille maximale du cache en nombre d'entrées
  ttl?: number; // Time to live en millisecondes
  strategy?: 'lru' | 'fifo' | 'lfu'; // Stratégie d'éviction
  persistToStorage?: boolean; // Persister dans le localStorage/sessionStorage
  storageKey?: string; // Clé pour le stockage persistant
  enableCompression?: boolean; // Activer la compression des données
  debug?: boolean; // Activer le mode debug
}

/**
 * Interface pour une entrée de cache
 */
export interface ViewCacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

/**
 * Interface pour les métriques du cache
 */
export interface ViewCacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  evictions: number;
  compressionRatio: number;
  averageAccessTime: number;
}

/**
 * Interface pour les événements du cache
 */
export interface ViewCacheEvents {
  hit: (entry: ViewCacheEntry) => void;
  miss: (key: string) => void;
  set: (entry: ViewCacheEntry) => void;
  delete: (key: string) => void;
  clear: () => void;
  evict: (entry: ViewCacheEntry) => void;
  error: (error: Error, context?: any) => void;
}

/**
 * Service de cache pour les vues Entidr
 * Gère le cache des données, configurations et états des vues
 */
export class EntidrViewCacheService extends EventEmitter {
  private cache: Map<string, ViewCacheEntry> = new Map();
  private accessOrder: string[] = []; // Pour la stratégie LRU
  private frequencyMap: Map<string, number> = new Map(); // Pour la stratégie LFU
  private metrics: ViewCacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    maxSize: 0,
    evictions: 0,
    compressionRatio: 1,
    averageAccessTime: 0
  };
  private options: Required<ViewCacheOptions>;
  private accessTimes: Map<string, number[]> = new Map();

  constructor(options: ViewCacheOptions = {}) {
    super();

    this.options = {
      maxSize: options.maxSize || 100,
      ttl: options.ttl || 300000, // 5 minutes par défaut
      strategy: options.strategy || 'lru',
      persistToStorage: options.persistToStorage || false,
      storageKey: options.storageKey || 'entidr_view_cache',
      enableCompression: options.enableCompression || false,
      debug: options.debug || false
    };

    this.metrics.maxSize = this.options.maxSize;

    // Charger les données persistantes si activé
    if (this.options.persistToStorage) {
      this.loadFromStorage();
    }

    // Configurer les écouteurs d'événements
    this.setupEventListeners();
  }

  /**
   * Récupère une valeur du cache
   */
  get<T = any>(key: string): T | null {
    const startTime = performance.now();

    try {
      const entry = this.cache.get(key);

      if (!entry) {
        this.handleMiss(key);
        return null;
      }

      // Vérifier si l'entrée est expirée
      if (this.isExpired(entry)) {
        this.delete(key);
        this.handleMiss(key);
        return null;
      }

      // Mettre à jour les métriques et l'ordre d'accès
      this.handleHit(entry);
      this.updateAccessOrder(key);

      const accessTime = performance.now() - startTime;
      this.updateAverageAccessTime(accessTime);

      if (this.options.debug) {
        console.log(`[ViewCache] Hit for key: ${key}`, entry);
      }

      return entry.data;
    } catch (error) {
      this.emit('error', error as Error, { key, operation: 'get' });
      return null;
    }
  }

  /**
   * Définit une valeur dans le cache
   */
  set<T = any>(key: string, data: T, customTTL?: number): void {
    try {
      const ttl = customTTL || this.options.ttl;
      const size = this.calculateSize(data);

      // Vérifier si nous devons faire de la place
      if (this.cache.size >= this.options.maxSize) {
        this.evict();
      }

      const entry: ViewCacheEntry = {
        key,
        data: this.options.enableCompression ? this.compress(data) : data,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        size
      };

      this.cache.set(key, entry);
      this.updateAccessOrder(key);
      this.frequencyMap.set(key, (this.frequencyMap.get(key) || 0) + 1);

      this.metrics.size = this.cache.size;

      if (this.options.persistToStorage) {
        this.saveToStorage();
      }

      if (this.options.debug) {
        console.log(`[ViewCache] Set for key: ${key}`, entry);
      }

      this.emit('set', entry);
    } catch (error) {
      this.emit('error', error as Error, { key, data, operation: 'set' });
    }
  }

  /**
   * Supprime une valeur du cache
   */
  delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.frequencyMap.delete(key);
      this.accessTimes.delete(key);

      this.metrics.size = this.cache.size;

      if (deleted && this.options.persistToStorage) {
        this.saveToStorage();
      }

      if (this.options.debug) {
        console.log(`[ViewCache] Delete for key: ${key}`);
      }

      this.emit('delete', key);
      return deleted;
    } catch (error) {
      this.emit('error', error as Error, { key, operation: 'delete' });
      return false;
    }
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    try {
      this.cache.clear();
      this.accessOrder = [];
      this.frequencyMap.clear();
      this.accessTimes.clear();

      this.metrics.size = 0;
      this.metrics.evictions = 0;

      if (this.options.persistToStorage) {
        this.saveToStorage();
      }

      if (this.options.debug) {
        console.log('[ViewCache] Cache cleared');
      }

      this.emit('clear');
    } catch (error) {
      this.emit('error', error as Error, { operation: 'clear' });
    }
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Récupère toutes les clés du cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys()).filter(key => {
      const entry = this.cache.get(key);
      return entry && !this.isExpired(entry);
    });
  }

  /**
   * Récupère toutes les valeurs du cache
   */
  values<T = any>(): T[] {
    return this.keys().map(key => this.get<T>(key)!);
  }

  /**
   * Récupère toutes les entrées du cache
   */
  entries<T = any>(): [string, T][] {
    return this.keys().map(key => [key, this.get<T>(key)!]);
  }

  /**
   * Récupère la taille du cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Récupère les métriques du cache
   */
  getMetrics(): ViewCacheMetrics {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;

    return { ...this.metrics };
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): number {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));

    if (this.options.debug) {
      console.log(`[ViewCache] Cleaned up ${keysToDelete.length} expired entries`);
    }

    return keysToDelete.length;
  }

  /**
   * Préchauffe le cache avec des données
   */
  async warmup<T = any>(dataProvider: (key: string) => Promise<T>, keys: string[]): Promise<void> {
    if (this.options.debug) {
      console.log(`[ViewCache] Warming up cache with ${keys.length} keys`);
    }

    const promises = keys.map(async (key) => {
      try {
        if (!this.has(key)) {
          const data = await dataProvider(key);
          this.set(key, data);
        }
      } catch (error) {
        this.emit('error', error as Error, { key, operation: 'warmup' });
      }
    });

    await Promise.all(promises);

    if (this.options.debug) {
      console.log('[ViewCache] Cache warmup completed');
    }
  }

  /**
   * Invalide le cache pour un modèle spécifique
   */
  invalidateForModel(modelId: string): void {
    const pattern = `model_${modelId}_`;
    const keysToDelete = this.keys().filter(key => key.startsWith(pattern));

    keysToDelete.forEach(key => this.delete(key));

    if (this.options.debug) {
      console.log(`[ViewCache] Invalidated ${keysToDelete.length} entries for model ${modelId}`);
    }
  }

  /**
   * Invalide le cache pour un type de vue spécifique
   */
  invalidateForViewType(viewType: string): void {
    const pattern = `view_${viewType}_`;
    const keysToDelete = this.keys().filter(key => key.startsWith(pattern));

    keysToDelete.forEach(key => this.delete(key));

    if (this.options.debug) {
      console.log(`[ViewCache] Invalidated ${keysToDelete.length} entries for view type ${viewType}`);
    }
  }

  /**
   * Configure les options du cache
   */
  configure(options: Partial<ViewCacheOptions>): void {
    this.options = { ...this.options, ...options };
    this.metrics.maxSize = this.options.maxSize;

    if (this.options.debug) {
      console.log('[ViewCache] Cache configuration updated', this.options);
    }
  }

  /**
   * Vérifie si une entrée est expirée
   */
  private isExpired(entry: ViewCacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Gère un hit de cache
   */
  private handleHit(entry: ViewCacheEntry): void {
    this.metrics.hits++;
    entry.hits++;
    this.emit('hit', entry);
  }

  /**
   * Gère un miss de cache
   */
  private handleMiss(key: string): void {
    this.metrics.misses++;
    this.emit('miss', key);
  }

  /**
   * Met à jour l'ordre d'accès selon la stratégie
   */
  private updateAccessOrder(key: string): void {
    // Supprimer la clé si elle existe déjà
    this.accessOrder = this.accessOrder.filter(k => k !== key);

    // Ajouter la clé au début (plus récemment utilisée)
    this.accessOrder.unshift(key);

    // Limiter la taille de la liste d'ordre
    if (this.accessOrder.length > this.options.maxSize) {
      this.accessOrder = this.accessOrder.slice(0, this.options.maxSize);
    }

    // Mettre à jour les temps d'accès
    if (!this.accessTimes.has(key)) {
      this.accessTimes.set(key, []);
    }
    this.accessTimes.get(key)!.push(performance.now());

    // Garder seulement les 10 derniers temps d'accès
    const times = this.accessTimes.get(key)!;
    if (times.length > 10) {
      times.splice(0, times.length - 10);
    }
  }

  /**
   * Évince une entrée selon la stratégie configurée
   */
  private evict(): void {
    let keyToEvict: string | undefined;

    switch (this.options.strategy) {
      case 'lru':
        // Least Recently Used
        keyToEvict = this.accessOrder[this.accessOrder.length - 1];
        break;

      case 'fifo':
        // First In First Out
        keyToEvict = this.accessOrder[this.accessOrder.length - 1];
        break;

      case 'lfu':
        // Least Frequently Used
        let minFrequency = Infinity;
        for (const [key, frequency] of this.frequencyMap.entries()) {
          if (frequency < minFrequency && this.cache.has(key)) {
            minFrequency = frequency;
            keyToEvict = key;
          }
        }
        break;

      default:
        keyToEvict = this.accessOrder[this.accessOrder.length - 1];
    }

    if (keyToEvict) {
      const entry = this.cache.get(keyToEvict);
      this.delete(keyToEvict);
      this.metrics.evictions++;

      if (this.options.debug) {
        console.log(`[ViewCache] Evicted entry for key: ${keyToEvict}`);
      }

      if (entry) {
        this.emit('evict', entry);
      }
    }
  }

  /**
   * Calcule la taille approximative des données
   */
  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  /**
   * Compresse les données (simulation)
   */
  private compress<T>(data: T): T {
    // Dans une implémentation réelle, vous utiliseriez une bibliothèque de compression
    // Pour l'instant, nous retournons simplement les données
    this.metrics.compressionRatio = 0.8; // Simulation de 20% de compression
    return data;
  }

  /**
   * Met à jour le temps d'accès moyen
   */
  private updateAverageAccessTime(accessTime: number): void {
    // Calculer la moyenne mobile
    const alpha = 0.1; // Facteur de lissage
    this.metrics.averageAccessTime =
      (1 - alpha) * this.metrics.averageAccessTime + alpha * accessTime;
  }

  /**
   * Sauvegarde le cache dans le stockage persistant
   */
  private saveToStorage(): void {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        metrics: this.metrics,
        timestamp: Date.now()
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.options.storageKey, JSON.stringify(data));
      }
    } catch (error) {
      this.emit('error', error as Error, { operation: 'saveToStorage' });
    }
  }

  /**
   * Charge le cache depuis le stockage persistant
   */
  private loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const stored = localStorage.getItem(this.options.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored);

      // Vérifier si les données ne sont pas trop anciennes
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      if (Date.now() - data.timestamp > maxAge) {
        if (this.options.debug) {
          console.log('[ViewCache] Stored cache data is too old, ignoring');
        }
        return;
      }

      // Reconstruire le cache
      this.cache = new Map(data.cache);
      this.metrics = data.metrics;

      // Reconstruire l'ordre d'accès et la fréquence
      this.accessOrder = Array.from(this.cache.keys());
      this.frequencyMap = new Map(this.accessOrder.map(key => [key, 1]));

      if (this.options.debug) {
        console.log(`[ViewCache] Loaded ${this.cache.size} entries from storage`);
      }
    } catch (error) {
      this.emit('error', error as Error, { operation: 'loadFromStorage' });
    }
  }

  /**
   * Configure les écouteurs d'événements
   */
  private setupEventListeners(): void {
    // Nettoyer périodiquement les entrées expirées
    setInterval(() => {
      this.cleanup();
    }, 60000); // Toutes les minutes

    // Sauvegarder périodiquement si la persistance est activée
    if (this.options.persistToStorage) {
      setInterval(() => {
        this.saveToStorage();
      }, 300000); // Toutes les 5 minutes
    }
  }
}

// Exporter une instance singleton pour une utilisation facile
export const viewCacheService = new EntidrViewCacheService({
  maxSize: 200,
  ttl: 300000,
  strategy: 'lru',
  persistToStorage: true,
  storageKey: 'entidr_view_cache',
  enableCompression: false,
  debug: false
});

export default EntidrViewCacheService;
