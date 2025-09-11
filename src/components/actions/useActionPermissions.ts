import { useState, useEffect, useCallback } from 'react';
import type { PermissionLevel } from '../../core/auth/types';
import type { ActionConfig } from './ActionButton';
import PermissionService from '../../core/auth/services/PermissionService';
import RecordAccessService from '../../core/auth/services/RecordAccessService';

/**
 * Configuration du hook de permissions d'action
 */
export interface UseActionPermissionsConfig {
  /** Configuration de l'action */
  action: ActionConfig;

  /** Contournement des permissions */
  bypass?: boolean;

  /** Contexte de sécurité personnalisé */
  securityContext?: any;

  /** Délai de vérification des permissions (ms) */
  checkTimeout?: number;

  /** Cache des permissions */
  enableCache?: boolean;

  /** Durée du cache (ms) */
  cacheDuration?: number;
}

/**
 * Résultat de la vérification des permissions
 */
export interface UseActionPermissionsResult {
  /** L'utilisateur a la permission */
  hasPermission: boolean;

  /** Vérification en cours */
  isChecking: boolean;

  /** Erreur de permission */
  permissionError: string | null;

  /** Détails des permissions vérifiées */
  permissionDetails: {
    /** Permissions requises */
    required: PermissionLevel[];
    /** Permissions accordées */
    granted: PermissionLevel[];
    /** Permissions manquantes */
    missing: PermissionLevel[];
    /** Modèle vérifié */
    model?: string;
    /** Type d'action */
    actionType: string;
  };

  /** Rafraîchir la vérification */
  refresh: () => Promise<void>;

  /** Effacer le cache */
  clearCache: () => void;
}

/**
 * Cache local des permissions
 */
const permissionCache = new Map<string, {
  result: boolean;
  timestamp: number;
  details: UseActionPermissionsResult['permissionDetails'];
}>();

/**
 * Hook pour vérifier les permissions d'une action
 */
export function useActionPermissions({
  action,
  bypass = false,
  securityContext,
  checkTimeout = 5000,
  enableCache = true,
  cacheDuration = 30000 // 30 secondes
}: UseActionPermissionsConfig): UseActionPermissionsResult {
  const [hasPermission, setHasPermission] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionDetails, setPermissionDetails] = useState<UseActionPermissionsResult['permissionDetails']>({
    required: [],
    granted: [],
    missing: [],
    model: action.model,
    actionType: action.type
  });

  // Générer une clé de cache
  const generateCacheKey = useCallback(() => {
    const requiredPerms = action.permissions?.join(',') || 'none';
    const model = action.model || 'none';
    const type = action.type;
    return `${model}:${type}:${requiredPerms}`;
  }, [action.model, action.type, action.permissions]);

  // Vérifier le cache
  const checkCache = useCallback(() => {
    if (!enableCache) return null;

    const key = generateCacheKey();
    const cached = permissionCache.get(key);

    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached;
    }

    return null;
  }, [enableCache, generateCacheKey, cacheDuration]);

  // Mettre en cache le résultat
  const cacheResult = useCallback((result: boolean, details: UseActionPermissionsResult['permissionDetails']) => {
    if (!enableCache) return;

    const key = generateCacheKey();
    permissionCache.set(key, {
      result,
      timestamp: Date.now(),
      details
    });
  }, [enableCache, generateCacheKey]);

  // Effacer le cache
  const clearCache = useCallback(() => {
    const key = generateCacheKey();
    permissionCache.delete(key);
  }, [generateCacheKey]);

  // Mapper le type d'action à une permission
  const mapActionToPermission = useCallback((actionType: string): string => {
    const actionMap: Record<string, string> = {
      'CREATE': 'create',
      'READ': 'read',
      'UPDATE': 'update',
      'DELETE': 'delete',
      'EXPORT': 'export',
      'IMPORT': 'import',
      'BATCH': 'batch',
      'CUSTOM': 'custom'
    };

    return actionMap[actionType] || 'custom';
  }, []);

  // Vérifier les permissions
  const checkPermissions = useCallback(async () => {
    // Si contournement activé, autoriser automatiquement
    if (bypass) {
      setHasPermission(true);
      setPermissionError(null);
      setPermissionDetails(prev => ({
        ...prev,
        granted: prev.required,
        missing: []
      }));
      return;
    }

    // Vérifier le cache
    const cached = checkCache();
    if (cached) {
      setHasPermission(cached.result);
      setPermissionDetails(cached.details);
      return;
    }

    setIsChecking(true);
    setPermissionError(null);

    try {
      // Créer un timeout pour la vérification
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout de vérification des permissions')), checkTimeout);
      });

      // Logique de vérification des permissions
      const checkPromise = async () => {
        const requiredPermissions = action.permissions || [];
        const model = action.model;
        const actionType = action.type;

        // Si aucune permission n'est requise, autoriser
        if (requiredPermissions.length === 0) {
          return {
            hasPermission: true,
            details: {
              required: [],
              granted: [],
              missing: [],
              model,
              actionType
            }
          };
        }

        // Utiliser le contexte de sécurité fourni ou en créer un
        const context = securityContext || await PermissionService.getInstance().createSecurityContext({
          // Utilisateur par défaut minimal (serait remplacé par le contexte réel)
          id: 'default',
          username: 'default',
          email: 'default@example.com',
          displayName: 'Default User',
          firstName: 'Default',
          lastName: 'User',
          active: true,
          roles: [],
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);

        // Vérifier les permissions de base
        const hasBasicPermission = await PermissionService.getInstance().hasPermission(
          context,
          model || '*',
          mapActionToPermission(actionType) as any
        );

        // Vérifier les permissions spécifiques
        const grantedPermissions: PermissionLevel[] = [];
        const missingPermissions: PermissionLevel[] = [];

        for (const permission of requiredPermissions) {
          const hasPerm = await PermissionService.getInstance().hasPermission(
            context,
            model || '*',
            permission as any
          );

          if (hasPerm) {
            grantedPermissions.push(permission);
          } else {
            missingPermissions.push(permission);
          }
        }

        const finalHasPermission = hasBasicPermission && missingPermissions.length === 0;

        return {
          hasPermission: finalHasPermission,
          details: {
            required: requiredPermissions,
            granted: grantedPermissions,
            missing: missingPermissions,
            model,
            actionType
          }
        };
      };

      // Exécuter la vérification avec timeout
      const result = await Promise.race([checkPromise(), timeoutPromise]);

      setHasPermission(result.hasPermission);
      setPermissionDetails(result.details);

      // Mettre en cache le résultat
      cacheResult(result.hasPermission, result.details);

    } catch (error) {
      console.error('Permission check error:', error);
      setHasPermission(false);
      setPermissionError(
        error instanceof Error ? error.message : 'Erreur lors de la vérification des permissions'
      );
    } finally {
      setIsChecking(false);
    }
  }, [
    action,
    bypass,
    securityContext,
    checkTimeout,
    checkCache,
    cacheResult,
    mapActionToPermission
  ]);

  // Rafraîchir la vérification
  const refresh = useCallback(async () => {
    clearCache();
    await checkPermissions();
  }, [clearCache, checkPermissions]);

  // Vérifier les permissions au montage et lorsque les dépendances changent
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // Nettoyer le cache au démontage
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  return {
    hasPermission,
    isChecking,
    permissionError,
    permissionDetails,
    refresh,
    clearCache
  };
}

export default useActionPermissions;
