import Redis from 'ioredis';
import logger from '../utils/logger';
import { AddonManifest } from '../types/addon';
import path from 'path';
import fs from 'fs';
import chokidar from 'chokidar';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const MANIFEST_FILE = 'manifest.ts';

export const getCachedManifests = async (): Promise<AddonManifest[]> => {
  try {
    // Vérifier d'abord le cache global
    const cached = await redis.get('modules:manifests');
    if (cached) return JSON.parse(cached);

    // Fallback: reconstruire à partir des caches individuels
    const keys = await redis.keys('module:*');
    if (keys.length > 0) {
      const manifests = await Promise.all(
        keys.map(async key => {
          const data = await redis.get(key);
          return data ? JSON.parse(data) : null;
        })
      );
      return manifests.filter(Boolean) as AddonManifest[];
    }
    return null;
  } catch (error) {
    logger.error('Redis cache error:', error);
    return null;
  }
};

export const cacheManifests = async (manifests: AddonManifest[]): Promise<void> => {
  try {
    // Cache principal avec TTL de 1h
    await redis.set('modules:manifests', JSON.stringify(manifests), 'EX', 3600);
    
    // Cache individuel par module avec TTL adaptatif
    await Promise.all(manifests.map(async manifest => {
      const ttl = manifest.core ? 86400 : 3600; // 24h pour les modules core, 1h pour les autres
      await redis.set(`module:${manifest.name}`, JSON.stringify(manifest), 'EX', ttl);
    }));
  } catch (error) {
    logger.error('Redis cache error:', error);
  }
};

export const discoverModules = async (): Promise<AddonManifest[]> => {
  const addonsDir = path.join(__dirname, '../../addons');
  const moduleDirs = fs.readdirSync(addonsDir).filter(dir => 
    fs.statSync(path.join(addonsDir, dir)).isDirectory()
  );

  const manifests = await Promise.all(
    moduleDirs.map(async dir => {
      try {
        const manifestPath = path.join(addonsDir, dir, MANIFEST_FILE);
        const manifest = (await import(manifestPath)).default;
        return { ...manifest, name: dir };
      } catch (error) {
        logger.warn(`Failed to load manifest for ${dir}:`, error);
        return null;
      }
    })
  );

  return manifests.filter(Boolean) as AddonManifest[];
};

export const watchModules = (onChange?: () => void) => {
  const watcher = chokidar.watch(path.join(__dirname, '../../addons/**/manifest.ts'), {
    ignored: /(^|[\/\\])\../,
    persistent: true
  });

  watcher.on('change', path => {
    logger.info(`Manifest changed: ${path}`);
    redis.del('modules:manifests');
    onChange?.();
  });

  watcher.on('unlink', path => {
    logger.info(`Manifest removed: ${path}`);
    redis.del('modules:manifests');
    onChange?.();
  });

  watcher.on('add', path => {
    logger.info(`New manifest detected: ${path}`);
    redis.del('modules:manifests');
    onChange?.();
  });

  return watcher;
};