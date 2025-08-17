const AuditConfig = require('../../models/auditconfig');
const { successResponse, errorResponse } = require('../helpers/response');

class AuditConfigController {
  static async get(req, res) {
    try {
      const config = await AuditConfig.findOne();
      if (!config) {
        // Create default config if none exists
        const defaultConfig = await AuditConfig.create({
          retentionDays: 365,
          logLevel: 'info',
          monitoredEvents: ['*'],
          alertEnabled: false
        });
        return successResponse(res, 200, defaultConfig);
      }
      return successResponse(res, 200, config);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const {
        retentionDays,
        logLevel,
        monitoredEvents,
        alertEnabled,
        alertThreshold,
        alertEmails,
        logSensitiveDataAccess,
        logDataChanges,
        logAuthentication,
        logPermissionChanges,
        logAdminActions
      } = req.body;

      const config = await AuditConfig.findOne();
      if (!config) {
        return errorResponse(res, 404, 'Audit configuration not found');
      }

      const updatedConfig = await config.update({
        retentionDays: retentionDays || config.retentionDays,
        logLevel: logLevel || config.logLevel,
        monitoredEvents: monitoredEvents || config.monitoredEvents,
        alertEnabled: alertEnabled !== undefined ? alertEnabled : config.alertEnabled,
        alertThreshold: alertThreshold || config.alertThreshold,
        alertEmails: alertEmails || config.alertEmails,
        logSensitiveDataAccess: logSensitiveDataAccess !== undefined
          ? logSensitiveDataAccess
          : config.logSensitiveDataAccess,
        logDataChanges: logDataChanges !== undefined
          ? logDataChanges
          : config.logDataChanges,
        logAuthentication: logAuthentication !== undefined
          ? logAuthentication
          : config.logAuthentication,
        logPermissionChanges: logPermissionChanges !== undefined
          ? logPermissionChanges
          : config.logPermissionChanges,
        logAdminActions: logAdminActions !== undefined
          ? logAdminActions
          : config.logAdminActions
      });

      return successResponse(res, 200, updatedConfig);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}

module.exports = AuditConfigController;
