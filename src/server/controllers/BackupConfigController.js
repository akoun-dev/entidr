const BackupConfig = require('../../models/backupConfig');
const { successResponse, errorResponse } = require('../helpers/response');

class BackupConfigController {
  static async get(req, res) {
    try {
      const config = await BackupConfig.findOne();
      return successResponse(res, 200, config || {});
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const {
        frequency,
        retentionDays,
        storageType,
        storageConfig,
        isEnabled
      } = req.body;

      let config = await BackupConfig.findOne();

      if (!config) {
        config = await BackupConfig.create({
          frequency: 'daily',
          retentionDays: 7,
          isEnabled: false
        });
      }

      const updated = await config.update({
        frequency: frequency || config.frequency,
        retentionDays: retentionDays || config.retentionDays,
        storageType: storageType || config.storageType,
        storageConfig: storageConfig || config.storageConfig,
        isEnabled: isEnabled !== undefined ? isEnabled : config.isEnabled
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async testConnection(req, res) {
    try {
      // Implémentation de test de connexion au stockage
      return successResponse(res, 200, { status: 'success' });
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}

module.exports = BackupConfigController;
