import { EventEmitter } from 'events';

/**
 * Niveaux de sévérité des erreurs
 */
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  FATAL = 'fatal'
}

/**
 * Catégories d'erreurs pour les vues
 */
export enum ViewErrorCategory {
  VALIDATION = 'validation',
  RENDERING = 'rendering',
  DATA_FETCH = 'data_fetch',
  STATE_MANAGEMENT = 'state_management',
  CACHE = 'cache',
  NETWORK = 'network',
  PERMISSION = 'permission',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown'
}

/**
 * Interface pour les options de gestion des erreurs
 */
export interface ViewErrorOptions {
  maxErrors?: number; // Nombre maximum d'erreurs à conserver
  enableConsole?: boolean; // Activer la sortie console
  enableReporting?: boolean; // Activer le rapport d'erreurs
  reportingEndpoint?: string; // Endpoint pour le rapport d'erreurs
  enableNotifications?: boolean; // Activer les notifications d'erreurs
  enableRetry?: boolean; // Activer la réessai automatique
  maxRetries?: number; // Nombre maximum de tentatives
  retryDelay?: number; // Délai entre les tentatives en ms
  enableErrorBoundary?: boolean; // Activer les limites d'erreur
  debug?: boolean; // Activer le mode debug
}

/**
 * Interface pour une erreur de vue
 */
export interface ViewError {
  id: string;
  timestamp: number;
  severity: ErrorSeverity;
  category: ViewErrorCategory;
  code: string;
  message: string;
  details?: any;
  stack?: string;
  component?: string;
  viewId?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  context?: Record<string, any>;
  retryCount: number;
  resolved: boolean;
  resolvedAt?: number;
  resolutionMethod?: string;
}

/**
 * Interface pour les métriques d'erreurs
 */
export interface ViewErrorMetrics {
  totalErrors: number;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCategory: Record<ViewErrorCategory, number>;
  resolvedErrors: number;
  unresolvedErrors: number;
  averageResolutionTime: number;
  retrySuccessRate: number;
  errorRate: number; // erreurs par minute
  criticalErrors: number;
  uniqueErrors: number;
}

/**
 * Interface pour les stratégies de retry
 */
export interface RetryStrategy {
  maxRetries: number;
  delay: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  condition?: (error: ViewError) => boolean;
}

/**
 * Interface pour les gestionnaires d'erreurs
 */
export interface ErrorHandler {
  canHandle(error: ViewError): boolean;
  handle(error: ViewError): Promise<boolean>;
  priority: number;
}

/**
 * Interface pour les notifications d'erreurs
 */
export interface ErrorNotification {
  id: string;
  error: ViewError;
  message: string;
  type: 'toast' | 'modal' | 'banner' | 'silent';
  actions?: ErrorNotificationAction[];
  timestamp: number;
  acknowledged: boolean;
}

/**
 * Interface pour les actions de notification
 */
export interface ErrorNotificationAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

/**
 * Interface pour les rapports d'erreurs
 */
export interface ErrorReport {
  errors: ViewError[];
  metrics: ViewErrorMetrics;
  environment: {
    url: string;
    userAgent: string;
    timestamp: number;
    sessionId: string;
    userId?: string;
  };
  summary: {
    totalErrors: number;
    criticalErrors: number;
    resolvedErrors: number;
    averageResolutionTime: number;
  };
}

/**
 * Service de gestion des erreurs pour les vues Entidr
 * Gère la collecte, le traitement, le rapport et la résolution des erreurs
 */
export class EntidrViewErrorService extends EventEmitter {
  private errors: Map<string, ViewError> = new Map();
  private errorQueue: ViewError[] = [];
  private handlers: ErrorHandler[] = [];
  private notifications: Map<string, ErrorNotification> = new Map();
  private retryStrategies: Map<string, RetryStrategy> = new Map();
  private metrics: ViewErrorMetrics = this.initializeMetrics();
  private options: Required<ViewErrorOptions>;
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(options: ViewErrorOptions = {}) {
    super();

    this.options = {
      maxErrors: options.maxErrors || 1000,
      enableConsole: options.enableConsole ?? true,
      enableReporting: options.enableReporting ?? false,
      reportingEndpoint: options.reportingEndpoint || '/api/errors',
      enableNotifications: options.enableNotifications ?? true,
      enableRetry: options.enableRetry ?? true,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      enableErrorBoundary: options.enableErrorBoundary ?? true,
      debug: options.debug || false
    };

    // Configurer les stratégies de retry par défaut
    this.setupDefaultRetryStrategies();

    // Configurer les écouteurs d'événements
    this.setupEventListeners();
  }

  /**
   * Signale une nouvelle erreur
   */
  report(error: Partial<ViewError>): string {
    const errorId = this.generateErrorId();
    const timestamp = Date.now();

    const viewError: ViewError = {
      id: errorId,
      timestamp,
      severity: error.severity || ErrorSeverity.ERROR,
      category: error.category || ViewErrorCategory.UNKNOWN,
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Une erreur inconnue est survenue',
      details: error.details,
      stack: error.stack,
      component: error.component,
      viewId: error.viewId,
      userId: error.userId,
      sessionId: error.sessionId || this.getSessionId(),
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      context: error.context || {},
      retryCount: error.retryCount || 0,
      resolved: error.resolved || false
    };

    // Ajouter l'erreur au cache et à la file
    this.errors.set(errorId, viewError);
    this.errorQueue.push(viewError);

    // Mettre à jour les métriques
    this.updateMetrics(viewError);

    // Journaliser dans la console si activé
    if (this.options.enableConsole) {
      this.logToConsole(viewError);
    }

    // Émettre l'événement d'erreur
    this.emit('error', viewError);

    // Tenter de résoudre automatiquement si le retry est activé
    if (this.options.enableRetry && this.shouldRetry(viewError)) {
      this.scheduleRetry(viewError);
    }

    // Créer une notification si activé
    if (this.options.enableNotifications && this.shouldNotify(viewError)) {
      this.createNotification(viewError);
    }

    // Nettoyer les anciennes erreurs si nécessaire
    this.cleanupOldErrors();

    if (this.options.debug) {
      console.log(`[ViewErrorService] Error reported: ${errorId}`, viewError);
    }

    return errorId;
  }

  /**
   * Résout une erreur
   */
  resolve(errorId: string, resolutionMethod: string): boolean {
    const error = this.errors.get(errorId);
    if (!error || error.resolved) {
      return false;
    }

    error.resolved = true;
    error.resolvedAt = Date.now();
    error.resolutionMethod = resolutionMethod;

    // Mettre à jour les métriques
    this.metrics.resolvedErrors++;
    this.metrics.unresolvedErrors = this.metrics.totalErrors - this.metrics.resolvedErrors;

    const resolutionTime = error.resolvedAt - error.timestamp;
    this.updateAverageResolutionTime(resolutionTime);

    // Annuler le timer de retry s'il existe
    const retryTimer = this.retryTimers.get(errorId);
    if (retryTimer) {
      clearTimeout(retryTimer);
      this.retryTimers.delete(errorId);
    }

    // Émettre l'événement de résolution
    this.emit('resolved', error);

    if (this.options.debug) {
      console.log(`[ViewErrorService] Error resolved: ${errorId}`, error);
    }

    return true;
  }

  /**
   * Récupère une erreur par son ID
   */
  getError(errorId: string): ViewError | undefined {
    return this.errors.get(errorId);
  }

  /**
   * Récupère toutes les erreurs
   */
  getErrors(filter?: {
    severity?: ErrorSeverity;
    category?: ViewErrorCategory;
    resolved?: boolean;
    component?: string;
    viewId?: string;
    since?: number;
  }): ViewError[] {
    let errors = Array.from(this.errors.values());

    if (filter) {
      errors = errors.filter(error => {
        if (filter.severity && error.severity !== filter.severity) return false;
        if (filter.category && error.category !== filter.category) return false;
        if (filter.resolved !== undefined && error.resolved !== filter.resolved) return false;
        if (filter.component && error.component !== filter.component) return false;
        if (filter.viewId && error.viewId !== filter.viewId) return false;
        if (filter.since && error.timestamp < filter.since) return false;
        return true;
      });
    }

    // Trier par timestamp (plus récent en premier)
    return errors.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Récupère les métriques d'erreurs
   */
  getMetrics(): ViewErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Ajoute un gestionnaire d'erreurs
   */
  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
    // Trier par priorité (plus haute priorité en premier)
    this.handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Supprime un gestionnaire d'erreurs
   */
  removeHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  /**
   * Configure une stratégie de retry
   */
  setRetryStrategy(errorType: string, strategy: RetryStrategy): void {
    this.retryStrategies.set(errorType, strategy);
  }

  /**
   * Crée un rapport d'erreurs
   */
  createReport(): ErrorReport {
    const errors = Array.from(this.errors.values());

    return {
      errors,
      metrics: this.getMetrics(),
      environment: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: this.getCurrentUserId()
      },
      summary: {
        totalErrors: this.metrics.totalErrors,
        criticalErrors: this.metrics.criticalErrors,
        resolvedErrors: this.metrics.resolvedErrors,
        averageResolutionTime: this.metrics.averageResolutionTime
      }
    };
  }

  /**
   * Envoie un rapport d'erreurs
   */
  async sendReport(): Promise<boolean> {
    if (!this.options.enableReporting) {
      return false;
    }

    try {
      const report = this.createReport();

      const response = await fetch(this.options.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });

      if (response.ok) {
        this.emit('reportSent', report);
        return true;
      }

      return false;
    } catch (error) {
      this.emit('reportError', error);
      return false;
    }
  }

  /**
   * Acknowledge une notification
   */
  acknowledgeNotification(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.acknowledged = true;
    this.emit('notificationAcknowledged', notification);

    return true;
  }

  /**
   * Vide toutes les erreurs
   */
  clear(): void {
    this.errors.clear();
    this.errorQueue = [];
    this.notifications.clear();

    // Annuler tous les timers de retry
    this.retryTimers.forEach(timer => clearTimeout(timer));
    this.retryTimers.clear();

    // Réinitialiser les métriques
    this.metrics = this.initializeMetrics();

    this.emit('cleared');
  }

  /**
   * Initialise les métriques
   */
  private initializeMetrics(): ViewErrorMetrics {
    return {
      totalErrors: 0,
      errorsBySeverity: {
        [ErrorSeverity.DEBUG]: 0,
        [ErrorSeverity.INFO]: 0,
        [ErrorSeverity.WARNING]: 0,
        [ErrorSeverity.ERROR]: 0,
        [ErrorSeverity.CRITICAL]: 0,
        [ErrorSeverity.FATAL]: 0
      },
      errorsByCategory: {
        [ViewErrorCategory.VALIDATION]: 0,
        [ViewErrorCategory.RENDERING]: 0,
        [ViewErrorCategory.DATA_FETCH]: 0,
        [ViewErrorCategory.STATE_MANAGEMENT]: 0,
        [ViewErrorCategory.CACHE]: 0,
        [ViewErrorCategory.NETWORK]: 0,
        [ViewErrorCategory.PERMISSION]: 0,
        [ViewErrorCategory.CONFIGURATION]: 0,
        [ViewErrorCategory.UNKNOWN]: 0
      },
      resolvedErrors: 0,
      unresolvedErrors: 0,
      averageResolutionTime: 0,
      retrySuccessRate: 0,
      errorRate: 0,
      criticalErrors: 0,
      uniqueErrors: 0
    };
  }

  /**
   * Met à jour les métriques
   */
  private updateMetrics(error: ViewError): void {
    this.metrics.totalErrors++;
    this.metrics.errorsBySeverity[error.severity]++;
    this.metrics.errorsByCategory[error.category]++;
    this.metrics.unresolvedErrors++;

    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.FATAL) {
      this.metrics.criticalErrors++;
    }

    // Calculer le taux d'erreur (erreurs par minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentErrors = Array.from(this.errors.values())
      .filter(e => e.timestamp >= oneMinuteAgo).length;
    this.metrics.errorRate = recentErrors;
  }

  /**
   * Met à jour le temps de résolution moyen
   */
  private updateAverageResolutionTime(resolutionTime: number): void {
    const alpha = 0.1; // Facteur de lissage
    this.metrics.averageResolutionTime =
      (1 - alpha) * this.metrics.averageResolutionTime + alpha * resolutionTime;
  }

  /**
   * Journalise l'erreur dans la console
   */
  private logToConsole(error: ViewError): void {
    const logMethod = {
      [ErrorSeverity.DEBUG]: console.debug,
      [ErrorSeverity.INFO]: console.info,
      [ErrorSeverity.WARNING]: console.warn,
      [ErrorSeverity.ERROR]: console.error,
      [ErrorSeverity.CRITICAL]: console.error,
      [ErrorSeverity.FATAL]: console.error
    }[error.severity];

    logMethod(`[ViewError] ${error.category.toUpperCase()}: ${error.message}`, error);
  }

  /**
   * Vérifie si une erreur devrait être réessayée
   */
  private shouldRetry(error: ViewError): boolean {
    if (error.resolved || error.retryCount >= this.options.maxRetries) {
      return false;
    }

    // Vérifier s'il y a une stratégie de retry pour ce type d'erreur
    const strategy = this.retryStrategies.get(error.code);
    if (strategy && strategy.condition) {
      return strategy.condition(error);
    }

    // Par défaut, réessayer les erreurs de réseau et de cache
    return [
      ViewErrorCategory.NETWORK,
      ViewErrorCategory.CACHE,
      ViewErrorCategory.DATA_FETCH
    ].includes(error.category);
  }

  /**
   * Planifie un retry pour une erreur
   */
  private scheduleRetry(error: ViewError): void {
    const strategy = this.retryStrategies.get(error.code) || {
      maxRetries: this.options.maxRetries,
      delay: this.options.retryDelay
    };

    if (error.retryCount >= strategy.maxRetries) {
      return;
    }

    const delay = this.calculateRetryDelay(error, strategy);
    const timer = setTimeout(() => {
      this.retryError(error);
    }, delay);

    this.retryTimers.set(error.id, timer);

    if (this.options.debug) {
      console.log(`[ViewErrorService] Scheduled retry for error ${error.id} in ${delay}ms`);
    }
  }

  /**
   * Calcule le délai de retry
   */
  private calculateRetryDelay(error: ViewError, strategy: RetryStrategy): number {
    let delay = strategy.delay * Math.pow(strategy.backoffMultiplier || 2, error.retryCount);

    // Ajouter du jitter si activé
    if (strategy.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.min(delay, 30000); // Maximum 30 secondes
  }

  /**
   * Réessaie une erreur
   */
  private async retryError(error: ViewError): Promise<void> {
    this.retryTimers.delete(error.id);

    // Incrémenter le compteur de retry
    error.retryCount++;

    // Émettre l'événement de retry
    this.emit('retry', error);

    // Tenter de résoudre avec les gestionnaires
    for (const handler of this.handlers) {
      if (handler.canHandle(error)) {
        try {
          const resolved = await handler.handle(error);
          if (resolved) {
            this.resolve(error.id, 'retry_handler');
            this.metrics.retrySuccessRate =
              (this.metrics.retrySuccessRate * (error.retryCount - 1) + 1) / error.retryCount;
            return;
          }
        } catch (handlerError) {
          this.report({
            severity: ErrorSeverity.ERROR,
            category: ViewErrorCategory.UNKNOWN,
            code: 'RETRY_HANDLER_ERROR',
            message: 'Erreur lors du retry par le gestionnaire',
            details: handlerError,
            context: { originalError: error }
          });
        }
      }
    }

    // Si aucun gestionnaire n'a pu résoudre, planifier un autre retry si possible
    if (this.shouldRetry(error)) {
      this.scheduleRetry(error);
    }
  }

  /**
   * Vérifie si une erreur devrait générer une notification
   */
  private shouldNotify(error: ViewError): boolean {
    // Ne pas notifier les erreurs déjà résolues
    if (error.resolved) return false;

    // Notifier les erreurs critiques et fatales
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.FATAL) {
      return true;
    }

    // Ne pas notifier les erreurs de debug en production
    if (error.severity === ErrorSeverity.DEBUG && !this.options.debug) {
      return false;
    }

    // Éviter les notifications trop fréquentes pour le même type d'erreur
    const recentErrors = Array.from(this.errors.values())
      .filter(e => e.code === error.code && e.timestamp > Date.now() - 300000); // 5 minutes
    return recentErrors.length <= 3;
  }

  /**
   * Crée une notification pour une erreur
   */
  private createNotification(error: ViewError): void {
    const notificationId = this.generateNotificationId();

    const notification: ErrorNotification = {
      id: notificationId,
      error,
      message: this.formatNotificationMessage(error),
      type: this.getNotificationType(error),
      actions: this.getNotificationActions(error),
      timestamp: Date.now(),
      acknowledged: false
    };

    this.notifications.set(notificationId, notification);
    this.emit('notification', notification);
  }

  /**
   * Formate le message de notification
   */
  private formatNotificationMessage(error: ViewError): string {
    const severityMap = {
      [ErrorSeverity.DEBUG]: 'Débogage',
      [ErrorSeverity.INFO]: 'Information',
      [ErrorSeverity.WARNING]: 'Avertissement',
      [ErrorSeverity.ERROR]: 'Erreur',
      [ErrorSeverity.CRITICAL]: 'Erreur critique',
      [ErrorSeverity.FATAL]: 'Erreur fatale'
    };

    const categoryMap = {
      [ViewErrorCategory.VALIDATION]: 'Validation',
      [ViewErrorCategory.RENDERING]: 'Rendu',
      [ViewErrorCategory.DATA_FETCH]: 'Récupération des données',
      [ViewErrorCategory.STATE_MANAGEMENT]: 'Gestion d\'état',
      [ViewErrorCategory.CACHE]: 'Cache',
      [ViewErrorCategory.NETWORK]: 'Réseau',
      [ViewErrorCategory.PERMISSION]: 'Permission',
      [ViewErrorCategory.CONFIGURATION]: 'Configuration',
      [ViewErrorCategory.UNKNOWN]: 'Inconnue'
    };

    return `${severityMap[error.severity]} - ${categoryMap[error.category]}: ${error.message}`;
  }

  /**
   * Détermine le type de notification
   */
  private getNotificationType(error: ViewError): 'toast' | 'modal' | 'banner' | 'silent' {
    if (error.severity === ErrorSeverity.FATAL) {
      return 'modal';
    }
    if (error.severity === ErrorSeverity.CRITICAL) {
      return 'banner';
    }
    if (error.severity === ErrorSeverity.ERROR) {
      return 'toast';
    }
    return 'silent';
  }

  /**
   * Crée les actions de notification
   */
  private getNotificationActions(error: ViewError): ErrorNotificationAction[] {
    const actions: ErrorNotificationAction[] = [];

    // Action pour marquer comme résolu
    if (!error.resolved) {
      actions.push({
        label: 'Marquer comme résolu',
        action: () => { this.resolve(error.id, 'user_action'); },
        primary: true
      });
    }

    // Action pour réessayer si possible
    if (this.shouldRetry(error)) {
      actions.push({
        label: 'Réessayer',
        action: () => { this.scheduleRetry(error); }
      });
    }

    // Action pour voir les détails
    actions.push({
      label: 'Voir les détails',
      action: () => { this.emit('showErrorDetails', error); }
    });

    return actions;
  }

  /**
   * Nettoie les anciennes erreurs
   */
  private cleanupOldErrors(): void {
    if (this.errors.size <= this.options.maxErrors) {
      return;
    }

    const errorsToDelete = this.errors.size - this.options.maxErrors;
    const sortedErrors = Array.from(this.errors.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    for (let i = 0; i < errorsToDelete; i++) {
      const [errorId] = sortedErrors[i];
      this.errors.delete(errorId);
      this.retryTimers.delete(errorId);
    }
  }

  /**
   * Configure les stratégies de retry par défaut
   */
  private setupDefaultRetryStrategies(): void {
    // Stratégie pour les erreurs réseau
    this.setRetryStrategy('NETWORK_ERROR', {
      maxRetries: 5,
      delay: 1000,
      backoffMultiplier: 2,
      jitter: true,
      condition: (error) => error.category === ViewErrorCategory.NETWORK
    });

    // Stratégie pour les erreurs de cache
    this.setRetryStrategy('CACHE_ERROR', {
      maxRetries: 3,
      delay: 500,
      backoffMultiplier: 1.5,
      condition: (error) => error.category === ViewErrorCategory.CACHE
    });

    // Stratégie pour les erreurs de récupération de données
    this.setRetryStrategy('DATA_FETCH_ERROR', {
      maxRetries: 4,
      delay: 2000,
      backoffMultiplier: 2,
      jitter: true,
      condition: (error) => error.category === ViewErrorCategory.DATA_FETCH
    });
  }

  /**
   * Configure les écouteurs d'événements
   */
  private setupEventListeners(): void {
    // Envoyer les rapports périodiquement
    if (this.options.enableReporting) {
      setInterval(() => {
        this.sendReport();
      }, 300000); // Toutes les 5 minutes
    }

    // Nettoyer les notifications anciennes
    setInterval(() => {
      const now = Date.now();
      const notificationsToDelete: string[] = [];

      for (const [id, notification] of this.notifications.entries()) {
        if (now - notification.timestamp > 300000 && notification.acknowledged) { // 5 minutes
          notificationsToDelete.push(id);
        }
      }

      notificationsToDelete.forEach(id => this.notifications.delete(id));
    }, 60000); // Toutes les minutes
  }

  /**
   * Génère un ID d'erreur unique
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Génère un ID de notification unique
   */
  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Récupère l'ID de session
   */
  private getSessionId(): string {
    // Essayer de récupérer depuis le stockage de session
    if (typeof sessionStorage !== 'undefined') {
      let sessionId = sessionStorage.getItem('entidr_session_id');
      if (!sessionId) {
        sessionId = this.generateErrorId().replace('error_', 'session_');
        sessionStorage.setItem('entidr_session_id', sessionId);
      }
      return sessionId;
    }
    return this.generateErrorId().replace('error_', 'session_');
  }

  /**
   * Récupère l'ID utilisateur actuel
   */
  private getCurrentUserId(): string | undefined {
    // Cette méthode devrait être implémentée pour récupérer l'ID utilisateur
    // depuis le système d'authentification
    return undefined;
  }
}

// Exporter une instance singleton pour une utilisation facile
export const viewErrorService = new EntidrViewErrorService({
  maxErrors: 1000,
  enableConsole: true,
  enableReporting: false,
  enableNotifications: true,
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enableErrorBoundary: true,
  debug: false
});

export default EntidrViewErrorService;
