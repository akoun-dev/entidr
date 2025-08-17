export interface AuditConfig {
  retentionDays: number;
  logLevel: 'info' | 'warning' | 'error' | 'debug';
  monitoredEvents: string[];
  alertEnabled: boolean;
  alertThreshold?: number;
  alertEmails?: string[];
  logSensitiveDataAccess: boolean;
  logDataChanges: boolean;
  logAuthentication: boolean;
  logPermissionChanges: boolean;
  logAdminActions: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
