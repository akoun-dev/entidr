import {
  Request,
  Response,
  NextFunction
} from 'express';
import {
  EntidrSecurityContext,
  EntidrAccessResult,
  EntidrSecurityConfig
} from '../../../types/entidr-security';
import PermissionService from '../services/PermissionService';
import RecordAccessService from '../services/RecordAccessService';
import { UserModel } from '../models/User';

/**
 * Options de configuration du middleware de sécurité
 */
export interface SecurityMiddlewareOptions {
  /**
   * Chemin pour l'authentification
   */
  authPath?: string;

  /**
   * Chemin pour le login
   */
  loginPath?: string;

  /**
   * Chemin pour le logout
   */
  logoutPath?: string;

  /**
   * Chemins publics (non protégés)
   */
  publicPaths?: string[];

  /**
   * Activer/désactiver le middleware
   */
  enabled?: boolean;

  /**
   * Configuration de sécurité personnalisée
   */
  securityConfig?: Partial<EntidrSecurityConfig>;
}

/**
 * Middleware de sécurité pour Express
 */
export class SecurityMiddleware {
  private permissionService: PermissionService;
  private recordAccessService: RecordAccessService;
  private options: Required<SecurityMiddlewareOptions>;
  private contextCache: Map<string, { context: EntidrSecurityContext; timestamp: number; ttl: number }> = new Map();
  private readonly CONTEXT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  /**
   * Crée une nouvelle instance du middleware de sécurité
   */
  constructor(options: SecurityMiddlewareOptions = {}) {
    this.permissionService = PermissionService.getInstance();
    this.recordAccessService = RecordAccessService.getInstance();

    // Options par défaut
    this.options = {
      authPath: '/api/auth',
      loginPath: '/api/auth/login',
      logoutPath: '/api/auth/logout',
      publicPaths: ['/health', '/api/docs', '/api/auth/login'],
      enabled: true,
      securityConfig: {},
      ...options
    };
  }

  /**
   * Middleware principal
   */
  middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.options.enabled) {
        return next();
      }

      // Vérifier si le chemin est public
      if (this.isPublicPath(req.path)) {
        return next();
      }

      // Vérifier si c'est une route d'authentification
      if (this.isAuthPath(req.path)) {
        return next();
      }

      // Récupérer le token d'authentification
      const token = this.extractToken(req);
      if (!token) {
        return this.unauthorized(res, 'Authentication token required');
      }

      // Récupérer le contexte de sécurité
      const context = await this.getSecurityContext(token, req);
      if (!context) {
        return this.unauthorized(res, 'Invalid or expired token');
      }

      // Attacher le contexte à la requête
      (req as any).securityContext = context;

      // Vérifier les permissions de base
      if (!await this.checkBasicPermissions(context, req)) {
        return this.forbidden(res, 'Insufficient permissions');
      }

      // Vérifier les règles d'accès aux enregistrements si nécessaire
      if (await this.needsRecordAccessCheck(req)) {
        const accessResult = await this.checkRecordAccess(context, req);
        if (!accessResult.granted) {
          return this.forbidden(res, accessResult.reason || 'Record access denied');
        }
      }

      next();
    } catch (error) {
      console.error('Security middleware error:', error);
      this.internalError(res, 'Internal security error');
    }
  };

  /**
   * Middleware pour vérifier les permissions spécifiques
   */
  requirePermission = (model: string, action: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const context = this.getSecurityContextFromRequest(req);
        if (!context) {
          return this.unauthorized(res, 'Authentication required');
        }

        const hasPermission = await this.permissionService.hasPermission(
          context,
          model,
          action as any
        );

        if (!hasPermission) {
          return this.forbidden(res, `Permission ${action} denied for model ${model}`);
        }

        next();
      } catch (error) {
        console.error('Permission check error:', error);
        this.internalError(res, 'Permission check failed');
      }
    };
  };

  /**
   * Middleware pour vérifier l'accès à un modèle
   */
  requireModelAccess = (model: string, action: string, domain?: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const context = this.getSecurityContextFromRequest(req);
        if (!context) {
          return this.unauthorized(res, 'Authentication required');
        }

        const accessResult = await this.permissionService.checkModelAccess(
          context,
          model,
          action as any,
          domain
        );

        if (!accessResult.granted) {
          return this.forbidden(res, accessResult.reason || `Model access denied for ${model}`);
        }

        // Attacher les permissions au résultat
        (res as any).modelPermissions = accessResult.permissions;

        next();
      } catch (error) {
        console.error('Model access check error:', error);
        this.internalError(res, 'Model access check failed');
      }
    };
  };

  /**
   * Middleware pour vérifier le rôle
   */
  requireRole = (roleName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const context = this.getSecurityContextFromRequest(req);
        if (!context) {
          return this.unauthorized(res, 'Authentication required');
        }

        const hasRole = context.roles.some(role => role.name === roleName);
        if (!hasRole) {
          return this.forbidden(res, `Role ${roleName} required`);
        }

        next();
      } catch (error) {
        console.error('Role check error:', error);
        this.internalError(res, 'Role check failed');
      }
    };
  };

  /**
   * Middleware pour vérifier l'appartenance à un groupe
   */
  requireGroup = (groupName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const context = this.getSecurityContextFromRequest(req);
        if (!context) {
          return this.unauthorized(res, 'Authentication required');
        }

        const hasGroup = context.groups.some(group => group.name === groupName);
        if (!hasGroup) {
          return this.forbidden(res, `Group ${groupName} required`);
        }

        next();
      } catch (error) {
        console.error('Group check error:', error);
        this.internalError(res, 'Group check failed');
      }
    };
  };

  /**
   * Middleware pour vérifier si l'utilisateur est administrateur
   */
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const context = this.getSecurityContextFromRequest(req);
      if (!context) {
        return this.unauthorized(res, 'Authentication required');
      }

      const isAdmin = context.roles.some(role => role.name === 'admin') ||
                     context.user.username === 'admin';

      if (!isAdmin) {
        return this.forbidden(res, 'Admin access required');
      }

      next();
    } catch (error) {
      console.error('Admin check error:', error);
      this.internalError(res, 'Admin check failed');
    }
  };

  /**
   * Middleware pour ajouter des en-têtes de sécurité
   */
  securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // En-têtes de sécurité HTTP
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    next();
  };

  /**
   * Middleware pour limiter le taux de requêtes
   */
  rateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
    const requests = new Map<string, number[]>();

    return (req: Request, res: Response, next: NextFunction): void => {
      const clientId = this.getClientId(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Nettoyer les anciennes requêtes
      if (!requests.has(clientId)) {
        requests.set(clientId, []);
      }

      const clientRequests = requests.get(clientId)!;
      const validRequests = clientRequests.filter(time => time > windowStart);

      if (validRequests.length >= max) {
        res.setHeader('Retry-After', Math.ceil(windowMs / 1000).toString());
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil(windowMs / 1000)
        });
        return;
      }

      validRequests.push(now);
      requests.set(clientId, validRequests);

      next();
    };
  };

  /**
   * Middleware pour le logging de sécurité
   */
  securityLogger = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Intercepter la fin de la réponse
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any): void {
      const responseTime = Date.now() - startTime;

      // Logger les informations de sécurité
      console.log(`[Security] ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).securityContext?.user?.id,
        timestamp: new Date().toISOString()
      });

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };

  /**
   * Vérifie si un chemin est public
   */
  private isPublicPath(path: string): boolean {
    return this.options.publicPaths.some(publicPath =>
      path.startsWith(publicPath)
    );
  }

  /**
   * Vérifie si un chemin est une route d'authentification
   */
  private isAuthPath(path: string): boolean {
    return path.startsWith(this.options.authPath);
  }

  /**
   * Extrait le token d'authentification de la requête
   */
  private extractToken(req: Request): string | null {
    // Vérifier l'en-tête Authorization
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Vérifier le paramètre de requête
    const tokenParam = req.query.token as string;
    if (tokenParam) {
      return tokenParam;
    }

    // Vérifier le cookie
    const tokenCookie = req.cookies?.token;
    if (tokenCookie) {
      return tokenCookie;
    }

    return null;
  }

  /**
   * Récupère le contexte de sécurité pour un token
   */
  private async getSecurityContext(token: string, req: Request): Promise<EntidrSecurityContext | null> {
    // Vérifier le cache d'abord
    const cacheKey = this.getCacheKey(token);
    const cached = this.contextCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      // Mettre à jour les informations de la requête
      cached.context.ipAddress = req.ip;
      cached.context.userAgent = req.get('User-Agent') || '';
      cached.context.timestamp = new Date();

      return cached.context;
    }

    try {
      // Dans une implémentation réelle, valider le token et récupérer l'utilisateur
      // Pour la démo, on crée un contexte factice
      const user = this.createDemoUser(token);
      const context = await this.permissionService.createSecurityContext(user);

      // Ajouter les informations de la requête
      context.ipAddress = req.ip;
      context.userAgent = req.get('User-Agent') || '';

      // Mettre en cache le contexte
      this.contextCache.set(cacheKey, {
        context,
        timestamp: Date.now(),
        ttl: this.CONTEXT_CACHE_TTL
      });

      return context;
    } catch (error) {
      console.error('Error creating security context:', error);
      return null;
    }
  }

  /**
   * Vérifie les permissions de base
   */
  private async checkBasicPermissions(context: EntidrSecurityContext, req: Request): Promise<boolean> {
    // Vérifier si l'utilisateur est actif
    if (!context.user.active) {
      return false;
    }

    // Vérifier si la session est active
    if (context.session && !context.session.active) {
      return false;
    }

    // Vérifier si le compte n'est pas verrouillé
    if (context.user.lockedUntil && new Date(context.user.lockedUntil) > new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Vérifie si une vérification d'accès aux enregistrements est nécessaire
   */
  private async needsRecordAccessCheck(req: Request): Promise<boolean> {
    // Vérifier si c'est une requête qui implique des enregistrements spécifiques
    const path = req.path;
    const method = req.method;

    // Les requêtes GET avec ID param nécessitent souvent une vérification
    if (method === 'GET' && /\/api\/.*\/[^\/]+$/.test(path)) {
      return true;
    }

    // Les requêtes PUT, PATCH, DELETE nécessitent souvent une vérification
    if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    return false;
  }

  /**
   * Vérifie l'accès aux enregistrements
   */
  private async checkRecordAccess(context: EntidrSecurityContext, req: Request): Promise<EntidrAccessResult> {
    // Extraire le modèle et l'ID de l'enregistrement du chemin
    const pathParts = req.path.split('/').filter(Boolean);

    if (pathParts.length < 3) {
      return { granted: true, reason: 'No record access check needed' };
    }

    const model = pathParts[2]; // Supposons que le format est /api/{model}/{id}
    const recordId = pathParts[3];
    const action = this.getMethodAction(req.method);

    try {
      // Dans une implémentation réelle, récupérer l'enregistrement depuis la base de données
      const record = await this.getRecordById(model, recordId);

      if (!record) {
        return { granted: false, reason: 'Record not found' };
      }

      return await this.recordAccessService.checkRecordAccess(
        context,
        model,
        record,
        action
      );
    } catch (error) {
      console.error('Record access check error:', error);
      return { granted: false, reason: 'Record access check failed' };
    }
  }

  /**
   * Récupère le contexte de sécurité depuis la requête
   */
  private getSecurityContextFromRequest(req: Request): EntidrSecurityContext | null {
    return (req as any).securityContext || null;
  }

  /**
   * Récupère l'ID client pour le rate limiting
   */
  private getClientId(req: Request): string {
    // Utiliser l'ID utilisateur si disponible, sinon l'IP
    const context = this.getSecurityContextFromRequest(req);
    return context?.user?.id || req.ip || 'unknown';
  }

  /**
   * Convertit la méthode HTTP en action de sécurité
   */
  private getMethodAction(method: string): string {
    switch (method) {
      case 'GET': return 'read';
      case 'POST': return 'create';
      case 'PUT':
      case 'PATCH': return 'write';
      case 'DELETE': return 'unlink';
      default: return 'read';
    }
  }

  /**
   * Crée un utilisateur de démonstration
   */
  private createDemoUser(token: string): UserModel {
    const user = new UserModel();
    Object.assign(user, {
      id: 'demo_user_id',
      username: 'demo_user',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      active: true,
      roles: ['user'],
      groups: [],
      permissions: [],
      security: {
        passwordHash: '',
        passwordSalt: '',
        twoFactorEnabled: false,
        twoFactorSecret: '',
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        passwordChangedAt: new Date(),
        sessions: [{
          id: 'demo_session_id',
          token: token,
          device: 'Demo Device',
          browser: 'Demo Browser',
          os: 'Demo OS',
          ipAddress: '127.0.0.1',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          lastActive: new Date(),
          active: true
        }]
      }
    });
    return user;
  }

  /**
   * Récupère un enregistrement par son ID (simulation)
   */
  private async getRecordById(model: string, id: string): Promise<any> {
    // Dans une implémentation réelle, cela récupérerait l'enregistrement depuis la base de données
    // Pour la démo, on retourne un objet factice
    return {
      id,
      model,
      user_id: 'demo_user_id',
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Génère une clé de cache
   */
  private getCacheKey(token: string): string {
    return `context:${token}`;
  }

  /**
   * Réponses d'erreur standardisées
   */
  private unauthorized(res: Response, message: string): void {
    res.status(401).json({
      error: 'Unauthorized',
      message,
      timestamp: new Date().toISOString()
    });
  }

  private forbidden(res: Response, message: string): void {
    res.status(403).json({
      error: 'Forbidden',
      message,
      timestamp: new Date().toISOString()
    });
  }

  private internalError(res: Response, message: string): void {
    res.status(500).json({
      error: 'Internal Server Error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Nettoie le cache des contextes
   */
  cleanupContextCache(): void {
    const now = Date.now();
    for (const [key, value] of this.contextCache) {
      if (now - value.timestamp > value.ttl) {
        this.contextCache.delete(key);
      }
    }
  }

  /**
   * Invalide le cache pour un utilisateur spécifique
   */
  invalidateUserContext(userId: string): void {
    for (const [key, value] of this.contextCache) {
      if (value.context.user.id === userId) {
        this.contextCache.delete(key);
      }
    }
  }

  /**
   * Initialise le middleware
   */
  async initialize(): Promise<void> {
    console.log('SecurityMiddleware initialized');

    // Démarrer le nettoyage périodique du cache
    setInterval(() => {
      this.cleanupContextCache();
    }, 20 * 60 * 1000); // Toutes les 20 minutes
  }

  /**
   * Détruit l'instance du middleware
   */
  destroy(): void {
    this.contextCache.clear();
  }
}

export default SecurityMiddleware;
