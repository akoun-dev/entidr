const NotificationConfig = require('../../models/notificationconfig');
const { successResponse, errorResponse } = require('../helpers/response');

class NotificationConfigController {
  static async get(req, res) {
    try {
      let config = await NotificationConfig.findOne();

      if (!config) {
        // Create default config if none exists
        config = await NotificationConfig.create({
          emailEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
          webhookEnabled: false,
          maxRetries: 3,
          retentionPeriod: 30
        });
      }

      return successResponse(res, 200, config);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const {
        emailEnabled,
        smsEnabled,
        inAppEnabled,
        webhookEnabled,
        maxRetries,
        retentionPeriod,
        batchingEnabled,
        batchingInterval
      } = req.body;

      let config = await NotificationConfig.findOne();
      if (!config) {
        return errorResponse(res, 404, 'Notification configuration not found');
      }

      const updatedConfig = await config.update({
        emailEnabled: emailEnabled !== undefined ? emailEnabled : config.emailEnabled,
        smsEnabled: smsEnabled !== undefined ? smsEnabled : config.smsEnabled,
        inAppEnabled: inAppEnabled !== undefined ? inAppEnabled : config.inAppEnabled,
        webhookEnabled: webhookEnabled !== undefined ? webhookEnabled : config.webhookEnabled,
        maxRetries: maxRetries || config.maxRetries,
        retentionPeriod: retentionPeriod || config.retentionPeriod,
        batchingEnabled: batchingEnabled !== undefined ? batchingEnabled : config.batchingEnabled,
        batchingInterval: batchingInterval || config.batchingInterval
      });

      return successResponse(res, 200, updatedConfig);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}

module.exports = NotificationConfigController;
